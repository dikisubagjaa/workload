// src/app/api/leave/annual-quota/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { getAnnualQuotaInfo } from "@/server/controllers/leaveController";

export const GET = withActive(async function GET_HANDLER(req, _ctx, currentUser) {
  try {
    const result = await getAnnualQuotaInfo(req, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (e) {
    console.error("GET /api/leave/annual-quota msg:", e);
    return jsonResponse({ msg: e?.message || "Failed" }, { status: 500 });
  }
});
