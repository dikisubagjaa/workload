
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { createSubtaskForTask, getSubtaskTaskDetail, updateSubtaskTask } from "@/server/controllers/taskController";

// Ambil semua profil dari database
export async function GET(req, { params }) {
  try {
    const { taskId } = params;
    const result = await getSubtaskTaskDetail(taskId);
    if (result.status && result.status !== 200) {
      return jsonResponse({ msg: result.msg }, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching Tasks:", error);
    return jsonResponse({ msg: error.message }, { status: 500 });
  }
}


export async function PUT(req, { params }) {
  try {
    const { taskId } = params;
    const body = await req.json();
    const result = await updateSubtaskTask(taskId, body);
    if (result.status && result.status !== 200) {
      return jsonResponse({ msg: result.msg }, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error adding Task:", error);
    return jsonResponse({ msg: error.message }, { status: 500 });
  }
}

export const POST = withAuth(async function POST_HANDLER(req, { params }, currentUser) {
  try {
    const { taskId } = params;
    const body = await req.json();
    const result = await createSubtaskForTask(taskId, body, currentUser);
    return jsonResponse(result, { status: result.status || 200 });
  } catch (error) {
    console.error("Error adding SubTask:", error);
    return jsonResponse({ msg: error.message }, { status: 500 });
  }
})
