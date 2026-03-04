// src/app/api/role/[roleId]/route.js
import 'server-only';
import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from '@/utils/session';
import {
  getRoleDetail,
  updateRoleFromRequest,
  deleteRole,
} from "@/server/controllers/roleController";

// ============================
// GET /api/role/[roleId]
// ============================
export const GET = withAuth(async function GET_HANDLER(_req, { params }, _currentUser) {
  try {
    const result = await getRoleDetail(params);
    const { status, ...payload } = result || {};
    return jsonResponse(payload, { status: status || 200 });
  } catch (error) {
    console.error('GET /api/role/[roleId] msg:', error);
    return jsonResponse({ msg: error?.message || 'Failed to get role' }, { status: 500 });
  }
});

// ============================
// PUT /api/role/[roleId]  (update)
// Body (JSON, camelCase):
//  - title?        : string  (alias: name?)
//  - slug?         : string  (unique, will be normalized)
//  - description?  : string|null
//  - menu_access?  : string[] | JSON-string
// ============================
export const PUT = withAuth(async function PUT_HANDLER(req, { params }, currentUser) {
  try {
    const result = await updateRoleFromRequest(req, params, currentUser);
    const { status, ...payload } = result || {};
    return jsonResponse(payload, { status: status || 200 });
  } catch (error) {
    console.error('PUT /api/role/[roleId] msg:', error);
    return jsonResponse({ msg: error?.message || 'Failed to update role' }, { status: 500 });
  }
});

// ============================
// DELETE /api/role/[roleId]  (soft delete)
// ============================
export const DELETE = withAuth(async function DELETE_HANDLER(_req, { params }, currentUser) {
  try {
    const result = await deleteRole(params, currentUser);
    const { status, ...payload } = result || {};
    return jsonResponse(payload, { status: status || 200 });
  } catch (error) {
    console.error('DELETE /api/role/[roleId] msg:', error);
    return jsonResponse({ msg: error?.message || 'Failed to delete role' }, { status: 500 });
  }
});
