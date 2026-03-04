// src/app/api/performance-score/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { getPerformanceScore } from "@/server/controllers/performanceScoreController";

export const GET = withAuth(async function GET_HANDLER(req, _ctx, currentUser) {
  try {
    const result = await getPerformanceScore(req, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    console.error("performance-score weekly failed:", err);
    return jsonResponse({ msg: err?.message || "Internal error" }, { status: 500 });
  }
});
