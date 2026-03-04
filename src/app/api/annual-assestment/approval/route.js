export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { submitAnnualAssessmentApproval } from "@/server/controllers/annualAssestmentController";

export const POST = withActive(async function POST_HANDLER(req, ctx, currentUser) {
  try {
    const result = await submitAnnualAssessmentApproval(req, currentUser);
    if (result.status) {
      return jsonResponse({ msg: result.msg }, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("POST /annual-assestment/approval msg:", error);
    const code = error?.statusCode || 500;
    return jsonResponse({ msg: error?.message || "Internal error" }, { status: code });
  }
});
