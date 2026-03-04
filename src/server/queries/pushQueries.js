import db from "@/database/models";

const { NotificationPush } = db;

export function findOrCreatePushToken(where, defaults) {
  return NotificationPush.findOrCreate({ where, defaults });
}

export function updatePushTokenInstance(row, updates) {
  return row.update(updates);
}
