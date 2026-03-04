// src/app/api/appraisal/approve/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { approveAppraisal } from "@/server/controllers/appraisalController";

export const POST = withActive(async function POST_HANDLER(req, ctx, currentUser) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await approveAppraisal(body, currentUser);
    if (result.status) {
      return jsonResponse({ msg: result.msg }, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("POST /api/appraisal/approve msg:", error);
    return jsonResponse({ msg: error?.message || "Failed." }, { status: 500 });
  }
});
