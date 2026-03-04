import dayjs from "dayjs";
import { nowUnix } from "@/utils/dateHelpers";
import {
  Op,
  findDepartmentsAll,
  findDepartmentsPaged,
  findDepartmentById,
  createDepartment,
  updateDepartmentInstance,
} from "@/server/queries/departmentQueries";

function toInt(v, def) {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : def;
}

function toStr(v) {
  return String(v ?? "").trim();
}

const SORT_WHITELIST = new Set(["department_id", "title", "description", "created", "updated"]);

export async function listDepartments() {
  const rows = await findDepartmentsAll();
  return { departments: rows };
}

export async function listDepartmentsPaged(req) {
  const url = new URL(req.url);
  const q = toStr(url.searchParams.get("q"));
  const page = Math.max(1, toInt(url.searchParams.get("page"), 1));
  const limit = Math.min(200, Math.max(1, toInt(url.searchParams.get("limit"), 10)));
  const offset = (page - 1) * limit;

  const sortFieldRaw = toStr(url.searchParams.get("sortField")) || "department_id";
  const sortField = SORT_WHITELIST.has(sortFieldRaw) ? sortFieldRaw : "department_id";

  const sortOrderRaw = toStr(url.searchParams.get("sortOrder")).toUpperCase();
  const sortOrder = sortOrderRaw === "ASC" ? "ASC" : "DESC";

  const where = { deleted: null };

  if (q) {
    where[Op.or] = [
      { title: { [Op.like]: `%${q}%` } },
      { description: { [Op.like]: `%${q}%` } },
    ];
  }

  const { rows, count } = await findDepartmentsPaged({
    where,
    limit,
    offset,
    order: [[sortField, sortOrder]],
  });

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.max(1, Math.ceil(count / limit)),
      sortField,
      sortOrder,
      q,
    },
  };
}

export async function getDepartmentById(departmentId) {
  const row = await findDepartmentById(departmentId);
  if (!row) return { status: 404, msg: "Not found" };
  return { department: row };
}

export async function createDepartmentFromBody(body) {
  const title = String(body?.title || "").trim();
  if (!title) return { status: 400, msg: "Title is required." };

  const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

  const newDepartment = await createDepartment({
    title,
    created: now,
    created_by: 1,
    updated: now,
    updated_by: 1,
  });

  return { msg: "Profil berhasil ditambahkan", Department: newDepartment };
}

export async function updateDepartment(departmentId, body, currentUser) {
  const row = await findDepartmentById(departmentId);
  if (!row) return { status: 404, msg: "Not found" };

  const title = String(body?.title || "").trim();
  const description = body?.description != null ? String(body.description).trim() : null;

  if (!title) return { status: 400, msg: "Title is required." };
  if (title.length > 100) return { status: 400, msg: "Title max 100 characters." };

  const userId = currentUser?.user_id || currentUser?.id || 1;
  const now = nowUnix();

  await updateDepartmentInstance(row, { title, description, updated: now, updated_by: userId });
  return { msg: "Department updated", department: row };
}

export async function deleteDepartment(departmentId, currentUser) {
  const row = await findDepartmentById(departmentId);
  if (!row) return { status: 404, msg: "Not found" };

  const userId = currentUser?.user_id || currentUser?.id || 1;
  const now = nowUnix();

  await updateDepartmentInstance(row, { deleted: now, deleted_by: userId });
  return { msg: "Department deleted" };
}

