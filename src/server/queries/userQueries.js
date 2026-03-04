import db from "@/database/models";

const { User, UserEmployment } = db;
const { Role } = db;

export function findUsers({ where, limit, offset, order, attributes, include }) {
  return User.findAndCountAll({
    where,
    limit,
    offset,
    order,
    attributes,
    include,
    distinct: true,
  });
}

export function findUserById(userId, transaction) {
  return User.findOne({ where: { user_id: userId }, transaction });
}

export function findUserByEmail(email, transaction) {
  return User.findOne({ where: { email }, transaction });
}

export function createUser(payload, transaction) {
  return User.create(payload, { transaction });
}

export function updateUserInstance(user, payload, transaction) {
  return user.update(payload, { transaction });
}

export function findActiveEmployment(userId, transaction) {
  return UserEmployment.findOne({
    where: { user_id: userId, deleted: null },
    transaction,
  });
}

export function createEmployment(payload, transaction) {
  return UserEmployment.create(payload, { transaction });
}

export function updateEmploymentInstance(employment, payload, transaction) {
  return employment.update(payload, { transaction });
}

export function getUserAttributes() {
  return User?.rawAttributes || {};
}

export function getEmploymentAttributes() {
  return UserEmployment?.rawAttributes || {};
}

export function findUsersForExport({ where, order, limit, offset }) {
  return User.findAll({
    where,
    order,
    limit,
    offset,
    attributes: [
      "user_id",
      "fullname",
      "email",
      "phone",
      "user_role",
      "department_id",
      "status",
      "join_date",
    ],
    include: [
      {
        model: Role,
        as: "RoleDetail",
        attributes: ["is_hod", "is_hrd", "is_operational_director"],
        required: false,
      },
    ],
    raw: true,
    nest: true,
  });
}
