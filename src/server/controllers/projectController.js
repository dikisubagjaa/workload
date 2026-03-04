import dayjs from "dayjs";
import db from "@/database/models";
import { nowUnix } from "@/utils/dateHelpers";
import {
  findPublishedProjectsWithClient,
  findProjectTypesByIds,
  findProjectTeamsByProjectIds,
  findProjectTeamsByProjectId,
  findChildTasksByProjectIds,
  findProjectByIdWithClient,
  findProjectById,
  updateProjectInstance,
  createDraftProject,
  findProjectTasksByProjectId,
  countTasks,
  countTasksWithInclude,
  findProjectChartData,
  findQuotationsByProjectId,
  createProjectQuotation,
  findQuotationById,
  updateQuotationInstance,
  updatePurchaseOrdersByQuotation,
  findPurchaseOrdersByQuotationId,
  createPurchaseOrder,
  findPurchaseOrderById,
  updatePurchaseOrderInstance,
} from "@/server/queries/projectQueries";

const { Sequelize } = db;
const { Op } = Sequelize;

// -----------------------------
// Helpers
// -----------------------------
export function parseProjectId(req, params) {
  const url = new URL(req.url);
  const qId = url.searchParams.get("projectId") ?? url.searchParams.get("id");
  const fromParams = params?.projectId ?? params?.project_id;
  const parsed = Number.parseInt(qId || fromParams, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function toArray(v) {
  if (Array.isArray(v)) return v;
  if (v == null) return [];
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return [];
    if ((s.startsWith("[") && s.endsWith("]")) || (s.startsWith("{") && s.endsWith("}"))) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed;
        if (parsed != null) return [parsed];
      } catch {
        // ignore
      }
    }
    return s.split(",").map((x) => x.trim()).filter(Boolean);
  }
  return [v];
}

export async function getProjectTypeTitles(project) {
  try {
    const raw = toArray(project?.project_type);
    const ids = raw.map((v) => (Number.isFinite(Number(v)) ? Number(v) : null)).filter((v) => v != null);
    if (!ids.length) return [];
    const rows = await findProjectTypesByIds(ids);
    return rows.map((r) => ({ pt_id: r.pt_id, title: r.title }));
  } catch {
    return [];
  }
}

export function buildMembersFromProjectTeams(pts) {
  const dedup = new Map();
  for (const pt of pts || []) {
    const u = pt?.User;
    if (!u) continue;
    if (!dedup.has(u.user_id)) {
      dedup.set(u.user_id, {
        user_id: u.user_id,
        fullname: u.fullname || "",
        profile_pic: u.profile_pic || null,
      });
    }
  }
  return Array.from(dedup.values());
}

// -----------------------------
// Project list
// -----------------------------
export async function listProjects() {
  const projects = await findPublishedProjectsWithClient();
  const rows = projects.map((p) => p.toJSON());
  const projectIds = rows.map((p) => p.project_id);

  const allPtIds = Array.from(
    new Set(
      rows
        .flatMap((p) => (Array.isArray(p.project_type) ? p.project_type : []))
        .map((v) => Number.parseInt(v, 10))
        .filter((n) => Number.isFinite(n))
    )
  );

  let ptMap = {};
  if (allPtIds.length) {
    const types = await findProjectTypesByIds(allPtIds);
    ptMap = Object.fromEntries(types.map((t) => [t.pt_id, { pt_id: t.pt_id, title: t.title }]));
  }

  let membersByProject = {};
  if (projectIds.length) {
    const pts = await findProjectTeamsByProjectIds(projectIds);
    for (const pt of pts) {
      const projId = pt.project_id;
      const u = pt.User;
      if (!u) continue;
      if (!membersByProject[projId]) membersByProject[projId] = [];
      const arr = membersByProject[projId];
      if (!arr.some((x) => x.user_id === u.user_id)) {
        arr.push({
          user_id: u.user_id,
          fullname: u.fullname || "",
          profile_pic: u.profile_pic || null,
        });
      }
    }
  }

  let progressByProject = {};
  if (projectIds.length) {
    const childTasks = await findChildTasksByProjectIds(projectIds);
    for (const t of childTasks) {
      const pid = t.project_id;
      if (!progressByProject[pid]) progressByProject[pid] = { total: 0, done: 0 };
      progressByProject[pid].total += 1;
      if (t.todo === "completed") progressByProject[pid].done += 1;
    }
  }

  const enriched = rows.map((p) => {
    const pid = p.project_id;
    const prog = progressByProject[pid] || { total: 0, done: 0 };
    const remaining = Math.max(0, prog.total - prog.done);
    return {
      ...p,
      members: membersByProject[pid] || [],
      ProjectType: Array.isArray(p.project_type)
        ? p.project_type.map((v) => ptMap[Number.parseInt(v, 10)]).filter(Boolean)
        : [],
      completed_task_count: prog.done,
      remaining_task_count: remaining,
    };
  });

  return { data: enriched };
}

export async function createProject(payload, currentUser) {
  if (!payload || typeof payload !== "object") {
    return { status: 400, msg: "Invalid payload" };
  }

  const title = String(payload.title || "").trim();
  const clientId = Number(payload.client_id);
  if (!title) return { status: 400, msg: "Project name is required" };
  if (!Number.isFinite(clientId) || clientId <= 0) return { status: 400, msg: "Client is required" };

  const ts = nowUnix();
  const row = await createDraftProject({
    ...payload,
    title,
    client_id: clientId,
    type: payload?.type || "project",
    published: payload?.published || "published",
    created: ts,
    updated: ts,
    created_by: currentUser.user_id,
    updated_by: currentUser.user_id,
  });

  const fresh = await findProjectByIdWithClient(row.project_id);
  const typeTitles = await getProjectTypeTitles(fresh);
  const members = [];
  return { status: 201, msg: "Project created", data: { ...fresh.get(), project_type_titles: typeTitles, members } };
}

// -----------------------------
// Project detail
// -----------------------------
export async function getProjectDetail(projectId) {
  const project = await findProjectByIdWithClient(projectId);
  if (!project) return null;

  const typeTitles = await getProjectTypeTitles(project);
  const pts = await findProjectTeamsByProjectId(projectId).catch(() => []);
  const members = buildMembersFromProjectTeams(pts);

  return { ...project.get(), project_type_titles: typeTitles, members };
}

export async function updateProject(projectId, payload, currentUser) {
  const project = await findProjectById(projectId);
  if (!project) return { status: 404, msg: "Project not found" };

  if (!payload || typeof payload !== "object") {
    return { status: 400, msg: "Invalid payload" };
  }

  const ts = nowUnix();
  const current = project.get();
  const updates = {};
  for (const [k, v] of Object.entries(payload)) {
    if (Object.prototype.hasOwnProperty.call(current, k)) updates[k] = v;
  }
  if ("updated" in current) updates.updated = ts;
  if ("updated_by" in current) updates.updated_by = currentUser?.user_id ?? null;

  await updateProjectInstance(project, updates);

  const fresh = await findProjectByIdWithClient(projectId);
  const typeTitles = await getProjectTypeTitles(fresh);
  const pts = await findProjectTeamsByProjectId(projectId).catch(() => []);
  const members = buildMembersFromProjectTeams(pts);

  return { status: 200, msg: "Project updated", data: { ...fresh.get(), project_type_titles: typeTitles, members } };
}

export async function softDeleteProject(projectId, currentUser) {
  const project = await findProjectById(projectId);
  if (!project) return { status: 404, msg: "Project not found" };

  const attrs = project.get();
  const payload = {};
  const ts = dayjs().format("YYYY-MM-DD HH:mm:ss");

  if ("deleted" in attrs) payload.deleted = ts;
  if ("deleted_by" in attrs) payload.deleted_by = currentUser?.user_id ?? null;
  if ("updated" in attrs) payload.updated = ts;
  if ("updated_by" in attrs) payload.updated_by = currentUser?.user_id ?? null;
  if ("status" in attrs) payload.status = "archived";

  await updateProjectInstance(project, payload);
  return { status: 200, msg: "Project soft-deleted", project_id: projectId };
}

// -----------------------------
// Project tasks
// -----------------------------
export async function listProjectTasks(projectId) {
  const activeDeletedClause = {
    [Op.or]: [{ deleted: null }, { deleted: 0 }, { deleted: "" }],
  };

  const tasks = await findProjectTasksByProjectId(projectId, activeDeletedClause);

  const toNumber = (val, fallback = 0) => {
    if (typeof val === "number") return val;
    const n = Number(val);
    return Number.isNaN(n) ? fallback : n;
  };

  const normalized = tasks.map((task) => {
    const todo = String(task.todo || "").toLowerCase();
    const totalChild = toNumber(task.count_task_child);
    const completedChild = toNumber(task.count_task_child_completed);

    let progress = 0;
    if (totalChild > 0) {
      const ratio = (completedChild / totalChild) * 100;
      progress = Math.max(0, Math.min(100, Math.round(ratio)));
    } else {
      const p = toNumber(task.progress, 0);
      progress = Math.max(0, Math.min(100, Math.round(p)));
    }

    return {
      taskId: task.task_id,
      title: task.title,
      description: task.description,
      todo,
      priority: task.priority,
      endDate: task.end_date,
      totalSubtask: totalChild,
      completedSubtask: completedChild,
      progress,
      members: (task.AssignedUser || []).map((u) => ({
        user_id: u.user_id,
        fullname: u.fullname,
        profile_pic: u.profile_pic,
      })),
    };
  });

  return { task: normalized };
}

// -----------------------------
// Project stats
// -----------------------------
export async function getProjectStats(currentUser) {
  const today = dayjs().format("YYYY-MM-DD");
  const nextWeek = dayjs().add(7, "day").format("YYYY-MM-DD");
  const userId = currentUser.user_id;

  const dueTodayCount = await countTasks({ end_date: today });
  const overdueCount = await countTasks({ is_overdue: "true", end_date: { [Op.lt]: today } });
  const dueThisWeekCount = await countTasks({ end_date: { [Op.between]: [today, nextWeek] } });
  const totalTaskCount = await countTasks({});
  const criticalDeadlinesCount = await countTasks({ priority: "high" });
  const needsReviewCount = await countTasks({ client_review: "review" });
  const newTaskAssignedCount = await countTasksWithInclude([
    {
      model: db.User,
      as: "AssignedUser",
      where: { user_id: userId },
    },
  ]);

  const projectChartData = await findProjectChartData(5);

  const stats = {
    dueToday: dueTodayCount,
    overdue: overdueCount,
    dueThisWeek: dueThisWeekCount,
    totalTask: totalTaskCount,
    criticalDeadlines: criticalDeadlinesCount,
    needsReview: needsReviewCount,
    newTaskAssigned: newTaskAssignedCount,
  };

  return { stats, chartData: projectChartData };
}

// -----------------------------
// Quotation
// -----------------------------
export async function listProjectQuotations(projectId) {
  const quotations = await findQuotationsByProjectId(projectId);
  return { data: quotations };
}

export async function createProjectQuotationWithFile(projectId, body, currentUser) {
  const { storedFilename, quotationNumber } = body || {};
  const ts = nowUnix();

  const newQuotation = await createProjectQuotation({
    project_id: projectId,
    quotation_number: quotationNumber,
    quotation_doc: storedFilename,
    created: ts,
    created_by: currentUser.user_id,
    updated: ts,
    updated_by: currentUser.user_id,
  });

  return { status: 201, msg: "Quotation uploaded successfully!", data: newQuotation };
}

export async function deleteProjectQuotation(projectId, qtId, currentUser) {
  const quotation = await findQuotationById(qtId, { unscoped: true });

  if (!quotation || quotation.deleted) {
    return { status: 404, msg: "Quotation not found." };
  }

  if (String(quotation.project_id) !== String(projectId)) {
    return { status: 404, msg: "Quotation not found." };
  }

  const ts = nowUnix();

  await updatePurchaseOrdersByQuotation(qtId, {
    deleted: ts,
    deleted_by: currentUser.user_id,
    updated: ts,
    updated_by: currentUser.user_id,
  });

  await updateQuotationInstance(quotation, {
    deleted: ts,
    deleted_by: currentUser.user_id,
    updated: ts,
    updated_by: currentUser.user_id,
  });

  return { status: 200, msg: "Quotation deleted." };
}

export async function uploadPoToQuotation(qtId, poData, currentUser) {
  const quotation = await findQuotationById(qtId);
  if (!quotation) return { status: 404, msg: "Quotation not found." };

  const payload = {
    po: poData,
    updated: dayjs().unix(),
    updated_by: currentUser.user_id,
  };

  await updateQuotationInstance(quotation, payload);
  return { status: 200, msg: "PO document uploaded and linked successfully!", data: quotation };
}

// -----------------------------
// Purchase Orders
// -----------------------------
export async function listPurchaseOrdersByQuotation(qtId) {
  const poDocs = await findPurchaseOrdersByQuotationId(qtId);
  return { poDoc: poDocs };
}

export async function createPurchaseOrderForQuotation(qtId, poPayload, currentUser) {
  const ts = nowUnix();
  const newPO = await createPurchaseOrder({
    pq_id: qtId,
    po_number: poPayload.po_number,
    po_doc: poPayload.po_doc,
    created: ts,
    created_by: currentUser.user_id,
    updated: ts,
    updated_by: currentUser.user_id,
  });

  return { status: 201, msg: "PO document uploaded and linked successfully!", data: newPO };
}

export async function deletePurchaseOrder(projectId, qtId, poId, currentUser) {
  const po = await findPurchaseOrderById(poId, { unscoped: true });
  if (!po || po.deleted) return { status: 404, msg: "PO not found." };

  if (String(po.pq_id) !== String(qtId)) return { status: 404, msg: "PO not found." };

  const quotation = await findQuotationById(qtId, { unscoped: true });
  if (!quotation || quotation.deleted || String(quotation.project_id) !== String(projectId)) {
    return { status: 404, msg: "PO not found." };
  }

  const ts = nowUnix();

  await updatePurchaseOrderInstance(po, {
    deleted: ts,
    deleted_by: currentUser.user_id,
    updated: ts,
    updated_by: currentUser.user_id,
  });

  return { status: 200, msg: "PO deleted." };
}
