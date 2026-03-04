import db from "@/database/models";

const { User } = db;

export function findAllUsers() {
  return User.findAll();
}

export function createUser(payload) {
  return User.create(payload);
}

export function findUserById(userId) {
  return User.findByPk(userId);
}

export function findUserByUuid(uuid) {
  return User.findOne({ where: { uuid } });
}

export function updateUserInstance(user, updates, options = {}) {
  return user.update(updates, options);
}
