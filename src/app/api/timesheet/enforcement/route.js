export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { getTimesheetEnforcement } from "@/server/controllers/timesheetController";

export const GET = withActive(async function handler(_req, _ctx, currentUser) {
  try {
    const result = await getTimesheetEnforcement(currentUser);
    return jsonResponse(result, { status: 200 });
  } catch (err) {
    console.error("Timesheet enforcement msg:", err);
    return jsonResponse({ msg: err?.message || "Server error" }, { status: 500 });
  }
});
