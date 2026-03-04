export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { updateRevisionStatus } from "@/server/controllers/revisionController";

export const PATCH = withAuth(async function PATCH_HANDLER(req, { params }, currentUser) {
  try {
    const { revisionId } = params;
    const body = await req.json();

    const result = await updateRevisionStatus(revisionId, body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    console.error("PATCH revision msg:", err);
    return jsonResponse({ msg: err.message || "Failed to update revision." }, { status: 500 });
  }
});
