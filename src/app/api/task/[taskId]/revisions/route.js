// src/app/api/task/[taskId]/revisions/route.js
import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { createTaskRevisionRequest, listTaskRevisions } from "@/server/controllers/taskController";

// ================= GET: list revisions for a task =================
export const GET = withAuth(async function GET_HANDLER(req, { params }) {
  try {
    const { taskId } = params;
    const result = await listTaskRevisions(taskId);
    return jsonResponse(result, { status: 200 });
  } catch (err) {
    console.error("GET revisions msg:", err);
    return jsonResponse(
      { msg: err.message || "Failed to fetch revisions." },
      { status: 500 }
    );
  }
});

// ================= POST: create revision =================
export const POST = withAuth(
  async function POST_HANDLER(req, { params }, currentUser) {
    try {
      const { taskId } = params;
      const body = (await req.json().catch(() => ({}))) || {};
      const result = await createTaskRevisionRequest(taskId, body, currentUser);
      return jsonResponse(result, { status: result.status || 200 });
    } catch (err) {
      console.error("POST revision msg:", err);
      return jsonResponse(
        { msg: err.message || "Failed to create revision." },
        { status: 500 }
      );
    }
  }
);
