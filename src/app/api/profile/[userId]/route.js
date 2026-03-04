import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { getProfileByParam, updateProfileById, uploadProfileAvatar } from "@/server/controllers/profileController";

export const GET = withAuth(async function GET_HANDLER(_req, { params }, _currentUser) {
  try {
    const param = params?.userId;
    const result = await getProfileByParam(param);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    console.error("GET /profile/[userId] msg:", err);
    return jsonResponse({ msg: "Failed to fetch user profile." }, { status: 500 });
  }
});

export const PUT = withAuth(async function PUT_HANDLER(req, { params }, currentUser) {
  try {
    const param = params?.userId;
    if (!param) return jsonResponse({ msg: "Missing userId" }, { status: 400 });
    if (!/^\d+$/.test(param)) {
      return jsonResponse({ msg: "PUT requires numeric user_id in path" }, { status: 400 });
    }
    const userId = Number(param);

    const body = await req.json();
    const result = await updateProfileById(userId, body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    console.error("PUT /profile/[userId] msg:", err);
    return jsonResponse({ msg: "Failed to update user profile." }, { status: 500 });
  }
});

export const POST = withAuth(async function POST_HANDLER(req, { params }, currentUser) {
  try {
    const param = params?.userId;
    if (!param) return jsonResponse({ msg: "Missing userId" }, { status: 400 });
    if (!/^\d+$/.test(param)) {
      return jsonResponse({ msg: "POST requires numeric user_id in path" }, { status: 400 });
    }
    const userId = Number(param);

    const result = await uploadProfileAvatar(userId, req, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    console.error("POST /profile/[userId] upload msg:", err);
    return jsonResponse({ msg: "Server error" }, { status: 500 });
  }
});
