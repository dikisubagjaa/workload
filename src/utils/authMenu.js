import { Menu, User, Role } from "@/database/models";
import {
  buildMenuTree,
  parseAccessList,
  isAllowed,
} from "@/utils/buildMenuHelpers";

const EMPTY_MENU = { pages: [], dashboardKeys: [], buttons: [] };

export async function buildSessionMenuByEmail(email) {
  if (!email) return EMPTY_MENU;

  const dbUser = await User.findOne({
    where: { email },
    attributes: ["menu_access", "user_role", "user_id"],
    raw: true,
  });

  if (!dbUser) return EMPTY_MENU;

  let { idSet, pathSet } = parseAccessList(dbUser.menu_access);
  if (idSet.size === 0 && pathSet.size === 0 && dbUser.user_role) {
    const roleRow = await Role.findOne({
      where: { slug: dbUser.user_role },
      attributes: ["menu_access"],
      raw: true,
    });
    const parsed = parseAccessList(roleRow?.menu_access);
    idSet = parsed.idSet;
    pathSet = parsed.pathSet;

    if (roleRow?.menu_access) {
      await User.update(
        { menu_access: roleRow.menu_access },
        { where: { user_id: dbUser.user_id } }
      );
    }
  }

  const allowedFn = (row) => isAllowed(row, idSet, pathSet);

  const allMenuRows = await Menu.findAll({
    where: { is_active: "true" },
    attributes: [
      "menu_id",
      "title",
      "path",
      "icon",
      "ordered",
      "is_show",
      "type",
      "parent_id",
    ],
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

  return { pages, dashboardKeys, buttons };
}
