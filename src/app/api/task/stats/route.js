// src/app/api/task/stats/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { getTaskStats } from "@/server/controllers/taskController";

export const GET = withAuth(async function GET_HANDLER(req, { params }, currentUser) {
  try {
    const result = await getTaskStats(req, currentUser);
    if (result.status && result.status !== 200) {
      return jsonResponse(result, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching task stats:", error);
    return jsonResponse({ msg: error.message }, { status: 500 });
  }
});
