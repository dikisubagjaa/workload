import { Page } from "@/database/models/website";
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

// GET /api/website/page
export async function GET() {
    try {
        const pages = await Page.findAll({
            order: [["page_id", "DESC"]],
            raw: true 
        });

        const formattedPages = pages.map(page => ({
            ...page,
            description: stripHTML(page.description),
            created: page.created
                ? dayjs.unix(page.created).format("YYYY-MM-DD HH:mm:ss")
                : null
        }));

        return jsonResponse({ data: formattedPages });
    } catch (error) {
        console.error("❌ Error in GET /api/website/page:", error);
        return jsonResponse({ msg: error.message || "Failed to fetch pages"}, { status: 500 });
    }
}

// POST /api/website/page
export const POST = withAuth(async function POST_HANDLER(req, context, currentUser) {
    try {
        const nowUnix = getNowUnix();
        const body = await req.json();

        const newPage = await Page.create({
            ...body,
            created: nowUnix,
            created_by: currentUser.user_id,
            updated: nowUnix,
            updated_by: currentUser.user_id,
        });

        // Bersihkan & format data yang baru dibuat
        const cleanPage = {
            ...newPage.get({ plain: true }),
            description: stripHTML(newPage.description),
            created: dayjs.unix(newPage.created).format("DD MMM YYYY")
        };

        return jsonResponse({ data: cleanPage }, { status: 201 });
    } catch (error) {
        console.error("❌ Error in POST /api/website/page:", error);
        return jsonResponse({ msg: error.message || "Failed to create page"}, { status: 500 });
    }
});
