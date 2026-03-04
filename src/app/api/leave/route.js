// src/app/api/leave/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { createLeave, listLeaves } from "@/server/controllers/leaveController";

export const GET = withActive(async function GET_HANDLER(req, _ctx, currentUser) {
  try {
    const result = await listLeaves(req, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    console.error("GET /api/leave msg:", err);
    return jsonResponse({ msg: err?.message || "Failed" }, { status: 500 });
  }
});

export const POST = withActive(async function POST_HANDLER(req, _ctx, currentUser) {
  try {
    const body = await req.json();
    const result = await createLeave(body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    console.error("POST /api/leave msg:", err);
    return jsonResponse({ msg: err?.message || "Failed" }, { status: 500 });
  }
});
