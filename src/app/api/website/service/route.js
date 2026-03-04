import { Service } from "@/database/models/website";
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

// GET /api/website/service
export async function GET() {
    try {
        const services = await Service.findAll({
            order: [["service_id", "DESC"]],
            raw: true 
        });

        const formattedServices = services.map(service => ({
            ...service,
            description: stripHTML(service.description),
            created: service.created
                ? dayjs.unix(service.created).format("YYYY-MM-DD HH:mm:ss")
                : null
        }));

        return jsonResponse({ data: formattedServices });
    } catch (error) {
        console.error("❌ Error in GET /api/website/service:", error);
        return jsonResponse({ msg: error.message || "Failed to fetch services"}, { status: 500 });
    }
}

// POST /api/website/service
export const POST = withAuth(async function POST_HANDLER(req, context, currentUser) {
    try {
        const nowUnix = getNowUnix();
        const body = await req.json();

        const newService = await Service.create({
            ...body,
            created: nowUnix,
            created_by: currentUser.user_id,
            updated: nowUnix,
            updated_by: currentUser.user_id,
        });

        // Bersihkan & format data yang baru dibuat
        const cleanService = {
            ...newService.get({ plain: true }),
            description: stripHTML(newService.description),
            created: dayjs.unix(newService.created).format("DD MMM YYYY")
        };

        return jsonResponse({ data: cleanService }, { status: 201 });
    } catch (error) {
        console.error("❌ Error in POST /api/website/service:", error);
        return jsonResponse({ msg: error.message || "Failed to create service"}, { status: 500 });
    }
});
