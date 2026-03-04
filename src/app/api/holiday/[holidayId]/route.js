import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { deleteHoliday, getHolidayById, updateHolidayFromBody } from "@/server/controllers/holidayController";

export const GET = withAuth(async function GET_HANDLER(_req, { params }, _currentUser) {
  try {
    const { holidayId } = params;
    const result = await getHolidayById(holidayId);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error fetching holiday detail:", error);
    return jsonResponse({ msg: error.message || "Failed to fetch holiday detail." }, { status: 500 });
  }
});

export const PUT = withAuth(async function PUT_HANDLER(req, { params }, currentUser) {
  try {
    const { holidayId } = params;
    const body = await req.json().catch(() => ({}));

    const result = await updateHolidayFromBody(holidayId, body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error updating holiday:", error);
    return jsonResponse({ msg: error.message || "Failed to update holiday." }, { status: 500 });
  }
});

export const DELETE = withAuth(async function DELETE_HANDLER(_req, { params }, currentUser) {
  try {
    const { holidayId } = params;
    const result = await deleteHoliday(holidayId, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error deleting holiday:", error);
    return jsonResponse({ msg: error.message || "Failed to delete holiday." }, { status: 500 });
  }
});
