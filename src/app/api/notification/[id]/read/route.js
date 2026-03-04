export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { markNotificationRead } from "@/server/controllers/notificationController";

export async function PATCH(_req, { params }) {
  const id = Number(params.id);
  if (!id) return jsonResponse({ msg: 'Invalid id' }, { status: 400 });

  const result = await markNotificationRead(id);
  const { httpStatus, ...payload } = result || {};
  return jsonResponse(payload, { status: httpStatus || 200 });
}
