import db from "@/database/models";

const { Notification, Sequelize } = db;
const { Op } = Sequelize;

export { Op };

export function findNotificationsPaged(where, limit, offset) {
  return Notification.findAndCountAll({
    where,
    order: [["created", "DESC"]],
    limit,
    offset,
    raw: true,
  });
}

export function updateNotifications(where, updates) {
  return Notification.update(updates, { where });
}

export function countUnread(userId) {
  return Notification.count({ where: { user_id: userId, is_read: "false" } });
}
