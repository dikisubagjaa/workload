import { Blog } from "@/database/models/website";
import { jsonResponse } from "@/utils/apiResponse";
import { nowUnix as getNowUnix } from "@/utils/dateHelpers";
import { withAuth } from "@/utils/session";

export async function GET(_, { params }) {
    try {
        const blog = await Blog.findByPk(params.id);
        if (!blog) {
            return jsonResponse({ msg: 'Not found' }, { status: 404 });
        }
        return jsonResponse({ data: blog });
    } catch (error) {
        console.error('❌ GET /blog/:id msg:', error);
        return jsonResponse({ msg: error.message || 'Failed to get blog'}, { status: 500 });
    }
}

export const PUT = withAuth(async function PUT_HANDLER(req, { params }, currentUser) {
    try {
        const body = await req.json();
        const blog = await Blog.findByPk(params.id);
        if (!blog) {
            return jsonResponse({ msg: 'Not found' }, { status: 404 });
        }
        
        const nowUnix = getNowUnix();
        await blog.update({
            ...body,
            updated: nowUnix,
            updated_by: currentUser.user_id
        });

        return jsonResponse({ msg: 'Updated' });
    } catch (error) {
        console.error('❌ PUT /blog/:id msg:', error);
        return jsonResponse({ msg: error.message || 'Failed to update blog'}, { status: 500 });
    }
});

export const DELETE = withAuth(async function DELETE_HANDLER(req, { params }, currentUser) {
    try {
        const blog = await Blog.findByPk(params.id);
        if (!blog) {
            return jsonResponse({ msg: 'Not found' }, { status: 404 });
        }

        const nowUnix = getNowUnix();
        await Blog.update(
            {
                deleted: nowUnix,
                deleted_by: currentUser.user_id
            },
            { where: { blog_id: params.id } }
        );

        return jsonResponse({ msg: 'Soft deleted' });
    } catch (error) {
        console.error('❌ DELETE /blog/:id msg:', error);
        return jsonResponse({ msg: error.message || 'Failed to delete blog'}, { status: 500 });
    }
});

