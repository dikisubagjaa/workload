// src/app/api/user/[userId]/route.js
import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { updateUserAndEmployment } from "@/server/controllers/userController";

export const PUT = withAuth(async (req, { params }, currentUser) => {
  try {
    const result = await updateUserAndEmployment(req, params, currentUser);
    const { status, ...payload } = result || {};
    return jsonResponse(payload, { status: status || 200 });
  } catch (err) {
    console.error("PUT /user/[userId] msg:", err);
    return jsonResponse({ msg: "Failed to update user." }, { status: 500 });
  }
});
