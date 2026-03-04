export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { listDepartmentsPaged } from "@/server/controllers/departmentController";

export const GET = withActive(async function GET_HANDLER(req) {
  try {
    const result = await listDepartmentsPaged(req);
    return jsonResponse(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching department list:", error);
    return jsonResponse({ msg: error.message }, { status: 500 });
  }
});
