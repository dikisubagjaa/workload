// src/app/api/department/[departmentId]/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { deleteDepartment, getDepartmentById, updateDepartment } from "@/server/controllers/departmentController";

export const GET = withActive(async function GET_HANDLER(_req, { params }) {
  try {
    const id = Number(params?.departmentId);
    if (!id) return jsonResponse({ msg: "Invalid departmentId" }, { status: 400 });

    const result = await getDepartmentById(id);
    if (result.status) {
      return jsonResponse({ msg: result.msg }, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching department:", error);
    return jsonResponse({ msg: error.message }, { status: 500 });
  }
});

export const PUT = withActive(async function PUT_HANDLER(req, { params }, currentUser) {
  try {
    const id = Number(params?.departmentId);
    if (!id) return jsonResponse({ msg: "Invalid departmentId" }, { status: 400 });

    const body = await req.json();
    const result = await updateDepartment(id, body, currentUser);
    if (result.status) {
      return jsonResponse({ msg: result.msg }, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error updating department:", error);
    return jsonResponse({ msg: error.message }, { status: 500 });
  }
});

export const DELETE = withActive(async function DELETE_HANDLER(_req, { params }, currentUser) {
  try {
    const id = Number(params?.departmentId);
    if (!id) return jsonResponse({ msg: "Invalid departmentId" }, { status: 400 });

    const result = await deleteDepartment(id, currentUser);
    if (result.status) {
      return jsonResponse({ msg: result.msg }, { status: result.status });
    }
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error deleting department:", error);
    return jsonResponse({ msg: error.message }, { status: 500 });
  }
});
