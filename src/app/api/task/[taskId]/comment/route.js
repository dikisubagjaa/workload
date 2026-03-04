export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { addTaskComment, listTaskComments } from "@/server/controllers/taskController";

// ===== POST: tambah komentar =====
export const POST = withAuth(async function POST_HANDLER(req, { params }, currentUser) {
  try {
    const { taskId } = params;
    const body = await req.json();
    const result = await addTaskComment(taskId, body, currentUser);
    return jsonResponse(result, { status: result.status || 200 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return jsonResponse(
      { msg: error.original?.sqlMessage || error.message || "An error occurred while adding the comment." },
      { status: 500 }
    );
  }
});

// ===== GET: list komentar + mapping mention user & file =====
export async function GET(req, { params }) {
  try {
    const { taskId } = params;
    const result = await listTaskComments(taskId);
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return jsonResponse(
      { msg: error.original?.sqlMessage || error.message || 'Failed to fetch comments.' },
      { status: 500 }
    );
  }
}
