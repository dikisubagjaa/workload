import { Page } from "@/database/models/website";
import { jsonResponse } from "@/utils/apiResponse";
import { nowUnix as getNowUnix } from "@/utils/dateHelpers";
import { withAuth } from "@/utils/session";

export async function GET(_, { params }) {
    try {
        const page = await Page.findByPk(params.id);
        if (!page) {
            return jsonResponse({ msg: 'Not found' }, { status: 404 });
        }
        return jsonResponse({ data: page });
    } catch (error) {
        console.error('❌ GET /page/:id msg:', error);
        return jsonResponse({ msg: error.message || 'Failed to get page'}, { status: 500 });
    }
}

export const PUT = withAuth(async function PUT_HANDLER(req, { params }, currentUser) {
    try {
        const body = await req.json();
        const page = await Page.findByPk(params.id);
        if (!page) {
            return jsonResponse({ msg: 'Not found' }, { status: 404 });
        }
        
        const nowUnix = getNowUnix();
        await page.update({
            ...body,
            updated: nowUnix,
            updated_by: currentUser.user_id
        });

        return jsonResponse({ msg: 'Updated' });
    } catch (error) {
        console.error('❌ PUT /page/:id msg:', error);
        return jsonResponse({ msg: error.message || 'Failed to update page'}, { status: 500 });
    }
});

export const DELETE = withAuth(async function DELETE_HANDLER(req, { params }, currentUser) {
    try {
        const page = await Page.findByPk(params.id);
        if (!page) {
            return jsonResponse({ msg: 'Not found' }, { status: 404 });
        }

        const nowUnix = getNowUnix();
        await Page.update(
            {
                deleted: nowUnix,
                deleted_by: currentUser.user_id
            },
            { where: { page_id: params.id } }
        );

        return jsonResponse({ msg: 'Soft deleted' });
    } catch (error) {
        console.error('❌ DELETE /page/:id msg:', error);
        return jsonResponse({ msg: error.message || 'Failed to delete page'}, { status: 500 });
    }
});

