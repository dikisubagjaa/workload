// src/app/api/dashboard/task-list/route.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { getDashboardTaskList } from "@/server/controllers/dashboardController";

export const GET = withActive(async function GET_HANDLER(req, _ctx, currentUser) {
  try {
    const result = await getDashboardTaskList(req, currentUser);
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching Tasks:", error);
    return jsonResponse({ msg: error.message }, { status: 500 });
  }
});
