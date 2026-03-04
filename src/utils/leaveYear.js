// src/utils/leaveYear.js
import dayjs from "dayjs";

/**
 * Leave year default: 1 Apr - 31 Mar
 * anchorYmd: "YYYY-MM-DD" (biasanya startDate / today)
 */
export function getLeaveYearRange(anchorYmd, resetMonth = 4, resetDay = 1) {
  const ref = dayjs(anchorYmd, "YYYY-MM-DD", true);
  const d = ref.isValid() ? ref : dayjs();

  const y = d.year();
  const resetThisYear = dayjs(
    `${y}-${String(resetMonth).padStart(2, "0")}-${String(resetDay).padStart(2, "0")}`,
    "YYYY-MM-DD",
    true
  );

  // kalau tanggal < reset date -> start = tahun sebelumnya
  const startYear = d.isBefore(resetThisYear, "day") ? y - 1 : y;

  const yearStart = dayjs(
    `${startYear}-${String(resetMonth).padStart(2, "0")}-${String(resetDay).padStart(2, "0")}`,
    "YYYY-MM-DD",
    true
  );

  const yearEnd = yearStart.add(1, "year").subtract(1, "day");

  return {
    yearStart: yearStart.format("YYYY-MM-DD"),
    yearEnd: yearEnd.format("YYYY-MM-DD"),
  };
}
