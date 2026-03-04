// src/app/api/user/export/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { NextResponse } from "next/server";
import { exportUsersCsv } from "@/server/controllers/userController";

export const GET = withAuth(
  async function EXPORT_HANDLER(req, _ctx, currentUser) {
    try {
      const result = await exportUsersCsv(req, currentUser);
      if (result?.status && result.status !== 200) {
        return jsonResponse({ msg: result.msg || "Forbidden" }, { status: result.status });
      }

      return new NextResponse(result.csv || "", {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="users_export.csv"`,
          "Cache-Control": "no-store",
        },
      });
    } catch (err) {
      console.error("GET /api/user/export msg:", err);
      return jsonResponse(
        { msg: "Failed to export users." },
        { status: 500 }
      );
    }
  }
);
