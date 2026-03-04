import { Project } from "@/database/models/website";
import { jsonResponse } from "@/utils/apiResponse";
import { nowUnix as getNowUnix } from "@/utils/dateHelpers";
import { withAuth } from "@/utils/session";

export async function GET(_, { params }) {
    try {
        const project = await Project.findByPk(params.id);
        if (!project) {
            return jsonResponse({ msg: 'Not found' }, { status: 404 });
        }
        return jsonResponse({ data: project });
    } catch (error) {
        console.error('❌ GET /project/:id msg:', error);
        return jsonResponse({ msg: error.message || 'Failed to get project'}, { status: 500 });
    }
}

export const PUT = withAuth(async function PUT_HANDLER(req, { params }, currentUser) {
    try {
        const body = await req.json();
        const project = await Project.findByPk(params.id);
        if (!project) {
            return jsonResponse({ msg: 'Not found' }, { status: 404 });
        }
        
        const nowUnix = getNowUnix();
        await project.update({
            ...body,
            updated: nowUnix,
            updated_by: currentUser.user_id
        });

        return jsonResponse({ msg: 'Updated' });
    } catch (error) {
        console.error('❌ PUT /project/:id msg:', error);
        return jsonResponse({ msg: error.message || 'Failed to update project'}, { status: 500 });
    }
});

export const DELETE = withAuth(async function DELETE_HANDLER(req, { params }, currentUser) {
    try {
        const project = await Project.findByPk(params.id);
        if (!project) {
            return jsonResponse({ msg: 'Not found' }, { status: 404 });
        }

        const nowUnix = getNowUnix();
        await Project.update(
            {
                deleted: nowUnix,
                deleted_by: currentUser.user_id
            },
            { where: { project_id: params.id } }
        );

        return jsonResponse({ msg: 'Soft deleted' });
    } catch (error) {
        console.error('❌ DELETE /project/:id msg:', error);
        return jsonResponse({ msg: error.message || 'Failed to delete project'}, { status: 500 });
    }
});

