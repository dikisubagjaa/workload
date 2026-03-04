export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { createBrandFromBody, listBrands } from "@/server/controllers/brandController";

export const GET = withActive(async function GET_HANDLER(req) {
  try {
    const result = await listBrands();
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching Brands:", error);
    return jsonResponse({ msg: "Failed to fetch data" }, { status: 500 });
  }
});

export const POST = withActive(async function POST_HANDLER(req, _context, currentUser) {
  try {
    const body = await req.json();
    const result = await createBrandFromBody(body, currentUser);
    const { status, ...payload } = result || {};
    return jsonResponse(payload, { status: status || 200 });
  } catch (error) {
    console.error("Error adding Brand:", error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return jsonResponse({ msg: "Brand with this title already exists." }, { status: 409 });
    }
    return jsonResponse({ msg: "Failed to add brand" }, { status: 500 });
  }
});
