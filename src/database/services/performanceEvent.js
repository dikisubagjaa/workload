// src/services/performanceEvent.js
// Service untuk mencatat event performance secara dinamis
// - Tidak pakai parameter models
// - Langsung pakai db global
// - Tanpa VIEW / snapshot
// - Dinamis via JSON tags di performance_config

import dayjs from "dayjs";
import db from "@/database/models";

const SELECTOR_CACHE_TTL_MS = 5 * 60 * 1000; // 5 menit
const _selectorCache = new Map();

// ================== Utils ==================
export function normalizeSelector(selector = {}) {
    if (!selector || typeof selector !== "object") throw new Error("selector is required");
    const type = String(selector.type || "").trim().toLowerCase();
    if (!type) throw new Error("selector.type is required");

    const bucket = selector.bucket != null ? String(selector.bucket).trim().toLowerCase() : null;
    let days = selector.days;
    if (days != null) {
        const n = Number(days);
        if (!Number.isFinite(n) || n < 0) throw new Error("selector.days must be >= 0");
        days = Math.trunc(n);
    } else {
        days = null;
    }
    return { type, bucket, days };
}

export function periodPartsFromDate(eventDate) {
    const d = dayjs(eventDate || dayjs().format("YYYY-MM-DD"));
    return {
        period_year: Number(d.format("YYYY")),
        period_month: Number(d.format("M")),
        period_start_date: d.startOf("month").format("YYYY-MM-01"),
        event_date: d.format("YYYY-MM-DD"),
    };
}

// ================== Resolve Config ==================
async function resolveConfig(selectorRaw) {
    const selector = normalizeSelector(selectorRaw);
    const key = `${selector.type}|${selector.bucket || ""}|${selector.days ?? ""}`;
    const now = Date.now();

    const cached = _selectorCache.get(key);
    if (cached && now - cached.t < SELECTOR_CACHE_TTL_MS) return cached.data;

    const where = { is_active: "true" };
    const [rows] = await db.sequelize.query(
        `
      SELECT perf_config_id AS id, score_default AS score, tags
      FROM performance_config
      WHERE is_active = 'true'
    `
    );

    const parsed = rows
        .map((r) => {
            let tags = {};
            try {
                tags = JSON.parse(r.tags || "{}");
            } catch {
                tags = {};
            }
            return { ...r, tags };
        })
        .filter((r) => (r.tags?.type || "").toLowerCase() === selector.type);

    if (!parsed.length) {
        throw new Error(`No active performance_config for type=${selector.type}`);
    }

    // filter opsional bucket/days
    let chosen = parsed[0];
    if (selector.bucket) {
        const sameBucket = parsed.filter((r) => (r.tags?.bucket || null) === selector.bucket);
        if (sameBucket.length) chosen = sameBucket[0];
    }
    if (selector.days != null) {
        const withDays = parsed.filter((r) => Number.isFinite(Number(r.tags?.days)));
        const candidates = withDays.filter((r) => Number(r.tags?.days) <= selector.days);
        if (candidates.length) chosen = candidates[candidates.length - 1];
    }

    const data = { id: chosen.id, score: chosen.score };
    _selectorCache.set(key, { t: now, data });
    return data;
}

// ================== Record Single Event ==================
export async function recordPerformanceEvent({
    userId,
    source,
    selector,
    eventDate,
    createdBy,
    refId = null,
    note = null,
    meta = null,
    scoreValue = null,
    nowUnix = Math.floor(Date.now() / 1000),
}) {
    if (!userId) throw new Error("userId is required");
    if (!source) throw new Error("source is required");
    if (!selector) throw new Error("selector is required");

    const { id, score } = await resolveConfig(selector);
    const impact = scoreValue ?? score;
    const p = periodPartsFromDate(eventDate);

    await db.performanceEventLog.create({
        user_id: userId,
        event_date: p.event_date,
        period_year: p.period_year,
        period_month: p.period_month,
        period_start_date: p.period_start_date,
        perf_config_id: id,
        score_value: impact,
        source,
        ref_id: refId,
        note,
        meta,
        created: nowUnix,
        created_by: createdBy || userId,
        updated: nowUnix,
        updated_by: createdBy || userId,
    });

    return { ok: true, perf_config_id: id, applied_score: impact };
}

// ================== Record Batch ==================
export async function recordPerformanceEventsBatch(items = []) {
    if (!Array.isArray(items) || items.length === 0) return { ok: true, inserted: 0 };

    const rows = [];
    for (const it of items) {
        const {
            userId,
            source,
            selector,
            eventDate,
            refId,
            note,
            meta,
            scoreValue = null,
            createdBy = null,
            nowUnix = Math.floor(Date.now() / 1000),
        } = it;

        if (!userId) throw new Error("userId is required in batch");
        if (!source) throw new Error("source is required in batch");
        if (!selector) throw new Error("selector is required in batch");

        const { id, score } = await resolveConfig(selector);
        const impact = scoreValue ?? score;
        const p = periodPartsFromDate(eventDate);

        rows.push({
            user_id: userId,
            event_date: p.event_date,
            period_year: p.period_year,
            period_month: p.period_month,
            period_start_date: p.period_start_date,
            perf_config_id: id,
            score_value: impact,
            source,
            ref_id: refId ?? null,
            note: note ?? null,
            meta: meta ?? null,
            created: nowUnix,
            created_by: createdBy || userId,
            updated: nowUnix,
            updated_by: createdBy || userId,
        });
    }

    const res = await db.performanceEventLog.bulkCreate(rows);
    return { ok: true, inserted: res?.length || 0 };
}

// ================== Cache ==================
export function clearSelectorCache() {
    _selectorCache.clear();
}
