// src/app/api/webhook/office-ip/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { registerOfficeIp } from "@/server/controllers/webhookController";

export async function POST(req) {
  try {
    const result = await registerOfficeIp(req);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (e) {
    console.error("[webhook/office-ip] msg:", e);
    return jsonResponse({ msg: "Internal Server Error" }, { status: 500 });
  }
}
