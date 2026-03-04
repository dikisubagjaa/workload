export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from '@/utils/session';
import {
  updateCalendarEvent,
  deleteCalendarEvent,
} from "@/server/controllers/calendarController";

export const PATCH = withActive(async function PATCH_HANDLER(req, { params }, currentUser) {
  const eventId = Number(params?.eventId);
  if (!Number.isInteger(eventId)) {
    return jsonResponse({ msg: 'Invalid eventId' }, { status: 400 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ msg: 'Invalid JSON' }, { status: 400 });
  }

  const result = await updateCalendarEvent(eventId, payload, currentUser);
  const { status, ...body } = result || {};
  return jsonResponse(body, { status: status || 200 });
});

export const DELETE = withActive(async function DELETE_HANDLER(_req, { params }, currentUser) {
  const eventId = Number(params?.eventId);
  if (!Number.isInteger(eventId)) {
    return jsonResponse({ msg: 'Invalid eventId' }, { status: 400 });
  }

  const result = await deleteCalendarEvent(eventId, currentUser);
  const { status, ...body } = result || {};
  return jsonResponse(body, { status: status || 200 });
});
