// src/app/api/attendance/_guard.js

const MIN_LATE_REASON_CHARS = 8; // hitung karakter tanpa spasi

function parseHHmm(hhmm = "00:00") {
  const [h = "0", m = "0"] = String(hhmm).split(":");
  return { h: +h || 0, m: +m || 0 };
}

function charCountNoSpaces(s) {
  return String(s || "").replace(/\s/g, "").length;
}

/**
 * validateClockIn
 * - strict: true untuk user "timeable"
 * - now: dayjs.tz(...) sudah timezone-aware
 * - openHHmm: jam paling awal boleh clock-in (HH:mm)
 * - deadlineHHmm: jam batas normal (HH:mm) -> lewat ini butuh alasan (late_reason)
 * - late_reason: alasan keterlambatan
 *
 * return:
 * - { success: false, error }
 * - { success: false, need_reason: true, deadline }
 * - { success: true, status: "present"|"late", minutesLate, deadline }
 */
export function validateClockIn({ strict, now, openHHmm, deadlineHHmm, late_reason }) {
  // Non strict user: bebas (di route sudah ada guard lain seperti IP / geolocation)
  if (!strict) {
    return { success: true, status: "present", minutesLate: 0, deadline: null };
  }

  const { h: openH, m: openM } = parseHHmm(openHHmm);
  const { h: dlH, m: dlM } = parseHHmm(deadlineHHmm);

  const open = now.clone().hour(openH).minute(openM).second(0).millisecond(0);
  const deadline = now.clone().hour(dlH).minute(dlM).second(0).millisecond(0);

  // Sebelum jam buka
  if (now.isBefore(open)) {
    return {
      success: false,
      msg: `Attendance is not available yet. Starts at ${open.format("HH:mm")}.`,
    };
  }

  // Lewat deadline → butuh alasan (minimal karakter tanpa spasi)
  if (now.isAfter(deadline)) {
    const chars = charCountNoSpaces(late_reason);
    if (chars < MIN_LATE_REASON_CHARS) {
      return {
        success: false,
        need_reason: true,
        deadline: deadline.format("HH:mm"),
        msg: `Late clock-in requires at least ${MIN_LATE_REASON_CHARS} characters (excluding spaces).`,
      };
    }

    const minutesLate = Math.max(0, now.diff(deadline, "minute"));
    return {
      success: true,
      status: "late",
      minutesLate,
      deadline: deadline.format("HH:mm"),
    };
  }

  // Dalam rentang normal
  return {
    success: true,
    status: "present",
    minutesLate: 0,
    deadline: deadline.format("HH:mm"),
  };
}

/**
 * validateClockOut
 * - strict: true untuk user "timeable"
 * - clock_in_unix: unix timestamp dari clock-in
 * - now: dayjs.tz(...)
 *
 * return:
 * - { success: true }
 * - { success: false, need_seconds }
 */
export function validateClockOut({ strict, clock_in_unix, now }) {
  const EIGHT_HOURS_SECONDS = 8 * 60 * 60;

  if (!strict) return { success: true };

  const worked = now.unix() - (clock_in_unix || 0);
  if (worked < EIGHT_HOURS_SECONDS) {
    return { success: false, need_seconds: EIGHT_HOURS_SECONDS - worked };
  }

  return { success: true };
}
