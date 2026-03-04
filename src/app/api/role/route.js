// src/app/api/role/route.js
import 'server-only';
import { jsonResponse } from "@/utils/apiResponse";
import { listRoles, createRoleFromRequest } from "@/server/controllers/roleController";

// ==========================================================
// GET /api/role  → list roles (search & pagination)
//  - query:
//      q        : optional string (search title/slug/description)
//      limit    : default 20
//      offset   : default 0
//      orderBy  : 'created' | 'updated' | 'title' | 'slug' (default: 'created')
//      orderDir : 'ASC' | 'DESC' (default: 'DESC')
// ==========================================================
export async function GET(req) {
  try {
    const data = await listRoles(req);
    return jsonResponse(data, { status: 200 });
  } catch (error) {
    console.error('GET /api/role msg:', error);
    return jsonResponse({ msg: error?.message || 'Failed to fetch roles' }, { status: 500 });
  }
}

// ==========================================================
// POST /api/role  → create role
//  - body (JSON, camelCase):
//      title        : string (required)
//      slug         : string (required, unique)
//      description  : string (optional)
//      menu_access  : string[] (optional)
// ==========================================================
export async function POST(req) {
  try {
    const result = await createRoleFromRequest(req);
    const { status, ...payload } = result || {};
    return jsonResponse(payload, { status: status || 200 });
  } catch (error) {
    console.error('POST /api/role msg:', error);
    return jsonResponse({ msg: error?.message || 'Failed to create role' }, { status: 500 });
  }
}
