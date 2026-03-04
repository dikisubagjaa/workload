import { nowUnix } from "@/utils/dateHelpers";
import { createOfficeIp, findOfficeIp, updateOfficeIpInstance } from "@/server/queries/webhookQueries";

function getClientPublicIp(headers) {
  const xff = headers.get?.("x-forwarded-for") || headers["x-forwarded-for"];
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts[0];
  }
  const rip = headers.get?.("x-real-ip") || headers["x-real-ip"];
  if (rip) return rip;
  const cip = headers.get?.("cf-connecting-ip") || headers["cf-connecting-ip"];
  if (cip) return cip;
  return null;
}

export async function registerOfficeIp(req) {
  const secret = req.headers.get("x-office-webhook-secret") || "";
  const expected = process.env.OFFICE_WEBHOOK_SECRET || "";

  if (!expected) {
    return { httpStatus: 500, msg: "OFFICE_WEBHOOK_SECRET is not set on server." };
  }

  if (!secret || secret !== expected) {
    return { httpStatus: 401, msg: "Unauthorized" };
  }

  const ip = getClientPublicIp(req.headers) || "0.0.0.0";
  if (!ip || ip === "0.0.0.0") {
    return { httpStatus: 400, msg: "Unable to detect client IP." };
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const label = String(body?.label || "Office").slice(0, 100);
  const note = body?.note != null ? String(body.note) : null;

  const ts = nowUnix();
  const systemUserId = parseInt(process.env.OFFICE_WEBHOOK_USER_ID || "1", 10) || 1;

  const existing = await findOfficeIp(ip);

  if (existing) {
    await updateOfficeIpInstance(existing, {
      label,
      note,
      updated: ts,
      updated_by: systemUserId,
    });

    return { msg: "Office IP refreshed.", ip, id: existing.id };
  }

  const created = await createOfficeIp({
    label,
    ip,
    active: 1,
    note,
    created: ts,
    created_by: systemUserId,
    updated: ts,
    updated_by: systemUserId,
  });

  return { httpStatus: 201, msg: "Office IP registered.", ip, id: created.id };
}
