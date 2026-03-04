import db from "@/database/models";

const {
  AnnualAssestment,
  MasterAnnualAssesmentQuestion,
  MasterAnnualAssesmentPeriod,
  User,
} = db;

export function findActiveAnnualQuestions() {
  return MasterAnnualAssesmentQuestion.findAll({
    where: { deleted: null, deleted_by: null, is_active: 1 },
    order: [
      ["section_key", "ASC"],
      ["sort_order", "ASC"],
      ["question_id", "ASC"],
    ],
    raw: true,
  });
}

export function findActiveAnnualQuestionsForList() {
  return MasterAnnualAssesmentQuestion.findAll({
    where: { is_active: 1 },
    order: [
      ["section_key", "ASC"],
      ["sort_order", "ASC"],
      ["question_id", "ASC"],
    ],
  });
}

export function findAnnualPeriodByYear(year) {
  return MasterAnnualAssesmentPeriod.findOne({
    where: { year, deleted: null, deleted_by: null, is_active: 1 },
  });
}

export function findAnnualPeriodByYearRaw(year) {
  return MasterAnnualAssesmentPeriod.findOne({
    where: { year, deleted: null, deleted_by: null, is_active: 1 },
    raw: true,
  });
}

export function findAnnualAssessmentByStaffYear(staffId, year) {
  return AnnualAssestment.findOne({
    where: { staff_id: staffId, period_to_year: year },
    order: [["annual_assestment_id", "DESC"]],
  });
}

export function findAnnualAssessmentByStaffYearRaw(staffId, year) {
  return AnnualAssestment.findOne({
    where: { staff_id: staffId, period_to_year: year },
    order: [["annual_assestment_id", "DESC"]],
    raw: true,
  });
}

export function findAnnualAssessmentById(id) {
  return AnnualAssestment.findOne({
    where: { annual_assestment_id: id },
  });
}

export function createAnnualAssessment(payload) {
  return AnnualAssestment.create(payload);
}

export function updateAnnualAssessmentInstance(row, updates) {
  return row.update(updates);
}

export function findHodByDepartmentId(departmentId) {
  return User.findOne({
    where: {
      department_id: departmentId,
      is_hod: "true",
      deleted: null,
      deleted_by: null,
    },
    order: [["user_id", "ASC"]],
  });
}

export function findHrdUser() {
  return User.findOne({
    where: {
      is_hrd: "true",
      deleted: null,
      deleted_by: null,
    },
    order: [["user_id", "ASC"]],
  });
}

export function findOperationalDirectorUser() {
  return User.findOne({
    where: {
      is_operational_director: "true",
      deleted: null,
      deleted_by: null,
    },
    order: [["user_id", "ASC"]],
  });
}

export function findUsersByIds(ids) {
  return User.findAll({
    where: { user_id: ids, deleted: null, deleted_by: null },
  });
}

export function listAnnualAssessmentsByHod({ hodId, year, status }) {
  const where = { hod_id: hodId, period_to_year: year };
  if (status && String(status).toLowerCase() !== "all") {
    where.status = String(status);
  }
  return AnnualAssestment.findAll({
    where,
    order: [
      ["status", "ASC"],
      ["updated", "DESC"],
      ["annual_assestment_id", "DESC"],
    ],
    include: [
      {
        model: User,
        as: "staff",
        attributes: ["user_id", "fullname", "name", "email", "department_id"],
        required: false,
      },
    ],
  });
}

export function findAnnualAssessmentForHodDetail({ staffId, hodId, year }) {
  return AnnualAssestment.findOne({
    where: { staff_id: staffId, hod_id: hodId, period_to_year: year },
    order: [["annual_assestment_id", "DESC"]],
    include: [
      {
        model: User,
        as: "staff",
        attributes: ["user_id", "fullname", "name", "email", "department_id"],
        required: false,
      },
    ],
  });
}

export function listAnnualAssessmentsByPeriod({ year, status }) {
  const where = { period_to_year: year };
  if (status && String(status).toLowerCase() !== "all") {
    where.status = "approved";
  }
  return AnnualAssestment.findAll({
    where,
    order: [["annual_assestment_id", "ASC"]],
  });
}

export function findLatestAnnualAssessmentByStaff({ staffId, year }) {
  return AnnualAssestment.findOne({
    where: { staff_id: staffId, period_to_year: year },
    order: [["annual_assestment_id", "DESC"]],
  });
}

export function findAnnualQuestionsForSnapshot() {
  return MasterAnnualAssesmentQuestion.findAll({
    where: { is_active: 1, deleted: null, deleted_by: null },
    order: [
      ["section_key", "ASC"],
      ["sort_order", "ASC"],
      ["question_id", "ASC"],
    ],
  });
}
