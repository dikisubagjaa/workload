export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { listAnnualAssessmentPeriods, upsertAnnualAssessmentPeriod } from "@/server/controllers/masterController";

export const GET = withActive(async function GET_HANDLER(req, ctx, currentUser) {
  try {
    const result = await listAnnualAssessmentPeriods(req, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("GET /master/annual-assesment-period msg:", error);
    return jsonResponse({ msg: "Internal error" }, { status: 500 });
  }
});

export const POST = withActive(async function POST_HANDLER(req, ctx, currentUser) {
  try {
    const body = await req.json();
    const result = await upsertAnnualAssessmentPeriod(body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("POST /master/annual-assesment-period msg:", error);

    if (
      String(error?.name || "").toLowerCase().includes("sequel") &&
      String(error?.message || "").toLowerCase().includes("uq_year")
    ) {
      return jsonResponse({ msg: "Year already exists." }, { status: 409 });
    }

    return jsonResponse({ msg: "Internal error" }, { status: 500 });
  }
});
