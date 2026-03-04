export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { deleteTaskDepartment } from "@/server/controllers/taskController";

// DELETE /api/task/:taskId/department/:departmentId
export const DELETE = withAuth(async function DELETE_HANDLER(req, { params }, currentUser) {
  try {
    const { taskId, departmentId } = params;
    const result = await deleteTaskDepartment(taskId, departmentId, currentUser);
    return jsonResponse(result, { status: result.status || 200 });
  } catch (error) {
    console.error("Error deleting department from task:", error);
    return jsonResponse({ msg: error.message || "Internal Server Error" }, { status: 500 });
  }
});
