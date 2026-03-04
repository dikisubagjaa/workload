// src/app/api/user/[userId]/password/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { updateUserPassword } from "@/server/controllers/userController";

export const PUT = withAuth(async (req, { params }, currentUser) => {
  try {
    const result = await updateUserPassword(req, params, currentUser);
    const { status, ...payload } = result || {};
    return jsonResponse(payload, { status: status || 200 });
  } catch (err) {
    console.error("PUT /user/[userId]/password msg:", err);
    return jsonResponse({ msg: "Failed to update password." }, { status: 500 });
  }
});
