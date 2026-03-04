export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { uploadFile, getFilename } from "@/utils/imageHelpers";
import { uploadTaskAttachment } from "@/server/controllers/taskController";

export const POST = withAuth(async function POST_HANDLER(req, { params }, currentUser) {
    try {
        const { taskId } = params;

        // Validasi content-type
        const contentType = req.headers.get("content-type");
        if (!contentType || !contentType.includes("multipart/form-data")) {
            return jsonResponse({ msg: "Missing or invalid Content-Type" }, { status: 400 });
        }

        // Ambil file
        const formData = await req.formData();
        const file = formData.get("file");
        if (!file) {
            console.log("Backend Upload: ERROR - File not found in formData.");
            return jsonResponse({ msg: "File not found" }, { status: 400 });
        }

        const originalFileName = String(file.name || "").trim();
        console.log("Backend Upload: incoming file =", originalFileName);

        // === Simpan file via helper yang seragam ===
        const out = await uploadFile(file, "task");
        const result = await uploadTaskAttachment(
            taskId,
            { storedFilename: getFilename(out.original), originalFileName },
            currentUser
        );
        return jsonResponse(result, { status: result.status || 200 });

    } catch (error) {
        console.error("Backend Upload: ERROR", error);
        return jsonResponse({
            msg: error.original?.sqlMessage || error.message || "An error occurred on the server while uploading the file."
        }, { status: 500 });
    }
});
