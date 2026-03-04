export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import {
    getProjectDetail,
    parseProjectId,
    updateProject,
    softDeleteProject,
} from "@/server/controllers/projectController";

/* ============================ GET ============================ */
export const GET = withActive(async function GET_HANDLER(req, { params }) {
    try {
        const projectId = parseProjectId(req, params);
        if (!projectId) {
            return jsonResponse({  msg: "Project not found" }, { status: 404 });
        }

        const detail = await getProjectDetail(projectId);
        if (!detail) {
            return jsonResponse({ msg: "Project not found" }, { status: 404 });
        }
        return jsonResponse({ data: detail }, { status: 200 });
    } catch (error) {
        console.error("GET /api/project/[projectId] msg:", error);
        return jsonResponse({ msg: error.message }, { status: 500 });
    }
});

/* ============================ PUT ============================ */
export const PUT = withActive(async function PUT_HANDLER(req, { params }, currentUser) {
    try {
        const projectId = parseProjectId(req, params);
        if (!projectId) {
            return jsonResponse({ msg: "Project not found" }, { status: 404 });
        }

        const payload = await req.json().catch(() => ({}));
        const result = await updateProject(projectId, payload, currentUser);
        return jsonResponse(result, { status: result.status || 200 });
    } catch (error) {
        console.error("PUT /api/project/[projectId] msg:", error);
        return jsonResponse({ msg: error.message }, { status: 500 });
    }
});

/* ============================ DELETE (Soft delete) ============================ */
export const DELETE = withActive(async function DELETE_HANDLER(req, { params }, currentUser) {
    try {
        const projectId = parseProjectId(req, params);
        if (!projectId) {
            return jsonResponse({ msg: "Project not found" }, { status: 404 });
        }

        const result = await softDeleteProject(projectId, currentUser);
        return jsonResponse(result, { status: result.status || 200 });
    } catch (error) {
        console.error("DELETE /api/project/[projectId] msg:", error);
        return jsonResponse({ msg: error.message }, { status: 500 });
    }
});
