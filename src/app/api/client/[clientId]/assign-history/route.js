export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { listClientAssignHistoryByClientId } from "@/server/controllers/clientController";

export const GET = withActive(async function GET_HANDLER(_req, { params }) {
  try {
    const { clientId } = params;
    const result = await listClientAssignHistoryByClientId(clientId);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error fetching client assign history:", error);
    return jsonResponse({ msg: error.message || "Failed to fetch assign history." }, { status: 500 });
  }
});
