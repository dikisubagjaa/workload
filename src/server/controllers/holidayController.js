import db from "@/database/models";
import { nowUnix } from "@/utils/dateHelpers";
import { Op, findHolidays, findHolidayByDate, findHolidayById, updateHolidayById, createHoliday } from "@/server/queries/holidayQueries";

const { User } = db;

const ALLOWED_TYPES = new Set(["holiday", "leave"]);

const HOLIDAY_TYPE_TO_TYPE = {
  public_holiday: "holiday",
  joint_leave: "leave",
  tanggal_merah: "holiday", 
  tgl_merah: "holiday",
  cuti_bersama: "leave",
};

function deriveHolidayTypeFromType(type) {
  return type === "leave" ? "joint_leave" : "public_holiday";
}

function normalizeTypeInput(typeRaw, holidayTypeRaw) {
  const type = typeRaw != null ? String(typeRaw).toLowerCase().trim() : "";
  const holidayType = holidayTypeRaw != null ? String(holidayTypeRaw).toLowerCase().trim() : "";

  if (holidayType) {
    const mapped = HOLIDAY_TYPE_TO_TYPE[holidayType];
    if (!mapped) return { ok: false, error: "Invalid holidayType." };
    return { ok: true, type: mapped, holidayType: holidayType === "leave" ? "joint_leave" : holidayType };
  }

  const finalType = type || "holiday";
  if (!ALLOWED_TYPES.has(finalType)) {
    return { ok: false, error: "Field 'type' must be 'holiday' or 'leave'." };
  }
  return { ok: true, type: finalType, holidayType: deriveHolidayTypeFromType(finalType) };
}

export async function listHolidays(req) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");

  const typeParamRaw = searchParams.get("type");
  const holidayTypeParamRaw = searchParams.get("holidayType") || searchParams.get("holiday_type");

  const parsed = normalizeTypeInput(typeParamRaw, holidayTypeParamRaw);

  const where = {};

  if (yearParam) {
    const y = Number(yearParam);
    if (!Number.isNaN(y) && Op?.between) {
      const from = `${y}-01-01`;
      const to = `${y}-12-31`;
      where.date = { [Op.between]: [from, to] };
    }
  }

  if (typeParamRaw || holidayTypeParamRaw) {
    if (!parsed.ok) {
      return { httpStatus: 400, msg: parsed.error };
    }
    where.type = parsed.type;
  }

  const rows = await findHolidays(where);

  const payload = rows.map((h) => {
    const obj = h.toJSON();
    obj.holidayType = deriveHolidayTypeFromType(obj.type);
    return obj;
  });

  return { holidays: payload };
}

export async function createHolidayFromBody(body, currentUser) {
  const parsed = normalizeTypeInput(body?.type, body?.holidayType || body?.holiday_type);
  if (!parsed.ok) {
    return { httpStatus: 400, msg: parsed.error };
  }

  const rawDate = body?.date;
  const rawDesc = body?.description;

  const date = rawDate != null && String(rawDate).trim() !== "" ? String(rawDate).trim().slice(0, 10) : "";
  const description = rawDesc != null ? String(rawDesc).trim() : "";

  if (!date) return { httpStatus: 400, msg: "Field 'date' is required (YYYY-MM-DD)." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { httpStatus: 400, msg: "Field 'date' must be in format YYYY-MM-DD." };
  }
  if (!description) return { httpStatus: 400, msg: "Field 'description' is required." };
  if (description.length > 120) {
    return { httpStatus: 400, msg: "Field 'description' must not exceed 120 characters." };
  }

  const userId = currentUser?.user_id ?? currentUser?.id ?? null;
  if (!userId) return { httpStatus: 500, msg: "Invalid current user (missing user_id)." };

  const existing = await findHolidayByDate(date);
  if (existing) return { httpStatus: 400, msg: "Holiday for this date already exists." };

  const now = nowUnix();

  const newHoliday = await createHoliday({
    type: parsed.type,
    date,
    description,
    created: now,
    created_by: userId,
    updated: now,
    updated_by: userId,
  });

  const out = newHoliday.toJSON();
  out.holidayType = deriveHolidayTypeFromType(out.type);

  return { httpStatus: 201, msg: "Holiday created", holiday: out };
}

export async function getHolidayById(holidayId) {
  const holiday = await findHolidayById(holidayId);
  if (!holiday) return { httpStatus: 404, msg: "Holiday not found." };
  return { holiday: holiday.toJSON() };
}

export async function updateHolidayFromBody(holidayId, body, currentUser) {
  const fields = {};

  if (body.type !== undefined) {
    const rawType = body.type;
    const type = rawType != null ? String(rawType).trim().toLowerCase() : "";

    if (!type) return { httpStatus: 400, msg: "Field 'type' cannot be empty." };
    if (!ALLOWED_TYPES.has(type)) {
      return { httpStatus: 400, msg: "Field 'type' must be 'holiday' or 'leave'." };
    }

    fields.type = type;
  }

  if (body.date !== undefined) {
    const rawDate = body.date;
    const date = rawDate != null && String(rawDate).trim() !== "" ? String(rawDate).trim().slice(0, 10) : "";

    if (!date) return { httpStatus: 400, msg: "Field 'date' cannot be empty." };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { httpStatus: 400, msg: "Field 'date' must be in format YYYY-MM-DD." };
    }

    if (Op?.ne) {
      const existing = await findHolidayByDate(date);
      if (existing && String(existing.holiday_id) !== String(holidayId)) {
        return { httpStatus: 400, msg: "Holiday for this date already exists." };
      }
    }

    fields.date = date;
  }

  if (body.description !== undefined) {
    const description = body.description != null ? String(body.description).trim() : "";

    if (!description) return { httpStatus: 400, msg: "Field 'description' cannot be empty." };
    if (description.length > 120) {
      return { httpStatus: 400, msg: "Field 'description' must not exceed 120 characters." };
    }

    fields.description = description;
  }

  if (Object.keys(fields).length === 0) {
    return { httpStatus: 400, msg: "No valid fields to update." };
  }

  const userId = currentUser?.user_id ?? currentUser?.id ?? null;
  if (!userId) return { httpStatus: 500, msg: "Invalid current user (missing user_id)." };

  const now = nowUnix();
  fields.updated = now;
  fields.updated_by = userId;

  const [updatedCount] = await updateHolidayById(holidayId, fields);
  if (!updatedCount) {
    return { httpStatus: 404, msg: "Holiday not found or no changes applied." };
  }

  const updatedHoliday = await findHolidayById(holidayId);
  return { msg: "Holiday updated", holiday: updatedHoliday?.toJSON() || null };
}

export async function deleteHoliday(holidayId, currentUser) {
  const userId = currentUser?.user_id ?? currentUser?.id ?? null;
  if (!userId) return { httpStatus: 500, msg: "Invalid current user (missing user_id)." };

  const now = nowUnix();
  const [deletedCount] = await updateHolidayById(holidayId, { deleted: now, deleted_by: userId });

  if (!deletedCount) return { httpStatus: 404, msg: "Holiday not found or already deleted." };

  return { msg: "Holiday deleted" };
}

export async function setGlobalAttendanceType(body, currentUser) {
  const userId = currentUser?.user_id ?? currentUser?.id ?? null;
  if (!userId) return { httpStatus: 500, msg: "Invalid current user (missing user_id)." };

  const rawMode = body?.mode ?? body?.attendance_type ?? body?.attendanceType ?? "";
  const mode = String(rawMode || "").toLowerCase().trim();
  const target = mode === "office" ? "office" : mode === "wfh" || mode === "anywhere" ? "anywhere" : "";
  if (!target) return { httpStatus: 400, msg: "mode must be 'office' or 'wfh'." };

  const rawExcept = body?.except_user_ids ?? body?.exceptUserIds ?? body?.except_users ?? [];
  const exceptIds = Array.isArray(rawExcept)
    ? rawExcept.map((v) => Number(v)).filter((v) => Number.isFinite(v) && v > 0)
    : [];
  const uniqueExcept = Array.from(new Set(exceptIds));

  const now = nowUnix();
  const baseWhere = { deleted: null, deleted_by: null };
  const payloadAll = { attendance_type: target, updated: now, updated_by: userId };

  const whereAll = uniqueExcept.length
    ? { ...baseWhere, user_id: { [Op.notIn]: uniqueExcept } }
    : baseWhere;

  const [updatedAll] = await User.update(payloadAll, { where: whereAll });

  let updatedExcept = 0;
  if (target === "office" && uniqueExcept.length) {
    const [count] = await User.update(
      { attendance_type: "anywhere", updated: now, updated_by: userId },
      { where: { ...baseWhere, user_id: { [Op.in]: uniqueExcept } } }
    );
    updatedExcept = count || 0;
  }

  return {
    msg: "Attendance type updated",
    updatedAll,
    updatedExcept,
    target,
    exceptIds: uniqueExcept,
  };
}
