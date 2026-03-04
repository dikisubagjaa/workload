import { Service } from "@/database/models/website";
import { jsonResponse } from "@/utils/apiResponse";
import { nowUnix as getNowUnix } from "@/utils/dateHelpers";
import { withAuth } from "@/utils/session";

export async function GET(_, { params }) {
    try {
        const service = await Service.findByPk(params.id);
        if (!service) {
            return jsonResponse({ msg: 'Not found' }, { status: 404 });
        }
        return jsonResponse({ data: service });
    } catch (error) {
        console.error('❌ GET /service/:id msg:', error);
        return jsonResponse({ msg: error.message || 'Failed to get service'}, { status: 500 });
    }
}

export const PUT = withAuth(async function PUT_HANDLER(req, { params }, currentUser) {
    try {
        const body = await req.json();
        const service = await Service.findByPk(params.id);
        if (!service) {
            return jsonResponse({ msg: 'Not found' }, { status: 404 });
        }
        
        const nowUnix = getNowUnix();
        await service.update({
            ...body,
            updated: nowUnix,
            updated_by: currentUser.user_id
        });

        return jsonResponse({ msg: 'Updated' });
    } catch (error) {
        console.error('❌ PUT /service/:id msg:', error);
        return jsonResponse({ msg: error.message || 'Failed to update service'}, { status: 500 });
    }
});

export const DELETE = withAuth(async function DELETE_HANDLER(req, { params }, currentUser) {
    try {
        const service = await Service.findByPk(params.id);
        if (!service) {
            return jsonResponse({ msg: 'Not found' }, { status: 404 });
        }

        const nowUnix = getNowUnix();
        await Service.update(
            {
                deleted: nowUnix,
                deleted_by: currentUser.user_id
            },
            { where: { service_id: params.id } }
        );

        return jsonResponse({ msg: 'Soft deleted' });
    } catch (error) {
        console.error('❌ DELETE /service/:id msg:', error);
        return jsonResponse({ msg: error.message || 'Failed to delete service'}, { status: 500 });
    }
});

