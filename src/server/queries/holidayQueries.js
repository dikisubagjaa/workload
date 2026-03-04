import db from "@/database/models";

const { Holiday, Sequelize } = db;
const { Op } = Sequelize;

export { Op };

export function findHolidays(where) {
  return Holiday.findAll({
    where: Object.keys(where || {}).length ? where : undefined,
    order: [["date", "ASC"], ["holiday_id", "ASC"]],
  });
}

export function findHolidayById(id) {
  return Holiday.findByPk(id);
}

export function findHolidayByDate(date) {
  return Holiday.findOne({ where: { date } });
}

export function updateHolidayById(id, updates) {
  return Holiday.update(updates, { where: { holiday_id: id } });
}

export function createHoliday(payload) {
  return Holiday.create(payload);
}
