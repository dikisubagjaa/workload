// src/app/api/timesheet/[timesheetId]/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { jsonResponse } from "@/utils/apiResponse";
import db from "@/database/models";
import { withActive } from "@/utils/session";
import dayjs from "dayjs";

const { Timesheet } = db;

// UPDATE (edit)
export const PUT = withActive(async function PUT_HANDLER(req, { params }, currentUser) {
    const { timesheetId } = params;
    const body = await req.json();
    const { projectId, taskId, date, startTime, endTime, description } = body;

    try {
        const timesheet = await Timesheet.findByPk(timesheetId);

        // cek pemilik
        if (!timesheet || timesheet.user_id !== currentUser.user_id) {
            return jsonResponse(
                { msg: "Timesheet not found or you don't have permission." },
                { status: 404 }
            );
        }

        // kalau sudah approved gak boleh diedit
        if (timesheet.status === "approved") {
            return jsonResponse(
                { msg: "Cannot edit an approved timesheet." },
                { status: 403 }
            );
        }

        const start = dayjs(`${date} ${startTime}`);
        const end = dayjs(`${date} ${endTime}`);
        const durationMinutes = end.diff(start, "minute");

        await timesheet.update({
            project_id: projectId,
            task_id: taskId,
            date,
            startTime,
            endTime,
            description,
            duration_minutes: durationMinutes,
            status: "submitted",
            updated: dayjs().unix(),
            updated_by: currentUser.user_id || 0,
        });

        return jsonResponse({
            msg: "Timesheet updated successfully!",
            data: timesheet,
        });
    } catch (error) {
        return jsonResponse(
            { msg: "Failed to update timesheet." },
            { status: 500 }
        );
    }
});

// DELETE (soft delete)
export const DELETE = withActive(async function DELETE_HANDLER(
    req,
    { params },
    currentUser
) {
    const { timesheetId } = params;

    try {
        const timesheet = await Timesheet.findByPk(timesheetId);
        if (!timesheet || timesheet.user_id !== currentUser.user_id) {
            return jsonResponse(
                { msg: "Timesheet not found or you don't have permission." },
                { status: 404 }
            );
        }

        await timesheet.update({
            deleted: dayjs().unix(),
            deleted_by: currentUser.user_id || 0,
            updated: dayjs().unix(),
            updated_by: currentUser.user_id || 0,
        });

        return jsonResponse({
            msg: "Timesheet deleted successfully.",
            timesheet: timesheet,
        });
    } catch (error) {
        return jsonResponse(
            { msg: "Failed to delete timesheet." },
            { status: 500 }
        );
    }
});
