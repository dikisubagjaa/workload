export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { getTaskDetail, updateTaskField } from "@/server/controllers/taskController";

export async function GET(req, { params }) {
    try {
        const { taskId } = params;
        if (!taskId) {
            return jsonResponse({ msg: "Task not found" }, { status: 404 });
        }

        const id = Number(taskId);
        if (!Number.isFinite(id) || id <= 0) {
            return jsonResponse({ msg: "Invalid task id." }, { status: 400 });
        }

        const result = await getTaskDetail(id);
        if (result.status && result.status !== 200) {
            return jsonResponse({ msg: result.msg }, { status: result.status });
        }
        return jsonResponse(result, { status: 200 });
    } catch (error) {
        console.error("Error fetching Tasks:", error);
        return jsonResponse({ msg: error.message }, { status: 500 });
    }
}


export const PUT = withAuth(async function PUT_HANDLER(req, { params }, currentUser) {
    try {
        const { taskId } = params;
        const body = await req.json();

        const result = await updateTaskField(taskId, body, currentUser);
        return jsonResponse(result, { status: result.status || 200 });

    } catch (error) {
        console.error("Error updating Task:", error);
        return jsonResponse({ msg: error.message }, { status: 500 });
    }
});

