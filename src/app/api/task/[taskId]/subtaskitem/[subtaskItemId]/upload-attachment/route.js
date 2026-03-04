// src/app/api/task/[taskId]/subtaskitem/[subtaskItemId]/upload-attachment/route.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { uploadFile, getFilename } from "@/utils/imageHelpers";
import { withAuth } from "@/utils/session";
import { uploadSubtaskItemAttachment } from "@/server/controllers/taskController";

export const POST = withAuth(async function POST_HANDLER(req, { params }, currentUser) {
    try {
        const { taskId, subtaskItemId } = params;

        if (!taskId) {
            return jsonResponse({ msg: "Subtask item not found." }, { status: 404 });
        }
        if (!subtaskItemId) {
            return jsonResponse({ msg: "Subtask item not found." }, { status: 404 });
        }

        const contentType = req.headers.get("content-type");
        if (!contentType || !contentType.includes("multipart/form-data")) {
            return jsonResponse({ msg: "Missing or invalid Content-Type." }, { status: 400 });
        }

        const formData = await req.formData();
        const file = formData.get("file");
        const rawRev = formData.get("attachment_id"); // optional, untuk re-parent revisi

        if (!file) {
            return jsonResponse({ msg: "File not found in formData." }, { status: 400 });
        }

        const out = await uploadFile(file, "task");
        const originalFileName = String(file.name || "").trim();
        const result = await uploadSubtaskItemAttachment(
            subtaskItemId,
            { storedFilename: getFilename(out.original), originalFileName },
            currentUser,
            rawRev
        );

        return jsonResponse(result, { status: result.status || 200 });

    } catch (error) {
        console.error("Error uploading file to subtask item:", error);
        return jsonResponse({
            msg: error.original?.sqlMessage || error.message || "An error occurred while uploading file to subtask item."
        }, { status: 500 });
    }
});
