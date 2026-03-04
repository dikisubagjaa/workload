export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { softDeleteTaskAttachment } from "@/server/controllers/taskController";

export const DELETE = withAuth(async function DELETE_HANDLER(req, { params }, currentUser) {
    try {
        const { taskId, attachmentId } = params;
        console.error("taskId d: ", taskId);

        if (!attachmentId) {
            return jsonResponse({ msg: "Attachment ID is required." }, { status: 400 });
        }
        const result = await softDeleteTaskAttachment(taskId, attachmentId, currentUser);
        return jsonResponse(result, { status: result.status || 200 });

    } catch (error) {
        console.error("Error soft-deleting attachment:", error);
        return jsonResponse({
            msg: error.original?.sqlMessage || error.message || "An error occurred on the server while soft-deleting the attachment."
        }, { status: 500 });
    }
});
