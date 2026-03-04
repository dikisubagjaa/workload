export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { createHolidayFromBody, listHolidays } from "@/server/controllers/holidayController";

export const GET = withAuth(async function GET_HANDLER(req, _ctx, _currentUser) {
  try {
    const result = await listHolidays(req);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return jsonResponse({ msg: error.message || "Failed to fetch holidays." }, { status: 500 });
  }
});

export const POST = withAuth(async function POST_HANDLER(req, _ctx, currentUser) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await createHolidayFromBody(body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error creating holiday:", error);
    return jsonResponse({ msg: error.message || "Failed to create holiday." }, { status: 500 });
  }
});
