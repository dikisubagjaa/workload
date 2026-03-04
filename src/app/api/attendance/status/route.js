export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { getAttendanceStatus } from "@/server/controllers/attendanceController";

export const GET = withAuth(async function GET_HANDLER(_req, _ctx, currentUser) {
  try {
    const result = await getAttendanceStatus(currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error checking attendance status:", error);
    return jsonResponse({ msg: "Failed to check attendance status." }, { status: 500 });
  }
});
