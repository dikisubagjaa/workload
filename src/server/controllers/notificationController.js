import { countUnread, findNotificationsPaged, updateNotifications } from "@/server/queries/notificationQueries";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function normalizeNotificationUrl(rawUrl) {
  if (!rawUrl) return rawUrl;

  const base = String(process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "")
    .trim()
    .replace(/\/+$/, "");
  if (!base) return rawUrl;

  try {
    const parsed = new URL(String(rawUrl));
    if (!/^https?:$/i.test(parsed.protocol)) return rawUrl;
    if (!LOCAL_HOSTS.has(parsed.hostname)) return rawUrl;
    return `${base}${parsed.pathname || ""}${parsed.search || ""}${parsed.hash || ""}`;
  } catch {
    return rawUrl;
  }
}

function normalizeUserId(u) {
  const raw = u?.user_id ?? u?.id ?? u?.userId;
  if (raw == null) return null;
  const n = typeof raw === "string" ? parseInt(raw, 10) : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function listNotifications(req) {
  const url = new URL(req.url);
  const userId = Number(url.searchParams.get("userId") || 1);

  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;

  const { rows, count } = await findNotificationsPaged({ user_id: userId }, limit, offset);

  const data = rows.map((r) => ({
    notificationId: r.notification_id,
    userId: r.user_id,
    sender: r.sender,
    description: r.description,
    url: normalizeNotificationUrl(r.url),
    payload: r.payload,
    isRead: r.is_read === "true",
    created: r.created,
    updated: r.updated,
  }));

  return {
    data,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

export async function markAllRead(req) {
  const url = new URL(req.url);
  const userId = Number(url.searchParams.get("userId") || 1);
  const now = Math.floor(Date.now() / 1000);

  const [aff] = await updateNotifications({ user_id: userId, is_read: "false" }, { is_read: "true", updated: now });
  return { updated: aff || 0 };
}

export async function markNotificationRead(id) {
  const now = Math.floor(Date.now() / 1000);
  const [aff] = await updateNotifications({ notification_id: id }, { is_read: "true", updated: now });
  if (!aff) return { httpStatus: 404, msg: "Not found" };
  return {};
}

export async function getUnreadCount(currentUser) {
  const userId = normalizeUserId(currentUser);
  if (!userId) return { httpStatus: 401, msg: "Unauthenticated" };

  const unread = await countUnread(userId);
  return { unread };
}
