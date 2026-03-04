import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { buildSessionMenuByEmail } from "@/utils/authMenu";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withAuth(async function GET_HANDLER(_req, _ctx, currentUser) {
  try {
    const menu = await buildSessionMenuByEmail(currentUser?.email);
    return jsonResponse({ menu }, { status: 200 });
  } catch (error) {
    console.error("GET /api/auth/menu msg:", error);
    return jsonResponse({ msg: "Failed to load menu." }, { status: 500 });
  }
});
