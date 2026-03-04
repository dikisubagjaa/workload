import dayjs from "dayjs";
import { Op } from "sequelize";
import db from "@/database/models";

const { Task, Project, TaskAssignment, ProjectType, Client, User, Timesheet, TaskTodo, Role } = db;

function parseProjectType(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return raw
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !Number.isNaN(n));
    }
  }
  return [];
}

function isTruthy(v) {
  return v === true || v === "true" || v === 1 || v === "1";
}

export async function getDashboardData(req, currentUser) {
  const url = new URL(req.url);
  const staffIdParam = url.searchParams.get("staffId");

  const isSuperadmin = isTruthy(currentUser?.is_superadmin);

  let effectiveUserId = currentUser.user_id;
  let effectiveDepartmentId = currentUser.department_id;

  if (isSuperadmin && staffIdParam) {
    const parsed = parseInt(staffIdParam, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      const targetUser = await User.findOne({
        where: { user_id: parsed },
        attributes: ["user_id", "department_id"],
      });

      if (!targetUser) {
        return { httpStatus: 404, msg: "Staff tidak ditemukan" };
      }

      effectiveUserId = targetUser.user_id;
      effectiveDepartmentId = targetUser.department_id;
    }
  }

  const nowStart = dayjs().startOf("day").unix();
  const todayEnd = dayjs().endOf("day").unix();
  const hPlus3 = dayjs().add(3, "day").endOf("day").unix();
  const hPlus7 = dayjs().add(7, "day").endOf("day").unix();

  const assignedInclude = [
    { model: TaskAssignment, as: "Assignments", where: { user_id: effectiveUserId }, required: true },
    { model: Project, as: "Project" },
  ];

  const dueToday = await Task.count({
    distinct: true,
    include: assignedInclude,
    where: { end_date: { [Op.gte]: nowStart, [Op.lte]: todayEnd } },
    subQuery: false,
  });

  const overdue = await Task.count({
    distinct: true,
    include: assignedInclude,
    where: { end_date: { [Op.lt]: nowStart } },
    subQuery: false,
  });

  const critical = await Task.count({
    distinct: true,
    include: assignedInclude,
    where: { end_date: { [Op.gte]: nowStart, [Op.lte]: hPlus3 } },
    subQuery: false,
  });

  const dueThisWeek = await Task.count({
    distinct: true,
    include: assignedInclude,
    where: { end_date: { [Op.gte]: nowStart, [Op.lte]: hPlus7 } },
    subQuery: false,
  });

  const totalTask = await Task.count({ distinct: true, include: assignedInclude, subQuery: false });

  const needReview = await Task.count({
    distinct: true,
    include: assignedInclude,
    where: { todo: "need_review" },
    subQuery: false,
  });

  const overview = [
    { title: "Due Today", value: dueToday, cardBorder: "!border-l-4 border-[#00939F]" },
    { title: "Overdue Task", value: overdue, cardBorder: "!border-l-4 border-[#EC221F]" },
    { title: "Critical Deadlines", value: critical, cardBorder: "!border-l-4 border-[#E8B931]" },
    { title: "Due This Week", value: dueThisWeek, cardBorder: "!border-l-4 border-[#00939F]" },
    { title: "New task assigned", value: 0, cardBorder: "!border-l-4 border-[#E8B931]" },
    { title: "Need Review", value: needReview, cardBorder: "!border-l-4 border-[#00939F]" },
    { title: "Total Task", value: totalTask, cardBorder: "!border-l-4 border-[#00939F]" },
  ];

  const task = await Task.findAll({
    where: { todo: { [Op.in]: ["new", "done", "in_progress", "revise_hod", "revise_account"] } },
    limit: 5,
    include: assignedInclude,
    order: [["end_date", "ASC"]],
    subQuery: false,
  });

  const taskHod = await Task.findAll({
    where: { todo: { [Op.in]: ["done", "need_review_hod", "revision"] } },
    include: [
      {
        model: User,
        as: "AssignedUser",
        required: true,
        where: { department_id: { [Op.ne]: null, [Op.eq]: effectiveDepartmentId } },
      },
      { model: Project, as: "Project" },
    ],
    limit: 5,
    order: [["end_date", "ASC"]],
  });

  const taskDataReview = await Task.findAll({
    where: { todo: { [Op.in]: ["need_review_ae"] }, created_by: effectiveUserId },
    include: [{ model: Project, as: "Project" }],
    order: [["end_date", "ASC"]],
    limit: 5,
    subQuery: false,
  });

  const projects = await Project.findAll({
    where: { created_by: effectiveUserId, published: "published" },
  });

  const allPtIds = [...new Set(projects.flatMap((p) => parseProjectType(p.project_type)))];
  const allClientIds = [...new Set(projects.map((p) => p.client_id).filter(Boolean))];

  const [ptRows, clientRows] = await Promise.all([
    allPtIds.length
      ? ProjectType.findAll({ where: { pt_id: allPtIds }, attributes: ["pt_id", "title"] })
      : [],
    allClientIds.length
      ? Client.findAll({ where: { client_id: allClientIds }, attributes: ["client_id", "client_name", "brand"] })
      : [],
  ]);

  const ptMap = new Map(ptRows.map((r) => [Number(r.pt_id), r.title]));
  const clientMap = new Map(clientRows.map((c) => [Number(c.client_id), c.toJSON?.() || c]));

  const project = projects.map((p) => {
    const ptIds = parseProjectType(p.project_type);
    const projectType = ptIds
      .map((id) => ptMap.get(Number(id)) ?? String(id))
      .filter(Boolean);

    const client = clientMap.get(Number(p.client_id)) || {};
    const fallbackBrand = String(client?.brand || "").trim() || null;
    const brand = fallbackBrand;
    const dueDate = p.due_date ? dayjs(p.due_date).format("DD MMM YYYY") : null;

    return { ...p.toJSON(), projectType, brand, dueDate };
  });

  return { overview, task, taskHod, project, taskDataReview };
}

const TODO_SET = [
  "new", "in_progress", "revision",
  "need_review_hod", "revise_hod",
  "need_review_ae", "revise_account", "approved_ae",
  "completed",
  "pending", "cancel", "todo", "review", "done",
];

export async function getDashboardTaskList(req, currentUser) {
  const { searchParams } = new URL(req.url);
  const userId = currentUser.user_id;

  const q = (searchParams.get("q") || "").trim();
  const projectId = Number(searchParams.get("projectId"));
  const category = (searchParams.get("category") || "").toLowerCase();
  const orderBy = (searchParams.get("orderBy") || "end_date").toLowerCase();
  const orderDir = (searchParams.get("orderDir") || "ASC").toUpperCase();

  const whereTask = {};
  const andFilters = [];

  andFilters.push({ todo: { [Op.in]: TODO_SET } });

  if (q) {
    andFilters.push({ title: { [Op.substring]: q } });
  }

  if (Number.isFinite(projectId)) {
    andFilters.push({ project_id: projectId });
  }

  const now = dayjs();
  const todayStart = now.startOf("day").unix();
  const todayEnd = now.endOf("day").unix();
  const thisWeekEnd = now.endOf("week").unix();

  switch (category) {
    case "due_today":
      andFilters.push({ due_date: { [Op.gte]: todayStart, [Op.lte]: todayEnd } });
      break;
    case "overdue":
      andFilters.push({ due_date: { [Op.lt]: todayStart } });
      break;
    case "this_week":
      andFilters.push({ due_date: { [Op.gte]: todayStart, [Op.lte]: thisWeekEnd } });
      break;
    case "need_review_hod":
      andFilters.push({ todo: "need_review_hod" });
      break;
    case "need_review_ae":
      andFilters.push({ todo: "need_review_ae" });
      break;
    case "completed":
      andFilters.push({ todo: "completed" });
      break;
    default:
      break;
  }

  if (andFilters.length) {
    whereTask[Op.and] = andFilters;
  }

  const assignedInclude = [
    {
      model: User,
      as: "AssignedUser",
      attributes: ["user_id", "fullname", "email"],
      through: { attributes: [] },
      where: { user_id: userId },
      required: true,
    },
    {
      model: Project,
      as: "Project",
      attributes: ["project_id", "title"],
      required: false,
    },
  ];

  const taskData = await Task.findAll({
    where: whereTask,
    include: assignedInclude,
    order: (() => {
      if (orderBy === "created") return [["created", orderDir]];
      if (orderBy === "updated") return [["updated", orderDir]];
      return [["end_date", orderDir], ["created", "ASC"]];
    })(),
    subQuery: false,
  });

  return { task: taskData };
}

const sum = (arr) => arr.reduce((a, b) => a + (Number(b) || 0), 0);
const toHM = (minutes) => {
  const m = Math.max(0, Number(minutes) || 0);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return { h, m: mm, label: `${h}h ${mm}m` };
};

function getRoleFlag(u, key) {
  if (u?.[key] !== undefined && u?.[key] !== null) return u[key];
  return u?.RoleDetail?.[key];
}

function isHodUser(u) {
  return isTruthy(getRoleFlag(u, "is_hod")) || String(u?.user_role || "").toLowerCase() === "hod";
}

export async function getTeamPerformance(req, currentUser) {
  const url = new URL(req.url);
  const staffIdParam = url.searchParams.get("staffId");

  const isSuperadmin = isTruthy(currentUser?.is_superadmin);

  let deptId = currentUser?.department_id ?? null;
  let hodUserIdToExclude = null;

  if (isSuperadmin && staffIdParam) {
    const parsed = parseInt(staffIdParam, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      const picked = await User.findOne({
        where: { user_id: parsed },
        attributes: ["user_id", "department_id", "user_role"],
        include: [
          {
            model: Role,
            as: "RoleDetail",
            attributes: ["is_hod"],
            required: false,
          },
        ],
      });

      if (!picked) {
        return { department_id: null, team: [] };
      }

      deptId = picked.department_id ?? null;

      if (!isHodUser(picked) || !deptId) {
        return { department_id: deptId, team: [] };
      }

      hodUserIdToExclude = picked.user_id;
    }
  } else {
    if (isHodUser(currentUser)) {
      hodUserIdToExclude = currentUser?.user_id ?? null;
    }
  }

  if (!deptId) {
    return { department_id: null, team: [] };
  }

  let members = await User.findAll({
    where: { department_id: deptId },
    attributes: ["user_id", "fullname", "email", "user_role", "profile_pic", "department_id"],
    include: [
      {
        model: Role,
        as: "RoleDetail",
        attributes: ["is_hod"],
        required: false,
      },
    ],
    order: [["fullname", "ASC"]],
  });

  if (hodUserIdToExclude) {
    members = members.filter((m) => Number(m?.user_id) !== Number(hodUserIdToExclude));
  }

  const team = await Promise.all(
    members.map(async (u) => {
      const tsMinutes = await Timesheet.sum("duration_minutes", {
        where: { user_id: u.user_id },
      }).then((v) => Number(v) || 0);

      const assignments = await TaskAssignment.findAll({
        where: { user_id: u.user_id },
        attributes: ["task_id"],
        raw: true,
      });

      const taskIds = [...new Set(assignments.map((a) => a.task_id))];

      let in_progress = 0, done = 0, pending = 0;

      if (taskIds.length) {
        const todos = await TaskTodo.findAll({
          where: { task_id: taskIds },
          attributes: ["task_id", "todo"],
          raw: true,
        });

        for (const t of todos) {
          if (t.todo === "in_progress") in_progress += 1;
          else if (t.todo === "done" || t.todo === "completed") done += 1;
          else pending += 1;
        }
      }

      const total_tasks = in_progress + done + pending;

      return {
        user_id: u.user_id,
        name: `${u.fullname || ""}`.trim() || "—",
        title: u.user_role || "",
        profile_pic: u.profile_pic || null,
        timesheet_minutes: tsMinutes,
        timesheet_label: toHM(tsMinutes).label,
        tasks: { in_progress, done, pending, total: total_tasks },
      };
    })
  );

  return { department_id: deptId, team };
}

export async function getDashboardProjectList() {
  return { project: [] };
}
