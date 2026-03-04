import dayjs, { TZ } from "@/utils/dayjs";
import { nowUnix } from "@/utils/dateHelpers";
import { notify as notifyUser } from "@/utils/notifier";
import { buildTaskWorkspaceUrl } from "@/utils/url";
import { formatHHMM, normalizeIdArray, parseHHMM } from "@/utils/parseHelpers";
import { isFlagTrue } from "@/utils/roleFlags";
import {
  Op,
  sequelize,
  findAllTasks,
  findTaskById,
  findTaskByPk,
  findTaskBrief,
  findTasks,
  countTasks,
  updateTaskById,
  updateTasksByWhere,
  createTask,
  updateTaskInstance,
  findProjectById,
  findProjectsByWhere,
  findProjectQuotationsByProjectId,
  findProjectQuotationById,
  findProjectPurchaseOrdersByPqId,
  findTaskAssignmentByTaskId,
  findTaskAssignmentsByTaskId,
  destroyTaskAssignmentsByTaskId,
  bulkCreateTaskAssignments,
  findTaskRevisionsByTaskId,
  findLastTaskRevision,
  createTaskRevision,
  createTaskTodo,
  findTaskCommentsByTaskId,
  createTaskComment,
  findUsersByIds,
  findUserById,
  findTaskAttachmentsByTaskId,
  findTaskAttachmentsByIds,
  findTaskAttachmentById,
  findTaskAttachmentByRealFilename,
  createTaskAttachment,
  updateTaskAttachmentByWhere,
  updateTaskAttachmentInstance,
  findSubTaskById,
  createSubTask,
  updateSubTask,
  findDepartmentsByIds,
  findDepartmentById,
  destroyProjectTeamsByTaskId,
  destroyProjectTeamsByTaskIdAndNotInUsers,
  findOrCreateProjectTeam,
  findTaskWithDetailInclude,
  findTaskWithCreator,
  findTaskDetailForSubtaskItem,
  findSubtaskItemWithAttachments,
  findSubtaskItemWithAssignees,
  findTasksForListAssign,
  findTaskWithAssignmentsForStats,
} from "@/server/queries/taskQueries";

import db from "@/database/models";

// -----------------------------
// Helpers
// -----------------------------
export function resolveTargetTaskId(rec, fallbackId) {
  const parentId = Number(rec?.parent_id);
  if (Number.isFinite(parentId) && parentId > 0) return parentId;
  return Number(fallbackId);
}

function normalizeOptionalId(v) {
  if (v == null) return null;
  const s = String(v).trim().toLowerCase();
  if (s === "" || s === "null" || s === "undefined") return null;
  const n = Number(s);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// -----------------------------
// /api/task
// -----------------------------
export async function listTasks() {
  const tasks = await findAllTasks();
  return { Task: tasks };
}

export async function createOrUpdateTask(body, currentUser) {
  const currentUserId = currentUser.user_id;

  const projectData = await findProjectById(body.project_id);
  if (!projectData) return { status: 404, msg: "Project not found" };

  const pqData = await findProjectQuotationById(body.pq_id);
  if (!pqData) return { status: 404, msg: "Quotation not found" };

  const finalStartDate = typeof body.start_date === "number" ? body.start_date : null;
  const finalEndDate = typeof body.end_date === "number" ? body.end_date : null;

  let finalAllottedTime = null;
  const sm = parseHHMM(body.start_time);
  const em = parseHHMM(body.end_time);
  if (sm != null && em != null) {
    let diff = em - sm;
    if (diff < 0) diff += 24 * 60;
    finalAllottedTime = formatHHMM(diff);
  } else if (finalStartDate != null && finalEndDate != null) {
    const diffMin = Math.max(0, Math.floor((finalEndDate - finalStartDate) / 60));
    finalAllottedTime = formatHHMM(diffMin);
  }

  const ensureProject = async (project_id) => {
    const row = await findProjectById(project_id);
    if (!row) throw new Error("Project not found");
    return row;
  };

  const ensurePQ = async (pq_id) => {
    const row = await findProjectQuotationById(pq_id);
    if (!row) throw new Error("Quotation not found");
    return row;
  };

  if (body?.task_id) {
    const task = await findTaskById(body.task_id);
    if (!task) return { status: 404, msg: "Task not found" };

    if (body.project_id != null) await ensureProject(body.project_id);
    let quotationNumberToSave = undefined;
    if (body.quotation_number != null) {
      const pq = await ensurePQ(body.quotation_number);
      quotationNumberToSave = pq.quotation_number;
    }

    const updatePayload = {
      ...(body.title != null && { title: body.title }),
      ...(body.project_id != null && { project_id: body.project_id }),
      ...(quotationNumberToSave != null && { quotation_number: quotationNumberToSave }),
      ...(body.po_number != null && { po_number: body.po_number }),
      ...(body.description != null && { description: body.description }),
      ...(finalStartDate !== null && { start_date: finalStartDate }),
      ...(finalEndDate !== null && { end_date: finalEndDate }),
      ...(finalAllottedTime !== null && { allotted_time: finalAllottedTime }),
      updated: nowUnix(),
      updated_by: currentUser.user_id,
    };

    await updateTaskById(body.task_id, updatePayload);
    const updatedTask = await findTaskById(body.task_id);
    return { status: 200, msg: "Task updated successfully", task: updatedTask };
  }

  const newTask = await createTask({
    title: body.title,
    project_id: projectData.project_id,
    pq_id: body.pq_id,
    po_id: body.po_id,
    description: body.description,
    start_date: finalStartDate,
    end_date: finalEndDate,
    allotted_time: finalAllottedTime,
    todo: "new",
    created: nowUnix(),
    created_by: currentUserId,
    updated: nowUnix(),
    updated_by: currentUserId,
  });

  return { status: 201, msg: "Task created successfully", task: newTask };
}

// -----------------------------
// /api/task/stats
// -----------------------------
export async function getTaskStats(req, currentUser) {
  const url = new URL(req.url);
  const staffIdParam = url.searchParams.get("staffId");
  const isSuperadmin = isFlagTrue(currentUser?.is_superadmin);

  let effectiveUserId = currentUser.user_id;

  if (isSuperadmin && staffIdParam) {
    const parsed = parseInt(staffIdParam, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      const targetUser = await findUserById(parsed);
      if (!targetUser) return { status: 404, msg: "Staff not found" };
      effectiveUserId = targetUser.user_id;
    }
  }

  const nowStart = dayjs().startOf("day").unix();
  const todayEnd = dayjs().endOf("day").unix();
  const hPlus3 = dayjs().add(3, "day").endOf("day").unix();
  const hPlus7 = dayjs().add(7, "day").endOf("day").unix();

  const assignedInclude = [
    {
      model: db.TaskAssignment,
      as: "Assignments",
      where: { user_id: effectiveUserId },
      required: true,
    },
    { model: db.Project, as: "Project" },
  ];

  const dueToday = await findTaskWithAssignmentsForStats(assignedInclude, {
    end_date: { [Op.gte]: nowStart, [Op.lte]: todayEnd },
  });

  const overdue = await findTaskWithAssignmentsForStats(assignedInclude, {
    end_date: { [Op.lt]: nowStart },
    [Op.or]: [{ todo: { [Op.notIn]: ["completed"] } }, { todo: null }],
  });

  const critical = await findTaskWithAssignmentsForStats(assignedInclude, {
    end_date: { [Op.gte]: nowStart, [Op.lte]: hPlus3 },
  });

  const dueThisWeek = await findTaskWithAssignmentsForStats(assignedInclude, {
    end_date: { [Op.gte]: nowStart, [Op.lte]: hPlus7 },
  });

  const totalTask = await findTaskWithAssignmentsForStats(assignedInclude, {});
  const newTaskAssigned = await findTaskWithAssignmentsForStats(assignedInclude, {
    todo: "new",
  });

  const needReview = await findTaskWithAssignmentsForStats(assignedInclude, {
    todo: "need_review",
  });

  const overview = [
    { title: "Due Today", category: "due_date", value: dueToday, cardBorder: "!border-l-4 border-[#00939F]" },
    { title: "Overdue Task", category: "overdue", value: overdue, cardBorder: "!border-l-4 border-[#EC221F]" },
    { title: "Critical Deadlines", category: "critical", value: critical, cardBorder: "!border-l-4 border-[#E8B931]" },
    { title: "Due This Week", category: "due_this_week", value: dueThisWeek, cardBorder: "!border-l-4 border-[#00939F]" },
    { title: "New task assigned", category: "new_task_assigned", value: newTaskAssigned, cardBorder: "!border-l-4 border-[#E8B931]" },
    { title: "Total Task", category: "total_task", value: totalTask, cardBorder: "!border-l-4 border-[#00939F]" },
    { title: "Need Review", category: "need_review", value: needReview, cardBorder: "!border-l-4 border-[#00939F]" },
  ];

  return { overview };
}

// -----------------------------
// /api/task/list-assign
// -----------------------------
export async function listAssignedTasks(req, currentUser) {
  const { searchParams } = new URL(req.url);
  const scope = (searchParams.get("scope") || "me").toLowerCase();
  const statusesParam = searchParams.get("statuses");
  const projectId = normalizeOptionalId(searchParams.get("projectId"));
  const assigneesParam = searchParams.get("assignees");
  const q = (searchParams.get("q") || "").trim();
  const category = (searchParams.get("category") || "").toLowerCase();
  const orderBy = (searchParams.get("orderBy") || "end_date").toLowerCase();
  const orderDir = (searchParams.get("orderDir") || "ASC").toUpperCase();

  console.log("[task/list-assign] incoming", {
    current_user_id: currentUser?.user_id,
    scope,
    statusesParam,
    projectId,
    assigneesParam,
    q,
    category,
    orderBy,
    orderDir,
  });

  const whereTask = {};
  const andFilters = [];

  if (statusesParam) {
    const todoList = statusesParam
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    andFilters.push({
      [Op.or]: [
        { todo: { [Op.in]: todoList } },
        { todo: null },
        { todo: "" },
      ],
    });
  }

  if (projectId !== null) {
    andFilters.push({ project_id: projectId });
  }

  if (q) {
    andFilters.push({ title: { [Op.substring]: q } });
  }

  // List page menampilkan task item (child).
  andFilters.push({ parent_id: { [Op.ne]: null } });

  const now = dayjs();
  const todayStart = now.startOf("day").unix();
  const todayEnd = now.endOf("day").unix();
  const hPlus3End = now.add(3, "day").endOf("day").unix();
  const hPlus7End = now.add(7, "day").endOf("day").unix();

  switch (category) {
    case "due_date":
    case "due_today":
      andFilters.push({ end_date: { [Op.gte]: todayStart, [Op.lte]: todayEnd } });
      break;
    case "overdue":
      andFilters.push({ end_date: { [Op.lt]: todayStart } });
      andFilters.push({
        [Op.or]: [{ todo: { [Op.notIn]: ["completed"] } }, { todo: null }, { todo: "" }],
      });
      break;
    case "critical":
      andFilters.push({ end_date: { [Op.gte]: todayStart, [Op.lte]: hPlus3End } });
      break;
    case "this_week":
    case "due_this_week":
      andFilters.push({ end_date: { [Op.gte]: todayStart, [Op.lte]: hPlus7End } });
      break;
    case "completed":
      andFilters.push({ todo: "completed" });
      break;
    case "need_review_hod":
      andFilters.push({ todo: "need_review_hod" });
      break;
    case "need_review_ae":
      andFilters.push({ todo: "need_review_ae" });
      break;
    case "total_task":
    default:
      break;
  }

  if (andFilters.length) whereTask[Op.and] = andFilters;

  console.log("[task/list-assign] whereTask", JSON.stringify(whereTask));

  let assignedInclude = {
    model: db.TaskAssignment,
    as: "Assignments",
    attributes: ["user_id"],
    required: false,
  };
  let includeRequired = false;

  if (scope === "me") {
    const uid = Number(currentUser?.user_id);
    includeRequired = true;
    assignedInclude = {
      ...assignedInclude,
      where: Number.isFinite(uid) ? { user_id: uid } : { user_id: -1 },
      required: true,
    };
  } else if (scope === "teams") {
    includeRequired = true;
    assignedInclude = { ...assignedInclude, required: true };
  } else {
    includeRequired = false;
  }

  if (scope !== "me" && assigneesParam) {
    const ids = assigneesParam
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n));
    if (ids.length) {
      includeRequired = true;
      assignedInclude = {
        ...assignedInclude,
        where: { user_id: { [Op.in]: ids } },
        required: true,
      };
    }
  }

  if (includeRequired) assignedInclude.required = true;

  console.log("[task/list-assign] include", {
    includeRequired,
    assignedIncludeRequired: assignedInclude?.required,
    hasAssignedWhere: !!assignedInclude?.where,
  });

  const tasks = await findTasksForListAssign(
    whereTask,
    [assignedInclude, { model: db.Project, as: "Project", attributes: ["project_id", "title"] }],
    (() => {
      if (orderBy === "created") return [["created", orderDir]];
      if (orderBy === "updated") return [["updated", orderDir]];
      return [["end_date", orderDir], ["created", "ASC"]];
    })()
  );

  const normalized = tasks.map((t) => {
    const todo = (t.todo || "new").toLowerCase();
    const totalChildRaw =
      typeof t.count_task_child === "number"
        ? t.count_task_child
        : Number(t.count_task_child || 0);
    const completedChildRaw =
      typeof t.count_task_child_completed === "number"
        ? t.count_task_child_completed
        : Number(t.count_task_child_completed || 0);

    const totalChild = Number.isNaN(totalChildRaw) ? 0 : totalChildRaw;
    const completedChild = Number.isNaN(completedChildRaw) ? 0 : completedChildRaw;

    let progressFromChild = null;
    if (totalChild > 0) {
      const ratio = (completedChild / totalChild) * 100;
      const clamped = Math.max(0, Math.min(100, Math.round(ratio)));
      progressFromChild = clamped;
    }

    const progress =
      progressFromChild !== null
        ? progressFromChild
        : typeof t.progress === "number"
          ? t.progress
          : todo === "done" || todo === "completed"
            ? 100
            : 0;

    return {
      task_id: t.task_id,
      title: t.title,
      description: t.description,
      created_by: t.created_by ?? null,
      parent_id: t.parent_id ?? null,
      count_task_child: totalChild,
      count_task_child_completed: completedChild,
      todo,
      status: todo,
      progress,
      start_date: t.start_date ?? null,
      end_date: t.end_date ?? null,
      project_id: t.project_id ?? null,
      project_title: t.Project?.title || null,
      created: t.created ?? null,
      updated: t.updated ?? null,
      assignedIds: (t.Assignments || []).map((a) => Number(a.user_id)).filter((n) => Number.isFinite(n)),
      assignedName: "-",
      client_review: t.client_review ?? 0,
    };
  });

  const tasksOut =
    scope === "me"
      ? normalized.filter((t) => {
          const uid = Number(currentUser?.user_id);
          const mineByAssign =
            Array.isArray(t.assignedIds) && t.assignedIds.some((id) => Number(id) === uid);
          return mineByAssign;
        })
      : normalized;

  console.log("[task/list-assign] result", {
    raw_tasks_count: tasks.length,
    normalized_count: normalized.length,
    output_count: tasksOut.length,
    sample_first: tasksOut[0]
      ? {
          task_id: tasksOut[0].task_id,
          title: tasksOut[0].title,
          todo: tasksOut[0].todo,
          created_by: tasksOut[0].created_by,
          assignedIds: tasksOut[0].assignedIds,
        }
      : null,
  });

  return { tasks: tasksOut };
}

// -----------------------------
// /api/task/[taskId]
// -----------------------------
export async function getTaskDetail(taskId) {
  const brief = await findTaskBrief(taskId);
  if (!brief) return { status: 404, msg: "Task is Not Found." };

  const targetId = resolveTargetTaskId(brief, taskId);
  const detailTask = await findTaskWithDetailInclude(targetId);
  if (!detailTask) return { status: 404, msg: "Data Task not found" };

  const [projectData, quotationData, poData, attachmentData] = await Promise.all([
    findProjectsByWhere({ published: "published" }),
    findProjectQuotationsByProjectId(detailTask.project_id),
    findProjectPurchaseOrdersByPqId(detailTask.pq_id),
    findTaskAttachmentsByTaskId(detailTask.task_id),
  ]);

  return {
    status: 200,
    detailTask,
    project: projectData,
    quotation: quotationData,
    po: poData,
    taskAttachment: attachmentData,
  };
}

export async function updateTaskField(taskId, body, currentUser) {
  const detail = await findTaskById(taskId);
  if (!detail) return { status: 404, msg: "Task not found" };

  const detailAssignment = await findTaskAssignmentByTaskId(taskId);
  const updatePayload = { updated: nowUnix(), updated_by: currentUser.user_id };

  let daysDiff = 0;
  if (body.type === "todo") {
    updatePayload.todo = body.value;
    if (body.value === "completed") {
      const deadline = dayjs.unix(detail.end_date).tz(TZ);
      const now = dayjs.unix(nowUnix()).tz(TZ);
      daysDiff = deadline.startOf("day").diff(now.startOf("day"), "day");

      let bucket = "on_deadline";
      if (daysDiff > 0) bucket = "early";
      else if (daysDiff < 0) {
        bucket = "overdue";
        daysDiff = Math.abs(daysDiff);
        updatePayload.is_overdue = "true";
      }

      const selector = { type: "task_complete", bucket, days: bucket === "early" ? daysDiff : null };
      const note = `Task ${taskId} ${bucket}${daysDiff ? ` (${daysDiff} hari)` : ""}`;
      void selector;
      void note;
      void detailAssignment;
    }
  } else if (body.type === "department") {
    if (Array.isArray(body.value)) {
      const ids = [...new Set((body.value || []).map(Number).filter(Number.isInteger))];
      if (ids.length === 0) {
        updatePayload.department = [];
      } else {
        const rows = await findDepartmentsByIds(ids);
        const titleById = new Map(rows.map((r) => [Number(r.department_id), r.title]));
        updatePayload.department = ids.map((id) => ({
          department_id: id,
          title: titleById.get(id) || "",
        }));
      }
    } else {
      const depId = Number(body.value);
      if (!Number.isInteger(depId)) throw new Error("Invalid department_id");

      let current = Array.isArray(detail.department) ? [...detail.department] : [];
      const idx = current.findIndex((d) => Number(d.department_id) === depId);

      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        const dept = await findDepartmentById(depId);
        if (!dept) throw new Error("Department not found");
        current.push({ department_id: dept.department_id, title: dept.title });
      }
      updatePayload.department = current;
    }
  } else if (body.type === "end_date" || body.type === "start_date") {
    updatePayload[body.type] = body.value ? dayjs(body.value).unix() : null;
  } else {
    updatePayload[body.type] = body.value;
  }

  await updateTaskById(taskId, updatePayload);
  const updatedTask = await findTaskWithCreator(taskId);
  return { status: 200, msg: "Task updated successfully", task: updatedTask };
}

// -----------------------------
// /api/task/[taskId]/subtask
// -----------------------------
export async function getSubtaskTaskDetail(taskId) {
  const detail = await findTaskById(taskId);
  if (!detail) return { status: 404, msg: "Task not found" };
  const projectData = await findProjectsByWhere({ project_id: detail.project_id });
  return { status: 200, detailTask: detail, project: projectData };
}

export async function updateSubtaskTask(taskId, body) {
  const detail = await findTaskById(taskId);
  if (!detail) return { status: 404, msg: "Task not found" };

  if (body.type === "department") {
    const rawIds = body.value.flat();
    const departments = await findDepartmentsByIds(rawIds);
    const formattedDepartments = departments.map((dept) => ({
      department_id: dept.department_id,
      title: dept.title,
    }));

    await updateTaskById(taskId, {
      [body.type]: formattedDepartments,
      updated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      updated_by: 1,
    });

    return { msg: "Task updated successfully", department: formattedDepartments };
  }

  await updateTaskById(taskId, {
    [body.type]: body.value,
    updated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    updated_by: 1,
  });

  return { msg: "Task updated successfully" };
}

export async function createSubtaskForTask(taskId, body, currentUser) {
  if (!body.title) return { status: 400, msg: "Subtask title is required." };

  const detail = await findTaskById(taskId, { order: [["created", "DESC"]] });
  if (!detail) return { status: 404, msg: "Task not found" };

  const newSubTask = await createSubTask({
    title: body.title,
    task_id: taskId,
    created: nowUnix(),
    created_by: currentUser.user_id,
    updated: nowUnix(),
    updated_by: currentUser.user_id,
  });

  return { msg: "Subtask added successfully", subTask: newSubTask };
}

// -----------------------------
// /api/task/[taskId]/subtask/[tsId]
// -----------------------------
export async function updateSubtask(taskId, tsId, body, currentUser) {
  const title = (body?.title ?? "").trim();
  if (!taskId || !tsId) return { status: 400, msg: "Invalid params" };
  if (!title) return { status: 422, msg: "Title is required" };

  const task = await findTaskById(taskId);
  if (!task) return { status: 404, msg: "Task not found" };

  const sub = await findSubTaskById(tsId, taskId);
  if (!sub) return { status: 404, msg: "Subtask not found" };

  await updateSubTask(
    { ts_id: tsId, task_id: taskId },
    { title, updated: nowUnix(), updated_by: currentUser.user_id }
  );

  const updated = await findSubTaskById(tsId, taskId);
  return { status: 200, msg: "Subtask updated", subTask: updated };
}

export async function deleteSubtask(taskId, tsId, currentUser) {
  if (!taskId || !tsId) return { status: 400, msg: "Invalid params" };

  const sub = await findSubTaskById(tsId, taskId);
  if (!sub) return { status: 404, msg: "Subtask not found" };

  await updateSubTask(
    { ts_id: tsId, task_id: taskId },
    { deleted: true, deleted_at: nowUnix(), deleted_by: currentUser.user_id }
  );

  await updateTasksByWhere(
    { ts_id: tsId },
    { deleted: true, deleted_at: nowUnix(), deleted_by: currentUser.user_id }
  );

  return { status: 200, msg: "Subtask deleted", tsId: Number(tsId) };
}

// -----------------------------
// /api/task/[taskId]/subtaskitem
// -----------------------------
export async function getSubtaskItemDetail(taskId) {
  const detailTask = await findTaskDetailForSubtaskItem(taskId);
  if (!detailTask) return { status: 404, msg: "Data Task not found" };

  const attachmentData = await findTaskAttachmentsByTaskId(detailTask.task_id);
  return { status: 200, detailTask, taskAttachment: attachmentData };
}

export async function createSubtaskItem(taskId, body, currentUser) {
  const { ts_id, title } = body;
  const detail = await findTaskById(taskId);
  if (!detail) return { status: 400, msg: "Task is Not Found." };
  if (!title || title.trim() === "") return { status: 400, msg: "Subtask item title cannot be empty." };
  if (!ts_id) return { status: 400, msg: "Parent subtask ID (ts_id) is required." };

  const newSubtaskItem = await createTask({
    title: title.trim(),
    ts_id,
    parent_id: detail.task_id,
    project_id: detail.project_id,
    pq_id: detail.pq_id,
    po_id: detail.po_id,
    description: null,
    priority: "medium",
    todo: "new",
    client_review: null,
    is_overdue: "false",
    tags: null,
    is_revise: "false",
    count_revision: 0,
    start_date: null,
    end_date: null,
    allotted_time: null,
    department: null,
    created_by: currentUser.user_id,
    created: nowUnix(),
    updated_by: currentUser.user_id,
    updated: nowUnix(),
    deleted_by: null,
    deleted: null,
  });

  const totalChild = await countTasks({ parent_id: taskId });
  const totalCompleted = await countTasks({ parent_id: taskId, todo: "completed" });
  await updateTaskInstance(detail, {
    count_task_child_completed: totalCompleted,
    count_task_child: totalChild,
    progress: totalChild > 0 ? (totalCompleted / totalChild) * 100 : 0,
    updated: nowUnix(),
    updated_by: currentUser?.user_id,
  });

  await createTaskTodo({
    task_id: taskId,
    todo: "new",
    created: nowUnix(),
    created_by: currentUser?.user_id,
    updated: nowUnix(),
    updated_by: currentUser?.user_id,
  });

  return { status: 201, msg: "Subtask item added successfully!", taskSubtaskItem: newSubtaskItem.toJSON() };
}

// helper: recalc stats
async function recalcParentChildStats(parentTaskId) {
  const numericParentId = Number(parentTaskId);
  if (!Number.isFinite(numericParentId) || numericParentId <= 0) return;

  const activeDeletedClause = { [Op.or]: [{ deleted: null }, { deleted: 0 }, { deleted: "" }] };

  const baseWhere = { parent_id: numericParentId, ...activeDeletedClause };
  const totalChild = await countTasks(baseWhere);
  const totalCompleted = await countTasks({ ...baseWhere, todo: "completed" });

  let progress = 0;
  if (totalChild > 0) {
    progress = Math.round((totalCompleted / totalChild) * 100);
    if (progress < 0) progress = 0;
    if (progress > 100) progress = 100;
  }

  await updateTaskById(numericParentId, {
    count_task_child: totalChild,
    count_task_child_completed: totalCompleted,
    progress,
  });
}

export async function updateSubtaskItem(subtaskItemId, body, currentUser) {
  const subtaskItem = await findTaskByPk(subtaskItemId);
  if (!subtaskItem) return { status: 404, msg: "Subtask item not found" };

  const actorId = currentUser.user_id;
  const subtaskItemJson = typeof subtaskItem.toJSON === "function" ? subtaskItem.toJSON() : subtaskItem;
  const parentTaskId = resolveTargetTaskId(subtaskItemJson, subtaskItemJson?.parent_id);
  const parentTask = parentTaskId ? await findTaskById(parentTaskId) : null;
  const canManageTimelineAndAssign =
    isFlagTrue(currentUser?.is_hod) ||
    isFlagTrue(currentUser?.is_superadmin) ||
    Number(parentTask?.created_by) === Number(actorId) ||
    Number(subtaskItemJson?.created_by) === Number(actorId);
  const url = buildTaskWorkspaceUrl({ taskId: Number(subtaskItemId), returnTo: "/dashboard" });

  if (body.type === "assign_to") {
    if (!canManageTimelineAndAssign) {
      return { status: 403, msg: "You do not have permission to change subtask item assignees." };
    }

    const userIds = (Array.isArray(body.value) ? body.value : [body.value])
      .map(Number)
      .filter(Number.isInteger);

    await destroyTaskAssignmentsByTaskId(subtaskItemId);
    if (userIds.length) {
      const rows = userIds.map((uid) => ({
        task_id: subtaskItemId,
        user_id: uid,
        created: nowUnix(),
        created_by: actorId,
        updated: nowUnix(),
        updated_by: actorId,
      }));
      await bulkCreateTaskAssignments(rows);
    }

    await updateTaskInstance(subtaskItem, { updated: nowUnix(), updated_by: actorId });

    const projectId = subtaskItem.project_id;
    await destroyProjectTeamsByTaskIdAndNotInUsers(projectId, subtaskItemId, userIds);

    await Promise.all(
      userIds.map((uid) =>
        findOrCreateProjectTeam(
          { project_id: projectId, task_id: subtaskItemId, user_id: uid },
          { source: "task", created: nowUnix(), created_by: actorId, updated: nowUnix(), updated_by: actorId }
        )
      )
    );

    if (userIds.length) {
      await Promise.all(
        userIds.map((uid) =>
          notifyUser({
            userId: uid,
            sender: "system",
            description: `You were assigned to subtask: ${subtaskItem.title}`,
            url,
            payload: { type: "assign", taskId: subtaskItemId },
          })
        )
      );
    }
  } else if (body.type === "end_date") {
    if (!canManageTimelineAndAssign) {
      return { status: 403, msg: "You do not have permission to change subtask item timeline." };
    }

    await updateTaskInstance(subtaskItem, {
      end_date: dayjs(body.value).unix(),
      start_date: nowUnix(),
      updated: nowUnix(),
      updated_by: actorId,
    });

    const assignees = await findTaskAssignmentsByTaskId(subtaskItemId, { attributes: ["user_id"] });
    const uids = assignees.map((a) => a.user_id);
    if (uids.length) {
      await Promise.all(
        uids.map((uid) =>
          notifyUser({
            userId: uid,
            sender: "system",
            description: `Subtask due date updated: ${dayjs(body.value).format("DD MMM YYYY")}.`,
            url,
            payload: { type: "reschedule", taskId: subtaskItemId, newDue: dayjs(body.value).unix() },
          })
        )
      );
    }
  } else if (body.type === "todo") {
    await recalcParentChildStats(subtaskItem.parent_id);
  } else {
    await updateTaskInstance(subtaskItem, {
      [body.type]: body.value,
      updated: nowUnix(),
      updated_by: actorId,
    });
  }

  const updated = await findSubtaskItemWithAssignees(subtaskItemId);
  if (!updated) return { status: 404, msg: "not found" };

  const json = updated.toJSON();
  const formattedUsers =
    Array.isArray(json.AssignedUser) && json.AssignedUser.length
      ? json.AssignedUser.map((u) => ({
          user_id: u.user_id,
          fullname: u.fullname.trim(),
          profile_pic: u.profile_pic || null,
        }))
      : [];

  json.assign_to = formattedUsers;
  json.AssignedUser = formattedUsers;

  return { status: 200, msg: "Subtask item updated successfully", subTaskItem: json };
}

export async function listSubtaskItems() {
  const Tasks = await findAllTasks();
  return { Task: Tasks };
}

export async function deleteSubtaskItem(taskId, subtaskItemId, currentUser) {
  if (!taskId || !subtaskItemId) return { status: 400, msg: "taskId and subtaskItemId are required" };

  const actorId = currentUser?.user_id ?? currentUser;
  const t = await sequelize.transaction();

  try {
    const [affected] = await updateTaskById(
      subtaskItemId,
      { deleted: nowUnix(), deleted_by: actorId, updated: nowUnix(), updated_by: actorId },
      { transaction: t }
    );

    await destroyProjectTeamsByTaskId(subtaskItemId, { transaction: t });

    await t.commit();

    if (!affected) return { status: 404, msg: "Subtask item not found or already deleted" };

    await recalcParentChildStats(taskId);
    return { msg: "Subtask item soft-deleted", subtaskItemId };
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

// -----------------------------
// /api/task/[taskId]/comment
// -----------------------------
export async function addTaskComment(taskId, body, currentUser) {
  const { content, comment_for, mentioned_user_ids, mentioned_attachment_ids, filename, type } = body || {};

  if (!content || content.trim() === "") {
    return { status: 400, msg: "Comment content cannot be empty." };
  }

  const resolvedUserIds = normalizeIdArray(mentioned_user_ids);
  const uniqueMentionUserIds = Array.from(
    new Set(resolvedUserIds.map((v) => Number(v)).filter((n) => Number.isFinite(n)))
  );
  const resolvedFileIds = normalizeIdArray(mentioned_attachment_ids);

  const newComment = await createTaskComment({
    task_id: taskId,
    user_id: currentUser.user_id || null,
    comment: content.trim(),
    comment_for: comment_for || null,
    mentioned_user_ids: uniqueMentionUserIds.length ? uniqueMentionUserIds : null,
    mentioned_attachment_ids: resolvedFileIds.length ? resolvedFileIds : null,
    filename: filename || null,
    type: type || "comment",
    created: nowUnix(),
    created_by: currentUser.user_id,
    updated: nowUnix(),
    updated_by: currentUser.user_id,
  });

  try {
    if (uniqueMentionUserIds.length > 0) {
      const commentId = Number(newComment?.id ?? newComment?.comment_id);
      const url = buildTaskWorkspaceUrl({ taskId: Number(taskId), returnTo: "/dashboard" });
      const preview = String(content).slice(0, 180);
      const actorName = currentUser?.fullname || currentUser?.name || currentUser?.email || "Someone";
      const taskRow = await findTaskById(taskId).catch(() => null);
      const taskTitle = taskRow?.title || `Task #${taskId}`;

      await Promise.all(
        uniqueMentionUserIds.map((uid) =>
          notifyUser({
            userId: uid,
            sender: "task",
            title: "You were mentioned in a task comment",
            description: `${actorName} mentioned you on task: ${taskTitle}`,
            email: true,
            type: "task_comment",
            url,
            payload: { taskId: Number(taskId), commentId, preview },
            meta: { taskTitle, actorName, comment: preview },
          })
        )
      );
    }
  } catch (e) {
    console.warn("Mention notify failed (non-blocking):", e?.message || e);
  }

  return { status: 201, msg: "Comment added successfully!", comment: newComment.toJSON() };
}

export async function listTaskComments(taskId) {
  const comments = await findTaskCommentsByTaskId(taskId);
  const raw = comments.map((c) => c.toJSON());

  const allIds = new Set();
  const allFileIds = new Set();

  raw.forEach((c) => {
    let ids = c.mentioned_user_ids;
    if (typeof ids === "string") {
      try {
        ids = JSON.parse(ids || "[]");
      } catch {
        ids = [];
      }
    }
    if (!Array.isArray(ids)) ids = [];

    const numericIds = ids.map((x) => Number(x)).filter((n) => Number.isFinite(n));
    c.mention_user_ids = numericIds;
    numericIds.forEach((id) => allIds.add(id));

    let fileIds = c.mentioned_attachment_ids;
    if (typeof fileIds === "string") {
      try {
        fileIds = JSON.parse(fileIds || "[]");
      } catch {
        fileIds = [];
      }
    }
    if (!Array.isArray(fileIds)) fileIds = [];

    const numericFileIds = fileIds.map((x) => Number(x)).filter((n) => Number.isFinite(n));
    c.mention_attachment_ids = numericFileIds;
    numericFileIds.forEach((id) => allFileIds.add(id));
  });

  let userMap = new Map();
  if (allIds.size > 0) {
    const users = await findUsersByIds(Array.from(allIds));
    userMap = new Map(users.map((u) => [Number(u.user_id), u.toJSON()]));
  }

  let fileMap = new Map();
  if (allFileIds.size > 0) {
    const files = await findTaskAttachmentsByIds(Array.from(allFileIds));
    fileMap = new Map(files.map((f) => [Number(f.attachment_id), f.toJSON()]));
  }

  const payload = raw.map((c) => ({
    ...c,
    mentioned: (c.mention_user_ids || []).map((id) => userMap.get(id)).filter(Boolean),
    mentioned_attachments: (c.mention_attachment_ids || [])
      .map((id) => {
        const o = fileMap.get(id);
        if (!o) return null;
        return {
          attachment_id: o.attachment_id,
          real_filename: o.real_filename ?? null,
          filename: o.filename ?? null,
        };
      })
      .filter(Boolean),
  }));

  return { comments: payload };
}

// -----------------------------
// /api/task/[taskId]/revisions
// -----------------------------
export async function listTaskRevisions(taskId) {
  const rows = await findTaskRevisionsByTaskId(taskId);
  return { revisions: rows.map((r) => r.toJSON()) };
}

export async function createTaskRevisionRequest(taskId, body, currentUser) {
  const t = await sequelize.transaction();
  try {
    let dueDateUnix = null;
    if (body.due_date !== undefined && body.due_date !== null && body.due_date !== "") {
      const num = Number(body.due_date);
      if (Number.isFinite(num)) dueDateUnix = num;
    }

    const task = await findTaskByPk(taskId, { transaction: t });
    if (!task) {
      await t.rollback();
      return { status: 404, msg: "Task not found." };
    }

    const fromTodo = body.from_todo || task.todo || null;
    let targetTodo = body.target_todo || null;

    if (!targetTodo) {
      if (fromTodo === "need_review_ae") targetTodo = "revise_account";
      else if (fromTodo === "need_review_hod") targetTodo = "revise_hod";
    }

    const allowedTargets = ["revise_account", "revise_hod"];
    if (!targetTodo || !allowedTargets.includes(targetTodo)) {
      await t.rollback();
      return {
        status: 400,
        msg: `Invalid revision status. Only transitions from need_review_ae→revise_account or need_review_hod→revise_hod are allowed. ${targetTodo ? `(got: ${targetTodo})` : ""}`,
      };
    }

    const requestBy = body?.request_by === "client" || body?.request_by === "internal" ? body.request_by : "internal";
    const reason = body?.reason ?? "";

    const last = await findLastTaskRevision(taskId, { transaction: t });
    const nextVersion = Number(last?.version ?? 0) + 1;

    const created = await createTaskRevision(
      {
        task_id: Number(taskId),
        version: nextVersion,
        reason,
        request_by: requestBy,
        start_revision: nowUnix(),
        end_revision: dueDateUnix,
        submitted_at: nowUnix(),
        created: nowUnix(),
        created_by: currentUser?.user_id ?? null,
        updated: nowUnix(),
        updated_by: currentUser?.user_id ?? null,
      },
      { transaction: t }
    );

    const lastVersionLabel = `${requestBy} ${nextVersion}`;

    await updateTaskInstance(
      task,
      {
        todo: targetTodo,
        start_data: nowUnix(),
        end_date: dueDateUnix,
        count_revision: nextVersion,
        last_version: lastVersionLabel,
        updated: nowUnix(),
        updated_by: currentUser?.user_id ?? null,
      },
      { transaction: t }
    );

    await createTaskTodo(
      {
        task_id: taskId,
        todo: targetTodo,
        created: nowUnix(),
        created_by: currentUser?.user_id ?? null,
        updated: nowUnix(),
        updated_by: currentUser?.user_id ?? null,
      },
      { transaction: t }
    );

    await t.commit();

    try {
      const assignees = await findTaskAssignmentsByTaskId(taskId, { attributes: ["user_id"] });
      if (assignees.length) {
        const url = buildTaskWorkspaceUrl({ taskId: Number(taskId), returnTo: "/dashboard" });
        let description = "Revision requested for your task.";
        if (fromTodo === "need_review_ae" && targetTodo === "revise_account") {
          description = "Client requested a revision for your task.";
        } else if (fromTodo === "need_review_hod" && targetTodo === "revise_hod") {
          description = "HOD requested a revision for your task.";
        }

        const revisionId = created?.revision_id ?? created?.id ?? null;

        await Promise.all(
          assignees.map((a) =>
            notifyUser({
              userId: a.user_id,
              sender: "task",
              description,
              url,
              payload: { type: "taskRevisionRequested", taskId: Number(taskId), revisionId },
            })
          )
        );
      }
    } catch (e) {
      console.warn("Failed to send revision notification:", e?.message || e);
    }

    return { status: 201, msg: "Revision request created.", revision: created.toJSON(), todo: targetTodo };
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

// -----------------------------
// /api/task/[taskId]/upload-attachment
// -----------------------------
export async function uploadTaskAttachment(taskId, fileMeta, currentUser) {
  const taskData = await findTaskById(taskId);
  if (!taskData) return { status: 404, msg: "Task not found" };

  const existingAttachment = await findTaskAttachmentByRealFilename(taskId, fileMeta.originalFileName);
  if (existingAttachment) {
    return { status: 200, msg: "File already exists, no duplication.", taskAttachment: existingAttachment.toJSON() };
  }

  const newAttachment = await createTaskAttachment({
    filename: fileMeta.storedFilename,
    real_filename: fileMeta.originalFileName,
    task_id: taskId,
    created: nowUnix(),
    updated: nowUnix(),
    created_by: currentUser.user_id,
    updated_by: currentUser.user_id,
    task_payload: taskData,
    user_payload: currentUser,
  });

  return { status: 201, msg: "Upload successful!", taskAttachment: newAttachment.toJSON() };
}

export async function softDeleteTaskAttachment(taskId, attachmentId, currentUser) {
  const updatedRows = await updateTaskAttachmentByWhere(
    {
      updated: nowUnix(),
      updated_by: currentUser.user_id,
      deleted: nowUnix(),
      deleted_by: currentUser.user_id,
    },
    { attachment_id: attachmentId, task_id: taskId, deleted: null }
  );

  if (updatedRows[0] === 0) {
    return { status: 404, msg: "Attachment not found or already deleted." };
  }

  return { status: 200, msg: "Attachment successfully soft-deleted." };
}

// -----------------------------
// /api/task/[taskId]/department/[departmentId]
// -----------------------------
export async function deleteTaskDepartment(taskId, departmentId, currentUser) {
  const task = await findTaskById(taskId);
  if (!task) return { status: 404, msg: "Task not found" };

  const depId = Number(departmentId);
  if (!Number.isInteger(depId)) return { status: 400, msg: "Invalid department_id" };

  const current = Array.isArray(task.department) ? task.department : [];
  const next = current.filter((d) => Number(d?.department_id) !== depId);

  if (next.length === current.length) {
    return { status: 200, msg: "No changes", task };
  }

  await updateTaskById(taskId, {
    department: next,
    updated: nowUnix(),
    updated_by: currentUser.user_id,
  });

  const updatedTask = await findTaskById(taskId);
  return { status: 200, msg: "Department removed from task", task: updatedTask };
}

// -----------------------------
// /api/task/[taskId]/subtaskitem/[subtaskItemId]/upload-attachment
// -----------------------------
export async function uploadSubtaskItemAttachment(subtaskItemId, fileMeta, currentUser, rawRev) {
  const subtaskItemDetail = await findSubtaskItemWithAttachments(subtaskItemId);
  if (!subtaskItemDetail) return { status: 404, msg: "Subtask item not found." };

  const newAttachment = await createTaskAttachment({
    task_id: subtaskItemId,
    filename: fileMeta.storedFilename,
    real_filename: fileMeta.originalFileName,
    is_star: "true",
    task_payload: subtaskItemDetail,
    user_payload: currentUser,
    created: nowUnix(),
    created_by: currentUser.user_id,
    updated: nowUnix(),
    updated_by: currentUser.user_id,
    deleted: null,
    deleted_by: null,
  });

  const revisionId = normalizeOptionalId(rawRev);

  if (revisionId !== null) {
    await updateTaskAttachmentByWhere(
      { revision_id: newAttachment.attachment_id },
      {
        [Op.or]: [
          { attachment_id: revisionId },
          { revision_id: revisionId },
        ],
        attachment_id: { [Op.ne]: newAttachment.attachment_id },
      }
    );

    if (newAttachment.revision_id !== null) {
      await updateTaskAttachmentByWhere({ revision_id: null }, { attachment_id: newAttachment.attachment_id });
    }

    await updateTaskAttachmentByWhere(
      { is_star: "false" },
      {
        [Op.or]: [
          { attachment_id: newAttachment.attachment_id },
          { revision_id: newAttachment.attachment_id },
        ],
        attachment_id: { [Op.ne]: newAttachment.attachment_id },
      }
    );
  }

  const subtaskItemDetail2 = await findSubtaskItemWithAttachments(subtaskItemId);

  return {
    status: 201,
    msg: "File uploaded successfully to subtask item!",
    taskAttachment: newAttachment.toJSON(),
    taskSubtaskItem: subtaskItemDetail2,
  };
}

// -----------------------------
// /api/task/[taskId]/subtaskitem/[subtaskItemId]/upload-attachment/[attachmentId]/star
// -----------------------------
export async function promoteAttachmentStar(subtaskItemId, attachmentId) {
  let t;
  try {
    t = await sequelize.transaction();

    const selected = await findTaskAttachmentById(attachmentId, { transaction: t });
    if (!selected) {
      await t.rollback();
      return { status: 404, msg: "Attachment not found" };
    }

    const currentRoot = selected.revision_id
      ? await findTaskAttachmentById(selected.revision_id, { transaction: t })
      : selected;

    if (!currentRoot) {
      await t.rollback();
      return { status: 404, msg: "Root attachment not found" };
    }

    if (selected.attachment_id === currentRoot.attachment_id) {
      await updateTaskAttachmentByWhere(
        { is_star: "false" },
        {
          [Op.or]: [
            { attachment_id: currentRoot.attachment_id },
            { revision_id: currentRoot.attachment_id },
          ],
        },
        { transaction: t }
      );

      await updateTaskAttachmentInstance(currentRoot, { is_star: "true" }, { transaction: t });
      await t.commit();
      return { status: 200, msg: "" };
    }

    const oldRootId = currentRoot.attachment_id;
    const selectedId = selected.attachment_id;

    await updateTaskAttachmentByWhere(
      { is_star: "false" },
      {
        [Op.or]: [
          { attachment_id: oldRootId },
          { revision_id: oldRootId },
        ],
      },
      { transaction: t }
    );

    await updateTaskAttachmentByWhere({ revision_id: null }, { attachment_id: selectedId }, { transaction: t });
    await updateTaskAttachmentByWhere({ revision_id: selectedId }, { attachment_id: oldRootId }, { transaction: t });

    await updateTaskAttachmentByWhere(
      { revision_id: selectedId },
      { revision_id: oldRootId, attachment_id: { [Op.ne]: selectedId } },
      { transaction: t }
    );

    await updateTaskAttachmentByWhere({ is_star: "true" }, { attachment_id: selectedId }, { transaction: t });

    await t.commit();

    const subtaskItemDetail = await findSubtaskItemWithAttachments(subtaskItemId);
    return {
      status: 201,
      msg: "File uploaded successfully to subtask item!",
      taskSubtaskItem: subtaskItemDetail,
    };
  } catch (e) {
    if (t) {
      try {
        await t.rollback();
      } catch {
        // ignore
      }
    }
    throw e;
  }
}
