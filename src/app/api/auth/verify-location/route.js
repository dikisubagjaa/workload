import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { recordUserLocation } from "@/server/controllers/authController";

export const POST = withAuth(async function POST_HANDLER(req, { params }, currentUser) {
  try {
    const result = await recordUserLocation(req, currentUser);
    if (result.status) return jsonResponse({ msg: result.msg }, { status: result.status });
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error in verify-location API:", error);
    return jsonResponse(
      { msg: error.message || "An error occurred during location verification." },
      { status: 500 }
    );
  }
});
