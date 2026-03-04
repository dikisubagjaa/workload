import dayjs, { TZ } from "@/utils/dayjs";
import { nowUnix } from "@/utils/dateHelpers";
import { parseHHMM } from "@/utils/parseHelpers";
import {
  Op,
  findTimesheets,
  findTimesheetById,
  createTimesheet,
  updateTimesheetInstance,
  Project,
  Task,
  findProjectById,
  findTaskById,
  findAttendanceByUserDate,
  createAttendance,
  updateAttendanceInstance,
  updateTimesheetsByDate,
  countTaskAssignments,
  countApprovedTimesheets,
  findHolidaysBetween,
} from "@/server/queries/timesheetQueries";

// ===== cache libur nasional (TTL 6 jam) =====
let HOLI_SET = new Set();
let HOLI_LOADED_AT = 0;
const HOLI_TTL_MS = 6 * 60 * 60 * 1000;

const JKT_NOW = () => dayjs().tz(TZ);

function isWeekend(d) {
  const wd = dayjs(d).day();
  return wd === 0 || wd === 6;
}

async function ensureHolidayCache() {
  const now = Date.now();
  if (HOLI_SET.size && now - HOLI_LOADED_AT < HOLI_TTL_MS) return;

  const y = JKT_NOW().year();
  const from = `${y - 1}-01-01`;
  const to = `${y + 1}-12-31`;

  const rows = await findHolidaysBetween(from, to);
  HOLI_SET = new Set(rows.map((r) => dayjs(r.date).format("YYYY-MM-DD")));
  HOLI_LOADED_AT = now;
}

async function isHoliday(ymd) {
  await ensureHolidayCache();
  return HOLI_SET.has(ymd);
}

async function previousWorkingDay() {
  let d = JKT_NOW().subtract(1, "day");
  while (true) {
    const ymd = d.format("YYYY-MM-DD");
    if (!isWeekend(d) && !(await isHoliday(ymd))) {
      return ymd;
    }
    d = d.subtract(1, "day");
  }
}

export async function listTimesheets(req, currentUser) {
  const { searchParams } = new URL(req.url);
  const userId = currentUser.user_id;

  const whereClause = { user_id: userId, deleted: null };

  const month = searchParams.get("month");
  if (month && dayjs(month, "YYYY-MM").isValid()) {
    const startDate = dayjs(month).startOf("month").format("YYYY-MM-DD");
    const endDate = dayjs(month).endOf("month").format("YYYY-MM-DD");
    whereClause.date = { [Op.between]: [startDate, endDate] };
  }

  const timesheetData = await findTimesheets(whereClause, {
    include: [
      { model: Project, as: "Project", attributes: ["title"] },
      { model: Task, as: "Task", attributes: ["title"] },
    ],
    order: [["date", "DESC"], ["start_time", "DESC"]],
  });

  return { data: timesheetData };
}

export async function createTimesheetFromBody(body, currentUser) {
  if (!body.projectId || !body.taskId || !body.date) {
    return { httpStatus: 400, msg: "Project, Task, and Date are required." };
  }

  const [proj, task] = await Promise.all([
    findProjectById(body.projectId),
    findTaskById(body.taskId),
  ]);
  if (!proj) return { httpStatus: 404, msg: "Project not found." };
  if (!task) return { httpStatus: 404, msg: "Task not found." };

  let start_time = null;
  let end_time = null;
  let duration_minutes = 0;

  const isDurationMode = body.durationMinutes > 0 && (!body.startTime || !body.endTime);

  if (isDurationMode) {
    duration_minutes = Math.floor(body.durationMinutes);
    if (!Number.isFinite(duration_minutes) || duration_minutes <= 0) {
      return { httpStatus: 400, msg: "Duration must be greater than 0 minutes." };
    }

    const nowTz = dayjs().tz(TZ);
    let baseDateTime;
    if (body.date && dayjs(body.date, "YYYY-MM-DD", true).isValid()) {
      baseDateTime = dayjs.tz(
        `${body.date} ${nowTz.format("HH:mm")}`,
        "YYYY-MM-DD HH:mm",
        TZ
      );
    } else {
      baseDateTime = nowTz;
    }

    const endDateTime = baseDateTime.add(duration_minutes, "minute");

    start_time = baseDateTime.format("HH:mm");
    end_time = endDateTime.format("HH:mm");
  } else {
    if (!body.startTime || !body.endTime) {
      return { httpStatus: 400, msg: "Start time and End time are required." };
    }
    const s = parseHHMM(body.startTime);
    const e = parseHHMM(body.endTime);
    if (s == null || e == null) {
      return { httpStatus: 400, msg: "Invalid time format. Expected HH:mm." };
    }
    if (e < s) {
      return { httpStatus: 400, msg: "End time cannot be before start time." };
    }
    start_time = body.startTime;
    end_time = body.endTime;
    duration_minutes = e - s;
  }

  let clockInUnixForAttendance = null;
  if (start_time && body.date && dayjs(body.date, "YYYY-MM-DD", true).isValid()) {
    const startDateTime = dayjs.tz(
      `${body.date} ${start_time}`,
      "YYYY-MM-DD HH:mm",
      TZ
    );
    if (startDateTime.isValid()) {
      clockInUnixForAttendance = startDateTime.unix();
    }
  }

  const ts = nowUnix();

  const newTimesheet = await createTimesheet({
    user_id: currentUser.user_id,
    project_id: body.projectId,
    task_id: body.taskId,
    date: body.date,
    start_time,
    end_time,
    duration_minutes,
    status: "submitted",
    created: ts,
    created_by: currentUser.user_id,
    updated: ts,
    updated_by: currentUser.user_id,
  });

  if (clockInUnixForAttendance) {
    try {
      const existing = await findAttendanceByUserDate(currentUser.user_id, body.date);

      if (!existing) {
        const latVal = body.latitude ?? body.lat;
        const lonVal = body.longitude ?? body.lng ?? body.long;
        const latNum = latVal !== undefined && latVal !== null ? Number(latVal) : null;
        const lonNum = lonVal !== undefined && lonVal !== null ? Number(lonVal) : null;

        await createAttendance({
          user_id: currentUser.user_id,
          date: body.date,
          clock_in: clockInUnixForAttendance,
          clock_out: null,
          location_latitude: Number.isFinite(latNum) ? latNum : null,
          location_longitude: Number.isFinite(lonNum) ? lonNum : null,
          status: "present",
          source: "timesheet",
          note: "Auto created from timesheet",
          timesheet: "true",
          duration_minutes: 0,
          minutes_late: 0,
          late_reason: null,
          created: ts,
          created_by: currentUser.user_id,
          updated: ts,
          updated_by: currentUser.user_id,
        });
      } else {
        await updateAttendanceInstance(existing, {
          timesheet: "true",
          updated: ts,
          updated_by: currentUser.user_id,
        });
      }
    } catch (attErr) {
      console.warn("Auto-attendance failed:", attErr?.message || attErr);
    }
  }

  return { httpStatus: 201, msg: "Timesheet submitted!", data: newTimesheet };
}

export async function updateTimesheetFromBody(timesheetId, body, currentUser) {
  const timesheet = await findTimesheetById(timesheetId, currentUser.user_id);

  if (!timesheet) {
    return { httpStatus: 404, msg: "Timesheet not found." };
  }

  let { startTime, endTime, durationMinutes, description, status } = body;

  const updates = {};
  if (description !== undefined) updates.description = description;
  if (status !== undefined) updates.status = status;

  if (durationMinutes !== undefined && (startTime === undefined && endTime === undefined)) {
    const mins = Math.floor(durationMinutes);
    if (!Number.isFinite(mins) || mins <= 0) {
      return { httpStatus: 400, msg: "Duration must be greater than 0 minutes." };
    }
    updates.duration_minutes = mins;
    updates.start_time = null;
    updates.end_time = null;
  } else if (startTime !== undefined && endTime !== undefined) {
    const s = parseHHMM(startTime);
    const e = parseHHMM(endTime);
    if (s == null || e == null) {
      return { httpStatus: 400, msg: "Invalid time format. Expected HH:mm." };
    }
    if (e < s) {
      return { httpStatus: 400, msg: "End time cannot be before start time." };
    }
    updates.start_time = startTime;
    updates.end_time = endTime;
    updates.duration_minutes = e - s;
  }

  updates.updated = nowUnix();
  updates.updated_by = currentUser.user_id;

  await updateTimesheetInstance(timesheet, updates);

  return { msg: "Timesheet updated successfully.", data: timesheet };
}

export async function deleteTimesheetById(timesheetId, currentUser) {
  const timesheet = await findTimesheetById(timesheetId, currentUser.user_id);

  if (!timesheet) {
    return { httpStatus: 404, msg: "Timesheet not found." };
  }

  await updateTimesheetInstance(timesheet, {
    deleted: nowUnix(),
    deleted_by: currentUser.user_id,
  });

  return { msg: "Timesheet deleted successfully." };
}

export async function confirmTimesheet(date, currentUser) {
  if (!date) {
    return { httpStatus: 400, msg: "Date is required." };
  }

  await updateTimesheetsByDate(currentUser.user_id, date, { status: "approved" });

  return { msg: "Timesheet confirmed.", date };
}

export async function getTimesheetEnforcement(currentUser) {
  const assignCount = await countTaskAssignments(currentUser.user_id);
  if (assignCount === 0) {
    return { required: false, reason: "no-assignment" };
  }

  const targetDate = await previousWorkingDay();

  const count = await countApprovedTimesheets(currentUser.user_id, targetDate);
  if (count > 0) {
    return { required: false };
  }

  const redirect = `/timesheet?force=1&date=${targetDate}`;
  return {
    required: true,
    date: targetDate,
    redirect,
    enforce: true,
  };
}
