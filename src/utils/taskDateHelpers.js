import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(relativeTime);

export const colorMap = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#EC221F",
  yellow: "#E8B931",
  green: "#14AE5C",
  purple: "#D42DA4",
};

export const toUnix = (v) => (typeof v === "number" ? v : Number(v));

export const fmtDate = (unixSec) => {
  const unix = toUnix(unixSec);
  return Number.isFinite(unix) ? dayjs.unix(unix).format("ddd, D MMM YY") : "-";
};

export const fmtDueTime = (unixSec) => {
  const unix = toUnix(unixSec);
  if (!Number.isFinite(unix)) return "-";

  const due = dayjs.unix(unix);
  const now = dayjs();
  return due.isBefore(now) ? due.from(now) : `in ${now.to(due, true)}`;
};

/**
 * Color by due date diff:
 * - overdue -> red
 * - due within 3 days -> yellow
 * - else -> green
 */
export const renderColorTodo = (dueDate) => {
  const unix = toUnix(dueDate);
  if (!Number.isFinite(unix)) return colorMap.black;

  const d = dayjs.unix(unix).startOf("day");
  const today = dayjs().startOf("day");
  const diffDays = d.diff(today, "day");

  if (diffDays < 0) return colorMap.red;
  if (diffDays <= 3) return colorMap.yellow;
  return colorMap.green;
};
