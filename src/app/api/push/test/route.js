export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { sendTestPush } from "@/server/controllers/pushController";

export async function GET(_req) {
  try {
    const result = await sendTestPush();
    return jsonResponse(result);
  } catch (e) {
    return jsonResponse({ msg: e?.message || "Internal error" }, { status: 500 });
  }
}
