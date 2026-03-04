export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { getUnreadCount } from "@/server/controllers/notificationController";

export const GET = withActive(async function GET_HANDLER(_req, _ctx, currentUser) {
  try {
    const result = await getUnreadCount(currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    return jsonResponse({ msg: err?.message || "Failed" }, { status: 500 });
  }
});
