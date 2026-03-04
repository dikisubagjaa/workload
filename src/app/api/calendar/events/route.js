export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from '@/utils/session';
import {
  listCalendarEvents,
  createCalendarEventFromBody,
} from "@/server/controllers/calendarController";

export const GET = withActive(async function GET_HANDLER(req) {
  try {
    const result = await listCalendarEvents(req);
    return jsonResponse(result, { status: 200 });
  } catch (err) {
    return jsonResponse({ msg: err?.message || 'Unknown error' }, { status: 500 });
  }
});

export const POST = withActive(async function POST_HANDLER(req, _context, currentUser) {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ msg: 'Invalid JSON' }, { status: 400 });
  }

  const result = await createCalendarEventFromBody(body, currentUser);
  const { status, ...payload } = result || {};
  return jsonResponse(payload, { status: status || 200 });
});
