// src/app/api/project/stats/route.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { getProjectStats } from "@/server/controllers/projectController";

export const GET = withAuth(async function GET_HANDLER(req, context, currentUser) {
    try {
        const result = await getProjectStats(currentUser);
        return jsonResponse(result, { status: 200 });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return jsonResponse(
            { msg: "Failed to fetch dashboard stats." },
            { status: 500 }
        );
    }
});
