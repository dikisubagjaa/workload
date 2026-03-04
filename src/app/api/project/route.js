export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive, withAuth } from "@/utils/session";
import { createProject, listProjects } from "@/server/controllers/projectController";

export const GET = withActive(async function GET_HANDLER(req, context, currentUser) {
  try {
    const result = await listProjects();
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("GET /project msg:", error);
    return jsonResponse({ msg: error.message }, { status: 500 });
  }
});

export const POST = withAuth(async function POST_HANDLER(req, context, currentUser) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await createProject(body, currentUser);
    return jsonResponse(result, { status: result.status || 201 });
  } catch (error) {
    console.error("POST /project msg:", error);
    return jsonResponse({ msg: error.message }, { status: 500 });
  }
});
