export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { markAllRead } from "@/server/controllers/notificationController";

export async function PATCH(req) {
  const result = await markAllRead(req);
  return jsonResponse(result);
}
