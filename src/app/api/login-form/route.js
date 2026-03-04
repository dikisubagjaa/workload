// src/app/api/login-form/route.js
import { jsonResponse } from "@/utils/apiResponse";
import { loginForm } from "@/server/controllers/loginFormController";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await loginForm(body);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    return jsonResponse({ msg: error?.message || "Failed" }, { status: 500 });
  }
}
