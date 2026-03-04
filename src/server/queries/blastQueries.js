import db from "@/database/models";

const { User } = db;

export function findActiveUsers() {
  return User.findAll({ where: { status: "active" } });
}

