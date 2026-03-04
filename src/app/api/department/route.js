export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { createDepartmentFromBody, listDepartments } from "@/server/controllers/departmentController";

// Ambil semua profil dari database
export async function GET() {
    try {
        const result = await listDepartments();
        return jsonResponse(result, { status: 200 });
    } catch (error) {
        console.error("Error fetching Departments:", error);
        return jsonResponse({ msg: error.message }, { status: 500 });
    }
}


export async function POST(req) {
    try {
        const body = await req.json();
        const result = await createDepartmentFromBody(body);
        return jsonResponse(result, { status: result.status || 200 });
    } catch (error) {
        console.error("Error adding Department:", error);
        return jsonResponse({ msg: "Gagal menambah profil" }, { status: 500 });
    }
}
