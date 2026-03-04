// src/app/api/file/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getFileResponse, headFileResponse } from "@/server/controllers/fileController";

export async function GET(req) {
  return getFileResponse(req);
}

export async function HEAD(req) {
  return headFileResponse(req);
}
