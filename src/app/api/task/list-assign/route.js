// src/app/api/task/list-assign/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { listAssignedTasks } from "@/server/controllers/taskController";

export const GET = withAuth(async function GET_HANDLER(req, _ctx, currentUser) {
  try {
    const sp = req.nextUrl.searchParams;
    console.log("[api/task/list-assign] request", {
      user_id: currentUser?.user_id,
      scope: sp.get("scope"),
      assignees: sp.get("assignees"),
      category: sp.get("category"),
      statuses: sp.get("statuses"),
      staffId: sp.get("staffId"),
      q: sp.get("q"),
    });

    const result = await listAssignedTasks(req, currentUser);
    console.log("[api/task/list-assign] response", {
      count: Array.isArray(result?.tasks) ? result.tasks.length : 0,
    });
    return jsonResponse(result, { status: 200 });
  } catch (err) {
    console.error("Error list-assign:", err);
    return jsonResponse(
      { msg: "Gagal mengambil data task (assigned)" },
      { status: 500 }
    );
  }
});
