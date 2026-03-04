import db from "@/database/models";

const { MasterAnnualAssesmentPeriod, LeaveConfig, Sequelize } = db;
const { Op } = Sequelize;

export { Op };

export function findAnnualAssessmentPeriods() {
  return MasterAnnualAssesmentPeriod.findAll({ order: [["year", "DESC"]], raw: true });
}

export function findAnnualAssessmentPeriodByYear(year) {
  return MasterAnnualAssesmentPeriod.findOne({ where: { year }, raw: true });
}

export function createAnnualAssessmentPeriod(payload) {
  return MasterAnnualAssesmentPeriod.create(payload);
}

export function updateAnnualAssessmentPeriodByYear(year, updates) {
  return MasterAnnualAssesmentPeriod.update(updates, { where: { year } });
}

export function findLeaveReasonsPaged(where, limit, offset) {
  return LeaveConfig.findAndCountAll({
    where,
    order: [["title", "ASC"]],
    limit,
    offset,
    attributes: [
      "lconfig_id",
      "title",
      "total",
      "max_sequence",
      "created",
      "created_by",
      "updated",
      "updated_by",
      "deleted",
      "deleted_by",
    ],
  });
}
