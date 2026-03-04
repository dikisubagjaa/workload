export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session"; // Mengimpor withActive untuk autentikasi
import { createProjectTypeFromBody, listProjectTypes } from "@/server/controllers/projectTypeController";

// GET Handler
export const GET = withActive(async function GET_HANDLER(req) {
    try {
        const result = await listProjectTypes();
        return jsonResponse(result, { status: 200 });
    } catch (error) {
        console.error("Error fetching Project Types:", error);
        return jsonResponse({ msg: "Failed to fetch data" }, { status: 500 });
    }
});

// POST Handler yang Diperbaiki
export const POST = withActive(async function POST_HANDLER(req, context, currentUser) {
    try {
        const body = await req.json();
        const result = await createProjectTypeFromBody(body, currentUser);
        return jsonResponse(result, { status: result.status || 200 });

    } catch (error) {
        console.error("Error adding Project Type:", error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return jsonResponse({ msg: "Project type with this title already exists." }, { status: 409 });
        }
        return jsonResponse({ msg: "Failed to add project type" }, { status: 500 });
    }
});
