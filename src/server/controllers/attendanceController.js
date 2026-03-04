import dayjs, { TZ } from "@/utils/dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { isFlagTrue } from "@/utils/roleFlags";
import { validateClockIn, validateClockOut } from "@/app/api/attendance/_guard";
import {
  getStartAttendanceHHmm,
  getDeadlineAttendanceHHmm,
  isTimeableUser,
} from "@/app/api/attendance/_rules";
import db from "@/database/models";
import {
  Op,
  findAttendanceByUserDate,
  findUserAbsentType,
  findHolidayByDate,
  findAttendanceConfigByIp,
  createAttendance,
  updateAttendanceInstance,
  updateUserClockedIn,
  findAttendanceListWithUser,
  findAttendanceMapRows,
  findFirstAttendanceDate,
  findAttendanceByUserDateSimple,
  findUserById,
  findUsersForAttendanceExport,
  findDepartmentsForAttendanceExport,
  findHolidaysBetween,
  findHolidaysForYear,
  findAttendanceBetween,
  findApprovedLeavesForYear,
  findAnnualLeaveConfig,
} from "@/server/queries/attendanceQueries";

const { Setting } = db;

dayjs.extend(isSameOrBefore);

function getClientPublicIp(headers) {
  const xff = headers.get?.("x-forwarded-for") || headers["x-forwarded-for"];
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts[0];
  }
  const rip = headers.get?.("x-real-ip") || headers["x-real-ip"];
  if (rip) return rip;
  const cip = headers.get?.("cf-connecting-ip") || headers["cf-connecting-ip"];
  if (cip) return cip;
  return null;
}

async function getNonWorkingInfo({ strict, now }) {
  if (!strict) return null;

  const dow = now.day();
  if (dow === 0 || dow === 6) {
    return {
      type: "weekend",
      msg: "Attendance is not available on weekends.",
    };
  }

  const ymd = now.format("YYYY-MM-DD");
  const holiday = await findHolidayByDate(ymd);
  if (holiday) {
    return {
      type: "holiday",
      msg: `Attendance is not available on holidays (${holiday.description}).`,
      holiday,
    };
  }

  return null;
}

export async function getAttendanceToday(currentUser) {
  const userId = currentUser?.user_id || currentUser?.id || currentUser?.userId;
  if (!userId) {
    return { httpStatus: 401, msg: "Unauthenticated" };
  }

  const now = dayjs().tz(TZ);
  const today = now.format("YYYY-MM-DD");

  const dbUser = await findUserAbsentType(userId);
  const strict = isTimeableUser(currentUser, dbUser?.absent_type);

  const nonWorking = await getNonWorkingInfo({ strict, now });

  const row = await findAttendanceByUserDate(userId, today);

  if (!row) {
    return {
      httpStatus: 200,
      in_unix: null,
      out_unix: null,
      status: null,
      blocked: Boolean(nonWorking),
      blocked_reason: nonWorking?.msg || null,
    };
  }

  const j = row.toJSON ? row.toJSON() : row;

  return {
    httpStatus: 200,
    in_unix: j.clock_in ?? j.in_unix ?? null,
    out_unix: j.clock_out ?? j.out_unix ?? null,
    status: j.status ?? null,
    minutes_late: j.minutes_late ?? 0,
    blocked: Boolean(nonWorking && !(j.clock_in ?? j.in_unix)),
    blocked_reason: nonWorking && !(j.clock_in ?? j.in_unix) ? nonWorking.msg : null,
  };
}

export async function handleAttendanceAction(req, currentUser) {
  const userId = currentUser?.user_id || currentUser?.id || currentUser?.userId;
  if (!userId) {
    return { httpStatus: 401, msg: "Unauthenticated" };
  }

  const url = new URL(req.url);
  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const action = url.searchParams.get("action") || body?.action;
  if (!action || !["clock-in", "clock-out"].includes(action)) {
    return { httpStatus: 400, msg: "action must be 'clock-in' or 'clock-out'" };
  }

  const geo = {};
  const hasGeo = typeof body?.latitude === "number" && typeof body?.longitude === "number";

  if (hasGeo) {
    geo.latitude = body.latitude;
    geo.longitude = body.longitude;
    if (typeof body?.accuracy === "number") {
      geo.accuracy = body.accuracy;
    }
  }

  if (action === "clock-in" && !hasGeo) {
    return {
      httpStatus: 400,
      msg: "Location is required for attendance",
      need_location: true,
    };
  }

  const now = dayjs().tz(TZ);
  const today = now.format("YYYY-MM-DD");
  let row = await findAttendanceByUserDate(userId, today);

  const dbUser = await findUserAbsentType(userId);
  const strict = isTimeableUser(currentUser, dbUser?.absent_type);

  const nonWorking = await getNonWorkingInfo({ strict, now });

  const attendanceType = String(currentUser?.attendance_type || "").toLowerCase();
  if (attendanceType === "office") {
    const clientIp = getClientPublicIp(req.headers) || "0.0.0.0";
    const ok = await findAttendanceConfigByIp(clientIp);
    if (!ok) {
      return {
        httpStatus: 403,
        msg: "Clock-in/out is only allowed from whitelisted office IP addresses.",
        client_ip: clientIp,
      };
    }
  }

  if (action === "clock-in") {
    if (nonWorking && !row?.clock_in) {
      return {
        httpStatus: 403,
        msg: nonWorking.msg,
        blocked: true,
        blocked_reason: nonWorking.msg,
        holiday: nonWorking.holiday || null,
      };
    }

    const openHHmm = strict ? await getStartAttendanceHHmm(Setting) : "00:00";
    const deadlineHHmm = strict ? await getDeadlineAttendanceHHmm(Setting) : "23:59";

    const guard = validateClockIn({
      strict,
      now,
      openHHmm,
      deadlineHHmm,
      late_reason: body?.late_reason,
    });

    if (!guard.success) {
      if (guard.need_reason) {
        return {
          httpStatus: 400,
          msg: "Late clock-in requires reason",
          need_reason: true,
          deadline: guard.deadline,
        };
      }
      return { httpStatus: 403, msg: guard.msg || "Clock-in blocked" };
    }

    if (row?.clock_in) {
      return { httpStatus: 409, msg: "Already clocked in today" };
    }

    const clockInUnix = now.unix();

    if (!row) {
      row = await createAttendance({
        user_id: userId,
        date: today,
        clock_in: clockInUnix,
        clock_out: null,
        status: guard.status || "present",
        duration_minutes: 0,
        late_reason: body?.late_reason || null,
        minutes_late: guard.minutesLate || 0,
        location_latitude: geo.latitude,
        location_longitude: geo.longitude,
        created: now.unix(),
        updated: now.unix(),
        created_by: userId,
        updated_by: userId,
      });
    } else {
      const updatePayload = {
        clock_in: clockInUnix,
        status: guard.status || "present",
        late_reason: body?.late_reason || null,
        minutes_late: guard.minutesLate || 0,
        updated: now.unix(),
        updated_by: userId,
      };

      if (row.location_latitude == null && row.location_longitude == null && hasGeo) {
        updatePayload.location_latitude = geo.latitude;
        updatePayload.location_longitude = geo.longitude;
      }

      await updateAttendanceInstance(row, updatePayload);
    }

    await updateUserClockedIn(userId, true, now.unix());

    return { httpStatus: 200, in_unix: clockInUnix, late: guard.status === "late" };
  }

  if (!row || !row.clock_in) {
    return { httpStatus: 400, msg: "You haven't clocked in today" };
  }
  if (row.clock_out) {
    return { httpStatus: 409, msg: "Already clocked out today" };
  }

  const guardOut = validateClockOut({
    strict,
    now,
    clock_in_unix: row.clock_in,
  });

  if (!guardOut.success) {
    if (guardOut.need_seconds) {
      return {
        httpStatus: 403,
        msg: guardOut.msg || "Clock-out too soon",
        need_seconds: guardOut.need_seconds,
      };
    }
    return { httpStatus: 403, msg: guardOut.msg || "Clock-out blocked" };
  }

  const clockOutUnix = now.unix();
  const durationMinutes = Math.floor((clockOutUnix - row.clock_in) / 60);

  const updatePayloadOut = {
    clock_out: clockOutUnix,
    duration_minutes: durationMinutes,
    updated: now.unix(),
    updated_by: userId,
  };

  if (row.location_latitude == null && row.location_longitude == null && hasGeo) {
    updatePayloadOut.location_latitude = geo.latitude;
    updatePayloadOut.location_longitude = geo.longitude;
  }

  await updateAttendanceInstance(row, updatePayloadOut);
  await updateUserClockedIn(userId, false, now.unix());

  return { httpStatus: 200, out_unix: clockOutUnix, duration_minutes: durationMinutes };
}

export async function getAttendanceStatus(currentUser) {
  const userId = currentUser?.user_id;
  if (!userId) return { httpStatus: 401, msg: "Unauthenticated" };

  const todayDate = dayjs().format("YYYY-MM-DD");
  const todaysAttendance = await findAttendanceByUserDateSimple(userId, todayDate);

  if (todaysAttendance && todaysAttendance.clock_in) {
    return {
      httpStatus: 200,
      isClockedIn: true,
      attendanceData: todaysAttendance.toJSON ? todaysAttendance.toJSON() : todaysAttendance,
    };
  }

  return { httpStatus: 200, isClockedIn: false, attendanceData: null };
}

function toYMD(s) {
  const d = dayjs(String(s || "").trim(), "YYYY-MM-DD", true);
  return d.isValid() ? d.format("YYYY-MM-DD") : null;
}

function rangeToday() {
  const d = dayjs().tz();
  const ymd = d.format("YYYY-MM-DD");
  return { from: ymd, to: ymd };
}

function rangeYesterday() {
  const d = dayjs().tz().subtract(1, "day");
  const ymd = d.format("YYYY-MM-DD");
  return { from: ymd, to: ymd };
}

function rangeWeek(base, offsetWeeks = 0) {
  const d = base.add(offsetWeeks, "week");
  const dow = d.day();
  const toMonday = (dow + 6) % 7;
  const monday = d.subtract(toMonday, "day").startOf("day");
  const sunday = monday.add(6, "day").startOf("day");
  return {
    from: monday.format("YYYY-MM-DD"),
    to: sunday.format("YYYY-MM-DD"),
  };
}

function buildOrder(sortBy, sortDir) {
  const dir = String(sortDir || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const key = String(sortBy || "date").toLowerCase();

  if (key === "fullname") {
    return [[{ model: db.User, as: "User" }, "fullname", dir]];
  }
  if (key === "clock_in") return [["clock_in", dir]];
  if (key === "clock_out") return [["clock_out", dir]];
  if (key === "status") return [["status", dir]];

  return [
    ["date", dir],
    [{ model: db.User, as: "User" }, "fullname", "ASC"],
  ];
}

export async function getAttendanceList(req) {
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
  const offset = (page - 1) * limit;

  const period = (searchParams.get("period") || "today").toLowerCase();
  let from = toYMD(searchParams.get("from"));
  let to = toYMD(searchParams.get("to"));

  if (period === "today") {
    ({ from, to } = rangeToday());
  } else if (period === "yesterday") {
    ({ from, to } = rangeYesterday());
  } else if (period === "thisweek") {
    ({ from, to } = rangeWeek(dayjs().tz(), 0));
  } else if (period === "lastweek") {
    ({ from, to } = rangeWeek(dayjs().tz(), -1));
  } else if (period === "period") {
    if (!from || !to) {
      return { httpStatus: 400, msg: "from/to is required when period=period (YYYY-MM-DD)" };
    }
  } else {
    ({ from, to } = rangeToday());
  }

  const dFrom = dayjs(from, "YYYY-MM-DD", true);
  const dTo = dayjs(to, "YYYY-MM-DD", true);
  if (!dFrom.isValid() || !dTo.isValid() || dFrom.isAfter(dTo)) {
    return { httpStatus: 400, msg: "Invalid date range (from <= to, format YYYY-MM-DD)" };
  }

  const statusFilter = (searchParams.get("status") || "").trim();
  const q = (searchParams.get("q") || "").trim();

  const sortBy = (searchParams.get("sortBy") || "date").trim();
  const sortDir = (searchParams.get("sortDir") || "desc").trim();
  const order = buildOrder(sortBy, sortDir);

  const whereAttendance = {
    deleted: null,
    date: { [Op.between]: [from, to] },
  };
  if (statusFilter) {
    whereAttendance.status = statusFilter;
  }

  let includeUserWhere;
  let includeRequired = false;
  if (q) {
    includeUserWhere = {
      [Op.or]: [
        { fullname: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
        { phone: { [Op.like]: `%${q}%` } },
      ],
    };
    includeRequired = true;
  }

  const { rows, count } = await findAttendanceListWithUser({
    whereAttendance,
    includeUserWhere,
    includeRequired,
    order,
    limit,
    offset,
  });

  const data = rows.map((r) => {
    const a = r.toJSON();
    const u = a.User || {};
    return {
      attendance_id: a.attendance_id,
      user_id: a.user_id,
      date: a.date,
      clock_in: a.clock_in ?? null,
      clock_out: a.clock_out ?? null,
      status: a.status,
      late_reason: a.late_reason ?? null,
      minutes_late: Number(a.minutes_late ?? 0),
      notes: a.notes ?? null,
      user: {
        user_id: u.user_id ?? null,
        fullname: u.fullname ?? null,
        email: u.email ?? null,
        phone: u.phone ?? null,
        job_position: u.job_position ?? null,
      },
    };
  });

  return { httpStatus: 200, data, meta: { page, limit, total: count } };
}

export async function createManualAttendance(req, currentUser) {
  const operatorId = currentUser?.user_id || currentUser?.id || currentUser?.userId;
  if (!operatorId) {
    return { httpStatus: 401, msg: "Unauthenticated" };
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const staffIdRaw = body.staffId ?? body.staff ?? body.userId ?? body.targetUserId;
  const staffId = Number(staffIdRaw);

  if (!staffId || Number.isNaN(staffId)) {
    return { httpStatus: 400, msg: "staffId is required" };
  }

  const rawDate = body.date ?? body.presenceDate ?? body.presence_date;
  if (!rawDate) {
    return { httpStatus: 400, msg: "date is required" };
  }

  const d = dayjs(rawDate);
  if (!d.isValid()) {
    return { httpStatus: 400, msg: "date is invalid" };
  }
  const date = d.tz(TZ).format("YYYY-MM-DD");

  const allowedStatuses = [
    "present",
    "late",
    "absent",
    "leave",
    "holiday",
    "sick",
    "permission",
  ];

  let status = (body.status || "").toString().trim().toLowerCase();
  if (!status) status = "present";

  if (!allowedStatuses.includes(status)) {
    return { httpStatus: 400, msg: "Invalid status value" };
  }

  const staff = await findUserById(staffId, { attributes: ["user_id"] });
  if (!staff) {
    return { httpStatus: 404, msg: "Target user not found" };
  }

  const now = dayjs().tz(TZ);

  const clockInUnix =
    body.clockInUnix != null && body.clockInUnix !== "" ? Number(body.clockInUnix) : null;
  const clockOutUnix =
    body.clockOutUnix != null && body.clockOutUnix !== "" ? Number(body.clockOutUnix) : null;

  if (
    (clockInUnix != null && Number.isNaN(clockInUnix)) ||
    (clockOutUnix != null && Number.isNaN(clockOutUnix))
  ) {
    return { httpStatus: 400, msg: "clockInUnix / clockOutUnix must be number (unix seconds)" };
  }

  const reason =
    (body.reason || body.lateReason || body.notes || body.manualReason || "")
      ?.toString()
      .trim() || null;

  const minutesLateRaw = body.minutesLate;
  const minutesLate =
    typeof minutesLateRaw === "number"
      ? minutesLateRaw
      : minutesLateRaw != null && minutesLateRaw !== ""
      ? Number(minutesLateRaw)
      : 0;

  let row = await findAttendanceByUserDate(staffId, date);

  let durationMinutes = row?.duration_minutes ?? 0;

  const payload = {
    status,
    updated: now.unix(),
    updated_by: operatorId,
  };

  if (status === "late") {
    payload.late_reason = reason;
    if (!Number.isNaN(minutesLate) && minutesLate > 0) {
      payload.minutes_late = minutesLate;
    }
  } else {
    payload.late_reason = null;
    payload.minutes_late = 0;
    payload.notes = reason;
  }

  if (clockInUnix != null) {
    payload.clock_in = clockInUnix;
  }

  if (clockOutUnix != null) {
    payload.clock_out = clockOutUnix;

    const baseIn =
      clockInUnix != null
        ? clockInUnix
        : row?.clock_in != null
        ? row.clock_in
        : null;

    if (baseIn != null) {
      durationMinutes = Math.max(0, Math.floor((clockOutUnix - baseIn) / 60));
      payload.duration_minutes = durationMinutes;
    }
  }

  let created = false;

  if (!row) {
    row = await createAttendance({
      user_id: staffId,
      date,
      clock_in: payload.clock_in ?? null,
      clock_out: payload.clock_out ?? null,
      status: payload.status,
      late_reason: payload.late_reason ?? null,
      minutes_late: typeof payload.minutes_late === "number" ? payload.minutes_late : 0,
      duration_minutes:
        typeof payload.duration_minutes === "number" ? payload.duration_minutes : 0,
      notes: payload.notes ?? null,
      location_latitude: null,
      location_longitude: null,
      ip_address: null,
      device_info: `manual by user_id=${operatorId}`,
      created: now.unix(),
      updated: now.unix(),
      created_by: operatorId,
      updated_by: operatorId,
    });
    created = true;
  } else {
    await updateAttendanceInstance(row, payload);
  }

  const json = row.toJSON ? row.toJSON() : row;

  return { httpStatus: created ? 201 : 200, created, attendance: json };
}

function resolveDate(searchParams) {
  const raw = (searchParams.get("date") || "").trim();
  if (raw) {
    const d = dayjs(raw, "YYYY-MM-DD", true);
    if (d.isValid()) return d;
  }
  return dayjs();
}

function formatTime(unixSeconds) {
  if (!unixSeconds && unixSeconds !== 0) return "";
  const n = Number(unixSeconds);
  if (Number.isNaN(n) || n <= 0) return "";
  return dayjs.unix(n).tz().format("HH:mm");
}

export async function getAttendanceMap(req, currentUser) {
  if (!currentUser) {
    return { httpStatus: 401, msg: "Unauthenticated" };
  }

  const { searchParams } = new URL(req.url);
  const d = resolveDate(searchParams);
  const date = d.format("YYYY-MM-DD");

  const statusFilter = (searchParams.get("status") || "").trim().toLowerCase();
  const q = (searchParams.get("q") || "").trim();

  const rows = await findAttendanceMapRows({ date, statusFilter, q });

  const data = rows.map((row) => {
    const r = row.toJSON ? row.toJSON() : row;
    const u = r.User || {};
    return {
      attendanceId: r.attendance_id,
      userId: r.user_id,
      fullname: u.fullname || "",
      email: u.email || "",
      jobPosition: u.job_position || "",
      phone: u.phone || "",
      date: r.date,
      status: r.status,
      latitude: r.location_latitude != null ? Number(r.location_latitude) : null,
      longitude: r.location_longitude != null ? Number(r.location_longitude) : null,
      clockIn: formatTime(r.clock_in),
      clockOut: formatTime(r.clock_out),
      minutesLate: r.minutes_late || 0,
    };
  });

  return { httpStatus: 200, date, count: data.length, data };
}

function fmtTime(val, tz = TZ) {
  if (val == null || val === "") return "";

  if (typeof val === "number" || /^\d+$/.test(String(val))) {
    const n = Number(val);
    if (Number.isFinite(n)) return dayjs.unix(n).tz(tz).format("HH.mm");
  }

  const tryFormats = ["HH:mm:ss", "HH:mm", "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DDTHH:mm:ssZ"];
  for (const f of tryFormats) {
    const d = dayjs(val, f, true);
    if (d.isValid()) return d.tz(tz).format("HH.mm");
  }

  const d = dayjs(val);
  return d.isValid() ? d.tz(tz).format("HH.mm") : "";
}

function dayShort(d) {
  const map = { Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thurs", Fri: "Fri", Sat: "Sat", Sun: "Sun" };
  const key = dayjs(d).format("ddd");
  return map[key] || key;
}

const GREEN = "#14AE5C";
const YELLOW = "#E8B931";
const RED = "#EC221F";
const LATE_CUTOFF = process.env.NEXT_PUBLIC_LATE_CUTOFF || "10:00";

function toMinutesFromAny(val) {
  if (val == null || val === "") return null;
  if (typeof val === "number" || /^\d+$/.test(String(val))) {
    const n = Number(val);
    const date = dayjs.unix(n).tz(TZ);
    return date.hour() * 60 + date.minute();
  }
  const s = String(val).trim().replace(".", ":");
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
}

function hhmmToMinutes(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

export async function getAttendanceWeekly(req, currentUser) {
  const url = new URL(req.url);
  const staffIdParam = url.searchParams.get("staffId");
  const isSuperadmin = isFlagTrue(currentUser?.is_superadmin);

  let effectiveUserId = currentUser.user_id;

  if (isSuperadmin && staffIdParam) {
    const parsed = parseInt(staffIdParam, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      const targetUser = await findUserById(parsed, { attributes: ["user_id"] });
      if (!targetUser) {
        return { httpStatus: 404, msg: "Staff not found" };
      }
      effectiveUserId = targetUser.user_id;
    }
  }

  const first = await findFirstAttendanceDate(effectiveUserId);
  if (!first) {
    return { httpStatus: 200, weekly: [] };
  }

  const today = dayjs().tz(TZ).startOf("day");
  const firstDate = dayjs(first.date).tz(TZ).startOf("day");

  const sevenDaysAgo = today.subtract(6, "day");
  const start = firstDate.isAfter(sevenDaysAgo) ? firstDate : sevenDaysAgo;

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = today.subtract(i, "day");
    if (d.isBefore(start)) break;

    const dateStr = d.format("YYYY-MM-DD");
    const att = await findAttendanceByUserDateSimple(effectiveUserId, dateStr);

    const hasClockIn = !!att?.clock_in;
    const cinMin = toMinutesFromAny(att?.clock_in);
    const cutoffMin = hhmmToMinutes(LATE_CUTOFF);

    let statusText = "Absent";
    let color = RED;

    if (hasClockIn) {
      const isLate = cutoffMin != null && cinMin != null ? cinMin > cutoffMin : false;
      if (isLate) {
        statusText = "Late";
        color = YELLOW;
      } else {
        statusText = "Normal";
        color = GREEN;
      }
    }

    days.push({
      day: dayShort(d),
      startTime: fmtTime(att?.clock_in),
      endTime: fmtTime(att?.clock_out),
      status: statusText,
      timesheet: att?.timesheet,
      color,
      rawDate: dateStr,
    });
  }

  return { httpStatus: 200, weekly: days };
}

function toYMDStrict(input) {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;
  const d = dayjs(s, "YYYY-MM-DD", true);
  return d.isValid() ? d.format("YYYY-MM-DD") : null;
}

function normalizeRange(searchParams) {
  const period = (searchParams.get("period") || "").toLowerCase();
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  if (period === "period" && fromParam && toParam) {
    const from = toYMDStrict(fromParam);
    const to = toYMDStrict(toParam);

    if (from && to) {
      const fromD = dayjs(from);
      const toD = dayjs(to);

      if (fromD.isValid() && toD.isValid() && !toD.isBefore(fromD)) {
        return { from, to };
      }
    }
  }

  const today = dayjs().tz(TZ);
  const ymd = today.format("YYYY-MM-DD");
  return { from: ymd, to: ymd };
}

function buildWorkingDays(from, to, holidayDatesSet) {
  const out = [];
  let d = dayjs.tz(from, TZ);
  const end = dayjs.tz(to, TZ);

  while (d.isSameOrBefore(end, "day")) {
    const dow = d.day();
    const ymd = d.format("YYYY-MM-DD");
    const isWeekend = dow === 0 || dow === 6;
    const isHoliday = holidayDatesSet.has(ymd);

    if (!isWeekend && !isHoliday) {
      out.push(ymd);
    }

    d = d.add(1, "day");
  }

  return out;
}

function mapReasonToKey(reasonRaw) {
  if (!reasonRaw) return null;
  const r = reasonRaw.toLowerCase().trim();

  if (r.startsWith("cuti tahunan")) return "cutiTahunan";
  if (r.startsWith("menikahkan")) return "menikahkan";
  if (r.startsWith("menikah")) return "menikah";
  if (r.startsWith("melahirkan (suami")) return "melahirkanSuami";
  if (r.startsWith("melahirkan")) return "melahirkan";
  if (r.startsWith("mengkhitankan")) return "mengkhitankan";
  if (r.startsWith("baptis")) return "baptis";
  if (r.startsWith("unpaid")) return "unpaidLeave";
  if (r.startsWith("sakit")) return "sakit";
  if (r.startsWith("berduka")) return "berduka";
  if (r.startsWith("menstruasi")) return "menstruasi";
  if (r.startsWith("umrah")) return "umrah";

  return null;
}

const HEADER_ROW = [
  "DIVISI",
  "NAMA LENGKAP",
  "JABATAN",
  "TELP",
  "EMAIL",
  "TOTAL KERJA",
  "NO-TIMESHEET",
  "TANPA KETERANGN",
  "TERLAMBAT",
  "Cuti Tahunan",
  "Menikah",
  "Menikahkan",
  "Melahirkan",
  "Mengkhitankan",
  "Baptis",
  "Unpaid Leave",
  "Sakit",
  "Berduka Cita (Keluarga Utama)",
  "Menstruasi",
  "Melahirkan (Suami)",
  "Umrah",
  "SISA CUTI",
  "TANGGAL CUTI",
];

export async function exportAttendanceReport(req) {
  const xlsxModule = await import("xlsx");
  const XLSX = xlsxModule.default || xlsxModule;

  const { searchParams } = new URL(req.url);
  const { from, to } = normalizeRange(searchParams);

  const fromLabel = dayjs.tz(from, TZ).format("DD/MM/YYYY");
  const toLabel = dayjs.tz(to, TZ).format("DD/MM/YYYY");

  const baseYear = dayjs.tz(from, TZ).year();
  const yearStart = `${baseYear}-01-01`;
  const yearEnd = `${baseYear}-12-31`;

  const [users, departments] = await Promise.all([
    findUsersForAttendanceExport(),
    findDepartmentsForAttendanceExport(),
  ]);

  const deptMap = new Map();
  for (const d of departments) {
    deptMap.set(d.department_id, d.title);
  }

  const holidayRows = await findHolidaysBetween(from, to);
  const holidaySetPeriod = new Set(holidayRows.map((h) => h.date));
  const workingDays = buildWorkingDays(from, to, holidaySetPeriod);
  const workingDaySet = new Set(workingDays);

  const holidayYearRows = await findHolidaysForYear(yearStart, yearEnd);

  const publicHolidaySetYear = new Set();
  const jointLeaveSetYear = new Set();

  for (const h of holidayYearRows) {
    const t = String(h.type || "holiday").toLowerCase();
    if (t === "leave") jointLeaveSetYear.add(h.date);
    else publicHolidaySetYear.add(h.date);
  }

  const jointLeaveAnnualArr = [];
  for (const ymd of jointLeaveSetYear) {
    const d = dayjs.tz(ymd, TZ);
    const dow = d.day();
    const isWeekend = dow === 0 || dow === 6;
    if (!isWeekend) jointLeaveAnnualArr.push(ymd);
  }
  jointLeaveAnnualArr.sort();

  const attendanceRows = await findAttendanceBetween(from, to);

  const attendanceMap = new Map();
  for (const row of attendanceRows) {
    const key = `${row.user_id}#${row.date}`;
    attendanceMap.set(key, row);
  }

  const allApprovedLeaves = await findApprovedLeavesForYear(yearStart, yearEnd);

  const leaveDailyMap = new Map();
  const annualCutiDatesByUser = new Map();

  const yearStartDayjs = dayjs.tz(yearStart, TZ);
  const yearEndDayjs = dayjs.tz(yearEnd, TZ);

  for (const lv of allApprovedLeaves) {
    const userId = lv.user_id;
    const reasonKey = mapReasonToKey(lv.reason || lv.permit || "");
    if (!reasonKey) continue;

    const leaveStart = dayjs.tz(lv.start_date, TZ);
    const leaveEnd = dayjs.tz(lv.end_date, TZ);

    const effStart = leaveStart.isAfter(from) ? leaveStart : dayjs.tz(from, TZ);
    const effEnd = leaveEnd.isBefore(to) ? leaveEnd : dayjs.tz(to, TZ);

    let d = effStart;
    while (d.isSameOrBefore(effEnd, "day")) {
      const ymd = d.format("YYYY-MM-DD");

      if (workingDaySet.has(ymd)) {
        const key = `${userId}#${ymd}`;
        if (!leaveDailyMap.has(key)) {
          leaveDailyMap.set(key, reasonKey);
        }
      }

      d = d.add(1, "day");
    }

    if (reasonKey === "cutiTahunan") {
      const effYearStart = leaveStart.isAfter(yearStartDayjs) ? leaveStart : yearStartDayjs;
      const effYearEnd = leaveEnd.isBefore(yearEndDayjs) ? leaveEnd : yearEndDayjs;

      let d2 = effYearStart;
      while (d2.isSameOrBefore(effYearEnd, "day")) {
        const ymd2 = d2.format("YYYY-MM-DD");
        const dow = d2.day();
        const isWeekend = dow === 0 || dow === 6;
        const isPublicHoliday = publicHolidaySetYear.has(ymd2);

        if (!isWeekend && !isPublicHoliday) {
          let set = annualCutiDatesByUser.get(userId);
          if (!set) {
            set = new Set();
            annualCutiDatesByUser.set(userId, set);
          }
          set.add(ymd2);
        }

        d2 = d2.add(1, "day");
      }
    }
  }

  let annualQuota = 12;
  const cutiCfg = await findAnnualLeaveConfig();
  if (cutiCfg && cutiCfg.total != null) {
    annualQuota = Number(cutiCfg.total) || annualQuota;
  }

  const userSummaries = [];

  for (const u of users) {
    const userId = u.user_id;

    const counters = {
      totalKerja: 0,
      noTimesheet: 0,
      tanpaKeterangan: 0,
      terlambat: 0,
      cutiTahunan: 0,
      menikah: 0,
      menikahkan: 0,
      melahirkan: 0,
      mengkhitankan: 0,
      baptis: 0,
      unpaidLeave: 0,
      sakit: 0,
      berduka: 0,
      menstruasi: 0,
      melahirkanSuami: 0,
      umrah: 0,
    };

    for (const ymd of workingDays) {
      const key = `${userId}#${ymd}`;

      const leaveKey = leaveDailyMap.get(key);
      if (leaveKey) {
        if (leaveKey === "cutiTahunan") counters.cutiTahunan += 1;
        else if (leaveKey === "menikah") counters.menikah += 1;
        else if (leaveKey === "menikahkan") counters.menikahkan += 1;
        else if (leaveKey === "melahirkan") counters.melahirkan += 1;
        else if (leaveKey === "mengkhitankan") counters.mengkhitankan += 1;
        else if (leaveKey === "baptis") counters.baptis += 1;
        else if (leaveKey === "unpaidLeave") counters.unpaidLeave += 1;
        else if (leaveKey === "sakit") counters.sakit += 1;
        else if (leaveKey === "berduka") counters.berduka += 1;
        else if (leaveKey === "menstruasi") counters.menstruasi += 1;
        else if (leaveKey === "melahirkanSuami") counters.melahirkanSuami += 1;
        else if (leaveKey === "umrah") counters.umrah += 1;
        continue;
      }

      const att = attendanceMap.get(key);
      if (!att) {
        counters.tanpaKeterangan += 1;
        continue;
      }

      const status = att.status;
      const hasTimesheet = att.timesheet === "true";
      const minutesLate = typeof att.minutes_late === "number" ? att.minutes_late : 0;

      if (status === "sick") {
        counters.sakit += 1;
      } else if (status === "leave") {
        counters.unpaidLeave += 1;
      } else if (status === "holiday") {
      } else if (status === "absent") {
        counters.tanpaKeterangan += 1;
      } else if (status === "present" || status === "late" || status === "permission") {
        if (hasTimesheet) counters.totalKerja += 1;
        else counters.noTimesheet += 1;
      }

      if (status === "late" || minutesLate > 0) {
        counters.terlambat += 1;
      }
    }

    let cutiDatesSet = annualCutiDatesByUser.get(userId);

    if (jointLeaveAnnualArr.length > 0) {
      if (!cutiDatesSet) {
        cutiDatesSet = new Set();
        annualCutiDatesByUser.set(userId, cutiDatesSet);
      }
      for (const ymdJL of jointLeaveAnnualArr) {
        cutiDatesSet.add(ymdJL);
      }
    }

    let tanggalCutiStr = "";
    let usedAnnual = 0;

    if (cutiDatesSet && cutiDatesSet.size > 0) {
      const arr = Array.from(cutiDatesSet);
      arr.sort();
      tanggalCutiStr = arr.join("|");
      usedAnnual = arr.length;
    }

    const sisaCuti = annualQuota != null ? annualQuota - usedAnnual : "";

    userSummaries.push({
      userId,
      deptId: u.department_id,
      fullname: u.fullname || "",
      job_position: u.job_position || "",
      phone: u.phone || "",
      email: u.email || "",
      counters,
      sisaCuti,
      tanggalCutiStr,
    });
  }

  const groupedByDept = new Map();

  for (const row of userSummaries) {
    const deptTitle = deptMap.get(row.deptId) || "Tanpa Departemen";

    if (!groupedByDept.has(deptTitle)) {
      groupedByDept.set(deptTitle, []);
    }

    groupedByDept.get(deptTitle).push(row);
  }

  const sortedDeptTitles = Array.from(groupedByDept.keys()).sort((a, b) =>
    a.localeCompare(b)
  );

  for (const deptTitle of sortedDeptTitles) {
    const list = groupedByDept.get(deptTitle);
    list.sort((a, b) => a.fullname.localeCompare(b.fullname));
  }

  const rowsAoA = [];

  rowsAoA.push(["MULAI", fromLabel]);
  rowsAoA.push(["SAMPAI", toLabel]);
  rowsAoA.push([]);

  rowsAoA.push(HEADER_ROW);

  for (const deptTitle of sortedDeptTitles) {
    const staffList = groupedByDept.get(deptTitle) || [];
    if (!staffList.length) continue;

    const deptRow = new Array(HEADER_ROW.length).fill("");
    deptRow[0] = deptTitle;
    rowsAoA.push(deptRow);

    let no = 1;
    for (const row of staffList) {
      const c = row.counters;
      const cols = new Array(HEADER_ROW.length).fill("");

      cols[0] = no;
      cols[1] = row.fullname;
      cols[2] = row.job_position;
      cols[3] = row.phone;
      cols[4] = row.email;
      cols[5] = c.totalKerja || 0;
      cols[6] = c.noTimesheet || 0;
      cols[7] = c.tanpaKeterangan || 0;
      cols[8] = c.terlambat || 0;
      cols[9] = c.cutiTahunan || 0;
      cols[10] = c.menikah || 0;
      cols[11] = c.menikahkan || 0;
      cols[12] = c.melahirkan || 0;
      cols[13] = c.mengkhitankan || 0;
      cols[14] = c.baptis || 0;
      cols[15] = c.unpaidLeave || 0;
      cols[16] = c.sakit || 0;
      cols[17] = c.berduka || 0;
      cols[18] = c.menstruasi || 0;
      cols[19] = c.melahirkanSuami || 0;
      cols[20] = c.umrah || 0;
      cols[21] = row.sisaCuti;
      cols[22] = row.tanggalCutiStr;

      rowsAoA.push(cols);
      no += 1;
    }
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rowsAoA);
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");

  const buffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "buffer",
  });

  const filename = `Attendance_${from}_${to}.xlsx`;

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
