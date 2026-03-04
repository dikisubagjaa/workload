export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from '@/utils/session';
import { getTrackerList } from "@/server/controllers/trackerController";

export const GET = withActive(async function GET_HANDLER(req) {
  try {
    const result = await getTrackerList(req);
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error('GET /api/tracker/list msg:', error);
    return jsonResponse({ msg: error?.message || 'Failed to fetch tracker list' }, { status: 500 });
  }
});
