import { findOrCreatePushToken, updatePushTokenInstance } from "@/server/queries/pushQueries";
import { sendPushToUser } from "@/server/push/sendPush";

export async function registerPushToken(body, headers) {
  const { userId, token, app } = body || {};
  const created_by = Number(userId);

  if (!created_by || !token) {
    return { httpStatus: 400, msg: "Bad request" };
  }

  const ua = headers.get("user-agent") || "";
  const now = Math.floor(Date.now() / 1000);

  const [row, created] = await findOrCreatePushToken(
    { created_by, token },
    {
      created_by,
      token,
      app: app || "web",
      ua,
      status: "active",
      last_seen: now,
      created: now,
      updated: now,
    }
  );

  if (!created) {
    row.app = app || row.app || "web";
    row.ua = ua;
    row.status = "active";
    row.last_seen = now;
    await updatePushTokenInstance(row, {});
  }

  return { id: row.notification_push_id, created };
}

export async function sendTestPush() {
  const userId = 19;
  const title = "Test Push Title";
  const body = `Hello user ${userId} 👋`;
  const url = "/notification";

  await sendPushToUser(userId, {
    title: title || "Test Push",
    body: body || `Hello user ${userId} 👋`,
    data: { url: url || "/notification", type: "test" },
  });

  return { msg: "Push test endpoint is ready." };
}
