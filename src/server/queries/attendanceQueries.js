import db from "@/database/models";

const {
  Attendance,
  AttendanceConfig,
  Holiday,
  Setting,
  User,
  Department,
  LeaveRequest,
  LeaveConfig,
  Sequelize,
} = db;

const { Op } = Sequelize;

export { Sequelize, Op };

export function findAttendanceByUserDate(userId, date, options = {}) {
  return Attendance.findOne({ where: { user_id: userId, date }, ...options });
}

export function findUserById(userId, options = {}) {
  return User.findOne({ where: { user_id: userId }, ...options });
}

export function findUserAbsentType(userId) {
  return User.findOne({
    where: { user_id: userId },
    attributes: ["absent_type"],
    raw: true,
  });
}

export function findHolidayByDate(ymd) {
  return Holiday.findOne({
    where: { date: ymd },
    attributes: ["holiday_id", "date", "description"],
    raw: true,
  });
}

export function findAttendanceConfigByIp(ip) {
  return AttendanceConfig.findOne({ where: { ip, active: 1 } });
}

export function createAttendance(payload) {
  return Attendance.create(payload);
}

export function updateAttendanceInstance(row, updates) {
  return row.update(updates);
}

export function updateUserClockedIn(userId, isClockedIn, ts) {
  return User.update(
    { is_clocked_in: isClockedIn ? "true" : "false", updated: ts, updated_by: userId },
    { where: { user_id: userId } }
  );
}

export function findAttendanceListWithUser({
  whereAttendance,
  includeUserWhere,
  includeRequired,
  order,
  limit,
  offset,
}) {
  return Attendance.findAndCountAll({
    where: whereAttendance,
    include: [
      {
        model: User,
        as: "User",
        required: includeRequired,
        where: includeUserWhere,
        attributes: ["user_id", "fullname", "email", "phone", "job_position"],
      },
    ],
    order,
    limit,
    offset,
    distinct: true,
    attributes: [
      "attendance_id",
      "user_id",
      "date",
      "clock_in",
      "clock_out",
      "status",
      "late_reason",
      "minutes_late",
      "notes",
    ],
  });
}

export function findAttendanceMapRows({ date, statusFilter, q }) {
  const whereAttendance = {
    date,
    location_latitude: { [Op.ne]: null },
    location_longitude: { [Op.ne]: null },
  };

  if (statusFilter) {
    whereAttendance.status = statusFilter;
  }

  const whereUser = {};
  if (q) {
    const like = `%${q}%`;
    whereUser[Op.or] = [
      { fullname: { [Op.like]: like } },
      { email: { [Op.like]: like } },
      { phone: { [Op.like]: like } },
    ];
  }

  return Attendance.findAll({
    where: whereAttendance,
    include: [
      {
        model: User,
        as: "User",
        required: true,
        attributes: ["user_id", "fullname", "email", "job_position", "phone"],
        where: whereUser,
      },
    ],
    order: [[{ model: User, as: "User" }, "fullname", "ASC"]],
  });
}

export function findFirstAttendanceDate(userId) {
  return Attendance.findOne({
    where: { user_id: userId },
    attributes: ["date"],
    order: [["date", "ASC"]],
  });
}

export function findAttendanceByUserDateSimple(userId, date) {
  return Attendance.findOne({ where: { user_id: userId, date } });
}

export function findUsersForAttendanceExport() {
  return User.findAll({
    attributes: [
      "user_id",
      "fullname",
      "job_position",
      "phone",
      "email",
      "department_id",
    ],
    raw: true,
  });
}

export function findDepartmentsForAttendanceExport() {
  return Department.findAll({
    attributes: ["department_id", "title"],
    raw: true,
  });
}

export function findHolidaysBetween(from, to) {
  return Holiday.findAll({
    where: {
      date: {
        [Op.between]: [from, to],
      },
    },
    attributes: ["date"],
    raw: true,
  });
}

export function findHolidaysForYear(yearStart, yearEnd) {
  return Holiday.findAll({
    where: {
      date: {
        [Op.between]: [yearStart, yearEnd],
      },
    },
    attributes: ["date", "type"],
    raw: true,
  });
}

export function findAttendanceBetween(from, to) {
  return Attendance.findAll({
    where: {
      date: { [Op.between]: [from, to] },
    },
    attributes: ["user_id", "date", "status", "timesheet", "minutes_late"],
    raw: true,
  });
}

export function findApprovedLeavesForYear(yearStart, yearEnd) {
  return LeaveRequest.findAll({
    where: {
      status: "approved",
      start_date: { [Op.lte]: yearEnd },
      end_date: { [Op.gte]: yearStart },
    },
    attributes: [
      "leave_id",
      "user_id",
      "start_date",
      "end_date",
      "days",
      "permit",
      "reason",
    ],
    raw: true,
  });
}

export function findAnnualLeaveConfig() {
  return LeaveConfig.findOne({
    where: {
      title: { [Op.like]: "Cuti Tahunan%" },
    },
    raw: true,
  });
}
