import db from "@/database/models";

const { TaskRevision, Task, Project } = db;

export function findRevisionsByStatus(statusList) {
  return TaskRevision.findAll({
    where: { status: statusList },
    include: [
      {
        model: Task,
        as: "Task",
        required: true,
        include: [{ model: Project, as: "Project", required: false }],
      },
    ],
    order: [["created", "DESC"]],
    subQuery: false,
  });
}

export function findRevisionById(revisionId) {
  return TaskRevision.findByPk(revisionId);
}

export function updateRevisionById(revisionId, updates) {
  return TaskRevision.update(updates, { where: { revision_id: revisionId } });
}

export function findRevisionByIdWithRaw(revisionId) {
  return TaskRevision.findByPk(revisionId);
}
