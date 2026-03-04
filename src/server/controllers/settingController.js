import db from "@/database/models";

const TYPES = [
  "taskAssignment",
  "taskOverdue",
  "lateToWork",
  "approval",
  "reschedule",
  "reimbursement",
  "reminderToFollowUp",
  "clientHaveOverdueInvoice",
  "collection",
  "overbudget",
  "overtimeLimit",
  "newInvoice",
  "Sales",
  "TaskCompletion",
  "memberOverdue",
  "revenue",
];

const keyOf = (type) => `notification_${type}_in_app`;

function parseDescToBool(v) {
  const s = String(v ?? "true").trim().toLowerCase();
  return !(s === "false" || s === "0");
}

function boolToDesc(b) {
  return b ? "true" : "false";
}

export async function getNotificationSettings() {
  const { Setting } = db;
  const keys = TYPES.map(keyOf);

  const rows = await Setting.findAll({ where: { var_name: keys } });

  const items = Object.fromEntries(TYPES.map((t) => [t, true]));

  for (const r of rows) {
    const t = r.var_name.replace(/^notification_/, "").replace(/_in_app$/, "");
    if (TYPES.includes(t)) {
      items[t] = parseDescToBool(r.description);
    }
  }

  return { items };
}

export async function updateNotificationSettings(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { httpStatus: 400, msg: "Bad request" };
  }

  const { Setting } = db;
  const now = Math.floor(Date.now() / 1000);
  const actor = 1;

  for (const t of TYPES) {
    if (!(t in body)) continue;

    const var_name = keyOf(t);
    const description = boolToDesc(!!body[t]);
    const title = `Notification ${t} (In-App)`;

    const [row, created] = await Setting.findOrCreate({
      where: { var_name },
      defaults: {
        title,
        var_name,
        description,
        created: now,
        created_by: actor,
        updated: now,
        updated_by: actor,
      },
    });

    if (!created) {
      row.description = description;
      row.updated = now;
      row.updated_by = actor;

      if (!row.title) {
        try {
          row.title = title;
        } catch (_) {}
      }

      await row.save();
    }
  }

  return {};
}
