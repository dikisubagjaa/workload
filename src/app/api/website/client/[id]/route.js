import { Client } from "@/database/models/website";
import { jsonResponse } from "@/utils/apiResponse";
import { nowUnix as getNowUnix } from "@/utils/dateHelpers";
import { withAuth } from "@/utils/session";

export async function GET(_, { params }) {
    try {
        const client = await Client.findByPk(params.id);
        if (!client) {
            return jsonResponse({ msg: 'Not found' }, { status: 404 });
        }
        return jsonResponse({ data: client });
    } catch (error) {
        console.error('❌ GET /client/:id msg:', error);
        return jsonResponse({ msg: error.message || 'Failed to get client'}, { status: 500 });
    }
}

export const PUT = withAuth(async function PUT_HANDLER(req, { params }, currentUser) {
    try {
        const body = await req.json();
        const client = await Client.findByPk(params.id);
        if (!client) {
            return jsonResponse({ msg: 'Not found' }, { status: 404 });
        }
        
        const nowUnix = getNowUnix();
        await client.update({
            ...body,
            updated: nowUnix,
            updated_by: currentUser.user_id
        });

        return jsonResponse({ msg: 'Updated' });
    } catch (error) {
        console.error('❌ PUT /client/:id msg:', error);
        return jsonResponse({ msg: error.message || 'Failed to update client'}, { status: 500 });
    }
});

export const DELETE = withAuth(async function DELETE_HANDLER(req, { params }, currentUser) {
    try {
        const client = await Client.findByPk(params.id);
        if (!client) {
            return jsonResponse({ msg: 'Not found' }, { status: 404 });
        }

        const nowUnix = getNowUnix();
        await Client.update(
            {
                deleted: nowUnix,
                deleted_by: currentUser.user_id
            },
            { where: { client_id: params.id } }
        );

        return jsonResponse({ msg: 'Soft deleted' });
    } catch (error) {
        console.error('❌ DELETE /client/:id msg:', error);
        return jsonResponse({ msg: error.message || 'Failed to delete client'}, { status: 500 });
    }
});

