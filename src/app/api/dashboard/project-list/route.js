// src/app/api/dashboard/project-list/route.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { getDashboardProjectList } from "@/server/controllers/dashboardController";

export const GET = withActive(async function GET_HANDLER(_req, _ctx, _currentUser) {
  const result = await getDashboardProjectList();
  return jsonResponse(result, { status: 200 });
});
