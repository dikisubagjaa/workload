import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

export const TZ = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Jakarta";

dayjs.extend(utc);
dayjs.extend(timezone);

// Set timezone default
dayjs.tz.setDefault(TZ);

export default dayjs;
