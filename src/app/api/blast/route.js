import { jsonResponse } from "@/utils/apiResponse";
import { sendBlast } from "@/server/controllers/blastController";

export async function POST(req) {
    try {
        const body = await req.json();
        const result = await sendBlast(body);
        if (result.status) return jsonResponse({ msg: result.msg }, { status: result.status });
        return jsonResponse(result, { status: 201 });
    } catch (error) {
        console.error("❌ Error in POST /api/blast:", error);
        return jsonResponse({ msg: error.message || "Gagal memproses data"}, { status: 500 });
    }
}


