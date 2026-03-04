export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { listLeadstatuses } from "@/server/controllers/clientController";

export const GET = withActive(async function GET_HANDLER(_req) {
  try {
    const result = await listLeadstatuses();
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching lead statuses:", error);
    return jsonResponse({ msg: error.message || "Failed to fetch lead statuses." }, { status: 500 });
  }
});
