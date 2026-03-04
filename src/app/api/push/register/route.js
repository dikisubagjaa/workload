// src/app/api/push/register/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { registerPushToken } from "@/server/controllers/pushController";

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await registerPushToken(body, req.headers);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (e) {
    return jsonResponse({ msg: e?.message || "Internal error" }, { status: 500 });
  }
}
