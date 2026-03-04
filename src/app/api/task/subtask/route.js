export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { notImplemented } from "@/server/controllers/taskExtrasController";

export async function GET() {
  const result = notImplemented();
  const { httpStatus, ...payload } = result || {};
  return jsonResponse(payload, { status: httpStatus || 501 });
}
