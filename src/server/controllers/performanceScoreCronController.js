import 'server-only';
import { jsonResponse } from "@/utils/apiResponse";
import db from "@/database/models";
import dayjs from "dayjs";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { withCronLock } from "@/utils/cronLock";
import { nowUnix as nowUnixUTC } from "@/utils/dateHelpers";

dayjs.extend(tz);
dayjs.extend(utc);

const TZ = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Jakarta";

// ---------- Complete Task On Deadline ----------
export async function completeTaskOnDeadline(req) {
  const t0 = Date.now();
  const { Op } = db.Sequelize;

  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const dryRun = String(searchParams.get("dryRun") || "").toLowerCase() === "true";

    const eventDate =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : dayjs().tz(TZ).format("YYYY-MM-DD");

    const periodYear = Number(dayjs(eventDate).year());
    const periodMonth = Number(dayjs(eventDate).month() + 1);
    const periodStart = dayjs(eventDate).startOf("month").format("YYYY-MM-DD");

    const res = await withCronLock(
      `perf-complete-on-deadline-${eventDate}`,
      async () => {
        const taskAttrs = db.Task.rawAttributes || {};
        const hasEndDate = "end_date" in taskAttrs;
        const hasTodo = "todo" in taskAttrs;
        const hasUpdated = "updated" in taskAttrs;

        if (!hasEndDate || !hasTodo || !hasUpdated) {
          return {
            inserted: 0,
            scanned: 0,
            skipped: 0,
            note: "Task model missing required columns",
          };
        }

        const dayStart = dayjs.tz(eventDate, TZ).startOf("day").unix();
        const dayEnd = dayjs.tz(eventDate, TZ).endOf("day").unix();

        const tasks = await db.Task.findAll({
          where: {
            todo: { [Op.in]: ["done", "completed", "approved_ae"] },
            updated: { [Op.between]: [dayStart, dayEnd] },
            end_date: { [Op.between]: [dayStart, dayEnd] },
          },
          attributes: ["task_id", "title", "end_date"],
          raw: true,
        });

        if (!tasks.length) {
          return { inserted: 0, scanned: 0, skipped: 0, note: "no tasks completed on deadline" };
        }

        const taskIds = tasks.map((t) => t.task_id);

        const assigns = await db.TaskAssignment.findAll({
          where: { task_id: { [Op.in]: taskIds } },
          attributes: ["task_id", "user_id"],
          raw: true,
        });

        if (!assigns.length) {
          return { inserted: 0, scanned: tasks.length, skipped: 0, note: "no assignees" };
        }

        const usersByTask = new Map();
        for (const a of assigns) {
          if (!usersByTask.has(a.task_id)) usersByTask.set(a.task_id, []);
          if (a.user_id) usersByTask.get(a.task_id).push(a.user_id);
        }

        const allRefPairs = [];
        for (const t of tasks) {
          const users = usersByTask.get(t.task_id) || [];
          for (const uid of users) allRefPairs.push({ user_id: uid, ref_id: t.task_id });
        }

        if (!allRefPairs.length) {
          return { inserted: 0, scanned: tasks.length, skipped: 0, note: "no assignees after mapping" };
        }

        const refIds = [...new Set(allRefPairs.map((p) => p.ref_id))];

        const existing = await db.PerformanceEventLog.findAll({
          where: { perf_config_id: 5, event_date: eventDate, ref_id: { [Op.in]: refIds } },
          attributes: ["ref_id", "user_id"],
          raw: true,
        });
        const existed = new Set(existing.map((e) => `${e.user_id}:${e.ref_id}`));

        const byIdTitle = new Map(tasks.map((t) => [t.task_id, t.title]));
        const byIdDeadline = new Map(tasks.map((t) => [t.task_id, t.end_date]));

        const nowUnix = nowUnixUTC();
        const rows = [];
        let skipped = 0;

        for (const { user_id, ref_id } of allRefPairs) {
          const key = `${user_id}:${ref_id}`;
          if (existed.has(key)) {
            skipped++;
            continue;
          }

          const deadlineUnix = byIdDeadline.get(ref_id);
          const deadlineYmd = deadlineUnix ? dayjs.unix(deadlineUnix).tz(TZ).format("YYYY-MM-DD") : null;

          rows.push({
            user_id,
            event_date: eventDate,
            period_year: periodYear,
            period_month: periodMonth,
            period_start_date: periodStart,
            perf_config_id: 5,
            score_value: 0,
            source: "task",
            ref_id,
            note: `Complete Task On Deadline: [#${ref_id}] ${byIdTitle.get(ref_id) || "(no title)"} — deadline ${deadlineYmd}`,
            meta: JSON.stringify({
              task_id: ref_id,
              title: byIdTitle.get(ref_id) || null,
              deadline: deadlineYmd,
              bucket: "on_deadline",
              days_early: 0,
            }),
            created: nowUnix,
            updated: nowUnix,
          });
        }

        if (dryRun) {
          return { scanned: tasks.length, inserted: 0, skipped, willInsert: rows.length, sample: rows.slice(0, 5), dryRun: true };
        }

        let inserted = 0;
        if (rows.length) {
          const result = await db.PerformanceEventLog.bulkCreate(rows, { ignoreDuplicates: true });
          inserted = Array.isArray(result) ? result.length : 0;
        }

        return { inserted, scanned: tasks.length, skipped };
      },
      { ttlSec: 60 }
    );

    if (res?.locked) {
      return jsonResponse({ success: false, rule: "complete-on-deadline", date: eventDate, busy: true }, { status: 423 });
    }

    return jsonResponse({ success: true, rule: "complete-on-deadline", date: eventDate, ...res, ms: Date.now() - t0 });
  } catch (err) {
    console.error("[cron][complete-on-deadline] msg:", err);
    return jsonResponse({ success: false, msg: String(err?.message || err) }, { status: 500 });
  }
}

// ---------- Complete Task H-3 ----------
export async function completeTaskH3(req) {
  const t0 = Date.now();
  const { Op } = db.Sequelize;

  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const dryRun = String(searchParams.get("dryRun") || "").toLowerCase() === "true";

    const eventDate =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : dayjs().tz(TZ).format("YYYY-MM-DD");

    const periodYear = Number(dayjs(eventDate).year());
    const periodMonth = Number(dayjs(eventDate).month() + 1);
    const periodStart = dayjs(eventDate).startOf("month").format("YYYY-MM-DD");

    const targetDeadline = dayjs(eventDate).add(3, "day").format("YYYY-MM-DD");
    const deadlineStartUnix = dayjs.tz(targetDeadline, TZ).startOf("day").unix();
    const deadlineEndUnix = dayjs.tz(targetDeadline, TZ).endOf("day").unix();

    const dayStart = dayjs.tz(eventDate, TZ).startOf("day").unix();
    const dayEnd = dayjs.tz(eventDate, TZ).endOf("day").unix();

    const res = await withCronLock(
      `perf-complete-h3-${eventDate}`,
      async () => {
        const tasks = await db.Task.findAll({
          where: {
            todo: { [Op.in]: ["done", "completed", "approved_ae"] },
            updated: { [Op.between]: [dayStart, dayEnd] },
            end_date: { [Op.between]: [deadlineStartUnix, deadlineEndUnix] },
          },
          attributes: ["task_id", "title", "end_date"],
          raw: true,
        });

        if (!tasks.length) {
          return { inserted: 0, scanned: 0, skipped: 0, note: "no tasks completed H-3" };
        }

        const taskIds = tasks.map((t) => t.task_id);

        const assigns = await db.TaskAssignment.findAll({
          where: { task_id: { [Op.in]: taskIds } },
          attributes: ["task_id", "user_id"],
          raw: true,
        });

        if (!assigns.length) {
          return { inserted: 0, scanned: tasks.length, skipped: 0, note: "no assignees" };
        }

        const usersByTask = new Map();
        for (const a of assigns) {
          if (!a.user_id) continue;
          if (!usersByTask.has(a.task_id)) usersByTask.set(a.task_id, []);
          usersByTask.get(a.task_id).push(a.user_id);
        }

        const allRefPairs = [];
        for (const t of tasks) {
          const users = usersByTask.get(t.task_id) || [];
          for (const uid of users) allRefPairs.push({ user_id: uid, ref_id: t.task_id });
        }

        if (!allRefPairs.length) {
          return { inserted: 0, scanned: tasks.length, skipped: 0, note: "no assignees after mapping" };
        }

        const refIds = [...new Set(allRefPairs.map((p) => p.ref_id))];

        const existing = await db.PerformanceEventLog.findAll({
          where: { perf_config_id: 9, event_date: eventDate, ref_id: { [Op.in]: refIds } },
          attributes: ["ref_id", "user_id"],
          raw: true,
        });
        const existed = new Set(existing.map((e) => `${e.user_id}:${e.ref_id}`));

        const byIdTitle = new Map(tasks.map((t) => [t.task_id, t.title]));
        const byIdDeadline = new Map(tasks.map((t) => [t.task_id, t.end_date]));

        const nowUnix = nowUnixUTC();
        const rows = [];
        let skipped = 0;

        for (const { user_id, ref_id } of allRefPairs) {
          const key = `${user_id}:${ref_id}`;
          if (existed.has(key)) {
            skipped++;
            continue;
          }

          const deadlineUnix = byIdDeadline.get(ref_id);
          const deadlineYmd = deadlineUnix ? dayjs.unix(deadlineUnix).tz(TZ).format("YYYY-MM-DD") : null;

          rows.push({
            user_id,
            event_date: eventDate,
            period_year: periodYear,
            period_month: periodMonth,
            period_start_date: periodStart,
            perf_config_id: 9,
            score_value: 2,
            source: "task",
            ref_id,
            note: `Complete Task H-3: [#${ref_id}] ${byIdTitle.get(ref_id) || "(no title)"} — deadline ${deadlineYmd}`,
            meta: JSON.stringify({
              task_id: ref_id,
              title: byIdTitle.get(ref_id) || null,
              deadline: deadlineYmd,
              bucket: "early",
              days_early: 3,
            }),
            created: nowUnix,
            updated: nowUnix,
          });
        }

        if (dryRun) {
          return { scanned: tasks.length, inserted: 0, skipped, willInsert: rows.length, sample: rows.slice(0, 5), dryRun: true };
        }

        let inserted = 0;
        if (rows.length) {
          const result = await db.PerformanceEventLog.bulkCreate(rows, { ignoreDuplicates: true });
          inserted = Array.isArray(result) ? result.length : 0;
        }

        return { inserted, scanned: tasks.length, skipped };
      },
      { ttlSec: 60 }
    );

    if (res?.locked) {
      return jsonResponse({ success: false, rule: "complete-h3", date: eventDate, busy: true }, { status: 423 });
    }

    return jsonResponse({ success: true, rule: "complete-h3", date: eventDate, targetDeadline, ...res, ms: Date.now() - t0 });
  } catch (err) {
    console.error("[cron][complete-h3] msg:", err);
    return jsonResponse({ success: false, msg: String(err?.message || err) }, { status: 500 });
  }
}

// ---------- Complete Task H-7 ----------
export async function completeTaskH7(req) {
  const t0 = Date.now();
  const { Op } = db.Sequelize;

  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const dryRun = String(searchParams.get("dryRun") || "").toLowerCase() === "true";

    const eventDate =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : dayjs().tz(TZ).format("YYYY-MM-DD");

    const targetDeadline = dayjs(eventDate).add(7, "day").format("YYYY-MM-DD");
    const startUnix = dayjs.tz(`${eventDate} 00:00:00`, TZ).unix();
    const endUnix = dayjs.tz(`${eventDate} 23:59:59`, TZ).unix();

    const periodYear = Number(dayjs(eventDate).year());
    const periodMonth = Number(dayjs(eventDate).month() + 1);
    const periodStart = dayjs(eventDate).startOf("month").format("YYYY-MM-DD");

    const res = await withCronLock(`perf-complete-h7-${eventDate}`, async () => {
      const tasks = await db.Task.findAll({
        where: { end_date: targetDeadline, todo: "complete", updated: { [Op.between]: [startUnix, endUnix] } },
        attributes: ["task_id", "title", "end_date", "todo", "updated"],
        raw: true,
      });
      if (!tasks.length) return { inserted: 0, scanned: 0, skipped: 0 };

      const taskIds = tasks.map((t) => t.task_id);
      const assigns = await db.TaskAssignment.findAll({
        where: { task_id: { [Op.in]: taskIds } },
        attributes: ["task_id", "user_id"],
        raw: true,
      });
      if (!assigns.length) return { inserted: 0, scanned: tasks.length, skipped: 0, note: "no assignees" };

      const usersByTask = new Map();
      for (const a of assigns) {
        if (!usersByTask.has(a.task_id)) usersByTask.set(a.task_id, []);
        usersByTask.get(a.task_id).push(a.user_id);
      }

      const pairs = [];
      for (const t of tasks) for (const u of usersByTask.get(t.task_id) || []) pairs.push({ user_id: u, ref_id: t.task_id });

      const refIds = [...new Set(pairs.map((p) => p.ref_id))];
      const existing = await db.PerformanceEventLog.findAll({
        where: { perf_config_id: 8, event_date: eventDate, ref_id: { [Op.in]: refIds } },
        attributes: ["ref_id", "user_id"],
        raw: true,
      });
      const existed = new Set(existing.map((e) => `${e.user_id}:${e.ref_id}`));

      const titleById = new Map(tasks.map((t) => [t.task_id, t.title]));
      const nowUnix = nowUnixUTC();
      const rows = [];
      let skipped = 0;

      for (const { user_id, ref_id } of pairs) {
        const key = `${user_id}:${ref_id}`;
        if (existed.has(key)) {
          skipped++;
          continue;
        }
        rows.push({
          user_id,
          event_date: eventDate,
          period_year: periodYear,
          period_month: periodMonth,
          period_start_date: periodStart,
          perf_config_id: 8,
          score_value: 3,
          source: "task",
          ref_id,
          note: `Complete Task H-7: [#${ref_id}] ${titleById.get(ref_id) || "(no title)"} — deadline ${targetDeadline}`,
          meta: JSON.stringify({
            task_id: ref_id,
            title: titleById.get(ref_id) || null,
            deadline: targetDeadline,
            status: "completed_early",
            days_early: 7,
            bucket: "early",
          }),
          created: nowUnix,
          updated: nowUnix,
        });
      }

      if (dryRun) {
        return { inserted: 0, scanned: tasks.length, skipped, willInsert: rows.length, sample: rows.slice(0, 5), dryRun: true };
      }

      let inserted = 0;
      if (rows.length) {
        const result = await db.PerformanceEventLog.bulkCreate(rows, { ignoreDuplicates: true });
        inserted = Array.isArray(result) ? result.length : 0;
      }
      return { inserted, scanned: tasks.length, skipped };
    }, { ttlSec: 60 });

    if (res?.locked) {
      return jsonResponse({ success: false, rule: "complete-h7", date: eventDate, busy: true }, { status: 423 });
    }

    return jsonResponse({ success: true, rule: "complete-h7", date: eventDate, targetDeadline, ...res, ms: Date.now() - t0 });
  } catch (err) {
    console.error("[cron][complete-h7] msg:", err);
    return jsonResponse({ success: false, msg: String(err?.message || err) }, { status: 500 });
  }
}

// ---------- Complete Overdue Task ----------
export async function completeOverdueTask(req) {
  const t0 = Date.now();
  const { Op } = db.Sequelize;

  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const dryRun = String(searchParams.get("dryRun") || "").toLowerCase() === "true";

    const eventDate =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : dayjs().tz(TZ).format("YYYY-MM-DD");

    const periodYear = Number(dayjs(eventDate).year());
    const periodMonth = Number(dayjs(eventDate).month() + 1);
    const periodStart = dayjs(eventDate).startOf("month").format("YYYY-MM-DD");

    const dayStart = dayjs.tz(eventDate, TZ).startOf("day").unix();
    const dayEnd = dayjs.tz(eventDate, TZ).endOf("day").unix();

    const res = await withCronLock(
      `perf-complete-overdue-${eventDate}`,
      async () => {
        const tasks = await db.Task.findAll({
          where: {
            todo: { [Op.in]: ["done", "completed", "approved_ae"] },
            updated: { [Op.between]: [dayStart, dayEnd] },
            end_date: { [Op.lt]: dayStart },
          },
          attributes: ["task_id", "title", "end_date"],
          raw: true,
        });

        if (!tasks.length) {
          return { inserted: 0, scanned: 0, skipped: 0, note: "no overdue tasks completed on this date" };
        }

        const taskIds = tasks.map((t) => t.task_id);
        const assigns = await db.TaskAssignment.findAll({
          where: { task_id: { [Op.in]: taskIds } },
          attributes: ["task_id", "user_id"],
          raw: true,
        });

        if (!assigns.length) {
          return { inserted: 0, scanned: tasks.length, skipped: 0, note: "no assignees" };
        }

        const usersByTask = new Map();
        for (const a of assigns) {
          if (!a.user_id) continue;
          if (!usersByTask.has(a.task_id)) usersByTask.set(a.task_id, []);
          usersByTask.get(a.task_id).push(a.user_id);
        }

        const allRefPairs = [];
        for (const t of tasks) {
          const users = usersByTask.get(t.task_id) || [];
          for (const uid of users) allRefPairs.push({ user_id: uid, ref_id: t.task_id });
        }

        if (!allRefPairs.length) {
          return { inserted: 0, scanned: tasks.length, skipped: 0, note: "no assignees after mapping" };
        }

        const refIds = [...new Set(allRefPairs.map((p) => p.ref_id))];

        const existing = await db.PerformanceEventLog.findAll({
          where: { perf_config_id: 6, event_date: eventDate, ref_id: { [Op.in]: refIds } },
          attributes: ["ref_id", "user_id"],
          raw: true,
        });
        const existed = new Set(existing.map((e) => `${e.user_id}:${e.ref_id}`));

        const byIdTitle = new Map(tasks.map((t) => [t.task_id, t.title]));
        const byIdDeadline = new Map(tasks.map((t) => [t.task_id, t.end_date]));

        const nowUnix = nowUnixUTC();
        const rows = [];
        let skipped = 0;

        for (const { user_id, ref_id } of allRefPairs) {
          const key = `${user_id}:${ref_id}`;
          if (existed.has(key)) {
            skipped++;
            continue;
          }

          const deadlineUnix = byIdDeadline.get(ref_id);
          const deadlineYmd = deadlineUnix ? dayjs.unix(deadlineUnix).tz(TZ).format("YYYY-MM-DD") : null;

          rows.push({
            user_id,
            event_date: eventDate,
            period_year: periodYear,
            period_month: periodMonth,
            period_start_date: periodStart,
            perf_config_id: 6,
            score_value: -2,
            source: "task",
            ref_id,
            note: `Complete Overdue Task: [#${ref_id}] ${byIdTitle.get(ref_id) || "(no title)"} — deadline ${deadlineYmd}`,
            meta: JSON.stringify({
              task_id: ref_id,
              title: byIdTitle.get(ref_id) || null,
              deadline: deadlineYmd,
              bucket: "overdue",
            }),
            created: nowUnix,
            updated: nowUnix,
          });
        }

        if (dryRun) {
          return { scanned: tasks.length, inserted: 0, skipped, willInsert: rows.length, sample: rows.slice(0, 5), dryRun: true };
        }

        let inserted = 0;
        if (rows.length) {
          const result = await db.PerformanceEventLog.bulkCreate(rows, { ignoreDuplicates: true });
          inserted = Array.isArray(result) ? result.length : 0;
        }

        return { inserted, scanned: tasks.length, skipped };
      },
      { ttlSec: 60 }
    );

    if (res?.locked) {
      return jsonResponse({ success: false, rule: "complete-overdue", date: eventDate, busy: true }, { status: 423 });
    }

    return jsonResponse({ success: true, rule: "complete-overdue", date: eventDate, ...res, ms: Date.now() - t0 });
  } catch (err) {
    console.error("[cron][complete-overdue] msg:", err);
    return jsonResponse({ success: false, msg: String(err?.message || err) }, { status: 500 });
  }
}

// ---------- Missed Deadline H+1 ----------
export async function missedDeadlineH1(req) {
  const t0 = Date.now();
  const { Op } = db.Sequelize;

  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const dryRun = String(searchParams.get("dryRun") || "").toLowerCase() === "true";

    const eventDate =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : dayjs().tz(TZ).format("YYYY-MM-DD");

    const periodYear = Number(dayjs(eventDate).year());
    const periodMonth = Number(dayjs(eventDate).month() + 1);
    const periodStart = dayjs(eventDate).startOf("month").format("YYYY-MM-DD");

    const targetDeadline = dayjs(eventDate).subtract(1, "day").format("YYYY-MM-DD");
    const deadlineStartUnix = dayjs.tz(targetDeadline, TZ).startOf("day").unix();
    const deadlineEndUnix = dayjs.tz(targetDeadline, TZ).endOf("day").unix();

    const res = await withCronLock(
      `perf-missed-deadline-h1-${eventDate}`,
      async () => {
        const tasks = await db.Task.findAll({
          where: {
            end_date: { [Op.between]: [deadlineStartUnix, deadlineEndUnix] },
            todo: { [Op.notIn]: ["done", "completed", "approved_ae", "cancel"] },
          },
          attributes: ["task_id", "title", "end_date", "todo", "is_overdue"],
          raw: true,
        });

        if (!tasks.length) {
          return { inserted: 0, scanned: 0, skipped: 0, note: "no missed-deadline tasks (H+1) for this date" };
        }

        const taskIds = tasks.map((t) => t.task_id);

        let overdueMarked = 0;
        if (!dryRun) {
          const [affected] = await db.Task.update(
            { is_overdue: "true" },
            {
              where: {
                task_id: { [Op.in]: taskIds },
                [Op.or]: [{ is_overdue: null }, { is_overdue: { [Op.ne]: "true" } }],
              },
            }
          );
          overdueMarked = affected || 0;
        }

        const assigns = await db.TaskAssignment.findAll({
          where: { task_id: { [Op.in]: taskIds } },
          attributes: ["task_id", "user_id"],
          raw: true,
        });

        if (!assigns.length) {
          return { inserted: 0, scanned: tasks.length, skipped: 0, overdueMarked, note: "no assignees" };
        }

        const usersByTask = new Map();
        for (const a of assigns) {
          if (!a.user_id) continue;
          if (!usersByTask.has(a.task_id)) usersByTask.set(a.task_id, []);
          usersByTask.get(a.task_id).push(a.user_id);
        }

        const allRefPairs = [];
        for (const t of tasks) {
          const users = usersByTask.get(t.task_id) || [];
          for (const uid of users) allRefPairs.push({ user_id: uid, ref_id: t.task_id });
        }

        if (!allRefPairs.length) {
          return { inserted: 0, scanned: tasks.length, skipped: 0, overdueMarked, note: "no assignees after mapping" };
        }

        const refIds = [...new Set(allRefPairs.map((p) => p.ref_id))];

        const existing = await db.PerformanceEventLog.findAll({
          where: { perf_config_id: 2, event_date: eventDate, ref_id: { [Op.in]: refIds } },
          attributes: ["ref_id", "user_id"],
          raw: true,
        });
        const existed = new Set(existing.map((e) => `${e.user_id}:${e.ref_id}`));

        const byIdTitle = new Map(tasks.map((t) => [t.task_id, t.title]));
        const byIdDeadline = new Map(tasks.map((t) => [t.task_id, t.end_date]));

        const nowUnix = nowUnixUTC();
        const rows = [];
        let skipped = 0;

        for (const { user_id, ref_id } of allRefPairs) {
          const key = `${user_id}:${ref_id}`;
          if (existed.has(key)) {
            skipped++;
            continue;
          }

          const deadlineUnix = byIdDeadline.get(ref_id);
          const deadlineYmd = deadlineUnix ? dayjs.unix(deadlineUnix).tz(TZ).format("YYYY-MM-DD") : null;

          rows.push({
            user_id,
            event_date: eventDate,
            period_year: periodYear,
            period_month: periodMonth,
            period_start_date: periodStart,
            perf_config_id: 2,
            score_value: -3,
            source: "task",
            ref_id,
            note: `Missed Deadline H+1: [#${ref_id}] ${byIdTitle.get(ref_id) || "(no title)"} — deadline ${deadlineYmd}`,
            meta: JSON.stringify({
              task_id: ref_id,
              title: byIdTitle.get(ref_id) || null,
              deadline: deadlineYmd,
              bucket: "late",
              days_late: 1,
            }),
            created: nowUnix,
            updated: nowUnix,
          });
        }

        if (dryRun) {
          return { scanned: tasks.length, inserted: 0, skipped, willInsert: rows.length, sample: rows.slice(0, 5), dryRun: true, overdueMarked };
        }

        let inserted = 0;
        if (rows.length) {
          const result = await db.PerformanceEventLog.bulkCreate(rows, { ignoreDuplicates: true });
          inserted = Array.isArray(result) ? result.length : 0;
        }

        return { inserted, scanned: tasks.length, skipped, overdueMarked };
      },
      { ttlSec: 60 }
    );

    if (res?.locked) {
      return jsonResponse({ success: false, rule: "missed-deadline-h1", date: eventDate, busy: true }, { status: 423 });
    }

    return jsonResponse({ success: true, rule: "missed-deadline-h1", date: eventDate, targetDeadline, ...res, ms: Date.now() - t0 });
  } catch (err) {
    console.error("[cron][missed-deadline-h1] msg:", err);
    return jsonResponse({ success: false, msg: String(err?.message || err) }, { status: 500 });
  }
}

// ---------- Missed Deadline H+3 ----------
export async function missedDeadlineH3(req) {
  const t0 = Date.now();
  const { Op } = db.Sequelize;

  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const dryRun = String(searchParams.get("dryRun") || "").toLowerCase() === "true";

    const eventDate =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : dayjs().tz(TZ).format("YYYY-MM-DD");

    const periodYear = Number(dayjs(eventDate).year());
    const periodMonth = Number(dayjs(eventDate).month() + 1);
    const periodStart = dayjs(eventDate).startOf("month").format("YYYY-MM-DD");

    const targetDeadline = dayjs(eventDate).subtract(3, "day").format("YYYY-MM-DD");
    const deadlineStartUnix = dayjs.tz(targetDeadline, TZ).startOf("day").unix();
    const deadlineEndUnix = dayjs.tz(targetDeadline, TZ).endOf("day").unix();

    const res = await withCronLock(
      `perf-missed-deadline-h3-${eventDate}`,
      async () => {
        const tasks = await db.Task.findAll({
          where: {
            end_date: { [Op.between]: [deadlineStartUnix, deadlineEndUnix] },
            todo: { [Op.notIn]: ["done", "completed", "approved_ae", "cancel"] },
          },
          attributes: ["task_id", "title", "end_date", "todo", "is_overdue"],
          raw: true,
        });

        if (!tasks.length) {
          return { inserted: 0, scanned: 0, skipped: 0, note: "no missed-deadline tasks (H+3) for this date" };
        }

        const taskIds = tasks.map((t) => t.task_id);

        let overdueMarked = 0;
        if (!dryRun) {
          const [affected] = await db.Task.update(
            { is_overdue: "true" },
            {
              where: {
                task_id: { [Op.in]: taskIds },
                [Op.or]: [{ is_overdue: null }, { is_overdue: { [Op.ne]: "true" } }],
              },
            }
          );
          overdueMarked = affected || 0;
        }

        const assigns = await db.TaskAssignment.findAll({
          where: { task_id: { [Op.in]: taskIds } },
          attributes: ["task_id", "user_id"],
          raw: true,
        });

        if (!assigns.length) {
          return { inserted: 0, scanned: tasks.length, skipped: 0, overdueMarked, note: "no assignees" };
        }

        const usersByTask = new Map();
        for (const a of assigns) {
          if (!a.user_id) continue;
          if (!usersByTask.has(a.task_id)) usersByTask.set(a.task_id, []);
          usersByTask.get(a.task_id).push(a.user_id);
        }

        const allRefPairs = [];
        for (const t of tasks) {
          const users = usersByTask.get(t.task_id) || [];
          for (const uid of users) allRefPairs.push({ user_id: uid, ref_id: t.task_id });
        }

        if (!allRefPairs.length) {
          return { inserted: 0, scanned: tasks.length, skipped: 0, overdueMarked, note: "no assignees after mapping" };
        }

        const refIds = [...new Set(allRefPairs.map((p) => p.ref_id))];

        const existing = await db.PerformanceEventLog.findAll({
          where: { perf_config_id: 3, event_date: eventDate, ref_id: { [Op.in]: refIds } },
          attributes: ["ref_id", "user_id"],
          raw: true,
        });
        const existed = new Set(existing.map((e) => `${e.user_id}:${e.ref_id}`));

        const byIdTitle = new Map(tasks.map((t) => [t.task_id, t.title]));
        const byIdDeadline = new Map(tasks.map((t) => [t.task_id, t.end_date]));

        const nowUnix = nowUnixUTC();
        const rows = [];
        let skipped = 0;

        for (const { user_id, ref_id } of allRefPairs) {
          const key = `${user_id}:${ref_id}`;
          if (existed.has(key)) {
            skipped++;
            continue;
          }

          const deadlineUnix = byIdDeadline.get(ref_id);
          const deadlineYmd = deadlineUnix ? dayjs.unix(deadlineUnix).tz(TZ).format("YYYY-MM-DD") : null;

          rows.push({
            user_id,
            event_date: eventDate,
            period_year: periodYear,
            period_month: periodMonth,
            period_start_date: periodStart,
            perf_config_id: 3,
            score_value: -4,
            source: "task",
            ref_id,
            note: `Missed Deadline H+3: [#${ref_id}] ${byIdTitle.get(ref_id) || "(no title)"} — deadline ${deadlineYmd}`,
            meta: JSON.stringify({
              task_id: ref_id,
              title: byIdTitle.get(ref_id) || null,
              deadline: deadlineYmd,
              bucket: "late",
              days_late: 3,
            }),
            created: nowUnix,
            updated: nowUnix,
          });
        }

        if (dryRun) {
          return { scanned: tasks.length, inserted: 0, skipped, willInsert: rows.length, sample: rows.slice(0, 5), dryRun: true, overdueMarked };
        }

        let inserted = 0;
        if (rows.length) {
          const result = await db.PerformanceEventLog.bulkCreate(rows, { ignoreDuplicates: true });
          inserted = Array.isArray(result) ? result.length : 0;
        }

        return { inserted, scanned: tasks.length, skipped, overdueMarked };
      },
      { ttlSec: 60 }
    );

    if (res?.locked) {
      return jsonResponse({ success: false, rule: "missed-deadline-h3", date: eventDate, busy: true }, { status: 423 });
    }

    return jsonResponse({ success: true, rule: "missed-deadline-h3", date: eventDate, targetDeadline, ...res, ms: Date.now() - t0 });
  } catch (err) {
    console.error("[cron][missed-deadline-h3] msg:", err);
    return jsonResponse({ success: false, msg: String(err?.message || err) }, { status: 500 });
  }
}

// ---------- Missed Deadline H+7 ----------
export async function missedDeadlineH7(req) {
  const t0 = Date.now();
  const { Op } = db.Sequelize;

  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const dryRun = String(searchParams.get("dryRun") || "").toLowerCase() === "true";

    const eventDate =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : dayjs().tz(TZ).format("YYYY-MM-DD");

    const periodYear = Number(dayjs(eventDate).year());
    const periodMonth = Number(dayjs(eventDate).month() + 1);
    const periodStart = dayjs(eventDate).startOf("month").format("YYYY-MM-DD");

    const targetDeadline = dayjs(eventDate).subtract(7, "day").format("YYYY-MM-DD");
    const deadlineStartUnix = dayjs.tz(targetDeadline, TZ).startOf("day").unix();
    const deadlineEndUnix = dayjs.tz(targetDeadline, TZ).endOf("day").unix();

    const res = await withCronLock(
      `perf-missed-deadline-h7-${eventDate}`,
      async () => {
        const tasks = await db.Task.findAll({
          where: {
            end_date: { [Op.between]: [deadlineStartUnix, deadlineEndUnix] },
            todo: { [Op.notIn]: ["done", "completed", "approved_ae", "cancel"] },
          },
          attributes: ["task_id", "title", "end_date", "todo", "is_overdue"],
          raw: true,
        });

        if (!tasks.length) {
          return { inserted: 0, scanned: 0, skipped: 0, note: "no missed-deadline tasks (H+7) for this date" };
        }

        const taskIds = tasks.map((t) => t.task_id);

        let overdueMarked = 0;
        if (!dryRun) {
          const [affected] = await db.Task.update(
            { is_overdue: "true" },
            {
              where: {
                task_id: { [Op.in]: taskIds },
                [Op.or]: [{ is_overdue: null }, { is_overdue: { [Op.ne]: "true" } }],
              },
            }
          );
          overdueMarked = affected || 0;
        }

        const assigns = await db.TaskAssignment.findAll({
          where: { task_id: { [Op.in]: taskIds } },
          attributes: ["task_id", "user_id"],
          raw: true,
        });

        if (!assigns.length) {
          return { inserted: 0, scanned: tasks.length, skipped: 0, overdueMarked, note: "no assignees" };
        }

        const usersByTask = new Map();
        for (const a of assigns) {
          if (!a.user_id) continue;
          if (!usersByTask.has(a.task_id)) usersByTask.set(a.task_id, []);
          usersByTask.get(a.task_id).push(a.user_id);
        }

        const allRefPairs = [];
        for (const t of tasks) {
          const users = usersByTask.get(t.task_id) || [];
          for (const uid of users) allRefPairs.push({ user_id: uid, ref_id: t.task_id });
        }

        if (!allRefPairs.length) {
          return { inserted: 0, scanned: tasks.length, skipped: 0, overdueMarked, note: "no assignees after mapping" };
        }

        const refIds = [...new Set(allRefPairs.map((p) => p.ref_id))];

        const existing = await db.PerformanceEventLog.findAll({
          where: { perf_config_id: 4, event_date: eventDate, ref_id: { [Op.in]: refIds } },
          attributes: ["ref_id", "user_id"],
          raw: true,
        });
        const existed = new Set(existing.map((e) => `${e.user_id}:${e.ref_id}`));

        const byIdTitle = new Map(tasks.map((t) => [t.task_id, t.title]));
        const byIdDeadline = new Map(tasks.map((t) => [t.task_id, t.end_date]));

        const nowUnix = nowUnixUTC();
        const rows = [];
        let skipped = 0;

        for (const { user_id, ref_id } of allRefPairs) {
          const key = `${user_id}:${ref_id}`;
          if (existed.has(key)) {
            skipped++;
            continue;
          }

          const deadlineUnix = byIdDeadline.get(ref_id);
          const deadlineYmd = deadlineUnix ? dayjs.unix(deadlineUnix).tz(TZ).format("YYYY-MM-DD") : null;

          rows.push({
            user_id,
            event_date: eventDate,
            period_year: periodYear,
            period_month: periodMonth,
            period_start_date: periodStart,
            perf_config_id: 4,
            score_value: -5,
            source: "task",
            ref_id,
            note: `Missed Deadline H+7: [#${ref_id}] ${byIdTitle.get(ref_id) || "(no title)"} — deadline ${deadlineYmd}`,
            meta: JSON.stringify({
              task_id: ref_id,
              title: byIdTitle.get(ref_id) || null,
              deadline: deadlineYmd,
              bucket: "late",
              days_late: 7,
            }),
            created: nowUnix,
            updated: nowUnix,
          });
        }

        if (dryRun) {
          return { scanned: tasks.length, inserted: 0, skipped, willInsert: rows.length, sample: rows.slice(0, 5), dryRun: true, overdueMarked };
        }

        let inserted = 0;
        if (rows.length) {
          const result = await db.PerformanceEventLog.bulkCreate(rows, { ignoreDuplicates: true });
          inserted = Array.isArray(result) ? result.length : 0;
        }

        return { inserted, scanned: tasks.length, skipped, overdueMarked };
      },
      { ttlSec: 60 }
    );

    if (res?.locked) {
      return jsonResponse({ success: false, rule: "missed-deadline-h7", date: eventDate, busy: true }, { status: 423 });
    }

    return jsonResponse({ success: true, rule: "missed-deadline-h7", date: eventDate, targetDeadline, ...res, ms: Date.now() - t0 });
  } catch (err) {
    console.error("[cron][missed-deadline-h7] msg:", err);
    return jsonResponse({ success: false, msg: String(err?.message || err) }, { status: 500 });
  }
}

// ---------- Late To Work ----------
export async function lateToWork(req) {
  const t0 = Date.now();
  const { Op } = db.Sequelize;

  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const dryRun = String(searchParams.get("dryRun") || "").toLowerCase() === "true";

    const eventDate =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : dayjs().tz(TZ).format("YYYY-MM-DD");

    const periodYear = Number(dayjs(eventDate).year());
    const periodMonth = Number(dayjs(eventDate).month() + 1);
    const periodStart = dayjs(eventDate).startOf("month").format("YYYY-MM-DD");

    const dayStart = dayjs.tz(eventDate, TZ).startOf("day").unix();
    const dayEnd = dayjs.tz(eventDate, TZ).endOf("day").unix();

    const res = await withCronLock(
      `perf-late-to-work-${eventDate}`,
      async () => {
        const rows = await db.Attendance.findAll({
          where: {
            date: eventDate,
            clock_in: { [Op.between]: [dayStart, dayEnd] },
            status: "late",
          },
          attributes: ["attendance_id", "user_id", "minutes_late", "clock_in"],
          raw: true,
        });

        if (!rows.length) {
          return { inserted: 0, scanned: 0, skipped: 0, note: "no late attendance" };
        }

        const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];

        const existing = await db.PerformanceEventLog.findAll({
          where: { perf_config_id: 7, event_date: eventDate, user_id: { [Op.in]: userIds } },
          attributes: ["user_id"],
          raw: true,
        });
        const existed = new Set(existing.map((e) => e.user_id));

        const nowUnix = nowUnixUTC();
        const inserts = [];
        let skipped = 0;

        for (const r of rows) {
          if (existed.has(r.user_id)) {
            skipped++;
            continue;
          }

          inserts.push({
            user_id: r.user_id,
            event_date: eventDate,
            period_year: periodYear,
            period_month: periodMonth,
            period_start_date: periodStart,
            perf_config_id: 7,
            score_value: -2,
            source: "attendance",
            ref_id: r.attendance_id,
            note: `Late to Work: ${r.minutes_late || 0} minutes`,
            meta: JSON.stringify({
              attendance_id: r.attendance_id,
              minutes_late: r.minutes_late || 0,
              bucket: "late",
            }),
            created: nowUnix,
            updated: nowUnix,
          });
        }

        if (dryRun) {
          return { scanned: rows.length, inserted: 0, skipped, willInsert: inserts.length, sample: inserts.slice(0, 5), dryRun: true };
        }

        let inserted = 0;
        if (inserts.length) {
          const result = await db.PerformanceEventLog.bulkCreate(inserts, { ignoreDuplicates: true });
          inserted = Array.isArray(result) ? result.length : 0;
        }

        return { inserted, scanned: rows.length, skipped };
      },
      { ttlSec: 60 }
    );

    if (res?.locked) {
      return jsonResponse({ success: false, rule: "late-to-work", date: eventDate, busy: true }, { status: 423 });
    }

    return jsonResponse({ success: true, rule: "late-to-work", date: eventDate, ...res, ms: Date.now() - t0 });
  } catch (err) {
    console.error("[cron][late-to-work] msg:", err);
    return jsonResponse({ success: false, msg: String(err?.message || err) }, { status: 500 });
  }
}

// ---------- Not Filling Timesheet ----------
export async function notFillingTimesheet(req) {
  const t0 = Date.now();
  const { Op } = db.Sequelize;

  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const dryRun = String(searchParams.get("dryRun") || "").toLowerCase() === "true";

    const eventDate =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : dayjs().tz(TZ).format("YYYY-MM-DD");

    const periodYear = Number(dayjs(eventDate).year());
    const periodMonth = Number(dayjs(eventDate).month() + 1);
    const periodStart = dayjs(eventDate).startOf("month").format("YYYY-MM-DD");

    const res = await withCronLock(
      `perf-timesheet-missing-${eventDate}`,
      async () => {
        const timesheets = await db.Timesheet.findAll({
          where: { date: eventDate, deleted: null },
          attributes: ["user_id"],
          raw: true,
        });

        const hasTimesheet = new Set(timesheets.map((t) => t.user_id).filter(Boolean));

        const users = await db.User.findAll({
          where: { deleted: null, status: "active" },
          attributes: ["user_id", "fullname"],
          raw: true,
        });

        const targetUsers = users.filter((u) => !hasTimesheet.has(u.user_id));

        if (!targetUsers.length) {
          return { inserted: 0, scanned: 0, skipped: 0, note: "no users missing timesheet" };
        }

        const userIds = targetUsers.map((u) => u.user_id);

        const existing = await db.PerformanceEventLog.findAll({
          where: { perf_config_id: 1, event_date: eventDate, user_id: { [Op.in]: userIds } },
          attributes: ["user_id"],
          raw: true,
        });
        const existed = new Set(existing.map((e) => e.user_id));

        const nowUnix = nowUnixUTC();
        const inserts = [];
        let skipped = 0;

        for (const u of targetUsers) {
          if (existed.has(u.user_id)) {
            skipped++;
            continue;
          }

          inserts.push({
            user_id: u.user_id,
            event_date: eventDate,
            period_year: periodYear,
            period_month: periodMonth,
            period_start_date: periodStart,
            perf_config_id: 1,
            score_value: -1,
            source: "timesheet",
            ref_id: null,
            note: `Not filling timesheet: ${u.fullname || ""}`,
            meta: JSON.stringify({ bucket: "missing" }),
            created: nowUnix,
            updated: nowUnix,
          });
        }

        if (dryRun) {
          return { scanned: targetUsers.length, inserted: 0, skipped, willInsert: inserts.length, sample: inserts.slice(0, 5), dryRun: true };
        }

        let inserted = 0;
        if (inserts.length) {
          const result = await db.PerformanceEventLog.bulkCreate(inserts, { ignoreDuplicates: true });
          inserted = Array.isArray(result) ? result.length : 0;
        }

        return { inserted, scanned: targetUsers.length, skipped };
      },
      { ttlSec: 60 }
    );

    if (res?.locked) {
      return jsonResponse({ success: false, rule: "timesheet-missing", date: eventDate, busy: true }, { status: 423 });
    }

    return jsonResponse({ success: true, rule: "timesheet-missing", date: eventDate, ...res, ms: Date.now() - t0 });
  } catch (err) {
    console.error("[cron][timesheet-missing] msg:", err);
    return jsonResponse({ success: false, msg: String(err?.message || err) }, { status: 500 });
  }
}
