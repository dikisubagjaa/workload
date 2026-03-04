export const dynamic = "force-dynamic";
export const revalidate = 0;

import "server-only";
import { jsonResponse } from "@/utils/apiResponse";
import { listProjectTasks } from "@/server/controllers/projectController";

export async function GET(req, { params }) {
    const projectIdRaw = params?.projectId;
    const projectId = Number(projectIdRaw);

    if (!projectId || !Number.isFinite(projectId) || projectId <= 0) {
        return jsonResponse(
            { msg: "projectId is required" },
            { status: 400 }
        );
    }

    try {
        const result = await listProjectTasks(projectId);
        return jsonResponse(result, { status: 200 });
    } catch (err) {
        console.error("[project task] msg:", err);
        return jsonResponse(
            { msg: "Failed to fetch project task" },
            { status: 500 }
        );
    }
}
