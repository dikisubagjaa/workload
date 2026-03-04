export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { createManualAttendance } from "@/server/controllers/attendanceController";

export const POST = withActive(async function POST_MANUAL(req, _ctx, currentUser) {
  try {
    const result = await createManualAttendance(req, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    console.error("POST /api/attendance/manual msg:", err);
    return jsonResponse({ msg: err?.message || "Failed" }, { status: 500 });
  }
});
