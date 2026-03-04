import { isFlagTrue } from "@/utils/roleFlags";
import {
  findActiveAnnualQuestions,
  findActiveAnnualQuestionsForList,
  findAnnualPeriodByYear,
  findAnnualPeriodByYearRaw,
  findAnnualAssessmentByStaffYear,
  findAnnualAssessmentByStaffYearRaw,
  findAnnualAssessmentById,
  createAnnualAssessment,
  updateAnnualAssessmentInstance,
  findHodByDepartmentId,
  findHrdUser,
  findOperationalDirectorUser,
  findUsersByIds,
  listAnnualAssessmentsByHod,
  findAnnualAssessmentForHodDetail,
  listAnnualAssessmentsByPeriod,
  findLatestAnnualAssessmentByStaff,
  findAnnualQuestionsForSnapshot,
} from "@/server/queries/annualAssestmentQueries";

function safeToPlain(val, fallback) {
  try {
    if (val == null) return fallback;
    if (typeof val === "object") return val;
    return JSON.parse(String(val));
  } catch {
    return fallback;
  }
}

function toPlainRow(row) {
  if (!row) return row;
  return typeof row.toJSON === "function" ? row.toJSON() : row;
}

function safeObj(val, fallback = null) {
  try {
    if (val == null) return fallback;
    if (typeof val === "object") return val;
    return JSON.parse(String(val));
  } catch {
    return fallback;
  }
}

function normalizePayload(payload) {
  const p = safeObj(payload, null) || payload;
  if (!p || typeof p !== "object") return { answers: {} };
  if (!p.answers || typeof p.answers !== "object") return { answers: {} };
  return { answers: p.answers };
}

function getPeriodState(periodRow, now) {
  if (!periodRow) return { configured: false, isOpen: false };
  const openAt = Number(periodRow.open_at);
  const closeAt = Number(periodRow.close_at);
  const isOpen = Number.isFinite(openAt) && Number.isFinite(closeAt) && now >= openAt && now <= closeAt;
  return { configured: true, isOpen, openAt, closeAt };
}

function getRunningPeriod() {
  const year = new Date().getFullYear();
  return { periodFromYear: year - 1, periodToYear: year };
}

async function resolveApprovers({ currentUser }) {
  let hrdId = null;
  let dirId = null;

  try {
    const hrd = await findHrdUser();
    if (hrd?.user_id) hrdId = Number(hrd.user_id) || null;
  } catch {
    // ignore
  }

  try {
    const dir = await findOperationalDirectorUser();
    if (dir?.user_id) dirId = Number(dir.user_id) || null;
  } catch {
    // ignore
  }

  if (!hrdId && isFlagTrue(currentUser?.is_hrd)) {
    hrdId = Number(currentUser?.user_id || 0) || null;
  }

  if (!dirId && isFlagTrue(currentUser?.is_director_operational)) {
    dirId = Number(currentUser?.user_id || 0) || null;
  }

  return { hrdId, dirId };
}

function canSubmitStatus(status) {
  return status === "draft";
}

function canApproveStatus(status) {
  return status === "submitted_by_staff";
}

function normalizeStatus(val) {
  return String(val || "").toLowerCase();
}

function computeApprovalSummary(row) {
  const needHod = Number(row?.hod_id || 0) > 0;
  const needHrd = Number(row?.hrd_id || 0) > 0;
  const needDir = Number(row?.operational_director_id || 0) > 0;

  const stHod = normalizeStatus(row?.approval_hod_status || "pending");
  const stHrd = normalizeStatus(row?.approval_hrd_status || "pending");
  const stDir = normalizeStatus(row?.approval_operational_director_status || "pending");

  const rejected = stHod === "rejected" || stHrd === "rejected" || stDir === "rejected";
  const approved =
    (!needHod || stHod === "approved") &&
    (!needHrd || stHrd === "approved") &&
    (!needDir || stDir === "approved");

  return { needHod, needHrd, needDir, stHod, stHrd, stDir, rejected, approved };
}

function computeOverallStatus(row) {
  if (row?.status === "draft") return "draft";
  const summary = computeApprovalSummary(row);
  if (summary.rejected) return "rejected";
  if (!summary.needHod && !summary.needHrd && !summary.needDir) return "approved";
  if (summary.approved) return "approved";
  return "submitted_by_staff";
}

function getPayloadFromRow(row, kind) {
  if (!row) return null;
  if (kind === "staff") {
    if (row.staff_payload_json && typeof row.staff_payload_json === "object") return row.staff_payload_json;
    return safeObj(row.staff_payload_json, { answers: {} }) || { answers: {} };
  }
  if (row.hod_payload_json == null) return null;
  if (row.hod_payload_json && typeof row.hod_payload_json === "object") return row.hod_payload_json;
  return safeObj(row.hod_payload_json, null);
}

async function buildQuestionsSnapshot() {
  const rows = await findActiveAnnualQuestions();
  return (rows || []).map((q) => ({
    section_key: q.section_key,
    question_key: q.question_key,
    title: q.title,
    description: q.description,
    input_type: q.input_type,
    options_json: q.options_json,
    scale_min: q.scale_min,
    scale_max: q.scale_max,
    sort_order: q.sort_order,
  }));
}

async function loadQuestionsSnapshotFull(assestmentRow) {
  if (Array.isArray(assestmentRow?.questions_json) && assestmentRow.questions_json.length) {
    return assestmentRow.questions_json;
  }

  const rows = await findAnnualQuestionsForSnapshot();
  return rows.map((q) => ({
    question_id: q.question_id,
    section_key: q.section_key,
    question_key: q.question_key,
    title: q.title,
    description: q.description,
    input_type: q.input_type,
    options_json: q.options_json,
    scale_min: q.scale_min,
    scale_max: q.scale_max,
    sort_order: q.sort_order,
  }));
}

export async function getAnnualAssessmentDraft(req, currentUser) {
  const now = Math.floor(Date.now() / 1000);
  const { searchParams } = new URL(req.url);

  const yearParam = searchParams.get("year");
  const periodToYear = yearParam ? Number(yearParam) : new Date().getFullYear();
  if (!Number.isFinite(periodToYear)) return { status: 400, msg: "Invalid year" };

  const periodFromYear = periodToYear - 1;
  const periodRow = await findAnnualPeriodByYear(periodToYear);
  const periodState = getPeriodState(periodRow, now);

  let row = await findAnnualAssessmentByStaffYear(currentUser.user_id, periodToYear);

  if (!row) {
    const privileged = isFlagTrue(currentUser?.is_superadmin) || isFlagTrue(currentUser?.is_hrd);

    if (!periodState.configured && !privileged) {
      return {
        status: 400,
        msg: `Assessment period is not configured for year ${periodToYear}. Please contact HRD.`,
        meta: { year: periodToYear },
      };
    }

    if (periodState.configured && !periodState.isOpen && !privileged) {
      const msg = now < periodState.openAt ? "Assessment period is not open yet." : "Assessment period is closed.";
      return {
        status: 400,
        msg,
        meta: { year: periodToYear, openAt: periodState.openAt, closeAt: periodState.closeAt, now },
      };
    }

    let hodId = null;
    if (currentUser.department_id) {
      const hod = await findHodByDepartmentId(currentUser.department_id);
      hodId = hod ? hod.user_id : null;
    }

    const { hrdId, dirId } = await resolveApprovers({ currentUser });

    const questionsSnapshot = await buildQuestionsSnapshot();

    row = await createAnnualAssessment({
      period_from_year: periodFromYear,
      period_to_year: periodToYear,
      staff_id: currentUser.user_id,
      hod_id: hodId,
      hrd_id: hrdId || null,
      operational_director_id: dirId || null,
      status: "draft",
      questions_json: questionsSnapshot,
      staff_answers_json: {},
      hod_answers_json: null,
      staff_payload_json: { answers: {} },
      hod_payload_json: null,
      created: now,
      created_by: currentUser.user_id,
      updated: now,
      updated_by: currentUser.user_id,
    });

    return { data: row, meta: { period: periodRow, periodState } };
  }

  const updates = {};
  if (!row.questions_json) updates.questions_json = await buildQuestionsSnapshot();
  if (!row.staff_answers_json) {
    const staffPayload = safeToPlain(row.staff_payload_json, null);
    const staffAns = staffPayload?.answers || null;
    if (staffAns) updates.staff_answers_json = staffAns;
  }
  if (!row.hod_answers_json) {
    const hodPayload = safeToPlain(row.hod_payload_json, null);
    const hodAns = hodPayload?.answers || null;
    if (hodAns) updates.hod_answers_json = hodAns;
  }
  if (!row.staff_payload_json) updates.staff_payload_json = { answers: {} };

  if (Object.keys(updates).length) {
    updates.updated = now;
    updates.updated_by = currentUser.user_id;
    await updateAnnualAssessmentInstance(row, updates);
  }

  return { data: row, meta: { period: periodRow, periodState } };
}

export async function submitAnnualAssessment(req, currentUser) {
  const now = Math.floor(Date.now() / 1000);
  const { searchParams } = new URL(req.url);
  const body = await req.json();

  const yearParam = body?.year ?? searchParams.get("year");
  const periodToYear = yearParam ? Number(yearParam) : new Date().getFullYear();
  if (!Number.isFinite(periodToYear)) return { status: 400, msg: "Invalid year" };
  const periodFromYear = periodToYear - 1;

  const staffId = Number(currentUser?.user_id);
  if (!Number.isFinite(staffId)) return { status: 401, msg: "Unauthorized" };

  const privileged = isFlagTrue(currentUser?.is_superadmin) || isFlagTrue(currentUser?.is_hrd);
  const periodRow = await findAnnualPeriodByYearRaw(periodToYear);
  const periodState = getPeriodState(periodRow, now);

  if (!periodState.configured && !privileged) {
    return {
      status: 400,
      msg: `Assessment period is not configured for year ${periodToYear}. Please contact HRD.`,
      meta: { year: periodToYear },
    };
  }

  if (periodState.configured && !periodState.isOpen && !privileged) {
    const msg = now < periodState.openAt ? "Assessment period is not open yet." : "Assessment period is closed.";
    return {
      status: 400,
      msg,
      meta: { year: periodToYear, openAt: periodState.openAt, closeAt: periodState.closeAt, now },
    };
  }

  const annualAssestmentId = body?.annualAssestmentId != null ? Number(body.annualAssestmentId) : null;
  const payload = normalizePayload(body?.payload);
  const answersOnly = payload?.answers || {};

  let row = null;
  if (Number.isFinite(annualAssestmentId) && annualAssestmentId > 0) {
    row = await findAnnualAssessmentById(annualAssestmentId);
    if (row && Number(row.staff_id) !== staffId) row = null;
  } else {
    row = await findAnnualAssessmentByStaffYear(staffId, periodToYear);
  }

  if (!row) return { status: 404, msg: "Draft not found." };
  if (!canSubmitStatus(row.status)) return { status: 400, msg: "Cannot submit. Current status is not draft." };

  let hodId = row.hod_id || null;
  if (!hodId && currentUser.department_id) {
    const hod = await findHodByDepartmentId(currentUser.department_id);
    hodId = hod ? hod.user_id : null;
  }

  const { hrdId, dirId } = await resolveApprovers({ currentUser });
  const nextHrdId = row.hrd_id || hrdId || null;
  const nextDirId = row.operational_director_id || dirId || null;

  const statusPreview = computeOverallStatus({
    ...toPlainRow(row),
    status: "submitted_by_staff",
    hod_id: hodId,
    hrd_id: nextHrdId,
    operational_director_id: nextDirId,
    approval_hod_status: "pending",
    approval_hrd_status: "pending",
    approval_operational_director_status: "pending",
  });

  await updateAnnualAssessmentInstance(row, {
    period_from_year: row.period_from_year || periodFromYear,
    period_to_year: row.period_to_year || periodToYear,
    staff_payload_json: payload,
    staff_answers_json: answersOnly,
    hod_id: hodId,
    hrd_id: nextHrdId,
    operational_director_id: nextDirId,
    approval_hod_status: "pending",
    approval_hod_at: null,
    approval_hrd_status: "pending",
    approval_hrd_at: null,
    approval_operational_director_status: "pending",
    approval_operational_director_at: null,
    status: statusPreview,
    staff_submitted_at: now,
    staff_submitted_by: staffId,
    updated: now,
    updated_by: staffId,
  });

  return {
    msg: "Submitted.",
    data: {
      annual_assestment_id: row.annual_assestment_id,
      staff_id: row.staff_id,
      hod_id: row.hod_id,
      status: row.status,
      period_from_year: row.period_from_year,
      period_to_year: row.period_to_year,
      staff_submitted_at: row.staff_submitted_at,
    },
    meta: { period: periodRow, periodState },
  };
}

export async function listAnnualAssessmentQuestions() {
  const rows = await findActiveAnnualQuestionsForList();
  const data = rows.map((r) => {
    const x = r.toJSON();
    x.options = safeObj(x.options_json, null);
    return x;
  });
  return { data };
}

export async function getAnnualAssessmentMe(req, currentUser) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const currentYear = new Date().getFullYear();
  const periodToYear = yearParam ? Number(yearParam) : currentYear;
  if (!Number.isFinite(periodToYear)) return { status: 400, msg: "Invalid year" };

  const staffId = Number(currentUser?.user_id);
  if (!Number.isFinite(staffId)) return { status: 401, msg: "Unauthorized" };

  const row = await findAnnualAssessmentByStaffYearRaw(staffId, periodToYear);
  const periodRow = await findAnnualPeriodByYearRaw(periodToYear);

  if (!row) {
    return {
      data: null,
      period: periodRow
        ? {
            year: periodRow.year,
            open_at: periodRow.open_at,
            close_at: periodRow.close_at,
            is_active: periodRow.is_active,
          }
        : null,
    };
  }

  const periodFromYear = Number(row.period_from_year) || periodToYear - 1;
  const periodToYearOut = Number(row.period_to_year) || periodToYear;

  return {
    data: {
      annual_assestment_id: row.annual_assestment_id,
      staff_id: row.staff_id,
      hod_id: row.hod_id,
      status: row.status,
      staff_submitted_at: row.staff_submitted_at || null,
      created: row.created || null,
      period_from_year: periodFromYear,
      period_to_year: periodToYearOut,
    },
    period: periodRow
      ? {
          year: periodRow.year,
          open_at: periodRow.open_at,
          close_at: periodRow.close_at,
          is_active: periodRow.is_active,
        }
      : null,
  };
}

export async function listAnnualAssessmentHod(req, currentUser) {
  if (!isFlagTrue(currentUser?.is_hod)) return { status: 403, msg: "Forbidden" };

  const url = new URL(req.url);
  const yearParam = url.searchParams.get("year");
  const statusParam = url.searchParams.get("status");

  const { periodToYear } = getRunningPeriod();
  const year = yearParam ? Number(yearParam) : periodToYear;
  if (!year || Number.isNaN(year)) return { status: 400, msg: "Invalid year" };

  const normalizedStatus =
    statusParam && String(statusParam).toLowerCase() === "finalized" ? "approved" : statusParam;
  const rows = await listAnnualAssessmentsByHod({
    hodId: currentUser.user_id,
    year,
    status: normalizedStatus,
  });

  const data = rows.map((r) => ({
    annual_assestment_id: r.annual_assestment_id,
    staff_id: r.staff_id,
    hod_id: r.hod_id,
    period_from_year: r.period_from_year,
    period_to_year: r.period_to_year,
    status: r.status,
    staff_submitted_at: r.staff_submitted_at || r.submitted_at || null,
    updated: r.updated || null,
    staff: r.staff
      ? {
          user_id: r.staff.user_id,
          fullname: r.staff.fullname || r.staff.name || null,
          name: r.staff.name || null,
          email: r.staff.email || null,
          department_id: r.staff.department_id ?? null,
        }
      : null,
  }));

  return { data };
}

export async function getAnnualAssessmentHodDetail(req, currentUser) {
  if (!isFlagTrue(currentUser?.is_hod)) return { status: 403, msg: "Forbidden" };

  const url = new URL(req.url);
  const staffIdParam = url.searchParams.get("staffId");
  const staffId = Number(staffIdParam);
  if (!staffId || Number.isNaN(staffId)) return { status: 400, msg: "Invalid staffId" };

  const yearParam = url.searchParams.get("year");
  const { periodToYear } = getRunningPeriod();
  const year = yearParam ? Number(yearParam) : periodToYear;
  if (!year || Number.isNaN(year)) return { status: 400, msg: "Invalid year" };

  const assessment = await findAnnualAssessmentForHodDetail({ staffId, hodId: currentUser.user_id, year });
  if (!assessment) return { status: 404, msg: "Assessment not found" };

  const questions = await loadQuestionsSnapshotFull(assessment);
  const staffPayload = getPayloadFromRow(assessment, "staff") || { answers: {} };
  const hodPayload = getPayloadFromRow(assessment, "hod");

  const staff = assessment.staff
    ? {
        user_id: assessment.staff.user_id,
        fullname: assessment.staff.fullname || assessment.staff.name || null,
        name: assessment.staff.name || null,
        email: assessment.staff.email || null,
        department_id: assessment.staff.department_id ?? null,
      }
    : { user_id: staffId, fullname: null, name: null, email: null, department_id: null };

  const assessmentSlim = {
    annual_assestment_id: assessment.annual_assestment_id,
    staff_id: assessment.staff_id,
    hod_id: assessment.hod_id,
    period_from_year: assessment.period_from_year,
    period_to_year: assessment.period_to_year,
    status: assessment.status,
    staff_submitted_at: assessment.staff_submitted_at || assessment.submitted_at || null,
    hod_submitted_at: assessment.hod_submitted_at || null,
    created: assessment.created || null,
    updated: assessment.updated || null,
  };

  return {
    data: {
      staff,
      assessment: assessmentSlim,
      questions,
      staffPayload,
      hodPayload,
    },
  };
}

export async function submitAnnualAssessmentHod(req, currentUser, notifier) {
  if (!isFlagTrue(currentUser?.is_hod)) return { status: 403, msg: "Forbidden" };

  const body = await req.json();
  const staffId = Number(body?.staffId);
  if (!staffId || Number.isNaN(staffId)) return { status: 400, msg: "Invalid staffId" };

  const payload = normalizePayload(body?.payload);

  const year = new Date().getFullYear();
  const periodToYear = year;

  const row = await findAnnualAssessmentForHodDetail({ staffId, hodId: currentUser.user_id, year: periodToYear });
  if (!row) return { status: 404, msg: "Assessment not found" };

  if (!canApproveStatus(row.status)) {
    return { status: 400, msg: "Cannot approve. Staff has not submitted yet." };
  }

  if (String(row.approval_hod_status || "").toLowerCase() === "approved") {
    return { status: 400, msg: "Already approved." };
  }

  const now = Math.floor(Date.now() / 1000);
  const answersOnly = payload?.answers || {};

  const statusPreview = computeOverallStatus({
    ...toPlainRow(row),
    approval_hod_status: "approved",
  });

  await updateAnnualAssessmentInstance(row, {
    hod_payload_json: payload,
    hod_answers_json: answersOnly,
    approval_hod_status: "approved",
    approval_hod_at: now,
    status: statusPreview,
    hod_submitted_at: now,
    hod_submitted_by: currentUser.user_id,
    updated: now,
    updated_by: currentUser.user_id,
  });

  let staffUser = null;
  let hodUser = null;
  try {
    const users = await findUsersByIds([staffId, currentUser.user_id]);
    users.forEach((u) => {
      if (u.user_id === staffId) staffUser = u;
      if (u.user_id === currentUser.user_id) hodUser = u;
    });
  } catch {
    // ignore
  }

  if (notifier && notifier.sendNotification) {
    try {
      await notifier.sendNotification({
        type: "annual_assessment_finalized",
        title: "Annual Review Approved",
        msg: "Your annual review has been approved. Please check the PDF.",
        toUserId: staffUser?.user_id || staffId,
        meta: { year: periodToYear },
        fromUserId: hodUser?.user_id || null,
      });
    } catch (e) {
      console.error("annual_assestment hod submit notifier msg:", e);
    }
  }

  return {
    msg: statusPreview === "approved" ? "Approved. PDF is ready." : "Approved. Waiting for other approvals.",
    data: {
      annual_assestment_id: row.annual_assestment_id,
      staff_id: row.staff_id,
      hod_id: row.hod_id,
      status: row.status,
      period_to_year: row.period_to_year,
      hod_submitted_at: row.hod_submitted_at,
    },
  };
}

export async function submitAnnualAssessmentApproval(req, currentUser) {
  const body = await req.json();
  const action = String(body?.action || "approve").toLowerCase();
  if (!["approve", "reject"].includes(action)) return { status: 400, msg: "Invalid action." };

  const yearParam = body?.year;
  const periodToYear = yearParam ? Number(yearParam) : new Date().getFullYear();
  if (!Number.isFinite(periodToYear)) return { status: 400, msg: "Invalid year." };

  const annualAssestmentId = body?.annualAssestmentId != null ? Number(body.annualAssestmentId) : null;
  const staffId = body?.staffId != null ? Number(body.staffId) : null;

  let row = null;
  if (Number.isFinite(annualAssestmentId) && annualAssestmentId > 0) {
    row = await findAnnualAssessmentById(annualAssestmentId);
  } else if (Number.isFinite(staffId) && staffId > 0) {
    row = await findAnnualAssessmentByStaffYear(staffId, periodToYear);
  }

  if (!row) return { status: 404, msg: "Assessment not found." };

  if (!canApproveStatus(row.status)) {
    return { status: 400, msg: "Cannot approve. Staff has not submitted yet." };
  }

  const isSuperadmin = isFlagTrue(currentUser?.is_superadmin);
  const isHrd = isFlagTrue(currentUser?.is_hrd);
  const isDirector = isFlagTrue(currentUser?.is_director_operational);

  const uid = Number(currentUser?.user_id || 0);
  let scope = null;
  if (Number(row.hrd_id || 0) === uid) scope = "hrd";
  else if (Number(row.operational_director_id || 0) === uid) scope = "operational_director";

  if (!scope && isSuperadmin) {
    const reqScope = String(body?.scope || "").toLowerCase();
    if (reqScope === "hrd" || reqScope === "operational_director") scope = reqScope;
  }

  if (!scope) {
    if (isHrd || isDirector || isSuperadmin) {
      return { status: 403, msg: "Not assigned as approver." };
    }
    return { status: 403, msg: "Forbidden." };
  }

  const now = Math.floor(Date.now() / 1000);
  const updates = {
    updated: now,
    updated_by: uid || null,
  };

  if (scope === "hrd") {
    updates.approval_hrd_status = action === "approve" ? "approved" : "rejected";
    updates.approval_hrd_at = now;
  } else if (scope === "operational_director") {
    updates.approval_operational_director_status = action === "approve" ? "approved" : "rejected";
    updates.approval_operational_director_at = now;
  }

  const statusPreview = computeOverallStatus({ ...toPlainRow(row), ...updates });

  updates.status = statusPreview;

  await updateAnnualAssessmentInstance(row, updates);

  return {
    msg: statusPreview === "approved" ? "Approved." : action === "reject" ? "Rejected." : "Approved. Waiting others.",
    data: {
      annual_assestment_id: row.annual_assestment_id,
      staff_id: row.staff_id,
      hod_id: row.hod_id,
      hrd_id: row.hrd_id,
      operational_director_id: row.operational_director_id,
      status: row.status,
    },
  };
}

// PDF helpers
export async function getAnnualAssessmentPdfZipData({ year, statusFilter }) {
  const rows = await listAnnualAssessmentsByPeriod({ year, status: statusFilter });
  return rows;
}

export async function getAnnualAssessmentPdfSingleData({ targetStaffId, year }) {
  const row = await findLatestAnnualAssessmentByStaff({ staffId: targetStaffId, year });
  return row;
}

export async function getAnnualAssessmentPdfUsers({ staffId, hodId, hrdId, directorId }) {
  const users = await findUsersByIds([staffId, hodId, hrdId, directorId].filter(Boolean));
  const byId = {};
  users.forEach((u) => {
    byId[u.user_id] = u;
  });
  return {
    staff: byId[staffId] || null,
    hod: hodId ? byId[hodId] || null : null,
    hrd: hrdId ? byId[hrdId] || null : null,
    director: directorId ? byId[directorId] || null : null,
  };
}

export async function getAnnualAssessmentPdfQuestions(assestmentRow) {
  if (Array.isArray(assestmentRow?.questions_json) && assestmentRow.questions_json.length) {
    return assestmentRow.questions_json;
  }

  const rows = await findAnnualQuestionsForSnapshot();
  return rows.map((q) => ({
    question_key: q.question_key,
    title: q.title,
    description: q.description,
    input_type: q.input_type,
  }));
}

export function getAnnualAssessmentAnswers(assestmentRow, kind) {
  if (!assestmentRow) return {};

  if (kind === "staff") {
    if (assestmentRow.staff_answers_json && typeof assestmentRow.staff_answers_json === "object") {
      return assestmentRow.staff_answers_json;
    }
    const payload = safeObj(assestmentRow.staff_payload_json, {});
    if (payload?.answers && typeof payload.answers === "object") return payload.answers;
    return {};
  }

  if (assestmentRow.hod_answers_json && typeof assestmentRow.hod_answers_json === "object") {
    return assestmentRow.hod_answers_json;
  }
  const payload = safeObj(assestmentRow.hod_payload_json, {});
  if (payload?.answers && typeof payload.answers === "object") return payload.answers;
  return {};
}
