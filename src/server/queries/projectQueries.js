import db from "@/database/models";

const {
  Project,
  Client,
  Company,
  ProjectType,
  ProjectTeam,
  User,
  Task,
  ProjectQuotation,
  ProjectPurchaseOrder,
  Sequelize,
} = db;

const { Op } = Sequelize;

export function findPublishedProjectsWithClient() {
  return Project.findAll({
    where: { published: "published" },
    include: [
      { model: Client, as: "Client", attributes: ["client_id", "client_name"] },
    ],
    order: [["project_id", "DESC"]],
  });
}

export function findProjectTypesByIds(ptIds) {
  if (!ptIds || !ptIds.length) return Promise.resolve([]);
  return ProjectType.findAll({
    where: { pt_id: { [Op.in]: ptIds }, deleted: null },
    attributes: ["pt_id", "title"],
    order: [["pt_id", "ASC"]],
  });
}

export function findProjectTeamsByProjectIds(projectIds) {
  if (!projectIds || !projectIds.length) return Promise.resolve([]);
  return ProjectTeam.findAll({
    where: { project_id: { [Op.in]: projectIds }, deleted: null },
    attributes: ["project_id", "user_id"],
    include: [
      { model: User, as: "User", attributes: ["user_id", "fullname", "profile_pic"] },
    ],
    order: [["project_id", "ASC"], ["user_id", "ASC"]],
  });
}

export function findProjectTeamsByProjectId(projectId) {
  return ProjectTeam.findAll({
    where: { project_id: projectId, deleted: null },
    attributes: ["project_id", "user_id"],
    include: [
      { model: User, as: "User", attributes: ["user_id", "fullname", "profile_pic"] },
    ],
    order: [["project_id", "ASC"], ["user_id", "ASC"]],
  });
}

export function findChildTasksByProjectIds(projectIds) {
  if (!projectIds || !projectIds.length) return Promise.resolve([]);
  return Task.findAll({
    where: {
      project_id: { [Op.in]: projectIds },
      parent_id: { [Op.ne]: null },
    },
    attributes: ["task_id", "project_id", "todo"],
    order: [["project_id", "ASC"]],
  });
}

export function findProjectByIdWithClient(projectId) {
  return Project.findOne({
    where: { project_id: projectId },
    include: [
      {
        model: Client,
        as: "Client",
        attributes: [
          "client_id",
          "client_name",
          "brand",
          "division",
          "pic_name",
          "pic_email",
          "pic_phone",
          "finance_name",
          "finance_email",
          "finance_phone",
        ],
        include: [
          {
            model: Company,
            as: "Company",
            attributes: ["company_id", "title", "legal_type", "address"],
            required: true,
          },
        ],
      },
    ],
  });
}

export function findProjectById(projectId) {
  return Project.findOne({ where: { project_id: projectId } });
}

export function updateProjectInstance(project, updates) {
  return project.update(updates);
}

export function createDraftProject(payload) {
  return Project.create(payload);
}

export function findProjectTasksByProjectId(projectId, activeDeletedClause) {
  return Task.findAll({
    where: {
      project_id: projectId,
      ...activeDeletedClause,
      [Op.or]: [{ parent_id: null }, { parent_id: 0 }, { parent_id: "" }],
    },
    include: [
      {
        model: User,
        as: "AssignedUser",
        required: false,
        attributes: ["user_id", "fullname", "profile_pic"],
        through: { attributes: [] },
      },
    ],
    order: [["task_id", "ASC"]],
  });
}

export function countTasks(where) {
  return Task.count({ where });
}

export function countTasksWithInclude(include) {
  return Task.count({ include });
}

export function findProjectChartData(limit = 5) {
  return Project.findAll({
    attributes: [
      "project_id",
      "title",
      [
        Sequelize.literal(`(
          SELECT COUNT(*) FROM task AS t
          WHERE t.project_id = Project.project_id
          AND t.todo = 'completed'
        )`),
        "completed_task_count",
      ],
      [
        Sequelize.literal(`(
          SELECT COUNT(*) FROM task AS t
          WHERE t.project_id = Project.project_id
          AND t.todo NOT IN ('completed')
        )`),
        "remaining_task_count",
      ],
      [
        Sequelize.literal(`(
          SELECT COUNT(*) FROM task AS t
          WHERE t.project_id = Project.project_id
          AND t.is_overdue = 'true'
        )`),
        "overdue_task_count",
      ],
    ],
    where: { published: "published" },
    limit,
  });
}

export function findQuotationsByProjectId(projectId) {
  return ProjectQuotation.findAll({
    where: { project_id: projectId, deleted: null },
    include: [
      {
        model: ProjectPurchaseOrder,
        as: "PurchaseOrderByQuotation",
        where: { deleted: null },
        required: false,
      },
    ],
    order: [["created", "DESC"]],
  });
}

export function createProjectQuotation(payload) {
  return ProjectQuotation.create(payload);
}

export function findQuotationById(qtId, { unscoped = false } = {}) {
  const model = unscoped ? ProjectQuotation.unscoped() : ProjectQuotation;
  return model.findByPk(qtId);
}

export function updateQuotationInstance(quotation, updates) {
  return quotation.update(updates);
}

export function updatePurchaseOrdersByQuotation(qtId, updates) {
  return ProjectPurchaseOrder.unscoped().update(updates, {
    where: { pq_id: qtId, deleted: null },
  });
}

export function findPurchaseOrdersByQuotationId(qtId) {
  return ProjectPurchaseOrder.findAll({ where: { pq_id: qtId } });
}

export function createPurchaseOrder(payload) {
  return ProjectPurchaseOrder.create(payload);
}

export function findPurchaseOrderById(poId, { unscoped = false } = {}) {
  const model = unscoped ? ProjectPurchaseOrder.unscoped() : ProjectPurchaseOrder;
  return model.findByPk(poId);
}

export function updatePurchaseOrderInstance(po, updates) {
  return po.update(updates);
}
