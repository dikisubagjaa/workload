import db from "@/database/models";
import { nowUnix } from "@/utils/dateHelpers";
import {
  findRoles,
  findRoleByParam,
  findRoleBySlug,
  createRole,
  updateRole,
  getRoleModel,
  getOp,
} from "@/server/queries/roleQueries";

const Role = getRoleModel();
const { Menu, User } = db;
const Op = getOp();

function parseIntSafe(v, def) {
  const n = parseInt(String(v ?? "").trim(), 10);
  return Number.isFinite(n) && n >= 0 ? n : def;
}

function normSlug(s) {
  if (!s) return "";
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeMenuAccess(val) {
  if (val == null) return undefined;
  if (Array.isArray(val)) {
    const normalized = val
      .map((x) => {
        if (typeof x === "number" && Number.isFinite(x)) return x;
        if (typeof x === "string") {
          const s = x.trim();
          if (!s) return null;
          if (/^\d+$/.test(s)) return Number(s);
          return s;
        }
        if (x && typeof x === "object") {
          if (x.menu_id != null && Number.isFinite(Number(x.menu_id))) {
            return Number(x.menu_id);
          }
          if (typeof x.path === "string" && x.path.trim()) {
            return x.path.trim();
          }
        }
        return null;
      })
      .filter((x) => x !== null && x !== undefined && x !== "");

    return normalized.filter((v, i) => normalized.findIndex((x) => x === v) === i);
  }
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) return sanitizeMenuAccess(parsed);
  } catch {}
  return [];
}

function toBoolEnum(val) {
  if (val === true || val === "true" || val === 1 || val === "1") return "true";
  if (val === false || val === "false" || val === 0 || val === "0") return "false";
  return undefined;
}

function toBool(val, def = undefined) {
  if (val === true || val === "true" || val === 1 || val === "1") return true;
  if (val === false || val === "false" || val === 0 || val === "0") return false;
  return def;
}

export async function listRoles(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const limit = parseIntSafe(searchParams.get("limit"), 20);
  const offset = parseIntSafe(searchParams.get("offset"), 0);

  const allowedOrderBy = new Set(["created", "updated", "title", "slug"]);
  const orderBy = allowedOrderBy.has(searchParams.get("orderBy"))
    ? searchParams.get("orderBy")
    : "created";
  const orderDir =
    String(searchParams.get("orderDir") || "DESC").toUpperCase() === "ASC"
      ? "ASC"
      : "DESC";

  const where = {};
  if (q) {
    where[Op.or] = [
      { title: { [Op.like]: `%${q}%` } },
      { slug: { [Op.like]: `%${q}%` } },
      { description: { [Op.like]: `%${q}%` } },
    ];
  }

  const { rows, count } = await findRoles({
    where,
    limit,
    offset,
    order: [[orderBy, orderDir]],
  });

  const menus = await Menu.findAll({
    attributes: ["menu_id", "title", "path"],
    raw: true,
  });
  const idMap = Object.fromEntries(menus.map((m) => [String(m.menu_id), m.title]));
  const pathMap = Object.fromEntries(menus.map((m) => [String(m.path || ""), m.title]));

  const rolesOut = rows.map((r) => {
    const obj = r?.toJSON ? r.toJSON() : r;
    const access = Array.isArray(obj.menu_access) ? obj.menu_access : [];
    const titles = access
      .map((entry) => {
        if (entry == null) return "";
        if (typeof entry === "object") {
          return (
            entry.title ||
            entry.label ||
            idMap[String(entry.menu_id)] ||
            pathMap[String(entry.path || "")] ||
            String(entry.menu_id || entry.path || "")
          );
        }
        return idMap[String(entry)] || pathMap[String(entry)] || "";
      })
      .filter(Boolean);
    return { ...obj, menu_access_titles: titles };
  });

  return { data: { rows: rolesOut, count, limit, offset }, roles: rolesOut, total: count };
}

export async function createRoleFromRequest(req) {
  let t = null;
  try {
    const body = await req.json().catch(() => ({}));
    const title = String(body?.title ?? "").trim();
    const slugRaw = body?.slug ?? "";
    const slug = normSlug(slugRaw);
    const description = body?.description != null ? String(body.description) : null;
    const menu_access = sanitizeMenuAccess(body?.menu_access);
    const is_superadmin = toBoolEnum(body?.is_superadmin);
    const is_hod = toBoolEnum(body?.is_hod);
    const is_operational_director = toBoolEnum(body?.is_operational_director);
    const is_hrd = toBoolEnum(body?.is_hrd);
    const is_ae = toBoolEnum(body?.is_ae);

    if (!title) return { status: 400, msg: "title is required" };
    if (!slug) return { status: 400, msg: "slug is required" };

    const exists = await findRoleBySlug(slug);
    if (exists) return { status: 409, msg: "slug already exists" };

    t = await db.sequelize.transaction();
    const now = nowUnix();
    const payload = {
      title,
      slug,
      description,
      menu_access,
      ...(is_superadmin !== undefined ? { is_superadmin } : {}),
      ...(is_hod !== undefined ? { is_hod } : {}),
      ...(is_operational_director !== undefined ? { is_operational_director } : {}),
      ...(is_hrd !== undefined ? { is_hrd } : {}),
      ...(is_ae !== undefined ? { is_ae } : {}),
      created: now,
      updated: now,
    };

    const role = await createRole(payload, t);
    await t.commit();
    return { status: 201, role };
  } catch (error) {
    if (t) { try { await t.rollback(); } catch {} }
    return { status: 500, msg: error?.message || "Failed to create role" };
  }
}

export async function getRoleDetail(params) {
  const roleId = params?.roleId;
  if (!roleId) return { status: 400, msg: "roleId is required" };

  const role = await findRoleByParam(roleId);
  if (!role) return { status: 404, msg: "Role not found" };

  return { status: 200, role };
}

export async function updateRoleFromRequest(req, params, currentUser) {
  let t = null;
  try {
    const roleId = params?.roleId;
    if (!roleId) return { status: 400, msg: "roleId is required" };

    const body = await req.json().catch(() => ({}));

    const titleRaw = body?.title ?? body?.name;
    const title = titleRaw != null ? String(titleRaw).trim() : undefined;

    const slugRaw = body?.slug;
    const slug = slugRaw != null ? normSlug(slugRaw) : undefined;

    const description =
      body?.description === null
        ? null
        : body?.description !== undefined
        ? String(body.description)
        : undefined;

    const menu_access = sanitizeMenuAccess(body?.menu_access);
    const syncToMembers = toBool(body?.sync_to_members ?? body?.apply_to_members, true);
    const is_superadmin = toBoolEnum(body?.is_superadmin);
    const is_hod = toBoolEnum(body?.is_hod);
    const is_operational_director = toBoolEnum(body?.is_operational_director);
    const is_hrd = toBoolEnum(body?.is_hrd);
    const is_ae = toBoolEnum(body?.is_ae);

    const fields = {};
    if (title !== undefined) fields.title = title;
    if (slug !== undefined) fields.slug = slug;
    if (description !== undefined) fields.description = description;
    if (menu_access !== undefined) fields.menu_access = menu_access;
    if (is_superadmin !== undefined) fields.is_superadmin = is_superadmin;
    if (is_hod !== undefined) fields.is_hod = is_hod;
    if (is_operational_director !== undefined) fields.is_operational_director = is_operational_director;
    if (is_hrd !== undefined) fields.is_hrd = is_hrd;
    if (is_ae !== undefined) fields.is_ae = is_ae;

    if (Object.keys(fields).length === 0) {
      return { status: 400, msg: "No fields to update" };
    }

    const target = await findRoleByParam(roleId);
    if (!target) return { status: 404, msg: "Role not found" };
    const oldSlug = String(target.slug || "");
    const oldRoleIdStr = String(target.role_id || "");

    if (fields.slug) {
      const exists = await Role.findOne({
        where: { slug: fields.slug, role_id: { [Op.ne]: target.role_id } },
      });
      if (exists) return { status: 409, msg: "slug already exists" };
    }

    t = await db.sequelize.transaction();
    const now = nowUnix();
    fields.updated = now;
    fields.updated_by = currentUser?.user_id;

    await updateRole({ role_id: target.role_id }, fields, t);
    const updated = await findRoleByParam(target.role_id, t);

    const newSlug = String(updated?.slug || fields.slug || oldSlug);
    const hasSlugChanged = !!newSlug && newSlug !== oldSlug;
    const hasMenuAccessUpdate = menu_access !== undefined;
    let syncMembersCount = 0;

    if (hasSlugChanged || (hasMenuAccessUpdate && syncToMembers !== false)) {
      const newRoleIdStr = String(updated?.role_id || target.role_id || "");
      const roleTitles = [target?.title, updated?.title]
        .map((x) => String(x || "").trim())
        .filter(Boolean);

      const identifiersExact = new Set(
        [oldSlug, newSlug, oldRoleIdStr, newRoleIdStr, ...roleTitles]
          .map((x) => String(x || "").trim())
          .filter(Boolean)
      );
      const identifiersLower = new Set(
        Array.from(identifiersExact).map((x) => x.toLowerCase())
      );

      const users = await User.findAll({
        where: { deleted: null },
        attributes: ["user_id", "user_role"],
        raw: true,
        transaction: t,
      });

      const targetUserIds = users
        .filter((u) => {
          const roleVal = String(u?.user_role || "").trim();
          if (!roleVal) return false;
          if (identifiersExact.has(roleVal)) return true;
          if (identifiersLower.has(roleVal.toLowerCase())) return true;
          if (/^\d+$/.test(roleVal)) {
            return roleVal === oldRoleIdStr || roleVal === newRoleIdStr;
          }
          return false;
        })
        .map((u) => Number(u.user_id))
        .filter((n) => Number.isFinite(n));

      if (targetUserIds.length > 0) {
        const userUpdates = {
          updated: now,
          updated_by: currentUser?.user_id,
        };

        if (hasSlugChanged) userUpdates.user_role = newSlug;
        if (hasMenuAccessUpdate && syncToMembers !== false) {
          userUpdates.menu_access = Array.isArray(updated?.menu_access)
            ? updated.menu_access
            : Array.isArray(fields?.menu_access)
            ? fields.menu_access
            : Array.isArray(menu_access)
            ? menu_access
            : [];
        }

        const [affected] = await User.update(userUpdates, {
          where: { user_id: { [Op.in]: targetUserIds } },
          transaction: t,
        });
        syncMembersCount = Number(affected || 0);
      } else {
        syncMembersCount = 0;
      }
    }

    await t.commit();
    return { status: 200, role: updated, sync_members_count: syncMembersCount };
  } catch (error) {
    if (t) { try { await t.rollback(); } catch {} }
    return { status: 500, msg: error?.message || "Failed to update role" };
  }
}

export async function deleteRole(params, currentUser) {
  let t = null;
  try {
    const roleId = params?.roleId;
    if (!roleId) return { status: 400, msg: "roleId is required" };

    const target = await findRoleByParam(roleId);
    if (!target) return { status: 404, msg: "Role not found" };

    t = await db.sequelize.transaction();
    const now = nowUnix();
    const fields = {
      deleted: now,
      deleted_by: currentUser?.user_id,
      updated: now,
      updated_by: currentUser?.user_id,
    };

    await updateRole({ role_id: target.role_id }, fields, t);
    await t.commit();
    return { status: 200 };
  } catch (error) {
    if (t) { try { await t.rollback(); } catch {} }
    return { status: 500, msg: error?.message || "Failed to delete role" };
  }
}
