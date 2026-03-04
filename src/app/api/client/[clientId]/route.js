import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { deleteClient, getClientById, updateClientFromBody } from "@/server/controllers/clientController";

export const GET = withActive(async function GET_HANDLER(_req, { params }, _currentUser) {
  try {
    const { clientId } = params;
    const result = await getClientById(clientId);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error fetching client detail:", error);
    return jsonResponse({ msg: error.message || "Failed to fetch client detail." }, { status: 500 });
  }
});

export const PUT = withActive(async function PUT_HANDLER(req, { params }, currentUser) {
  try {
    const { clientId } = params;
    const body = await req.json();
    const result = await updateClientFromBody(clientId, body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error updating client:", error);
    return jsonResponse({ msg: error.message || "Failed to update client." }, { status: 500 });
  }
});

export const DELETE = withActive(async function DELETE_HANDLER(_req, { params }, currentUser) {
  try {
    const { clientId } = params;
    const result = await deleteClient(clientId, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error soft deleting client:", error);
    return jsonResponse({ msg: error.message || "Failed to perform soft delete." }, { status: 500 });
  }
});
