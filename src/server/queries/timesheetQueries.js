import db from "@/database/models";

const { Timesheet, Project, Task, Attendance, Holiday, TaskAssignment, Sequelize } = db;
const { Op } = Sequelize;

export { Op };

export function findTimesheets(where, options = {}) {
  return Timesheet.findAll({ where, ...options });
}

export function findTimesheetById(timesheetId, userId) {
  return Timesheet.findOne({
    where: { timesheet_id: timesheetId, user_id: userId, deleted: null },
  });
}

export function createTimesheet(payload) {
  return Timesheet.create(payload);
}

export function updateTimesheetInstance(timesheet, updates) {
  return timesheet.update(updates);
}

export function findProjectById(projectId) {
  return Project.findOne({ where: { project_id: projectId } });
}

export function findTaskById(taskId) {
  return Task.findOne({ where: { task_id: taskId } });
}

export function findAttendanceByUserDate(userId, date) {
  return Attendance.findOne({ where: { user_id: userId, date } });
}

export function createAttendance(payload) {
  return Attendance.create(payload);
}

export function updateAttendanceInstance(attendance, updates) {
  return attendance.update(updates);
}

export function updateTimesheetsByDate(userId, date, updates) {
  return Timesheet.update(updates, { where: { user_id: userId, date } });
}

export function countTaskAssignments(userId) {
  return TaskAssignment.count({
    where: {
      user_id: userId,
      deleted: { [Op.or]: [null, 0] },
    },
  });
}

export function countApprovedTimesheets(userId, date) {
  return Timesheet.count({
    where: {
      user_id: userId,
      date,
      status: { [Op.eq]: "approved" },
      deleted: null,
    },
  });
}

export function findHolidaysBetween(from, to) {
  return Holiday.findAll({
    where: {
      date: { [Op.between]: [from, to] },
      is_day_off: { [Op.in]: ["true"] },
    },
    attributes: ["date"],
    raw: true,
  });
}

export { Project, Task };
