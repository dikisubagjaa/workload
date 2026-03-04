export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { getAttendanceList } from "@/server/controllers/attendanceController";

export const GET = withActive(async function GET_HANDLER(req) {
  try {
    const result = await getAttendanceList(req);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    console.error("GET /api/attendance/list msg:", err);
    return jsonResponse(
      { msg: err?.message || "Failed to fetch attendance list" },
      { status: 500 }
    );
  }
});
