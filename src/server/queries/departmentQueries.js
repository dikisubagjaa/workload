import db from "@/database/models";

const { Department, Sequelize } = db;
const { Op } = Sequelize;

export { Sequelize, Op };

export function findDepartmentsAll() {
  return Department.findAll();
}

export function findDepartmentsPaged({ where, limit, offset, order }) {
  return Department.findAndCountAll({ where, limit, offset, order });
}

export function findDepartmentById(departmentId) {
  return Department.findOne({ where: { department_id: departmentId } });
}

export function createDepartment(payload) {
  return Department.create(payload);
}

export function updateDepartmentInstance(row, updates) {
  return row.update(updates);
}

