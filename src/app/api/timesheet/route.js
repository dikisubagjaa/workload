export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import {
  listTimesheets,
  createTimesheetFromBody,
  updateTimesheetFromBody,
  deleteTimesheetById,
} from "@/server/controllers/timesheetController";

export const GET = withActive(async function GET_HANDLER(req, _context, currentUser) {
  try {
    const result = await listTimesheets(req, currentUser);
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    return jsonResponse({ msg: "Failed to fetch timesheets." }, { status: 500 });
  }
});

export const POST = withActive(async function POST_HANDLER(req, _context, currentUser) {
  const body = await req.json();

  try {
    const result = await createTimesheetFromBody(body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error(error);
    return jsonResponse({ msg: "Failed to submit timesheet." }, { status: 500 });
  }
});

export const PUT = withActive(async function PUT_HANDLER(req, context, currentUser) {
  const { params } = context;
  const { id } = params;
  const body = await req.json();

  try {
    const result = await updateTimesheetFromBody(id, body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error updating timesheet:", error);
    return jsonResponse({ msg: "Failed to update timesheet." }, { status: 500 });
  }
});

export const DELETE = withActive(async function DELETE_HANDLER(req, context, currentUser) {
  const { params } = context;
  const { id } = params;

  try {
    const result = await deleteTimesheetById(id, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error deleting timesheet:", error);
    return jsonResponse({ msg: "Failed to delete timesheet." }, { status: 500 });
  }
});
