export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { getProjectTaskTree } from "@/server/controllers/projectTaskController";

export const GET = withActive(async function GET_HANDLER(req, context, currentUser) {
    try {
        const result = await getProjectTaskTree();
        return jsonResponse(result, { status: 200 });
    } catch (error) {
        console.error("Error fetching project-task:", error);
        return jsonResponse({ msg: "Failed to fetch project & task data." }, { status: 500 });
    }
});
