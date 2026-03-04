// /src/app/api/attendance/_rules.js
import dayjs from "dayjs";

export const TZ = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Jakarta";

/** normalisasi "HH:mm" (toleran input "HH:mm:ss") */
function normHHmm(raw, fallback = "00:00") {
  const s = String(raw || fallback).trim();
  const parts = s.split(":");
  const h = parts[0] ?? "0";
  const m = parts[1] ?? "0";
  const hh = String(parseInt(h, 10) || 0).padStart(2, "0");
  const mm = String(parseInt(m, 10) || 0).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** ambil setting jam "HH:mm" (pakai value, fallback ke description) */
async function getHHmmSetting(SettingModel, var_name, fallback) {
  const row = await SettingModel.findOne({ where: { var_name } });
  if (!row) return normHHmm(fallback, fallback);

  const j = row.toJSON ? row.toJSON() : row;
  const val = j.value ?? j.description ?? fallback;
  return normHHmm(val, fallback);
}

// biar gak hardcode ke DB kalau ternyata var_name beda
const START_VAR = process.env.ATTENDANCE_START_VAR || "start_attendance";
const DEADLINE_VAR = process.env.ATTENDANCE_DEADLINE_VAR || "deadline_attendance";

/** jam mulai boleh clock-in (default 05:30) */
export async function getStartAttendanceHHmm(SettingModel) {
  return getHHmmSetting(SettingModel, START_VAR, "05:30");
}

/** deadline clock-in (default 10:00) */
export async function getDeadlineAttendanceHHmm(SettingModel) {
  return getHHmmSetting(SettingModel, DEADLINE_VAR, "10:00");
}

/**
 * Menentukan user "timeable" (strict) atau tidak.
 * - dukung nilai dari session, atau fallback nilai dari DB (dbAbsentType)
 * - terima pola lama: "timeable" / "true" / "1"
 */
export function isTimeableUser(sessionUser, dbAbsentType) {
  const raw = (
    dbAbsentType ??
    sessionUser?.absent_type ??
    sessionUser?.is_timesheet ??
    ""
  )
    .toString()
    .trim()
    .toLowerCase();

  return raw === "timeable" || raw === "true" || raw === "1";
}
