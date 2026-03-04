import {
  findAppraisalsAndCount,
  findAppraisalById,
  findAppraisalByWhere,
  createAppraisal,
  updateAppraisalInstance,
  findActiveAppraisalQuestions,
  findQuestionsSnapshot,
  findUserById,
  findLatestEmployment,
  Sequelize,
  Op,
} from "@/server/queries/appraisalQueries";

import {
  parseIntParam,
  parseOrder,
  isTrue,
  getStaffIdField,
  getDepartmentIdField,
  buildJsonSearchWhere,
  RATING_SCALE,
  buildEmptyAnswers,
  calcScore,
  requireAllAnswered,
  nowUnix,
} from "@/utils/appraisalHelpers";

const DEFAULT_TITLE = "Performance Appraisal (Probation Period)";

function getDeptIdFromUser(u) {
  const v = u?.department_id;
  return v == null ? null : Number(v);
}

function getDeptIdFromRow(row) {
  const d1 = row?.department_id;
  if (d1 != null) return Number(d1);
  const snap = row?.staff_snapshot_json && typeof row.staff_snapshot_json === "object" ? row.staff_snapshot_json : {};
  const d2 = snap?.department_id;
  return d2 == null ? null : Number(d2);
}

function makeActorSnapshot(currentUser, atUnix) {
  return {
    user_id: Number(currentUser?.user_id),
    fullname: currentUser?.fullname || null,
    email: currentUser?.email || null,
    job_position: currentUser?.job_position || null,
    approved_at: atUnix,
  };
}

function canRead(currentUser, row) {
  if (isTrue(currentUser?.is_superadmin)) return true;

  const isHod = isTrue(currentUser?.is_hod);
  const isHrd = isTrue(currentUser?.is_hrd);
  const isDirector = isTrue(currentUser?.is_operational_director);

  if (isHrd || isDirector) {
    return String(row?.status) !== "draft";
  }

  if (isHod) {
    if (String(row?.status) === "draft") return false;
    const myDept = currentUser?.department_id == null ? null : Number(currentUser.department_id);
    const rowDept = getDeptIdFromRow(row);
    if (myDept != null && rowDept != null) return myDept === rowDept;
    return true;
  }

  const myId = Number(currentUser?.user_id);
  const staffIdField = getStaffIdField();
  return Number(row?.[staffIdField]) === myId;
}

function canEdit(currentUser, row) {
  return isTrue(currentUser?.is_superadmin) && String(row?.status) === "draft";
}

export async function listAppraisals(req, currentUser) {
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseIntParam(searchParams.get("page"), 1));
  const limit = Math.min(100, Math.max(1, parseIntParam(searchParams.get("limit"), 10)));
  const offset = (page - 1) * limit;

  const q = (searchParams.get("q") || "").trim();
  const status = (searchParams.get("status") || "").trim();
  const title = (searchParams.get("title") || "").trim();
  const deptIdParam = searchParams.get("department_id");
  const staffIdParam = searchParams.get("staffId");

  const order = parseOrder(searchParams.get("sortBy"), searchParams.get("sortDir"));

  const staffIdField = getStaffIdField();
  const deptField = getDepartmentIdField();

  const superadmin = isTrue(currentUser?.is_superadmin);
  const isHod = isTrue(currentUser?.is_hod);
  const isHrd = isTrue(currentUser?.is_hrd);
  const isDirector = isTrue(currentUser?.is_operational_director);

  const myId = Number(currentUser?.user_id);

  const where = {
    deleted: { [Op.is]: null },
    deleted_by: { [Op.is]: null },
  };

  const isApprover = isHod || isHrd || isDirector;

  if (!superadmin && !isApprover) {
    // staff biasa: biarkan filter by staffId param (default none)
  }

  if (staffIdParam) {
    const staffId = Number(staffIdParam);
    if (!Number.isFinite(staffId)) return { status: 400, msg: "Invalid staffId" };
    if (!superadmin && staffId !== myId) return { status: 403, msg: "Forbidden" };
    where[staffIdField] = staffId;
  }

  if (status) where.status = status;
  if (title) where.title = title;

  if (deptIdParam) {
    const deptId = Number(deptIdParam);
    if (!Number.isFinite(deptId)) return { status: 400, msg: "Invalid department_id" };

    if (deptField) {
      where[deptField] = deptId;
    } else {
      where[Op.and] = [
        ...(Array.isArray(where[Op.and]) ? where[Op.and] : []),
        Sequelize.where(Sequelize.json("staff_snapshot_json.department_id"), deptId),
      ];
    }
  } else {
    if (!superadmin && isHod && !isHrd && !isDirector) {
      const myDept = getDeptIdFromUser(currentUser);
      if (myDept != null) {
        where[Op.and] = [
          ...(Array.isArray(where[Op.and]) ? where[Op.and] : []),
          Sequelize.where(Sequelize.json("staff_snapshot_json.department_id"), myDept),
        ];
      }
    }
  }

  const jsonSearch = buildJsonSearchWhere(q);
  if (jsonSearch) {
    where[Op.and] = [
      ...(Array.isArray(where[Op.and]) ? where[Op.and] : []),
      jsonSearch,
    ];
  }

  const { rows, count } = await findAppraisalsAndCount({ where, order, limit, offset });
  return { data: rows, meta: { page, limit, total: count } };
}

export async function getAppraisalDraft(req, currentUser) {
  const { searchParams } = new URL(req.url);

  const staffIdField = getStaffIdField();
  const deptField = getDepartmentIdField();

  const title = (searchParams.get("title") || DEFAULT_TITLE).trim();
  const staffIdParam = searchParams.get("staffId");
  const myId = Number(currentUser?.user_id);

  const targetStaffId = staffIdParam ? Number(staffIdParam) : myId;
  if (!Number.isFinite(targetStaffId)) return { status: 400, msg: "Invalid staffId" };

  if (!isTrue(currentUser?.is_superadmin) && targetStaffId !== myId) {
    return { status: 403, msg: "Forbidden" };
  }

  let row = await findAppraisalByWhere({
    [staffIdField]: targetStaffId,
    title,
    status: "draft",
    deleted: null,
    deleted_by: null,
  });

  if (row) return { data: row };

  const staff = await findUserById(targetStaffId);
  if (!staff) return { status: 404, msg: "User not found" };

  const questions = await findQuestionsSnapshot(title);
  const answers = buildEmptyAnswers(questions);
  const employment = await findLatestEmployment(targetStaffId);

  const now = nowUnix();
  const actorId = myId;

  const payload = {
    title,
    [staffIdField]: targetStaffId,
    ...(deptField ? { [deptField]: staff.department_id ?? null } : {}),
    status: "draft",
    current_step: "staff",
    submitted_at: null,
    staff_snapshot_json: {
      user_id: staff.user_id,
      fullname: staff.fullname ?? null,
      email: staff.email ?? null,
      phone: staff.phone ?? null,
      job_position: staff.job_position ?? null,
      department_id: staff.department_id ?? null,
      user_type: staff.user_type ?? null,
    },
    employment_snapshot_json: {
      user_type: staff.user_type ?? null,
      employment: employment,
      before_status: null,
      after_status: null,
    },
    rating_scale_json: RATING_SCALE,
    questions_json: questions.map((q) => ({
      question_id: q.question_id,
      title: q.question_title,
      description: q.description,
      sort_order: q.sort_order,
      master_title: q.title,
    })),
    answers_json: answers,
    total_score: 0,
    average_score: 0,
    grade: "E",
    scoring_json: {
      rule: { A: 4.1, B: 3.0, C: 2.0, D: 1.1, E: 0 },
      total_score: 0,
      average_score: 0,
      grade: "E",
      note: null,
    },
    approvals_json: {
      history: [],
      hod: null,
      hrd: null,
      director: null,
      superadmin: null,
    },
    general_comment: null,
    created: now,
    created_by: actorId,
    updated: now,
    updated_by: actorId,
    deleted: null,
    deleted_by: null,
  };

  row = await createAppraisal(payload);
  return { data: row };
}

export async function submitAppraisal(body, currentUser) {
  if (!isTrue(currentUser?.is_superadmin)) return { status: 403, msg: "Forbidden" };

  const appraisalId = Number(body?.appraisalId);
  if (!Number.isFinite(appraisalId)) return { status: 400, msg: "Invalid appraisalId" };

  const row = await findAppraisalById(appraisalId);
  if (!row) return { status: 404, msg: "Not found" };

  if (String(row.status) !== "draft") {
    return { status: 400, msg: "Only draft can be submitted." };
  }

  const check = requireAllAnswered(row.questions_json, row.answers_json);
  if (!check.ok) {
    return { status: 400, msg: `Answer required for question_id=${check.missing}` };
  }

  const now = nowUnix();
  const actorId = Number(currentUser?.user_id);

  const score = calcScore(row.questions_json, row.answers_json);

  const prevApprovals = row.approvals_json && typeof row.approvals_json === "object" ? row.approvals_json : {};

  const submitterSnapshot = {
    user_id: actorId,
    fullname: currentUser?.fullname || null,
    email: currentUser?.email || null,
    job_position: currentUser?.job_position || null,
    approved_at: now,
  };

  const updates = {
    status: "submitted",
    current_step: "hod",
    submitted_at: now,
    total_score: score.total_score,
    average_score: score.average_score,
    grade: score.grade,
    scoring_json: {
      ...(row.scoring_json && typeof row.scoring_json === "object" ? row.scoring_json : {}),
      ...score,
    },
    approvals_json: {
      ...prevApprovals,
      superadmin: submitterSnapshot,
      hod: prevApprovals.hod || null,
      hrd: prevApprovals.hrd || null,
      director: prevApprovals.director || null,
    },
    updated: now,
    updated_by: actorId,
  };

  await updateAppraisalInstance(row, updates);
  return { data: row };
}

export async function approveAppraisal(body, currentUser) {
  const appraisalId = Number(body?.appraisalId);
  const actionRaw = String(body?.action || "approve").toLowerCase();
  const note = body?.note != null ? String(body.note) : "";

  if (!Number.isFinite(appraisalId)) return { status: 400, msg: "Invalid appraisalId" };
  if (actionRaw !== "approve" && actionRaw !== "reject") return { status: 400, msg: "Invalid action" };

  const row = await findAppraisalById(appraisalId);
  if (!row) return { status: 404, msg: "Not found" };

  if (String(row.status) !== "submitted") return { status: 400, msg: "Only submitted appraisal can be approved." };

  const step = String(row.current_step || "").toLowerCase();
  if (!["hod", "hrd", "director"].includes(step)) return { status: 400, msg: "Invalid current_step for approval." };

  const superadmin = isTrue(currentUser?.is_superadmin);
  const isHod = isTrue(currentUser?.is_hod);
  const isHrd = isTrue(currentUser?.is_hrd);
  const isDirector = isTrue(currentUser?.is_operational_director);

  let allowed = false;
  if (step === "hod" && isHod) allowed = true;
  if (step === "hrd" && isHrd) allowed = true;
  if (step === "director" && isDirector) allowed = true;

  if (allowed && step === "hod" && !superadmin) {
    const myDept = currentUser?.department_id == null ? null : Number(currentUser.department_id);
    const rowDept = getDeptIdFromRow(row);
    if (myDept != null && rowDept != null && myDept !== rowDept) {
      return { status: 403, msg: "Forbidden (different department)" };
    }
  }

  if (!allowed && !superadmin) return { status: 403, msg: "Forbidden" };

  const now = nowUnix();
  const actorId = Number(currentUser?.user_id);
  const actorSnap = makeActorSnapshot(currentUser, now);

  const prevApprovals = row.approvals_json && typeof row.approvals_json === "object" ? row.approvals_json : {};
  const prevHist = Array.isArray(row.approval_history_json) ? row.approval_history_json : [];

  const approvals = {
    ...prevApprovals,
    [step]: actorSnap,
  };

  const history = prevHist.concat([
    { step, action: actionRaw, at: now, by: actorSnap, note: note || "" },
  ]);

  const updates = {
    approvals_json: approvals,
    approval_history_json: history,
    updated: now,
    updated_by: actorId,
  };

  if (actionRaw === "reject") {
    updates.status = "rejected";
    await updateAppraisalInstance(row, updates);
    return { data: row };
  }

  if (step === "hod") {
    updates.hod_approved_at = now;
    updates.current_step = "hrd";
  } else if (step === "hrd") {
    updates.hrd_approved_at = now;
    updates.current_step = "director";
  } else if (step === "director") {
    updates.director_approved_at = now;
    updates.approved_at = now;
    updates.status = "approved";
    updates.current_step = "done";
  }

  await updateAppraisalInstance(row, updates);
  return { data: row };
}

export async function getAppraisalById(appraisalId, currentUser) {
  const row = await findAppraisalById(appraisalId);
  if (!row) return { status: 404, msg: "Not found" };

  if (!canRead(currentUser, row)) return { status: 403, msg: "Forbidden" };

  return { data: row };
}

export async function updateAppraisal(appraisalId, body, currentUser) {
  const row = await findAppraisalById(appraisalId);
  if (!row) return { status: 404, msg: "Not found" };

  if (!canEdit(currentUser, row)) return { status: 403, msg: "Forbidden" };

  const updates = {};
  const now = nowUnix();
  const actorId = Number(currentUser?.user_id);

  if (body?.answers && typeof body.answers === "object") {
    const existing = row.answers_json && typeof row.answers_json === "object" ? row.answers_json : {};
    const merged = { ...existing };

    for (const [k, v] of Object.entries(body.answers)) {
      const key = String(k);
      if (v && typeof v === "object") {
        const n = v.value == null || v.value === "" ? null : Number(v.value);
        merged[key] = {
          value: Number.isFinite(n) ? n : null,
          note: typeof v.note === "string" ? v.note : (merged[key]?.note || ""),
        };
      } else {
        const n = v == null || v === "" ? null : Number(v);
        merged[key] = { value: Number.isFinite(n) ? n : null, note: merged[key]?.note || "" };
      }
    }

    updates.answers_json = merged;
  }

  if (body?.generalComment !== undefined) {
    updates.general_comment = body.generalComment != null ? String(body.generalComment) : null;
  }

  if (body?.beforeStatus !== undefined || body?.afterStatus !== undefined) {
    const emp = row.employment_snapshot_json && typeof row.employment_snapshot_json === "object" ? row.employment_snapshot_json : {};
    updates.employment_snapshot_json = {
      ...emp,
      before_status: body.beforeStatus !== undefined ? (body.beforeStatus || null) : (emp.before_status ?? null),
      after_status: body.afterStatus !== undefined ? (body.afterStatus || null) : (emp.after_status ?? null),
    };
  }

  const questions = row.questions_json;
  const answers = updates.answers_json ?? row.answers_json;
  const score = calcScore(questions, answers);

  updates.total_score = score.total_score;
  updates.average_score = score.average_score;
  updates.grade = score.grade;

  const prevScoring = row.scoring_json && typeof row.scoring_json === "object" ? row.scoring_json : {};
  updates.scoring_json = {
    ...prevScoring,
    total_score: score.total_score,
    average_score: score.average_score,
    grade: score.grade,
    answered_count: score.answered_count,
    question_count: score.question_count,
  };

  updates.updated = now;
  updates.updated_by = actorId;

  await updateAppraisalInstance(row, updates);
  return { data: row };
}

export async function deleteAppraisal(appraisalId, currentUser) {
  if (!isTrue(currentUser?.is_superadmin)) return { status: 403, msg: "Forbidden" };

  const row = await findAppraisalById(appraisalId);
  if (!row) return { status: 404, msg: "Not found" };

  const now = nowUnix();
  const actorId = Number(currentUser?.user_id);

  await updateAppraisalInstance(row, {
    deleted: now,
    deleted_by: actorId,
    updated: now,
    updated_by: actorId,
  });

  return { msg: "Deleted" };
}

export async function listAppraisalQuestions(req) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "").trim();
  const rows = await findActiveAppraisalQuestions(title || null);
  return { data: rows };
}

export async function getAppraisalPdfData(appraisalId) {
  const row = await findAppraisalById(appraisalId);
  return row;
}
