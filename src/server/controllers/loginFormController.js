import { encode } from "next-auth/jwt";
import db from "@/database/models";

const { User, Role, Menu } = db;

function parseAccessList(src) {
  let arr = [];
  if (Array.isArray(src)) arr = src;
  else if (typeof src === "string") {
    const s = src.trim();
    if (!s || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") arr = [];
    else if ((s.startsWith("[") && s.endsWith("]")) || (s.startsWith("{") && s.endsWith("}"))) {
      try {
        const p = JSON.parse(s);
        arr = Array.isArray(p) ? p : [];
      } catch {
        arr = s.split(",");
      }
    } else arr = s.split(",");
  }
  arr = arr.map((v) => (typeof v === "string" ? v.trim() : v)).filter(Boolean);

  const idSet = new Set(
    arr
      .map((v) => (typeof v === "string" && /^[0-9]+$/.test(v) ? Number(v) : v))
      .filter((v) => typeof v === "number")
  );
  const pathSet = new Set(
    arr
      .map((v) => (typeof v === "number" ? "" : String(v)))
      .map((s) => s.trim().toLowerCase())
      .filter((s) => !!s && !/^[0-9]+$/.test(s))
  );
  return { idSet, pathSet };
}

function isAllowed(row, idSet, pathSet) {
  const byId = idSet.has(row.menu_id);
  const byPath = row.path && pathSet.has(String(row.path).toLowerCase());
  return byId || byPath;
}

function buildMenuTree(menuRows, allowedFn = () => true) {
  const nodesById = new Map();

  for (const row of menuRows) {
    nodesById.set(row.menu_id, {
      id: row.menu_id,
      parentId: row.parent_id ?? null,
      order: row.ordered ?? 0,
      key: row.path || String(row.menu_id),
      path: row.path || null,
      label: row.title || "",
      icon: row.icon || null,
      isShow: row.is_show,
      allowed: !!allowedFn(row),
      children: [],
    });
  }

  const roots = [];
  for (const node of nodesById.values()) {
    if (node.parentId && nodesById.has(node.parentId)) {
      nodesById.get(node.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortByOrder = (a, b) => (a.order || 0) - (b.order || 0);
  function sortTree(n, depth = 0) {
    if (depth > 50) return;
    n.children.sort(sortByOrder);
    n.children.forEach((c) => sortTree(c, depth + 1));
  }
  roots.sort(sortByOrder);
  roots.forEach((n) => sortTree(n));

  function prune(n) {
    const keptChildren = n.children.map(prune).filter(Boolean);
    const keepThis = n.allowed || keptChildren.length > 0;
    if (!keepThis) return null;
    const out = {
      key: n.key,
      path: n.path,
      label: n.label,
      icon: n.icon,
      isShow: n.isShow,
    };
    if (keptChildren.length) out.children = keptChildren;
    return out;
  }

  return roots.map(prune).filter(Boolean);
}

export async function loginForm(body) {
  const email = (body.email || "").trim();
  if (!email) return { httpStatus: 400, msg: "Email is required" };

  const dbUser = await User.findOne({ where: { email }, raw: true });
  if (!dbUser) return { httpStatus: 404, msg: "User not found in DB" };

  const roleRow = dbUser.user_role
    ? await Role.findOne({
        where: { slug: dbUser.user_role },
        attributes: ["menu_access", "is_hod", "is_hrd", "is_ae", "is_superadmin", "is_operational_director"],
        raw: true,
      })
    : null;

  let { idSet, pathSet } = parseAccessList(dbUser.menu_access);
  if (idSet.size === 0 && pathSet.size === 0) {
    const parsed = parseAccessList(roleRow?.menu_access);
    idSet = parsed.idSet;
    pathSet = parsed.pathSet;
  }

  const allowedFn = (row) => isAllowed(row, idSet, pathSet);

  const allMenuRows = await Menu.findAll({
    where: { is_active: "true" },
    attributes: ["menu_id", "title", "path", "icon", "ordered", "is_show", "type", "parent_id"],
    order: [["ordered", "ASC"]],
    raw: true,
  });

  const pageRows = allMenuRows.filter((r) => r.type === "page");
  const dashboardRows = allMenuRows.filter((r) => r.type === "dashboard");
  const buttonRows = allMenuRows.filter((r) => r.type === "button");

  const pages = buildMenuTree(pageRows, allowedFn);

  const dashboardKeys = dashboardRows
    .filter(allowedFn)
    .sort((a, b) => (a.ordered || 0) - (b.ordered || 0))
    .map((r) => r.path || String(r.menu_id));

  const buttons = buttonRows
    .filter(allowedFn)
    .sort((a, b) => (a.ordered || 0) - (b.ordered || 0))
    .map((r) => ({
      key: r.path || String(r.menu_id),
      path: r.path || null,
      label: r.title || "",
      icon: r.icon || null,
      isShow: r.is_show,
    }));

  const menu = { pages, dashboardKeys, buttons };

  const token = {
    sub: String(dbUser.user_id),
    email: dbUser.email,
    user_id: dbUser.user_id,
    user_role: dbUser.user_role,
    department_id: dbUser.department_id,
    fullname: dbUser.fullname,
    status: dbUser.status,

    menu,

    is_hod: String(roleRow?.is_hod ?? "false"),
    is_hrd: String(roleRow?.is_hrd ?? "false"),
    is_ae: String(roleRow?.is_ae ?? "false"),
    is_superadmin: String(roleRow?.is_superadmin ?? "false"),
    is_director_operational: String(roleRow?.is_operational_director ?? "false"),
  };

  const jwt = await encode({
    token,
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 60 * 60 * 24 * 30,
  });

  return { token: jwt, user: token };
}
