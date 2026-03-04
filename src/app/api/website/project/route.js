import { Project } from "@/database/models/website";
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

// GET /api/website/project
export async function GET() {
    try {
        const projects = await Project.findAll({
            order: [["project_id", "DESC"]],
            raw: true 
        });

        const formattedProjects = projects.map(project => ({
            ...project,
            description: stripHTML(project.description),
            created: project.created
                ? dayjs.unix(project.created).format("YYYY-MM-DD HH:mm:ss")
                : null
        }));

        return jsonResponse({ data: formattedProjects }, {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "http://localhost:4000", // izinkan frontend
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });
    } catch (error) {
        console.error("❌ Error in GET /api/website/project:", error);
        return jsonResponse({ msg: error.message || "Failed to fetch projects"}, { status: 500 });
    }
}

// POST /api/website/project
export const POST = withAuth(async function POST_HANDLER(req, context, currentUser) {
    try {
        const nowUnix = getNowUnix();
        const body = await req.json();

        const newProject = await Project.create({
            ...body,
            created: nowUnix,
            created_by: currentUser.user_id,
            updated: nowUnix,
            updated_by: currentUser.user_id,
        });

        // Bersihkan & format data yang baru dibuat
        const cleanProject = {
            ...newProject.get({ plain: true }),
            description: stripHTML(newProject.description),
            created: dayjs.unix(newProject.created).format("DD MMM YYYY")
        };

        return jsonResponse({ data: cleanProject }, { status: 201 });
    } catch (error) {
        console.error("❌ Error in POST /api/website/project:", error);
        return jsonResponse({ msg: error.message || "Failed to create project"}, { status: 500 });
    }
});
