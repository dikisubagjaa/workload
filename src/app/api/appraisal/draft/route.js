// src/app/api/appraisal/draft/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { getAppraisalDraft } from "@/server/controllers/appraisalController";

export const GET = withActive(async function GET_HANDLER(req, ctx, currentUser) {
  try {
    const result = await getAppraisalDraft(req, currentUser);
    if (result.status) {
      return jsonResponse({ msg: result.msg }, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/appraisal/draft msg:", error);
    return jsonResponse(
      { msg: error?.message || "Failed to create draft." },
      { status: 500 }
    );
  }
});
