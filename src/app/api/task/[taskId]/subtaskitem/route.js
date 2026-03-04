export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { createSubtaskItem, getSubtaskItemDetail } from "@/server/controllers/taskController";


export async function GET(req, { params }) {
    try {
        const { taskId } = params;
        if (!taskId) {
            return jsonResponse({ msg: "Task not found" }, { status: 404 });
        }
        const result = await getSubtaskItemDetail(taskId);
        if (result.status && result.status !== 200) {
            return jsonResponse({ msg: result.msg }, { status: result.status });
        }
        return jsonResponse(result, { status: 200 });
    } catch (error) {
        console.error("Error fetching Tasks:", error);
        return jsonResponse({ msg: error.message }, { status: 500 });
    }
}

export const POST = withAuth(async function POST_HANDLER(req, { params }, currentUser) {
    try {
        const { taskId } = params;
        const body = await req.json();
        const result = await createSubtaskItem(taskId, body, currentUser);
        return jsonResponse(result, { status: result.status || 200 });

    } catch (error) {
        console.error("Error adding subtask item:", error);
        return jsonResponse({
            msg: error.original?.sqlMessage || error.message || "An error occurred while adding the subtask item."
        }, { status: 500 });
    }
});

// Handler GET untuk mengambil daftar subtask item (jika dibutuhkan, bisa ditambahkan di sini)
// export const GET = async function GET_HANDLER(req, { params }) { /* ... */ };
