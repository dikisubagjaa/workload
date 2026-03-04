// src/app/api/appraisal/[appraisalId]/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { deleteAppraisal, getAppraisalById, updateAppraisal } from "@/server/controllers/appraisalController";

export const GET = withActive(async function GET_HANDLER(req, { params }, currentUser) {
  try {
    const appraisalId = Number(params?.appraisalId);
    if (!Number.isFinite(appraisalId)) {
      return jsonResponse({ msg: "Invalid appraisalId" }, { status: 400 });
    }

    const result = await getAppraisalById(appraisalId, currentUser);
    if (result.status) {
      return jsonResponse({ msg: result.msg }, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/appraisal/[id] msg:", error);
    return jsonResponse({ msg: error?.message || "Failed." }, { status: 500 });
  }
});

export const PUT = withActive(async function PUT_HANDLER(req, { params }, currentUser) {
  try {
    const appraisalId = Number(params?.appraisalId);
    if (!Number.isFinite(appraisalId)) {
      return jsonResponse({ msg: "Invalid appraisalId" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const result = await updateAppraisal(appraisalId, body, currentUser);
    if (result.status) {
      return jsonResponse({ msg: result.msg }, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("PUT /api/appraisal/[id] msg:", error);
    return jsonResponse({ msg: error?.message || "Failed." }, { status: 500 });
  }
});

export const DELETE = withActive(async function DELETE_HANDLER(req, { params }, currentUser) {
  try {
    const appraisalId = Number(params?.appraisalId);
    if (!Number.isFinite(appraisalId)) {
      return jsonResponse({ msg: "Invalid appraisalId" }, { status: 400 });
    }

    const result = await deleteAppraisal(appraisalId, currentUser);
    if (result.status) {
      return jsonResponse({ msg: result.msg }, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/appraisal/[id] msg:", error);
    return jsonResponse({ msg: error?.message || "Failed." }, { status: 500 });
  }
});
