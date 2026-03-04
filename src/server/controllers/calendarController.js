import dayjs, { TZ } from "@/utils/dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { nowUnix } from "@/utils/dateHelpers";
import {
  Op,
  findCalendarEvents,
  createCalendarEvent,
  findCalendarEventById,
  updateCalendarEventInstance,
} from "@/server/queries/calendarQueries";

dayjs.extend(customParseFormat);

function toYMD(s) {
  const raw = String(s || "").trim();
  const d = dayjs(raw, "YYYY-MM-DD", true);
  return d.isValid() ? d.format("YYYY-MM-DD") : null;
}

function toUnixStart(ymd) {
  if (!ymd) return null;
  const d = dayjs.tz(ymd, "YYYY-MM-DD", TZ);
  return d.isValid() ? d.startOf("day").unix() : null;
}

function toUnixEnd(ymd) {
  if (!ymd) return null;
  const d = dayjs.tz(ymd, "YYYY-MM-DD", TZ);
  return d.isValid() ? d.endOf("day").unix() : null;
}

function parseIntSafe(v, def, { min = 1, max = 1000 } = {}) {
  const n = Number.parseInt(String(v ?? ""), 10);
  if (Number.isFinite(n)) return Math.max(min, Math.min(max, n));
  return def;
}

function parseSortBy(raw) {
  const allowed = new Set(["start_at", "end_at", "created", "updated"]);
  const key = String(raw || "").trim().toLowerCase();
  return allowed.has(key) ? key : "start_at";
}

function parseSortDir(raw) {
  const dir = String(raw || "").trim().toLowerCase();
  return dir === "desc" ? "DESC" : "ASC";
}

function validHex(color) {
  if (!color) return true;
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(color);
}

export async function listCalendarEvents(req) {
  const url = new URL(req.url);
  const sp = url.searchParams;

  const fromYmd = toYMD(sp.get("from"));
  const toYmd = toYMD(sp.get("to"));
  const fromUnix = toUnixStart(fromYmd);
  const toUnix = toUnixEnd(toYmd);

  const limit = parseIntSafe(sp.get("limit"), 100, { min: 1, max: 1000 });
  const sortBy = parseSortBy(sp.get("sortBy"));
  const sortDir = parseSortDir(sp.get("sortDir"));

  const where = {};
  if (fromUnix != null && toUnix != null) {
    where[Op.and] = [
      { start_at: { [Op.lte]: toUnix } },
      { end_at: { [Op.gte]: fromUnix } },
    ];
  } else if (fromUnix != null) {
    where.start_at = { [Op.gte]: fromUnix };
  } else if (toUnix != null) {
    where.start_at = { [Op.lte]: toUnix };
  }

  const rows = await findCalendarEvents(where, {
    order: [[sortBy, sortDir]],
    limit,
  });

  return {
    data: rows,
    meta: {
      now_unix: nowUnix(),
      from: fromYmd,
      to: toYmd,
      limit,
      sortBy,
      sortDir,
    },
  };
}

export async function createCalendarEventFromBody(body, currentUser) {
  const title = String(body?.title || "").trim();
  const description = body?.description ? String(body.description) : null;
  const start_at = Number(body?.start_at);
  const end_at = Number(body?.end_at);
  const color = body?.color ? String(body.color) : null;
  const is_public = typeof body?.is_public === "boolean" ? body.is_public : false;

  if (!title || title.length > 150) {
    return { status: 400, msg: "Title is required (1..150 chars)." };
  }
  if (!Number.isInteger(start_at) || !Number.isInteger(end_at)) {
    return { status: 400, msg: "start_at and end_at must be unix seconds (integer)." };
  }
  if (end_at < start_at) {
    return { status: 400, msg: "end_at must be greater than or equal to start_at." };
  }

  const created = await createCalendarEvent({
    user_id: currentUser.user_id,
    title,
    description,
    start_at,
    end_at,
    color,
    is_public,
    created_by: currentUser.user_id,
    updated_by: currentUser.user_id,
    created: nowUnix(),
    updated: nowUnix(),
  });

  return { status: 201, data: created };
}

export async function updateCalendarEvent(eventId, body) {
  const ev = await findCalendarEventById(eventId, {
    attributes: [
      "event_id",
      "user_id",
      "title",
      "description",
      "start_at",
      "end_at",
      "color",
      "is_public",
      "created",
      "updated",
    ],
  });
  if (!ev) return { status: 404, msg: "Event not found" };

  const updates = {};
  if (typeof body.title !== "undefined") {
    const t = String(body.title || "").trim();
    if (!t || t.length > 150) {
      return { status: 400, msg: "Title is required (1..150 chars)." };
    }
    updates.title = t;
  }
  if (typeof body.description !== "undefined") {
    updates.description = body.description ? String(body.description) : null;
  }
  if (typeof body.start_at !== "undefined") {
    if (!Number.isInteger(Number(body.start_at))) {
      return { status: 400, msg: "start_at must be unix seconds (integer)." };
    }
    updates.start_at = Number(body.start_at);
  }
  if (typeof body.end_at !== "undefined") {
    if (!Number.isInteger(Number(body.end_at))) {
      return { status: 400, msg: "end_at must be unix seconds (integer)." };
    }
    updates.end_at = Number(body.end_at);
  }
  if (typeof updates.start_at !== "undefined" || typeof updates.end_at !== "undefined") {
    const a = typeof updates.start_at !== "undefined" ? updates.start_at : ev.start_at;
    const b = typeof updates.end_at !== "undefined" ? updates.end_at : ev.end_at;
    if (b < a) {
      return { status: 400, msg: "end_at must be greater than or equal to start_at." };
    }
  }
  if (typeof body.color !== "undefined") {
    const color = body.color ? String(body.color) : null;
    if (!validHex(color)) {
      return { status: 400, msg: "Invalid color hex." };
    }
    updates.color = color;
  }
  if (typeof body.is_public !== "undefined") {
    updates.is_public = !!body.is_public;
  }

  updates.updated = nowUnix();
  await updateCalendarEventInstance(ev, updates);

  return { status: 200, data: ev };
}

export async function deleteCalendarEvent(eventId, currentUser) {
  const ev = await findCalendarEventById(eventId, {
    attributes: ["event_id", "user_id"],
  });
  if (!ev) return { status: 404, msg: "Event not found" };

  if (ev.user_id && ev.user_id !== currentUser?.user_id) {
    return { status: 403, msg: "Forbidden" };
  }

  await updateCalendarEventInstance(ev, { deleted: nowUnix(), updated: nowUnix() });
  return { status: 200 };
}
