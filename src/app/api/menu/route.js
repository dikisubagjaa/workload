export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { createMenuFromBody, listMenus } from "@/server/controllers/menuController";

export const GET = withAuth(async function GET_HANDLER(_req, _context, _currentUser) {
  try {
    const result = await listMenus();
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return jsonResponse({ msg: error.message || "Failed to fetch menus." }, { status: 500 });
  }
});

export const POST = withAuth(async function POST_HANDLER(req, _context, currentUser) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await createMenuFromBody(body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error creating menu:", error);

    let status = 500;
    let errMsg = error.message || "Failed to create menu.";

    if (error.name === "SequelizeUniqueConstraintError") {
      status = 400;
      errMsg = "Menu title must be unique.";
    }

    return jsonResponse({ msg: errMsg }, { status });
  }
});
