export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session"; // samain dengan import yg lain
import { deleteSubtask, updateSubtask } from "@/server/controllers/taskController";

// EDIT SUBTASK
export const PUT = withAuth(async (req, { params }, currentUser) => {
    try {
        const { taskId, tsId } = params;
        const body = await req.json();
        const result = await updateSubtask(taskId, tsId, body, currentUser);
        return jsonResponse(result, { status: result.status || 200 });
    } catch (e) {
        console.error("Update Subtask msg:", e);
        return jsonResponse({ msg: e.message }, { status: 500 });
    }
});

// DELETE SUBTASK
export const DELETE = withAuth(async (_req, { params }, currentUser) => {
    try {
        const { taskId, tsId } = params;
        const result = await deleteSubtask(taskId, tsId, currentUser);
        return jsonResponse(result, { status: result.status || 200 });
    } catch (e) {
        console.error("Delete Subtask msg:", e);
        return jsonResponse({ msg: e.message }, { status: 500 });
    }
});
