import db from "@/database/models";

const { Menu } = db;

export function findAllMenus() {
  return Menu.findAll({
    order: [
      ["ordered", "ASC"],
      ["title", "ASC"],
    ],
  });
}

export function createMenu(payload) {
  return Menu.create(payload);
}

export function updateMenuById(menuId, updates) {
  return Menu.update(updates, { where: { menu_id: menuId } });
}

export function findMenuById(menuId) {
  return Menu.findOne({ where: { menu_id: menuId } });
}
