// src/app/api/leave/[leaveId]/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { getLeaveById, handleLeaveAction } from "@/server/controllers/leaveController";

export const GET = withActive(async function GET_HANDLER(_req, { params }, currentUser) {
  try {
    const leaveId = Number(params?.leaveId || params?.id || params?.leave_id || 0);
    if (!leaveId) return jsonResponse({ msg: "Invalid id" }, { status: 400 });

    const result = await getLeaveById(leaveId, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    console.error("GET /api/leave/[leaveId] msg:", err);
    return jsonResponse({ msg: err?.message || "Failed" }, { status: 500 });
  }
});

export const POST = withActive(async function POST_HANDLER(req, { params }, currentUser) {
  try {
    const leaveId = Number(params?.leaveId || params?.id || params?.leave_id || 0);
    if (!leaveId) return jsonResponse({ msg: "Invalid id" }, { status: 400 });

    const body = await req.json();
    const result = await handleLeaveAction(leaveId, body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    console.error("POST /api/leave/[leaveId] msg:", err);
    return jsonResponse({ msg: err?.message || "Failed" }, { status: 500 });
  }
});
