export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { listNotifications } from "@/server/controllers/notificationController";

export async function GET(req) {
  const result = await listNotifications(req);
  return jsonResponse(result, { headers: { 'Cache-Control': 'no-store' } });
}
