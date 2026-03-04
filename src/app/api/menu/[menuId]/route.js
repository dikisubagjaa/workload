import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { deleteMenu, updateMenuFromBody } from "@/server/controllers/menuController";

export const PUT = withAuth(async function PUT_HANDLER(req, { params }, currentUser) {
  try {
    const { menuId } = params;
    const payload = await req.json().catch(() => ({}));

    const result = await updateMenuFromBody(menuId, payload, currentUser);
    const { httpStatus, ...body } = result || {};
    return jsonResponse(body, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error updating menu:", error);
    return jsonResponse({ msg: error.message || "Failed to update menu." }, { status: 500 });
  }
});

export const DELETE = withAuth(async function DELETE_HANDLER(_req, { params }, currentUser) {
  try {
    const { menuId } = params;

    const result = await deleteMenu(menuId, currentUser);
    const { httpStatus, ...body } = result || {};
    return jsonResponse(body, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return jsonResponse({ msg: error.message || "Failed to delete menu." }, { status: 500 });
  }
});
