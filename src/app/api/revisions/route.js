export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { listUnderReviewRevisions } from "@/server/controllers/revisionController";

export const GET = withActive(async function GET_HANDLER(req, _ctx, _currentUser) {
  try {
    const result = await listUnderReviewRevisions(req);
    return jsonResponse(result, { status: 200 });
  } catch (err) {
    console.error("GET under-review msg:", err);
    return jsonResponse({ msg: err.message || "Failed to fetch under-review." }, { status: 500 });
  }
});
