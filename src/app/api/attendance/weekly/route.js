export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { getAttendanceWeekly } from "@/server/controllers/attendanceController";

export const GET = withAuth(async function GET_HANDLER(req, _ctx, currentUser) {
  try {
    const result = await getAttendanceWeekly(req, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    console.error("attendance/weekly msg:", err);
    return jsonResponse({ msg: "Failed to fetch weekly attendance." }, { status: 500 });
  }
});
