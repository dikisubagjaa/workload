export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { deleteClientActivity, updateClientActivity } from "@/server/controllers/clientController";

export const PUT = withActive(async function PUT_HANDLER(req, { params }, currentUser) {
  try {
    const { clientId, activityId } = params;
    const body = await req.json();
    const result = await updateClientActivity(clientId, activityId, body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error updating client activity:", error);
    return jsonResponse({ msg: error.message || "Failed to update client activity." }, { status: 500 });
  }
});

export const DELETE = withActive(async function DELETE_HANDLER(_req, { params }, currentUser) {
  try {
    const { clientId, activityId } = params;
    const result = await deleteClientActivity(clientId, activityId, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error deleting client activity:", error);
    return jsonResponse({ msg: error.message || "Failed to delete client activity." }, { status: 500 });
  }
});
