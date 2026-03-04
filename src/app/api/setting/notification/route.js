export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { getNotificationSettings, updateNotificationSettings } from "@/server/controllers/settingController";

export async function GET() {
  try {
    const result = await getNotificationSettings();
    return jsonResponse(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('GET /setting/notification msg:', err);
    return jsonResponse({ msg: 'Internal error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const result = await updateNotificationSettings(body);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    console.error('PUT /setting/notification msg:', err);
    return jsonResponse({ msg: 'Internal error' }, { status: 500 });
  }
}
