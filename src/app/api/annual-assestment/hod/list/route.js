export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { listAnnualAssessmentHod } from "@/server/controllers/annualAssestmentController";

export const GET = withActive(async function GET_HANDLER(req, ctx, currentUser) {
  try {
    const result = await listAnnualAssessmentHod(req, currentUser);
    if (result.status) {
      return jsonResponse({ msg: result.msg }, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("GET /annual-assestment/hod/list msg:", error);
    return jsonResponse(
      { msg: error?.message || "Internal error" },
      { status: 500 }
    );
  }
});
