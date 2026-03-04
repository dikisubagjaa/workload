import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import db from "@/database/models";
import { nowUnix as nowUnixUTC } from "@/utils/dateHelpers";
import { notify as notifyUser } from "@/utils/notifier";
import { buildModalUrl } from "@/utils/url";
import { getLeaveYearRange } from "@/utils/leaveYear";

const { LeaveRequest, User, LeaveConfig, Holiday, Sequelize } = db;
const { Op } = Sequelize;

const TZ = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Jakarta";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(TZ);

function getUserId(u) {
  return u?.user_id ?? u?.id ?? u?.userId ?? null;
}

export async function listLeaves(req, currentUser) {
  const uid = Number(currentUser?.user_id || 0);
  if (!uid) return { httpStatus: 401, msg: "Unauthenticated" };

  const userRole = currentUser?.user_role || null;
  const privilegedRoles = [
    "superadmin",
    "hrd",
    "hod",
    "director_operational",
  ];
  const hasPrivilegedFlag =
    currentUser?.is_superadmin === "true" ||
    currentUser?.is_hrd === "true" ||
    currentUser?.is_hod === "true" ||
    currentUser?.is_director_operational === "true";
  const isPrivileged =
    hasPrivilegedFlag || (userRole && privilegedRoles.includes(userRole));

  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
  const offset = (page - 1) * limit;

  const period = String(searchParams.get("period") || "all").toLowerCase();
  const fromParam = String(searchParams.get("from") || "").trim();
  const toParam = String(searchParams.get("to") || "").trim();
  const q = String(searchParams.get("q") || "").trim();

  const and = [];

  and.push({ deleted: { [Op.or]: [null, 0] } });

  if (!isPrivileged) {
    and.push({
      [Op.or]: [
        { user_id: uid },
        { assign_to: uid },
        { hod: uid },
        { hrd: uid },
        { operational_director: uid },
      ],
    });
  }

  if (period === "today") {
    const today = dayjs().tz().format("YYYY-MM-DD");
    and.push({ start_date: { [Op.lte]: today } });
    and.push({ end_date: { [Op.gte]: today } });
  } else if (period === "period") {
    const from = dayjs(fromParam);
    const to = dayjs(toParam);
    if (from.isValid() && to.isValid()) {
      const fromYMD = from.format("YYYY-MM-DD");
      const toYMD = to.format("YYYY-MM-DD");
      and.push({ start_date: { [Op.lte]: toYMD } });
      and.push({ end_date: { [Op.gte]: fromYMD } });
    }
  }

  if (q) {
    and.push({
      [Op.or]: [
        { permit: { [Op.like]: `%${q}%` } },
        { reason: { [Op.like]: `%${q}%` } },
        { detail: { [Op.like]: `%${q}%` } },
        { assign_note: { [Op.like]: `%${q}%` } },
      ],
    });
  }

  const where = { [Op.and]: and };

  const { rows, count } = await LeaveRequest.findAndCountAll({
    where,
    distinct: true,
    include: [
      { model: User, as: "User", attributes: ["user_id", "fullname", "email", "phone"], required: false },
      { model: User, as: "AssignedTo", attributes: ["user_id", "fullname", "email", "phone"], required: false },
      { model: User, as: "HOD", attributes: ["user_id", "fullname", "email", "phone"], required: false },
      { model: User, as: "HRD", attributes: ["user_id", "fullname", "email", "phone"], required: false },
      { model: User, as: "OperationalDirector", attributes: ["user_id", "fullname", "email", "phone"], required: false },
    ],
    order: [["start_date", "DESC"], ["leave_id", "DESC"]],
    limit,
    offset,
  });

  let data = rows.map((r) => r.toJSON());

  try {
    const todayYmd = dayjs().tz().format("YYYY-MM-DD");

    let yearStart = `${dayjs().year()}-04-01`;
    let yearEnd = `${dayjs().year() + 1}-03-31`;

    const y = dayjs(todayYmd).year();
    const apr1 = dayjs(`${y}-04-01`, "YYYY-MM-DD", true);
    if (dayjs(todayYmd).isBefore(apr1, "day")) {
      yearStart = `${y - 1}-04-01`;
      yearEnd = `${y}-03-31`;
    }

    let annualQuota = 12;
    const cfg = await LeaveConfig.findOne({
      where: { title: { [Op.like]: "Cuti Tahunan%" } },
      attributes: ["total"],
      raw: true,
    });
    if (cfg && cfg.total != null) annualQuota = Number(cfg.total) || annualQuota;

    const holRows = await Holiday.findAll({
      where: { date: { [Op.between]: [yearStart, yearEnd] }, type: "holiday" },
      attributes: ["date"],
      raw: true,
    });
    const publicHolidaySet = new Set((holRows || []).map((r) => String(r.date)));

    const jointRows = await Holiday.findAll({
      where: { date: { [Op.between]: [yearStart, yearEnd] }, type: "leave" },
      attributes: ["date"],
      raw: true,
    });

    let jointLeaveCount = 0;
    for (const r of jointRows || []) {
      const d = dayjs(String(r.date), "YYYY-MM-DD", true);
      if (!d.isValid()) continue;
      const dow = d.day();
      if (dow !== 0 && dow !== 6) jointLeaveCount += 1;
    }

    const userIds = Array.from(new Set(data.map((x) => Number(x.user_id || 0)).filter(Boolean)));
    const usedMap = {};

    if (userIds.length) {
      const lr = await LeaveRequest.findAll({
        where: {
          user_id: { [Op.in]: userIds },
          deleted: { [Op.or]: [null, 0] },
          start_date: { [Op.lte]: yearEnd },
          end_date: { [Op.gte]: yearStart },
        },
        attributes: [
          "leave_id",
          "user_id",
          "start_date",
          "end_date",
          "reason",
          "status",
          "assign_to",
          "hod",
          "hrd",
          "operational_director",
          "approval_assign_to_status",
          "approval_hod_status",
          "approval_hrd_status",
          "approval_operational_director_status",
        ],
        raw: true,
      });

      for (const r of lr || []) {
        const reason = String(r.reason || "").toLowerCase().trim();
        if (!reason.startsWith("cuti tahunan")) continue;

        const finalApproved =
          String(r.status || "").toLowerCase() === "approved" &&
          (!Number(r.assign_to || 0) || String(r.approval_assign_to_status || "").toLowerCase() === "approved") &&
          (!Number(r.hod || 0) || String(r.approval_hod_status || "").toLowerCase() === "approved") &&
          (!Number(r.hrd || 0) || String(r.approval_hrd_status || "").toLowerCase() === "approved") &&
          (!Number(r.operational_director || 0) ||
            String(r.approval_operational_director_status || "").toLowerCase() === "approved");

        if (!finalApproved) continue;

        const s = dayjs(String(r.start_date), "YYYY-MM-DD", true);
        const e = dayjs(String(r.end_date), "YYYY-MM-DD", true);
        if (!s.isValid() || !e.isValid()) continue;

        const effStart = s.isBefore(yearStart, "day") ? dayjs(yearStart) : s;
        const effEnd = e.isAfter(yearEnd, "day") ? dayjs(yearEnd) : e;

        let d = effStart.clone();
        let used = 0;

        while (!d.isAfter(effEnd, "day")) {
          const ymd = d.format("YYYY-MM-DD");
          const dow = d.day();
          const isWeekend = dow === 0 || dow === 6;

          if (!isWeekend && !publicHolidaySet.has(ymd)) used += 1;
          d = d.add(1, "day");
        }

        const u = Number(r.user_id || 0);
        usedMap[u] = (usedMap[u] || 0) + used;
      }
    }

    data = data.map((x) => {
      const u = Number(x.user_id || 0);
      const usedAnnual = usedMap[u] || 0;
      const remaining = annualQuota - (usedAnnual + jointLeaveCount);
      return {
        ...x,
        quota_leave: remaining,
        quota_leave_meta: { annualQuota, usedAnnual, jointLeaveCount, leaveYear: { yearStart, yearEnd } },
      };
    });
  } catch (e) {
    console.warn("quota_leave inject failed:", e?.message || e);
  }

  return { data, meta: { page, limit, total: count } };
}

export async function createLeave(body, currentUser) {
  const uid = Number(currentUser?.user_id || 0);
  if (!uid) return { httpStatus: 401, msg: "Unauthenticated" };

  const nowUnix = nowUnixUTC();

  const start = dayjs(body?.startDate);
  const end = dayjs(body?.endDate);

  if (!start.isValid() || !end.isValid()) {
    return { httpStatus: 400, msg: "startDate and endDate are required (YYYY-MM-DD)" };
  }

  const start_date = start.format("YYYY-MM-DD");
  const end_date = end.format("YYYY-MM-DD");

  if (end.isBefore(start, "day")) {
    return { httpStatus: 400, msg: "endDate must be the same day or after startDate" };
  }

  const days = end.diff(start, "day") + 1;
  if (days <= 0 || days > 60) {
    return { httpStatus: 400, msg: "Invalid date range" };
  }

  const permit = body?.permit ? String(body.permit) : "Leave";

  const mlreasonId = Number(body?.mlreasonId || 0) || null;

  let reason = body?.reason ? String(body.reason).trim() : null;
  const detail = body?.detail ? String(body.detail).trim() : null;
  const assign_note = body?.assignNote ? String(body.assignNote).trim() : null;

  const assignWorkTo = body?.assignWorkTo;
  const assign_to = Array.isArray(assignWorkTo)
    ? Number(assignWorkTo?.[0] || 0) || null
    : Number(assignWorkTo || 0) || null;

  const hod = Number(body?.headOfDepartment || 0) || null;
  const hrd = Number(body?.hrd || 0) || null;
  const operational_director = Number(body?.operationalDirector || 0) || null;

  if (mlreasonId) {
    const cfg = await LeaveConfig.findOne({
      where: { lconfig_id: mlreasonId, deleted: { [Op.or]: [null, 0] } },
      attributes: ["title"],
    });
    if (cfg?.title) reason = cfg.title;
  }

  const overlap = await LeaveRequest.findOne({
    where: {
      user_id: uid,
      deleted: { [Op.or]: [null, 0] },
      status: { [Op.in]: ["pending", "approved"] },
      start_date: { [Op.lte]: end_date },
      end_date: { [Op.gte]: start_date },
    },
    attributes: ["leave_id"],
  });

  if (overlap) {
    return { httpStatus: 400, msg: "You already have leave on that date range." };
  }

  const created = await LeaveRequest.create({
    user_id: uid,
    start_date,
    end_date,
    days,
    permit,
    reason,
    detail,
    assign_note,

    assign_to,
    hod,
    hrd,
    operational_director,

    status: "pending",

    approval_assign_to_status: "pending",
    approval_assign_to_at: null,

    approval_hod_status: "pending",
    approval_hod_at: null,

    approval_hrd_status: "pending",
    approval_hrd_at: null,

    approval_operational_director_status: "pending",
    approval_operational_director_at: null,

    created: nowUnix,
    created_by: uid,
    updated: nowUnix,
    updated_by: uid,
    deleted: null,
    deleted_by: null,
  });

  const leaveId = created.leave_id;

  const url = buildModalUrl({
    module: "leave",
    id: Number(leaveId),
    commentId: null,
    basePath: "/leave",
  });

  const actorName = currentUser?.fullname || currentUser?.email || `User #${uid}`;
  const rangeStr = `${start_date} → ${end_date}`;
  const reasonStr = reason || "-";

  if (assign_to) {
    try {
      await notifyUser({
        userId: Number(assign_to),
        sender: "system",
        description: `${actorName} created leave request (${reasonStr}) for ${rangeStr}. Please approve (Assign To).`,
        url,
        payload: { type: "leave_need_approval_assign", leaveId },
      });
    } catch (e) {
      console.warn("notify assign_to failed:", e?.message || e);
    }
  }

  if (hod) {
    try {
      await notifyUser({
        userId: Number(hod),
        sender: "system",
        description: `${actorName} created leave request (${reasonStr}) for ${rangeStr}. Please approve (HOD).`,
        url,
        payload: { type: "leave_need_approval_hod", leaveId },
      });
    } catch (e) {
      console.warn("notify hod failed:", e?.message || e);
    }
  }

  if (hrd) {
    try {
      await notifyUser({
        userId: Number(hrd),
        sender: "system",
        description: `${actorName} created leave request (${reasonStr}) for ${rangeStr}. Please approve (HRD).`,
        url,
        payload: { type: "leave_need_approval_hrd", leaveId },
      });
    } catch (e) {
      console.warn("notify hrd failed:", e?.message || e);
    }
  }

  if (operational_director) {
    try {
      await notifyUser({
        userId: Number(operational_director),
        sender: "system",
        description: `${actorName} created leave request (${reasonStr}) for ${rangeStr}. Please approve (Director).`,
        url,
        payload: { type: "leave_need_approval_director", leaveId },
      });
    } catch (e) {
      console.warn("notify director failed:", e?.message || e);
    }
  }

  return { httpStatus: 201, data: created };
}

export async function getLeaveById(leaveId, currentUser) {
  const uid = Number(currentUser?.user_id || 0);
  if (!uid) return { httpStatus: 401, msg: "Unauthenticated" };

  const row = await LeaveRequest.findOne({ where: { leave_id: leaveId, deleted: null } });
  if (!row) return { httpStatus: 404, msg: "Not found" };

  const isSuperadmin = currentUser?.is_superadmin === "true";
  const isHrd = currentUser?.is_hrd === "true";

  const allow =
    Number(row.user_id || 0) === uid ||
    Number(row.assign_to || 0) === uid ||
    Number(row.hod || 0) === uid ||
    Number(row.hrd || 0) === uid ||
    Number(row.operational_director || 0) === uid ||
    isSuperadmin ||
    isHrd;

  if (!allow) return { httpStatus: 403, msg: "Forbidden" };

  return { data: row.toJSON() };
}

export async function handleLeaveAction(leaveId, body, currentUser) {
  const uid = Number(currentUser?.user_id || 0);
  if (!uid) return { httpStatus: 401, msg: "Unauthenticated" };

  const isSuperadmin = currentUser?.is_superadmin === "true";
  const isHrd = currentUser?.is_hrd === "true";
  const isDirectorOperational = currentUser?.is_director_operational === "true";

  const action = String(body?.action || "").toLowerCase();
  const target = body?.target ? String(body.target).toLowerCase() : null;

  const row = await LeaveRequest.findOne({ where: { leave_id: leaveId, deleted: null } });
  if (!row) return { httpStatus: 404, msg: "Not found" };

  const now = dayjs().unix();
  const actorName = currentUser?.fullname || currentUser?.email || `User #${uid}`;
  const requesterId = Number(row.user_id || 0);

  const reasonStr = row.reason || "-";
  const rangeStr = `${row.start_date} → ${row.end_date}`;
  const url = "/leave";

  const approverIds = Array.from(
    new Set([row.assign_to, row.hod, row.hrd, row.operational_director].map((x) => Number(x || 0)).filter((x) => x > 0))
  );

  const currentStatus = String(row.status || "").toLowerCase();
  if (["approved", "rejected", "cancelled"].includes(currentStatus)) {
    return { httpStatus: 400, msg: `Request already ${row.status}` };
  }

  if (action === "cancel") {
    if (Number(row.user_id || 0) !== uid) return { httpStatus: 403, msg: "Forbidden" };

    row.status = "cancelled";
    row.updated = now;
    row.updated_by = uid;
    await row.save();

    for (const toId of approverIds) {
      try {
        await notifyUser({
          userId: toId,
          sender: "system",
          description: `${actorName} cancelled leave (${reasonStr}) for ${rangeStr}.`,
          url,
          payload: { type: "leave_cancelled", leaveId: row.leave_id },
        });
      } catch (e) {
        console.warn("notify cancel failed:", e?.message || e);
      }
    }

    return { data: row.toJSON() };
  }

  if (action === "set_approver") {
    const canSet = isSuperadmin || isHrd || isDirectorOperational;
    if (!canSet) return { httpStatus: 403, msg: "Forbidden" };

    if (body?.hrd !== undefined) {
      const nextHrd = Number(body.hrd || 0);
      row.hrd = nextHrd > 0 ? nextHrd : null;
      row.approval_hrd_status = "pending";
      row.approval_hrd_at = null;
    }

    if (body?.operational_director !== undefined) {
      const nextDir = Number(body.operational_director || 0);
      row.operational_director = nextDir > 0 ? nextDir : null;
      row.approval_operational_director_status = "pending";
      row.approval_operational_director_at = null;
    }

    row.updated = now;
    row.updated_by = uid;
    await row.save();

    try {
      await notifyUser({
        userId: requesterId,
        sender: "system",
        description: `Approver updated by ${actorName} for leave (${reasonStr}) ${rangeStr}.`,
        url,
        payload: { type: "leave_approver_updated", leaveId: row.leave_id },
      });
    } catch (e) {
      console.warn("notify requester failed:", e?.message || e);
    }

    if (row.hrd) {
      try {
        await notifyUser({
          userId: Number(row.hrd),
          sender: "system",
          description: `Leave (${reasonStr}) for ${rangeStr} needs your approval (HRD).`,
          url,
          payload: { type: "leave_need_approval_hrd", leaveId: row.leave_id },
        });
      } catch (e) {
        console.warn("notify hrd failed:", e?.message || e);
      }
    }

    if (row.operational_director) {
      try {
        await notifyUser({
          userId: Number(row.operational_director),
          sender: "system",
          description: `Leave (${reasonStr}) for ${rangeStr} needs your approval (Director).`,
          url,
          payload: { type: "leave_need_approval_director", leaveId: row.leave_id },
        });
      } catch (e) {
        console.warn("notify director failed:", e?.message || e);
      }
    }

    return { data: row.toJSON() };
  }

  if (action !== "approve" && action !== "reject") {
    return { httpStatus: 400, msg: "Unsupported action" };
  }

  let scope = null;

  if (Number(row.assign_to || 0) === uid) scope = "assign_to";
  else if (Number(row.hod || 0) === uid) scope = "hod";
  else if (Number(row.hrd || 0) === uid) scope = "hrd";
  else if (Number(row.operational_director || 0) === uid) scope = "operational_director";
  else if (isSuperadmin) scope = target || null;

  if (!scope || !["assign_to", "hod", "hrd", "operational_director"].includes(scope)) {
    return { httpStatus: isSuperadmin ? 400 : 403, msg: isSuperadmin ? "Superadmin must provide target" : "Forbidden" };
  }

  if (!isSuperadmin && scope === "hrd") {
    if (!(isHrd && Number(row.hrd || 0) === uid)) return { httpStatus: 403, msg: "Forbidden" };
  }

  if (isSuperadmin) {
    if (scope === "assign_to" && !Number(row.assign_to || 0)) return { httpStatus: 400, msg: "No assign_to" };
    if (scope === "hod" && !Number(row.hod || 0)) return { httpStatus: 400, msg: "No hod" };
    if (scope === "hrd" && !Number(row.hrd || 0)) return { httpStatus: 400, msg: "No hrd" };
    if (scope === "operational_director" && !Number(row.operational_director || 0)) {
      return { httpStatus: 400, msg: "No operational_director" };
    }
  }

  if (action === "approve") {
    if (scope === "assign_to") {
      row.approval_assign_to_status = "approved";
      row.approval_assign_to_at = now;
    } else if (scope === "hod") {
      row.approval_hod_status = "approved";
      row.approval_hod_at = now;
    } else if (scope === "hrd") {
      row.approval_hrd_status = "approved";
      row.approval_hrd_at = now;
    } else if (scope === "operational_director") {
      row.approval_operational_director_status = "approved";
      row.approval_operational_director_at = now;
    }
  } else {
    if (scope === "assign_to") {
      row.approval_assign_to_status = "rejected";
      row.approval_assign_to_at = now;
    } else if (scope === "hod") {
      row.approval_hod_status = "rejected";
      row.approval_hod_at = now;
    } else if (scope === "hrd") {
      row.approval_hrd_status = "rejected";
      row.approval_hrd_at = now;
    } else if (scope === "operational_director") {
      row.approval_operational_director_status = "rejected";
      row.approval_operational_director_at = now;
    }
  }

  const needAssign = Number(row.assign_to || 0) > 0;
  const needHod = Number(row.hod || 0) > 0;
  const needHrd = Number(row.hrd || 0) > 0;
  const needDir = Number(row.operational_director || 0) > 0;

  const stAssign = String(row.approval_assign_to_status || "pending").toLowerCase();
  const stHod = String(row.approval_hod_status || "pending").toLowerCase();
  const stHrd = String(row.approval_hrd_status || "pending").toLowerCase();
  const stDir = String(row.approval_operational_director_status || "pending").toLowerCase();

  const anyReject =
    (needAssign && stAssign === "rejected") ||
    (needHod && stHod === "rejected") ||
    (needHrd && stHrd === "rejected") ||
    (needDir && stDir === "rejected");

  if (anyReject) {
    row.status = "rejected";
  } else {
    const allApproved =
      (!needAssign || stAssign === "approved") &&
      (!needHod || stHod === "approved") &&
      (!needHrd || stHrd === "approved") &&
      (!needDir || stDir === "approved");

    row.status = allApproved ? "approved" : "pending";
  }

  row.updated = now;
  row.updated_by = uid;
  await row.save();

  try {
    if (String(row.status).toLowerCase() === "approved") {
      await notifyUser({
        userId: requesterId,
        sender: "system",
        description: `Your leave (${reasonStr}) for ${rangeStr} is fully approved.`,
        url,
        payload: { type: "leave_final_approved", leaveId: row.leave_id },
      });
    } else if (String(row.status).toLowerCase() === "rejected") {
      await notifyUser({
        userId: requesterId,
        sender: "system",
        description: `Your leave (${reasonStr}) for ${rangeStr} was rejected by ${actorName}.`,
        url,
        payload: { type: "leave_rejected", leaveId: row.leave_id, scope },
      });
    } else {
      await notifyUser({
        userId: requesterId,
        sender: "system",
        description:
          action === "approve"
            ? `Your leave (${reasonStr}) for ${rangeStr} was approved by ${actorName}. (Waiting others)`
            : `Your leave (${reasonStr}) for ${rangeStr} was updated by ${actorName}.`,
        url,
        payload: { type: "leave_progress_updated", leaveId: row.leave_id, scope, status: row.status },
      });
    }
  } catch (e) {
    console.warn("notify requester failed:", e?.message || e);
  }

  if (String(row.status).toLowerCase() === "rejected") {
    for (const toId of approverIds) {
      if (toId === uid) continue;
      try {
        await notifyUser({
          userId: toId,
          sender: "system",
          description: `Leave (${reasonStr}) for ${rangeStr} was rejected by ${actorName}.`,
          url,
          payload: { type: "leave_rejected_fyi", leaveId: row.leave_id, scope },
        });
      } catch (e) {
        console.warn("notify reject fyi failed:", e?.message || e);
      }
    }
  }

  return { data: row.toJSON() };
}

function isWeekendYMD(ymd) {
  const d = dayjs(ymd, "YYYY-MM-DD", true);
  if (!d.isValid()) return false;
  const dow = d.day();
  return dow === 0 || dow === 6;
}

function isAnnualLeaveReason(reason) {
  if (!reason) return false;
  return String(reason).toLowerCase().trim().startsWith("cuti tahunan");
}

function countAnnualChargeDays(startYmd, endYmd, publicHolidaySet) {
  let d = dayjs(startYmd, "YYYY-MM-DD", true);
  const end = dayjs(endYmd, "YYYY-MM-DD", true);
  if (!d.isValid() || !end.isValid()) return 0;

  let count = 0;
  while (!d.isAfter(end, "day")) {
    const ymd = d.format("YYYY-MM-DD");
    if (!isWeekendYMD(ymd) && !publicHolidaySet.has(ymd)) count += 1;
    d = d.add(1, "day");
  }

  return count;
}

async function getAnnualQuota() {
  let annualQuota = 12;
  const cfg = await LeaveConfig.findOne({
    where: { title: { [Op.like]: "Cuti Tahunan%" } },
    raw: true,
  });
  if (cfg && cfg.total != null) annualQuota = Number(cfg.total) || annualQuota;
  return annualQuota;
}

async function getPublicHolidaySet(yearStart, yearEnd) {
  const rows = await Holiday.findAll({
    where: { date: { [Op.between]: [yearStart, yearEnd] }, type: "holiday" },
    attributes: ["date"],
    raw: true,
  });
  return new Set(rows.map((r) => r.date));
}

async function getJointLeaveCount(yearStart, yearEnd) {
  const rows = await Holiday.findAll({
    where: { date: { [Op.between]: [yearStart, yearEnd] }, type: "leave" },
    attributes: ["date"],
    raw: true,
  });

  let cnt = 0;
  for (const r of rows) {
    if (!isWeekendYMD(r.date)) cnt += 1;
  }
  return cnt;
}

async function getUsedAnnualDays(uid, yearStart, yearEnd, publicHolidaySet) {
  const rows = await LeaveRequest.findAll({
    where: {
      user_id: uid,
      deleted: null,
      status: "approved",
      start_date: { [Op.lte]: yearEnd },
      end_date: { [Op.gte]: yearStart },
    },
    attributes: ["start_date", "end_date", "reason"],
    raw: true,
  });

  let used = 0;

  for (const r of rows) {
    if (!isAnnualLeaveReason(r.reason)) continue;

    const s = dayjs(r.start_date, "YYYY-MM-DD", true);
    const e = dayjs(r.end_date, "YYYY-MM-DD", true);
    if (!s.isValid() || !e.isValid()) continue;

    const effStart = s.isBefore(yearStart, "day") ? yearStart : s.format("YYYY-MM-DD");
    const effEnd = e.isAfter(yearEnd, "day") ? yearEnd : e.format("YYYY-MM-DD");

    used += countAnnualChargeDays(effStart, effEnd, publicHolidaySet);
  }

  return used;
}

export async function getAnnualQuotaInfo(req, currentUser) {
  const uid = getUserId(currentUser);
  if (!uid) return { httpStatus: 401, msg: "Unauthenticated" };

  const { searchParams } = new URL(req.url);
  const anchor = (searchParams.get("anchor") || "").trim();
  const anchorYmd = anchor || dayjs().tz().format("YYYY-MM-DD");

  const { yearStart, yearEnd } = getLeaveYearRange(anchorYmd, 4, 1);

  const annualQuota = await getAnnualQuota();
  const publicHolidaySet = await getPublicHolidaySet(yearStart, yearEnd);
  const usedAnnual = await getUsedAnnualDays(uid, yearStart, yearEnd, publicHolidaySet);
  const jointLeaveCount = await getJointLeaveCount(yearStart, yearEnd);

  const remaining = annualQuota - (usedAnnual + jointLeaveCount);

  return {
    annualQuota,
    usedAnnual,
    jointLeaveCount,
    remaining,
    leaveYear: { yearStart, yearEnd },
  };
}
