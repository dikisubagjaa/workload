export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { createCompanyFromBody, listCompanies } from "@/server/controllers/companyController";

export const GET = withActive(async function GET_HANDLER(_req) {
  try {
    const result = await listCompanies();
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return jsonResponse({ msg: error.message || "Failed to fetch companies." }, { status: 500 });
  }
});

export const POST = withActive(async function POST_HANDLER(req, _context, currentUser) {
  try {
    const body = await req.json();
    const result = await createCompanyFromBody(body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error creating company:", error);
    return jsonResponse({ msg: error.message || "Failed to create company." }, { status: 500 });
  }
});
