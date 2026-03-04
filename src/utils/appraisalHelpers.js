import db from "@/database/models";
import { nowUnix } from "@/utils/dateHelpers";

const { Sequelize, Appraisal } = db;
const { Op } = Sequelize;

export { nowUnix };

export const isTrue = (v) => v === "true" || v === true || v === 1 || v === "1";

export function parseIntParam(v, def) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export function parseOrder(sortBy, sortDir) {
  const safeField = [
    "created",
    "updated",
    "submitted_at",
    "status",
    "grade",
    "average_score",
    "total_score",
    "title",
  ].includes((sortBy || "").toLowerCase())
    ? sortBy
    : "created";

  const dir = (sortDir || "").toLowerCase() === "asc" ? "ASC" : "DESC";
  return [[safeField, dir]];
}

export function getStaffIdField() {
  const attrs = Appraisal?.rawAttributes || {};
  if (attrs.staff_id) return "staff_id";
  if (attrs.user_id) return "user_id";
  return "staff_id";
}

export function getDepartmentIdField() {
  const attrs = Appraisal?.rawAttributes || {};
  if (attrs.department_id) return "department_id";
  return null;
}

export function buildJsonSearchWhere(q) {
  if (!q) return null;
  const qq = String(q).trim();
  if (!qq) return null;

  return {
    [Op.or]: [
      Sequelize.where(Sequelize.json("staff_snapshot_json.fullname"), {
        [Op.like]: `%${qq}%`,
      }),
      Sequelize.where(Sequelize.json("staff_snapshot_json.email"), {
        [Op.like]: `%${qq}%`,
      }),
      Sequelize.where(Sequelize.json("staff_snapshot_json.phone"), {
        [Op.like]: `%${qq}%`,
      }),
    ],
  };
}

export const RATING_SCALE = {
  1: "Tidak Memuaskan",
  2: "Kurang Memuaskan",
  3: "Cukup Memuaskan",
  4: "Memuaskan",
  5: "Sangat Memuaskan",
};

export function computeGrade(average) {
  const a = Number(average || 0);
  if (a >= 4.1) return "A";
  if (a >= 3.0) return "B";
  if (a >= 2.0) return "C";
  if (a >= 1.1) return "D";
  return "E";
}

export function calcScore(questionsJson, answersJson) {
  const qs = Array.isArray(questionsJson) ? questionsJson : [];
  const ans = answersJson && typeof answersJson === "object" ? answersJson : {};

  let total = 0;
  let answered = 0;

  for (const q of qs) {
    const qid = String(q.question_id);
    const raw = ans[qid];
    const v = raw && typeof raw === "object" ? raw.value : raw;

    const n = v == null || v === "" ? NaN : Number(v);
    if (Number.isFinite(n)) {
      total += n;
      answered += 1;
    }
  }

  const count = qs.length || 0;
  const avg = count ? total / count : 0;

  return {
    total_score: Number(total.toFixed(2)),
    average_score: Number(avg.toFixed(3)),
    grade: computeGrade(avg),
    answered_count: answered,
    question_count: count,
  };
}

export function requireAllAnswered(questionsJson, answersJson) {
  const qs = Array.isArray(questionsJson) ? questionsJson : [];
  const ans = answersJson && typeof answersJson === "object" ? answersJson : {};

  for (const q of qs) {
    const qid = String(q.question_id);
    const raw = ans[qid];
    const v = raw && typeof raw === "object" ? raw.value : raw;

    const n = v == null || v === "" ? NaN : Number(v);
    if (!Number.isFinite(n) || n < 1 || n > 5) {
      return { ok: false, missing: qid };
    }
  }

  return { ok: true };
}

export function buildEmptyAnswers(questions) {
  const out = {};
  for (const q of questions || []) {
    out[String(q.question_id)] = { value: null, note: "" };
  }
  return out;
}
