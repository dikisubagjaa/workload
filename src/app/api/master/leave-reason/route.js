export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from '@/utils/session';
import { listLeaveReasons } from "@/server/controllers/masterController";

export const GET = withActive(async function GET_HANDLER(req) {
  try {
    const result = await listLeaveReasons(req);
    return jsonResponse(result, { status: 200 });
  } catch (err) {
    console.error('GET /api/master/leave-reason msg:', err);
    return jsonResponse({ msg: err?.message || 'Failed' }, { status: 500 });
  }
});
