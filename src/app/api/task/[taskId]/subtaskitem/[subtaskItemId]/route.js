export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import {
  deleteSubtaskItem,
  listSubtaskItems,
  updateSubtaskItem,
} from "@/server/controllers/taskController";

// ============================ PUT ============================
export const PUT = withAuth(async function PUT_HANDLER(req, { params }, currentUser) {
  try {
    const { subtaskItemId } = params;
    const body = await req.json();
    const result = await updateSubtaskItem(subtaskItemId, body, currentUser);
    return jsonResponse(result, { status: result.status || 200 });
  } catch (error) {
    console.error("Error updating subtask item:", error);
    return jsonResponse({ msg: error.message }, { status: 500 });
  }
});

// ============================ GET ============================
export const GET = withAuth(async function GET_HANDLER(req, { params }, currentUser) {
  try {
    const result = await listSubtaskItems();
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching Tasks:", error);
    return jsonResponse({ msg: "Gagal mengambil data" }, { status: 500 });
  }
});

// ============================ DELETE ============================
export const DELETE = withAuth(async function DELETE_HANDLER(req, { params }, currentUser) {
  const { taskId, subtaskItemId } = params;
  try {
    const result = await deleteSubtaskItem(taskId, subtaskItemId, currentUser);
    return jsonResponse(result, { status: result.status || 200 });
  } catch (err) {
    console.error("Soft delete subtask item msg:", err);
    return jsonResponse({ msg: err.message }, { status: 500 });
  }
});
