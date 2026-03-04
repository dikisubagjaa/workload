export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import {
  getAttendanceToday,
  handleAttendanceAction,
} from "@/server/controllers/attendanceController";

export const GET = withActive(async function GET_HANDLER(_req, _ctx, currentUser) {
  try {
    const result = await getAttendanceToday(currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    return jsonResponse({ msg: err?.message || "Failed" }, { status: 500 });
  }
});

export const POST = withActive(async function POST_HANDLER(req, _ctx, currentUser) {
  try {
    const result = await handleAttendanceAction(req, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    return jsonResponse({ msg: err?.message || "Failed" }, { status: 500 });
  }
});
