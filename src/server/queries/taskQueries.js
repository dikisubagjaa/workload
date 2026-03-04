import db from "@/database/models";

const {
  sequelize,
  Task,
  Project,
  ProjectQuotation,
  ProjectPurchaseOrder,
  TaskAssignment,
  TaskRevision,
  TaskTodo,
  TaskAttachment,
  TaskComment,
  SubTask,
  Department,
  ProjectTeam,
  User,
  Client,
  Sequelize,
} = db;

const { Op } = Sequelize;

export { sequelize, Sequelize, Op };

export function findAllTasks() {
  return Task.findAll();
}

export function findTaskById(taskId, options = {}) {
  return Task.findOne({ where: { task_id: taskId }, ...options });
}

export function findTaskByPk(taskId, options = {}) {
  return Task.findByPk(taskId, options);
}

export function findTaskBrief(taskId) {
  return Task.findOne({ where: { task_id: taskId }, attributes: ["task_id", "parent_id"] });
}

export function findTasks(where, options = {}) {
  return Task.findAll({ where, ...options });
}

export function countTasks(where, options = {}) {
  return Task.count({ where, ...options });
}

export function updateTaskById(taskId, updates, options = {}) {
  return Task.update(updates, { where: { task_id: taskId }, ...options });
}

export function updateTasksByWhere(where, updates, options = {}) {
  return Task.update(updates, { where, ...options });
}

export function createTask(payload, options = {}) {
  return Task.create(payload, options);
}

export function updateTaskInstance(task, updates, options = {}) {
  return task.update(updates, options);
}

export function findProjectById(projectId) {
  return Project.findOne({ where: { project_id: projectId } });
}

export function findProjectsByWhere(where, options = {}) {
  return Project.findAll({ where, ...options });
}

export function findProjectQuotationsByProjectId(projectId) {
  return ProjectQuotation.findAll({
    where: { project_id: projectId },
    attributes: ["pq_id", "quotation_number", "project_id"],
    order: [["pq_id", "DESC"]],
  });
}

export function findProjectQuotationById(pqId) {
  return ProjectQuotation.findOne({ where: { pq_id: pqId } });
}

export function findProjectPurchaseOrdersByPqId(pqId) {
  return ProjectPurchaseOrder.findAll({
    where: { pq_id: pqId },
    attributes: ["po_id", "po_number"],
    order: [["pq_id", "DESC"]],
  });
}

export function findTaskAssignmentByTaskId(taskId) {
  return TaskAssignment.findOne({ where: { task_id: taskId } });
}

export function findTaskAssignmentsByTaskId(taskId, options = {}) {
  return TaskAssignment.findAll({ where: { task_id: taskId }, ...options });
}

export function destroyTaskAssignmentsByTaskId(taskId, options = {}) {
  return TaskAssignment.destroy({ where: { task_id: taskId }, ...options });
}

export function bulkCreateTaskAssignments(rows, options = {}) {
  return TaskAssignment.bulkCreate(rows, options);
}

export function findTaskRevisionsByTaskId(taskId) {
  return TaskRevision.findAll({
    where: { task_id: taskId },
    order: [["created", "DESC"]],
    include: [{ model: Task, as: "Task", required: false }],
  });
}

export function findLastTaskRevision(taskId, options = {}) {
  return TaskRevision.findOne({
    where: { task_id: taskId },
    order: [["version", "DESC"]],
    attributes: ["version"],
    ...options,
  });
}

export function createTaskRevision(payload, options = {}) {
  return TaskRevision.create(payload, options);
}

export function createTaskTodo(payload, options = {}) {
  return TaskTodo.create(payload, options);
}

export function findTaskCommentsByTaskId(taskId) {
  return TaskComment.findAll({
    include: [{ model: User, as: "creator" }],
    where: { task_id: taskId },
    order: [["created", "DESC"]],
  });
}

export function createTaskComment(payload) {
  return TaskComment.create(payload);
}

export function findUsersByIds(ids) {
  return User.findAll({
    where: { user_id: ids },
    attributes: ["user_id", "uuid", "fullname", "email", "profile_pic"],
  });
}

export function findUserById(userId) {
  return User.findOne({ where: { user_id: userId }, attributes: ["user_id"] });
}

export function findTaskAttachmentsByTaskId(taskId, options = {}) {
  return TaskAttachment.findAll({ where: { task_id: taskId }, ...options });
}

export function findTaskAttachmentsByIds(ids) {
  return TaskAttachment.findAll({
    where: { attachment_id: ids },
    attributes: ["attachment_id", "real_filename", "filename"],
  });
}

export function findTaskAttachmentById(attachmentId, options = {}) {
  return TaskAttachment.findByPk(attachmentId, options);
}

export function findTaskAttachmentByRealFilename(taskId, realFilename) {
  return TaskAttachment.findOne({ where: { real_filename: realFilename, task_id: taskId } });
}

export function createTaskAttachment(payload, options = {}) {
  return TaskAttachment.create(payload, options);
}

export function updateTaskAttachmentByWhere(updates, where, options = {}) {
  return TaskAttachment.update(updates, { where, ...options });
}

export function updateTaskAttachmentInstance(attachment, updates, options = {}) {
  return attachment.update(updates, options);
}

export function findSubTaskById(tsId, taskId) {
  return SubTask.findOne({ where: { ts_id: tsId, task_id: taskId } });
}

export function createSubTask(payload) {
  return SubTask.create(payload);
}

export function updateSubTask(where, updates) {
  return SubTask.update(updates, { where });
}

export function findDepartmentsByIds(ids) {
  return Department.findAll({
    where: { department_id: { [Op.in]: ids } },
    attributes: ["department_id", "title"],
  });
}

export function findDepartmentById(departmentId) {
  return Department.findByPk(departmentId, { attributes: ["department_id", "title"] });
}

export function findProjectTeamsByTaskId(projectId, taskId) {
  return ProjectTeam.findAll({ where: { project_id: projectId, task_id: taskId } });
}

export function destroyProjectTeamsByTaskId(taskId, options = {}) {
  return ProjectTeam.destroy({ where: { task_id: taskId }, ...options });
}

export function destroyProjectTeamsByTaskIdAndNotInUsers(projectId, taskId, userIds, options = {}) {
  return ProjectTeam.destroy({
    where: {
      project_id: projectId,
      task_id: taskId,
      ...(userIds.length ? { user_id: { [Op.notIn]: userIds } } : {}),
    },
    ...options,
  });
}

export function findOrCreateProjectTeam(where, defaults, options = {}) {
  return ProjectTeam.findOrCreate({ where, defaults, ...options });
}

export function findTaskWithDetailInclude(taskId) {
  return Task.findOne({
    where: { task_id: taskId },
    include: [
      { model: User, as: "creator" },
      { model: SubTask, as: "SubTasks", required: false },
      {
        model: Task,
        as: "SubtaskItems",
        required: false,
        include: [
          {
            model: TaskAttachment,
            as: "Attachments",
            separate: true,
            where: { revision_id: null },
            required: false,
            order: [["attachment_id", "DESC"]],
            include: [
              {
                model: TaskAttachment,
                as: "revisionFiles",
                separate: true,
                order: [["attachment_id", "DESC"]],
                required: false,
              },
            ],
          },
          { model: User, as: "AssignedUser", attributes: ["fullname", "profile_pic", "user_id"], required: false },
        ],
      },
    ],
  });
}

export function findTaskWithCreator(taskId) {
  return Task.findOne({ where: { task_id: taskId }, include: [{ model: User, as: "creator" }] });
}

export function findTaskDetailForSubtaskItem(taskId) {
  return Task.findOne({
    where: { task_id: taskId },
    include: [
      { model: User, as: "creator" },
      {
        model: Project,
        as: "Project",
        include: [{ model: Client, as: "Client" }],
      },
    ],
  });
}

export function findSubtaskItemWithAttachments(taskId) {
  return Task.findOne({
    where: { task_id: taskId },
    attribute: ["task_id", "title", "priority", "todo"],
    include: [
      {
        model: TaskAttachment,
        as: "Attachments",
        separate: true,
        where: { revision_id: null },
        order: [["attachment_id", "DESC"]],
        include: [
          {
            model: TaskAttachment,
            as: "revisionFiles",
            separate: true,
            order: [["attachment_id", "DESC"]],
            required: false,
          },
        ],
      },
    ],
  });
}

export function findSubtaskItemWithAssignees(taskId) {
  return Task.findOne({
    where: { task_id: taskId },
    attributes: [
      "task_id",
      "title",
      "description",
      "project_id",
      "parent_id",
      "ts_id",
      "start_date",
      "end_date",
      "created",
      "created_by",
      "updated",
      "updated_by",
    ],
    include: [
      { model: User, as: "creator", attributes: ["user_id", "fullname", "profile_pic"], required: false },
      { model: User, as: "AssignedUser", attributes: ["user_id", "fullname", "profile_pic"], through: { attributes: [] }, required: false },
    ],
  });
}

export function findTasksForListAssign(where, include, order) {
  console.log("[task/list-assign][query-builder]", {
    where,
    include_aliases: Array.isArray(include)
      ? include.map((i) => i?.as || i?.model?.name || "unknown")
      : [],
    order,
  });

  return Task.findAll({
    where,
    include,
    order,
    subQuery: false,
    benchmark: true,
    logging: (sql, ms) => {
      console.log("[task/list-assign][sql]", sql);
      if (typeof ms === "number") {
        console.log("[task/list-assign][sql-ms]", ms);
      }
    },
  });
}

export function findTaskWithAssignmentsForStats(include, where) {
  return Task.count({ distinct: true, include, where, subQuery: false });
}
