import db from "@/database/models";

const { Appraisal, MasterAppraisalQuestion, User, UserEmployment, Sequelize } = db;
const { Op } = Sequelize;

export { Sequelize, Op };

export function findAppraisalsAndCount({ where, order, limit, offset }) {
  return Appraisal.findAndCountAll({ where, order, limit, offset });
}

export function findAppraisalById(appraisalId) {
  return Appraisal.findOne({ where: { appraisal_id: appraisalId, deleted: null, deleted_by: null } });
}

export function findAppraisalByWhere(where) {
  return Appraisal.findOne({ where });
}

export function createAppraisal(payload) {
  return Appraisal.create(payload);
}

export function updateAppraisalInstance(row, updates) {
  return row.update(updates);
}

export function findActiveAppraisalQuestions(title) {
  const where = { deleted: null, deleted_by: null, is_active: "true" };
  if (title) where.title = title;
  return MasterAppraisalQuestion.findAll({
    where,
    order: [
      ["sort_order", "ASC"],
      ["question_id", "ASC"],
    ],
  });
}

export function findQuestionsSnapshot(title) {
  const where = { deleted: null, deleted_by: null, is_active: "true" };
  if (title) where.title = title;
  return MasterAppraisalQuestion.findAll({
    where,
    order: [
      ["sort_order", "ASC"],
      ["question_id", "ASC"],
    ],
    raw: true,
  });
}

export function findUserById(userId) {
  return User.findOne({ where: { user_id: userId, deleted: null, deleted_by: null }, raw: true });
}

export function findLatestEmployment(userId) {
  return UserEmployment.findOne({
    where: { user_id: userId, deleted: null },
    order: [["employment_id", "DESC"]],
    raw: true,
  });
}

export function getAppraisalRawAttributes() {
  return Appraisal?.rawAttributes || {};
}

