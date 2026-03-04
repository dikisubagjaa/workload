export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { createPitchingProject } from "@/server/controllers/pitchingController";

export const POST = withActive(async (req, _ctx, currentUser) => {
  try {
    const body = await req.json();
    const result = await createPitchingProject(body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (err) {
    console.error("POST /api/pitching msg:", err);
    return jsonResponse({ msg: err?.message || "Create pitching failed" }, { status: 500 });
  }
});
