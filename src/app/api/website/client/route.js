import { Client } from "@/database/models/website";
import { jsonResponse } from "@/utils/apiResponse";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { nowUnix as getNowUnix } from "@/utils/dateHelpers";
import { withAuth } from "@/utils/session";
dayjs.extend(utc);

// Fungsi untuk hapus tag HTML
function stripHTML(html) {
    return html ? html.replace(/<[^>]*>?/gm, "").trim() : "";
}

// GET /api/website/client
export async function GET() {
    try {
        const clients = await Client.findAll({
            order: [["client_id", "DESC"]],
            raw: true 
        });

        const formattedClients = clients.map(client => ({
            ...client,
            description: stripHTML(client.description),
            created: client.created
                ? dayjs.unix(client.created).format("YYYY-MM-DD HH:mm:ss")
                : null
        }));

        return jsonResponse({ data: formattedClients });
    } catch (error) {
        console.error("❌ Error in GET /api/website/client:", error);
        return jsonResponse({ msg: error.message || "Failed to fetch clients"}, { status: 500 });
    }
}

// POST /api/website/client
export const POST = withAuth(async function POST_HANDLER(req, context, currentUser) {
    try {
        const nowUnix = getNowUnix();
        const body = await req.json();

        const newClient = await Client.create({
            ...body,
            created: nowUnix,
            created_by: currentUser.user_id,
            updated: nowUnix,
            updated_by: currentUser.user_id,
        });

        // Bersihkan & format data yang baru dibuat
        const cleanClient = {
            ...newClient.get({ plain: true }),
            description: stripHTML(newClient.description),
            created: dayjs.unix(newClient.created).format("DD MMM YYYY")
        };

        return jsonResponse({ data: cleanClient }, { status: 201 });
    } catch (error) {
        console.error("❌ Error in POST /api/website/client:", error);
        return jsonResponse({ msg: error.message || "Failed to create client"}, { status: 500 });
    }
});
