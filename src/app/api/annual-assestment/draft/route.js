export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { getAnnualAssessmentDraft } from "@/server/controllers/annualAssestmentController";

export const GET = withActive(async function GET_HANDLER(req, ctx, currentUser) {
  try {
    const result = await getAnnualAssessmentDraft(req, currentUser);
    if (result.status) {
      return jsonResponse({ msg: result.msg, meta: result.meta }, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("GET /annual-assestment/draft msg:", error);
    return jsonResponse(
      { msg: error?.message || "Internal error" },
      { status: 500 }
    );
  }
});
