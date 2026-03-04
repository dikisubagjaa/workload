export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { getRecentActivity } from "@/server/controllers/trackerController";

export const GET = withActive(async function GET_HANDLER(_req) {
  try {
    const result = await getRecentActivity();
    return jsonResponse(result);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return jsonResponse({ msg: "Failed to fetch recent activity." }, { status: 500 });
  }
});
