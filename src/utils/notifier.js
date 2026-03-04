// src/utils/notifier.js (ESM) — aligned to your models + robust logs
import db from "@/database/models";
import * as mailerMod from "@/server/email/mailer";
import * as templatesMod from "@/server/email/templates";
import { nowUnix } from "@/utils/dateHelpers";
import { sendPushToUser } from "@/server/push/sendPush"; // <-- NEW: push FCM

const { sendMail } = mailerMod.default || mailerMod;
const { renderEmail } = templatesMod.default || templatesMod;

const { Notification, User, EmailLog } = db;

const DEBUG = String(process.env.NOTIFY_DEBUG || "").toLowerCase() === "true";
const dlog = (...args) => { if (DEBUG) console.log("[notifier]", ...args); };
const wlog = (...args) => console.warn("[notifier]", ...args);
const elog = (...args) => console.error("[notifier]", ...args);

const toInfoString = (v, fallback = "n/a", max = 500) => {
  const raw = v == null ? "" : String(v).trim();
  const out = raw || fallback;
  return out.length > max ? out.slice(0, max) : out;
};


/* ---------- URL helper ---------- */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

const getPublicBase = () =>
  (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "")
    .trim()
    .replace(/\/+$/, "");

const normalizeAbsoluteHost = (url) => {
  try {
    const parsed = new URL(url);
    if (!/^https?:$/i.test(parsed.protocol)) return url;
    if (!LOCAL_HOSTS.has(parsed.hostname)) return url;

    const base = getPublicBase();
    if (!base) return url;
    return `${base}${parsed.pathname || ""}${parsed.search || ""}${parsed.hash || ""}`;
  } catch {
    return url;
  }
};

const toAbs = (url) => {
  if (!url) return null;
  const u = String(url).trim();
  if (/^[a-z][a-z0-9+.+-]*:|^\/\//i.test(u)) return normalizeAbsoluteHost(u);
  const base = getPublicBase();
  if (!base) return u;
  return `${base}${u.startsWith("/") ? "" : "/"}${u}`;
};

/* ---------- DB helpers ---------- */
const notifPKWhere = (notifRowOrId) => {
  const id = (notifRowOrId && (notifRowOrId.notification_id ?? notifRowOrId.id)) ?? notifRowOrId ?? null;
  return { notification_id: id };
};

async function getTargetUser(userId) {
  const row = await User.findOne({
    where: { user_id: userId },
    attributes: ["user_id", "email"],
    raw: true,
  });
  dlog("getTargetUser:", { userId, found: !!row, email: row?.email });
  return row;
}

/* ---------- EmailLog util ---------- */
async function logEmailRow(payload) {
  const row = await EmailLog.create({
    ...payload,
    template_vars: payload.template_vars ? JSON.stringify(payload.template_vars) : null,
    provider: toInfoString(payload.provider, "unknown", 64),
    provider_message_id: toInfoString(payload.provider_message_id, "n/a", 191),
    smtp_response: toInfoString(payload.smtp_response, "n/a", 512),
    error_code: toInfoString(payload.error_code, "n/a", 64),
    error_message: toInfoString(payload.error_message, "n/a", 1000),
    created: nowUnix(),
    created_by: payload.created_by ?? 1,
    updated: nowUnix(),
    updated_by: payload.updated_by ?? 1,
  });
  dlog("EmailLog row:", row.get({ plain: true }));
  return row;
}

/* ---------- Email sender (flag based) ---------- */
async function sendEmailForNotification({
  notifRow,
  toUserId,
  emailFlag = false,
  type = "generic",
  title,
  description,
  url,
  meta = {},
  dedupKey = null,
}) {
  const wherePK = notifPKWhere(notifRow);
  const notifId = notifRow?.notification_id ?? notifRow?.id ?? null;
  dlog("sendEmailForNotification:", { emailFlag, toUserId, type, notifId, dedupKey });

  if (emailFlag !== true) {
    try {
      await Notification.update(
        { delivery_email_status: "skipped", delivery_email_meta: "flag_off", updated: nowUnix() },
        { where: wherePK }
      );
      dlog("email skipped (flag_off)");
    } catch (e) { elog("mark skipped(flag_off) failed:", e?.message || e); }
    return { sent: false, reason: "flag_off" };
  }

  const user = await getTargetUser(toUserId);
  if (!user?.email) {
    const reason = "no_email";
    await logEmailRow({
      status: "skipped",
      reason,
      notification_id: notifId,
      user_id: toUserId,
      to_email: user?.email || "",
      type,
      subject: title || "[Workload] Notification",
      template_key: type,
      template_vars: meta,
      body: description || "",
      dedup_key: dedupKey || null,
      smtp_response: "skipped:no_email",
      error_code: "NO_EMAIL",
      error_message: "Target user has no email address.",
    });
    await Notification.update(
      { delivery_email_status: "skipped", delivery_email_meta: toInfoString(reason, "skipped"), updated: nowUnix() },
      { where: wherePK }
    );
    return { sent: false, reason };
  }

  const linkAbs = toAbs(url);
  let subject, html, text, template_key, template_vars;
  try {
    ({ subject, html, text, template_key, template_vars } = renderEmail(type || "generic", {
      title, body: description, link: linkAbs, ...meta,
    }));
  } catch (e) {
    subject = title || "[Workload] Notification";
    html = `<p>${description || ""}</p>${linkAbs ? `<p><a href="${linkAbs}">${linkAbs}</a></p>` : ""}`;
    text = `${description || ""}${linkAbs ? `\n${linkAbs}` : ""}`;
    template_key = type || "generic";
    template_vars = { title, body: description, link: linkAbs, ...meta };
  }

  const attempt = await logEmailRow({
    status: "attempt",
    notification_id: notifId,
    user_id: toUserId,
    to_email: user.email,
    type: type || "generic",
    subject,
    template_key,
    template_vars,
    body: html,
    dedup_key: dedupKey || null,
    attempted: nowUnix(),
    smtp_response: "attempt:sendmail_called",
    error_code: "n/a",
    error_message: "n/a",
  });

  try {
    const info = await sendMail({ to: user.email, subject, html, text });
    const ts = nowUnix();
    await attempt.update({
      status: "sent",
      provider_message_id: toInfoString(info?.messageId, "sent:no_provider_message_id", 191),
      smtp_response: toInfoString(info?.response, "sent:no_provider_response", 512),
      error_code: "n/a",
      error_message: "n/a",
      sent: ts,
      updated: ts,
    });
    await Notification.update(
      {
        delivery_email_status: "sent",
        delivery_email_meta: toInfoString(info?.response, "sent:no_provider_response", 512),
        email_send: "true",
        email_type: type || "generic",
        updated: ts
      },
      { where: wherePK }
    );
    return { sent: true, messageId: info?.messageId || null };
  } catch (err) {
    const ts = nowUnix();
    await logEmailRow({
      status: "failed",
      notification_id: notifId,
      user_id: toUserId,
      to_email: user.email,
      type: type || "generic",
      subject,
      template_key,
      template_vars,
      body: html,
      dedup_key: dedupKey || null,
      smtp_response: "failed:sendmail_error",
      error_code: toInfoString(err?.code, "SENDMAIL_ERROR", 64),
      error_message: toInfoString(err?.message || String(err), "Unknown email send error", 1000),
      updated: ts,
    });
    await Notification.update(
      {
        delivery_email_status: "failed",
        delivery_email_meta: toInfoString(err?.message || String(err), "Unknown email send error", 512),
        email_send: "false",
        email_type: type || "generic",
        updated: ts
      },
      { where: wherePK }
    );
    return { sent: false, error: err?.message || String(err) };
  }
}

/* API */
export async function notify({
  userId,
  sender,
  description,
  url,
  payload,
  email = false,
  type,
  dedupKey,
  meta,
  title,
}) {
  if (!userId) throw new Error("notify: userId is required");
  const ts = nowUnix();

  const safeSender = sender || process.env.APP_NAME || "system";
  const absUrl = toAbs(url);

  let row;
  try {
    row = await Notification.create({
      user_id: userId,
      sender: safeSender,
      description: description || "",
      url: absUrl || null,
      payload:
        typeof payload === "string"
          ? payload
          : payload
            ? JSON.stringify(payload)
            : null,
      is_read: "false",
      email_send: "false",
      email_type: type || null,
      dedup_key: dedupKey || null,
      created: ts,
      updated: ts,
    });
  } catch (e) {
    throw e;
  }

  // ⬇️ NEW: kirim PUSH FCM setelah row notif berhasil dibuat
  try {
    const notifId = row?.notification_id ?? row?.id ?? null;

    await sendPushToUser(userId, {
      title: title || description || "Notification",
      body: description || "",
      data: {
        url: absUrl || "/notification",
        type: type || "generic",
        notificationId: notifId != null ? String(notifId) : "",
        dedupKey: dedupKey || null,
        // meta tambahan (kalau object) ikut dikirim sebagai data
        ...(meta && typeof meta === "object" ? meta : {}),
      },
    });

    dlog("notify: push sent", {
      userId,
      notifId,
      url: absUrl,
      type: type || "generic",
    });
  } catch (e) {
    wlog("notify: sendPushToUser failed:", e?.message || e);
  }

  // EMAIL tetap seperti semula (flag-based)
  try {
    await sendEmailForNotification({
      notifRow: row.toJSON ? row.toJSON() : row,
      toUserId: userId,
      emailFlag: email,
      type,
      title: title || description,
      description,
      url: absUrl,
      meta,
      dedupKey,
    });
  } catch {
    /* swallow */
  }

  return row;
}

export const notifyUser = notify;
export default { notify, notifyUser };
