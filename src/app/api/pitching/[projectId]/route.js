export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { deletePitchingByUuid, getPitchingByUuid, updatePitchingByUuid, uploadPitchingFile } from "@/server/controllers/pitchingController";

export async function GET(req, { params }) {
  const param = params?.uuid || params?.projectId;
  const result = await getPitchingByUuid(param);
  const { httpStatus, ...payload } = result || {};
  return jsonResponse(payload, { status: httpStatus || 200 });
}

export async function PUT(req, { params }) {
  try {
    const param = params?.uuid || params?.projectId;
    const body = await req.json();
    const result = await updatePitchingByUuid(param, body);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error updating Pitching:", error);
    return jsonResponse({ msg: "Gagal memperbarui data" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const param = params?.uuid || params?.projectId;
    const result = await deletePitchingByUuid(param);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    return jsonResponse({ msg: "Gagal melakukan soft delete" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const param = params?.uuid || params?.projectId;
    const result = await uploadPitchingFile(param, req);
    const { httpStatus, ...payload } = result || {};
    return jsonResponse(payload, { status: httpStatus || 200 });
  } catch (error) {
    console.error("Error upload:", error);
    return jsonResponse({ msg: "Terjadi kesalahan server" }, { status: 500 });
  }
}
