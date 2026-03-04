import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import db from "@/database/models";

dayjs.extend(utc);
dayjs.extend(tz);

const TZ = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Jakarta";

const toYmd = (d) => dayjs(d).tz(TZ).format("YYYY-MM-DD");

function clampRange(fromStr, toStr) {
  const today = dayjs().tz(TZ).startOf("day");
  let from = fromStr ? dayjs.tz(fromStr, TZ) : today.startOf("week").add(1, "day");
  let to = toStr ? dayjs.tz(toStr, TZ).endOf("day") : today.endOf("week").add(1, "day").endOf("day");
  if (!from.isValid()) from = today.startOf("week").add(1, "day");
  if (!to.isValid()) to = today.endOf("week").add(1, "day").endOf("day");
  if (to.isBefore(from)) to = from.endOf("day");
  return { from: toYmd(from), to: toYmd(to) };
}

function isTruthy(v) {
  return v === true || v === "true" || v === 1 || v === "1";
}

async function qWeeklyBreakdown(userId, from, to) {
  const sql = `
    SELECT
      COALESCE(SUM(e.score_value), 0) AS delta_sum,
      GREATEST(0, LEAST(100, 100 + COALESCE(SUM(e.score_value), 0))) AS final_score,

      SUM(CASE WHEN t='task_complete'  AND b='early'      AND d=7 THEN 1 ELSE 0 END) AS complete_task_h7,
      SUM(CASE WHEN t='task_complete'  AND b='early'      AND d=3 THEN 1 ELSE 0 END) AS complete_task_h3,
      SUM(CASE WHEN t='task_complete'  AND b='early'      AND d=1 THEN 1 ELSE 0 END) AS complete_task_h1,
      SUM(CASE WHEN t='task_complete'  AND b='on_deadline'        THEN 1 ELSE 0 END) AS complete_task,
      SUM(CASE WHEN t='task_complete'  AND b='overdue'            THEN 1 ELSE 0 END) AS complete_overdue_task,
      SUM(CASE WHEN t='attendance_late'                           THEN 1 ELSE 0 END) AS late_to_work,
      SUM(CASE WHEN t='deadline_miss'   AND b='late' AND (d IS NULL OR d=0) THEN 1 ELSE 0 END) AS miss_deadline,
      SUM(CASE WHEN t='deadline_miss'   AND b='late' AND d=3 THEN 1 ELSE 0 END) AS miss_deadline_h3,
      SUM(CASE WHEN t='deadline_miss'   AND b='late' AND d=7 THEN 1 ELSE 0 END) AS miss_deadline_h7,
      SUM(CASE WHEN t='timesheet_missing'                          THEN 1 ELSE 0 END) AS not_filling_timesheet
    FROM (
      SELECT
        pel.score_value,
        JSON_UNQUOTE(JSON_EXTRACT(pc.tags, '$.type'))     AS t,
        JSON_UNQUOTE(JSON_EXTRACT(pc.tags, '$.bucket'))   AS b,
        CAST(JSON_UNQUOTE(JSON_EXTRACT(pc.tags, '$.days')) AS SIGNED) AS d
      FROM performance_event_log pel
      JOIN performance_config pc ON pc.perf_config_id = pel.perf_config_id
      WHERE pel.user_id = :userId
        AND pel.event_date BETWEEN :from AND :to
    ) e;
  `;

  const [rows] = await db.sequelize.query(sql, { replacements: { userId, from, to } });
  const r = Array.isArray(rows) ? rows[0] : rows;
  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  return {
    totalScore: num(r?.final_score),
    breakdown: {
      complete_task_h7: { count: num(r?.complete_task_h7) },
      complete_task_h3: { count: num(r?.complete_task_h3) },
      complete_task_h1: { count: num(r?.complete_task_h1) },
      complete_task: { count: num(r?.complete_task) },
      complete_overdue_task: { count: num(r?.complete_overdue_task) },
      late_to_work: { count: num(r?.late_to_work) },
      miss_deadline: { count: num(r?.miss_deadline) },
      miss_deadline_h3: { count: num(r?.miss_deadline_h3) },
      miss_deadline_h7: { count: num(r?.miss_deadline_h7) },
      not_filling_timesheet: { count: num(r?.not_filling_timesheet) },
    },
  };
}

export async function getPerformanceScore(req, currentUser) {
  if (!currentUser?.user_id) {
    return { httpStatus: 401, msg: "Unauthorized" };
  }

  const { searchParams } = new URL(req.url);

  const staffIdParam = searchParams.get("staffId");
  const isSuperadmin = isTruthy(currentUser?.is_superadmin);

  let effectiveUserId = currentUser.user_id;

  if (isSuperadmin && staffIdParam) {
    const parsed = parseInt(staffIdParam, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      const targetUser = await db.User.findOne({
        where: { user_id: parsed },
        attributes: ["user_id"],
      });

      if (!targetUser) {
        return { httpStatus: 404, msg: "Staff tidak ditemukan" };
      }

      effectiveUserId = targetUser.user_id;
    }
  }

  const { from, to } = clampRange(searchParams.get("from"), searchParams.get("to"));
  const { totalScore, breakdown } = await qWeeklyBreakdown(effectiveUserId, from, to);

  return { user_id: effectiveUserId, period: { from, to }, totalScore, breakdown };
}
