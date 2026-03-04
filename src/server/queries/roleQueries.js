import db from "@/database/models";

const { Role, Sequelize } = db;
const { Op } = Sequelize;

export function findRoles({ where, limit, offset, order }) {
  return Role.findAndCountAll({ where, limit, offset, order });
}

export function findRoleBySlug(slug, transaction) {
  return Role.findOne({ where: { slug }, transaction });
}

export function findRoleById(roleId, transaction) {
  return Role.findOne({ where: { role_id: roleId }, transaction });
}

export function findRoleByParam(roleId, transaction) {
  const n = Number(roleId);
  const asId = Number.isFinite(n) && String(n) === String(roleId) ? n : null;
  const where = asId != null
    ? { [Op.or]: [{ role_id: asId }, { slug: String(roleId) }] }
    : { slug: String(roleId) };
  return Role.findOne({ where, transaction });
}

export function createRole(payload, transaction) {
  return Role.create(payload, { transaction });
}

export function updateRole(where, payload, transaction) {
  return Role.update(payload, { where, transaction });
}

export function getRoleModel() {
  return Role;
}

export function getOp() {
  return Op;
}
