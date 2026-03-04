// src/app/api/appraisal/question/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { listAppraisalQuestions } from "@/server/controllers/appraisalController";

export const GET = withActive(async function GET_HANDLER(req, ctx, currentUser) {
  try {
    const result = await listAppraisalQuestions(req);
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/appraisal/question msg:", error);
    return jsonResponse(
      { msg: error?.message || "Failed to fetch questions." },
      { status: 500 }
    );
  }
});
