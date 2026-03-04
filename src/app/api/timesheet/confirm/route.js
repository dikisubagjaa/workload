export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { confirmTimesheet } from "@/server/controllers/timesheetController";

export const POST = withActive(async function POST_HANDLER(req, _context, currentUser) {
  try {
    const body = await req.json();
    const { date } = body;

    const result = await confirmTimesheet(date, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error confirming timesheet:", error);
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
});
