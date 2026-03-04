export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { createOrUpdateTask, listTasks } from "@/server/controllers/taskController";

// Handler untuk mengambil semua task dari database (Method: GET)
export async function GET() {
    try {
        const result = await listTasks();
        return jsonResponse(result, { status: 200 });
    } catch (error) {
        console.error("Error fetching Tasks:", error);
        return jsonResponse({ msg: "Gagal mengambil data task" }, { status: 500 });
    }
}

// Handler untuk membuat task baru di database (Method: POST)
export const POST = withActive(async function POST_HANDLER(req, context, currentUser) {
    try {
        const body = await req.json();
        const result = await createOrUpdateTask(body, currentUser);
        return jsonResponse(result, { status: result.status || 200 });
    } catch (error) {
        console.error("Error adding Task:", error);
        return jsonResponse({
            msg: error.original?.sqlMessage || "Terjadi kesalahan pada server saat menambahkan task."
        }, { status: 500 });
    }
})
