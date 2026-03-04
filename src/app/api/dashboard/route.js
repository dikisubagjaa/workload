// src/app/api/dashboard/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { getDashboardData } from "@/server/controllers/dashboardController";

export const GET = withAuth(async function GET_HANDLER(req, _ctx, currentUser) {
  try {
    const result = await getDashboardData(req, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error fetching Dashboard:", error);
    return jsonResponse({ msg: error.message }, { status: 500 });
  }
});
