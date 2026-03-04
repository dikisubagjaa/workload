export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { deleteBrand, getBrandById, updateBrandFromBody } from "@/server/controllers/brandController";

export const GET = withActive(async function GET_HANDLER(_req, { params }, _currentUser) {
  try {
    const brandId = Number(params?.uuid || params?.brandId || params?.id);
    if (!Number.isFinite(brandId)) {
      return jsonResponse({ msg: "Invalid id" }, { status: 400 });
    }

    const result = await getBrandById(brandId);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    return jsonResponse({ msg: error?.message || "Failed" }, { status: 500 });
  }
});

export const PUT = withActive(async function PUT_HANDLER(req, { params }, currentUser) {
  try {
    const brandId = Number(params?.uuid || params?.brandId || params?.id);
    if (!Number.isFinite(brandId)) {
      return jsonResponse({ msg: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const result = await updateBrandFromBody(brandId, body, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    return jsonResponse({ msg: error?.message || "Failed" }, { status: 500 });
  }
});

export const DELETE = withActive(async function DELETE_HANDLER(_req, { params }, currentUser) {
  try {
    const brandId = Number(params?.uuid || params?.brandId || params?.id);
    if (!Number.isFinite(brandId)) {
      return jsonResponse({ msg: "Invalid id" }, { status: 400 });
    }

    const result = await deleteBrand(brandId, currentUser);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    return jsonResponse({ msg: error?.message || "Failed" }, { status: 500 });
  }
});
