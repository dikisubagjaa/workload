export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { submitAnnualAssessmentHod } from "@/server/controllers/annualAssestmentController";

// optional notifier (kalau ada di project kamu)
let notifier = null;
try {
  // kalau path kamu beda, ganti sesuai project
  // eslint-disable-next-line global-require, import/no-unresolved
  notifier = require("@/utils/notifier");
} catch (e) {
  notifier = null;
}


export const POST = withActive(async function POST_HANDLER(req, ctx, currentUser) {
  try {
    const result = await submitAnnualAssessmentHod(req, currentUser, notifier);
    if (result.status) {
      return jsonResponse({ msg: result.msg }, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("POST /annual-assestment/hod/submit msg:", error);
    const code = error?.statusCode || 500;
    return jsonResponse(
      { msg: error?.message || "Internal error" },
      { status: code }
    );
  }
});
