export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { getAttendanceMap } from "@/server/controllers/attendanceController";

export const GET = withActive(async function GET_ATTENDANCE_MAP(req, _ctx, currentUser) {
  try {
    const result = await getAttendanceMap(req, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    console.error("GET /api/attendance/map msg:", err);
    return jsonResponse(
      { msg: err?.message || "Failed to fetch map attendance" },
      { status: 500 }
    );
  }
});
