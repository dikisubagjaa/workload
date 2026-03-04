import { Blog } from "@/database/models/website";
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

// GET /api/website/blog
export async function GET() {
    try {
        const blogs = await Blog.findAll({
            order: [["blog_id", "DESC"]],
            raw: true 
        });

        const formattedBlogs = blogs.map(blog => ({
            ...blog,
            description: stripHTML(blog.description),
            created: blog.created
                ? dayjs.unix(blog.created).format("YYYY-MM-DD HH:mm:ss")
                : null
        }));

        return jsonResponse({ data: formattedBlogs });
    } catch (error) {
        console.error("❌ Error in GET /api/website/blog:", error);
        return jsonResponse({ msg: error.message || "Failed to fetch blogs"}, { status: 500 });
    }
}

// POST /api/website/blog
export const POST = withAuth(async function POST_HANDLER(req, context, currentUser) {
    try {
        const nowUnix = getNowUnix();
        const body = await req.json();

        const newBlog = await Blog.create({
            ...body,
            created: nowUnix,
            created_by: currentUser.user_id,
            updated: nowUnix,
            updated_by: currentUser.user_id,
        });

        // Bersihkan & format data yang baru dibuat
        const cleanBlog = {
            ...newBlog.get({ plain: true }),
            description: stripHTML(newBlog.description),
            created: dayjs.unix(newBlog.created).format("DD MMM YYYY")
        };

        return jsonResponse({ data: cleanBlog }, { status: 201 });
    } catch (error) {
        console.error("❌ Error in POST /api/website/blog:", error);
        return jsonResponse({ msg: error.message || "Failed to create blog"}, { status: 500 });
    }
});
