import db from "@/database/models";

const { ProjectType } = db;

export function findProjectTypes() {
  return ProjectType.findAll({ where: { deleted: null } });
}

export function createProjectType(payload) {
  return ProjectType.create(payload);
}

