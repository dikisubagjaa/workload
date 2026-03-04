export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { createClientFromBody, listClients } from "@/server/controllers/clientController";

export const GET = withActive(async function GET_HANDLER(_req, _context, _currentUser) {
  try {
    const result = await listClients();
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return jsonResponse({ msg: error.message || "Failed to fetch clients." }, { status: 500 });
  }
});

export const POST = withActive(async function POST_HANDLER(req, _context, currentUser) {
  try {
    const body = await req.json();
    const result = await createClientFromBody(body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error creating client:", error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return jsonResponse({ msg: "Client with this name/UUID already exists." }, { status: 409 });
    }
    return jsonResponse({ msg: error.message || "Failed to create client." }, { status: 500 });
  }
});
