import db from "@/database/models";

const { Project, Task, Sequelize } = db;
const { Op } = Sequelize;

export { Op };

export function findProjectsWithChildTasks() {
  return Project.findAll({
    include: [
      {
        where: { parent_id: { [Op.ne]: null } },
        model: Task,
        as: "Task",
        required: false,
      },
    ],
    where: { published: "published" },
  });
}

