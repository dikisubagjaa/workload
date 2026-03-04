export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { deletePurchaseOrder } from "@/server/controllers/projectController";

export const DELETE = withAuth(async function DELETE_HANDLER(req, { params }, currentUser) {
  const { projectId, qtId, poId } = params;

  try {
    if (!poId || poId === "undefined") {
      return jsonResponse({ msg: "PO ID is required." }, { status: 400 });
    }
    if (!qtId || qtId === "undefined") {
      return jsonResponse({ msg: "Quotation ID is required." }, { status: 400 });
    }
    const result = await deletePurchaseOrder(projectId, qtId, poId, currentUser);
    return jsonResponse(result, { status: result.status || 200 });
  } catch (err) {
    console.error("DELETE PO msg:", err);
    return jsonResponse({ msg: "Failed to delete PO." }, { status: 500 });
  }
});
