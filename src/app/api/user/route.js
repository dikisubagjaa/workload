// src/app/api/user/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import {
  listUsers,
  createUserWithEmployment,
} from "@/server/controllers/userController";

// -----------------------------
// GET /api/user
// -----------------------------
export const GET = withActive(async function GET_HANDLER(req) {
  try {
    const data = await listUsers(req);
    return jsonResponse(data, { status: 200 });
  } catch (error) {
    console.error("GET /api/user msg:", error);
    return jsonResponse(
      { msg: error?.message || "Failed to fetch users." },
      { status: 500 }
    );
  }
});

// -----------------------------
// POST /api/user
// -----------------------------
export const POST = withActive(async function POST_HANDLER(req, { locals }) {
  try {
    const result = await createUserWithEmployment(req, locals);
    const { status, ...payload } = result || {};
    return jsonResponse(payload, { status: status || 200 });
  } catch (error) {
    console.error("POST /api/user msg:", error);
    return jsonResponse({ msg: error?.message || "Failed to create user." }, { status: 500 });
  }
});
