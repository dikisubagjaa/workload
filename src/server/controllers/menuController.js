import { nowUnix } from "@/utils/dateHelpers";
import { createMenu, findAllMenus, findMenuById, updateMenuById } from "@/server/queries/menuQueries";

function normalizeBoolEnum(value, defaultValue = "true") {
  if (value === undefined || value === null) return defaultValue;

  if (value === true || value === "true" || value === 1 || value === "1") {
    return "true";
  }
  if (value === false || value === "false" || value === 0 || value === "0") {
    return "false";
  }
  return defaultValue;
}

export async function listMenus() {
  const menus = await findAllMenus();
  return { menus: menus.map((m) => (m.toJSON ? m.toJSON() : m)) };
}

export async function createMenuFromBody(body, currentUser) {
  const title = String(body?.title ?? "").trim();
  const path = body?.path != null && String(body.path).trim() !== "" ? String(body.path).trim() : null;
  const icon = body?.icon != null && String(body.icon).trim() !== "" ? String(body.icon).trim() : null;

  const orderedRaw = body?.ordered;
  const ordered = Number.isFinite(+orderedRaw) ? +orderedRaw : 0;

  const isActive = normalizeBoolEnum(body?.is_active, "true");
  const isShow = normalizeBoolEnum(body?.is_show, "true");

  const typeRaw = body?.type;
  const type = typeRaw === "dashboard" ? "dashboard" : "page";

  const parentIdRaw = body?.parent_id;
  const parent_id =
    parentIdRaw === null || parentIdRaw === undefined || parentIdRaw === ""
      ? null
      : Number(parentIdRaw);

  if (!title) {
    return { httpStatus: 400, msg: "Title is required." };
  }

  const now = nowUnix();
  const userId = currentUser?.user_id ?? currentUser?.id ?? null;

  if (!userId) {
    return { httpStatus: 500, msg: "Invalid current user (missing user_id)." };
  }

  const newMenu = await createMenu({
    title,
    path,
    icon,
    ordered,
    is_active: isActive,
    is_show: isShow,
    type,
    parent_id,
    created: now,
    created_by: userId,
    updated: now,
    updated_by: userId,
  });

  return { httpStatus: 201, msg: "Menu created successfully!", menu: newMenu.toJSON() };
}

export async function updateMenuFromBody(menuId, body, currentUser) {
  const fields = {};

  if (body.title !== undefined) {
    fields.title = String(body.title).trim();
  }

  if (body.path !== undefined) {
    const path = body.path != null && String(body.path).trim() !== "" ? String(body.path).trim() : null;
    fields.path = path;
  }

  if (body.icon !== undefined) {
    const icon = body.icon != null && String(body.icon).trim() !== "" ? String(body.icon).trim() : null;
    fields.icon = icon;
  }

  if (body.ordered !== undefined) {
    const orderedRaw = body.ordered;
    fields.ordered = Number.isFinite(+orderedRaw) ? +orderedRaw : 0;
  }

  if (body.parent_id !== undefined) {
    const parentRaw = body.parent_id;
    fields.parent_id =
      parentRaw === null || parentRaw === undefined || parentRaw === "" ? null : Number(parentRaw);
  }

  if (body.is_active !== undefined) {
    fields.is_active = normalizeBoolEnum(body.is_active);
  }

  if (body.is_show !== undefined) {
    fields.is_show = normalizeBoolEnum(body.is_show);
  }

  if (body.type !== undefined) {
    fields.type = body.type === "dashboard" ? "dashboard" : "page";
  }

  const now = nowUnix();
  const userId = currentUser?.user_id ?? currentUser?.id ?? null;

  if (!userId) {
    return { httpStatus: 500, msg: "Invalid current user (missing user_id)." };
  }

  fields.updated = now;
  fields.updated_by = userId;

  const [affected] = await updateMenuById(menuId, fields);

  if (!affected) {
    return { httpStatus: 404, msg: "Menu not found." };
  }

  const updatedMenu = await findMenuById(menuId);
  return {
    msg: "Menu updated.",
    menu: updatedMenu ? updatedMenu.toJSON() : null,
  };
}

export async function deleteMenu(menuId, currentUser) {
  const now = nowUnix();
  const userId = currentUser?.user_id ?? currentUser?.id ?? null;

  if (!userId) {
    return { httpStatus: 500, msg: "Invalid current user (missing user_id)." };
  }

  const [affected] = await updateMenuById(menuId, {
    updated: now,
    updated_by: userId,
    deleted: now,
    deleted_by: userId,
  });

  if (!affected) {
    return { httpStatus: 404, msg: "Menu not found." };
  }

  return { msg: "Menu deleted" };
}
