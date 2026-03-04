export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { submitAnnualAssessment } from "@/server/controllers/annualAssestmentController";

export const POST = withActive(async function POST_HANDLER(req, ctx, currentUser) {
  try {
    const result = await submitAnnualAssessment(req, currentUser);
    if (result.status) {
      return jsonResponse({ msg: result.msg, meta: result.meta }, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("POST /annual-assestment/submit msg:", error);
    return jsonResponse(
      { msg: error?.message || "Internal error" },
      { status: 500 }
    );
  }
});
