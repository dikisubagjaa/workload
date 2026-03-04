export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { exportAttendanceReport } from "@/server/controllers/attendanceController";

export const GET = withActive(async function ATTENDANCE_EXPORT_HANDLER(req) {
  try {
    const result = await exportAttendanceReport(req);
    if (result instanceof Response) return result;
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    console.error("GET /api/attendance/export msg:", err);
    return jsonResponse(
      { msg: err?.message || "Failed to export attendance report" },
      { status: 500 }
    );
  }
});
