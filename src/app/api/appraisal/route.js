// src/app/api/appraisal/route.js  (LIST)
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { listAppraisals } from "@/server/controllers/appraisalController";

export const GET = withActive(async function GET_HANDLER(req, ctx, currentUser) {
  try {
    const result = await listAppraisals(req, currentUser);
    if (result.status) {
      return jsonResponse({ msg: result.msg }, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/appraisal msg:", error);
    return jsonResponse({ msg: error?.message || "Failed to fetch appraisal list." }, { status: 500 });
  }
});
