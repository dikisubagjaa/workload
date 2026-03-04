export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { setGlobalAttendanceType } from "@/server/controllers/holidayController";

export const POST = withAuth(
  async function POST_HANDLER(req, _ctx, currentUser) {
    try {
      const body = await req.json().catch(() => ({}));
      const result = await setGlobalAttendanceType(body, currentUser);
      const { httpStatus, ...payload } = result || {};
      return jsonResponse(payload, { status: httpStatus || 200 });
    } catch (error) {
      console.error("Error updating attendance type:", error);
      return jsonResponse(
        { msg: error.message || "Failed to update attendance type." },
        { status: 500 }
      );
    }
  },
  {
    allowRoles: ["superadmin", "hrd", "hod", "operational_director", "director_operation"],
  }
);
