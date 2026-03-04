import { nowUnix } from "@/utils/dateHelpers";
import { Op, findAnnualAssessmentPeriods, findAnnualAssessmentPeriodByYear, createAnnualAssessmentPeriod, updateAnnualAssessmentPeriodByYear, findLeaveReasonsPaged } from "@/server/queries/masterQueries";

function isTruthy(v) {
  return v === "true" || v === true || v === 1 || v === "1";
}

export async function listAnnualAssessmentPeriods(req, currentUser) {
  const isHrd = isTruthy(currentUser?.is_hrd);
  const isSuperadmin = isTruthy(currentUser?.is_superadmin);
  if (!isHrd && !isSuperadmin) return { httpStatus: 403, msg: "Forbidden" };

  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? Number(yearParam) : null;

  if (yearParam) {
    if (!Number.isFinite(year)) return { httpStatus: 400, msg: "Invalid year" };
    const row = await findAnnualAssessmentPeriodByYear(year);
    return { data: row || null };
  }

  const rows = await findAnnualAssessmentPeriods();
  return { data: rows || [] };
}

export async function upsertAnnualAssessmentPeriod(body, currentUser) {
  const isHrd = isTruthy(currentUser?.is_hrd);
  const isSuperadmin = isTruthy(currentUser?.is_superadmin);
  if (!isHrd && !isSuperadmin) return { httpStatus: 403, msg: "Forbidden" };

  const year = Number(body?.year);
  const openAt = Number(body?.openAt);
  const closeAt = Number(body?.closeAt);
  const isActive = body?.isActive == null ? null : isTruthy(body.isActive) ? 1 : 0;

  if (!Number.isFinite(year) || year < 2000 || year > 2100) {
    return { httpStatus: 400, msg: "Invalid year" };
  }
  if (!Number.isFinite(openAt) || !Number.isFinite(closeAt)) {
    return { httpStatus: 400, msg: "openAt and closeAt are required" };
  }
  if (closeAt < openAt) {
    return { httpStatus: 400, msg: "closeAt must be after openAt" };
  }

  const now = nowUnix();

  const existing = await findAnnualAssessmentPeriodByYear(year);
  if (existing) {
    const updatePayload = {
      open_at: openAt,
      close_at: closeAt,
      updated: now,
      updated_by: currentUser.user_id,
    };
    if (isActive !== null) updatePayload.is_active = isActive;

    await updateAnnualAssessmentPeriodByYear(year, updatePayload);
    const updated = await findAnnualAssessmentPeriodByYear(year);
    return { msg: "Period updated.", data: updated || existing };
  }

  const createPayload = {
    year,
    open_at: openAt,
    close_at: closeAt,
    is_active: isActive !== null ? isActive : 1,
    created: now,
    created_by: currentUser.user_id,
    updated: now,
    updated_by: currentUser.user_id,
    deleted: null,
    deleted_by: null,
  };

  const created = await createAnnualAssessmentPeriod(createPayload);
  return { httpStatus: 201, msg: "Period created.", data: created };
}

export async function listLeaveReasons(req) {
  const { searchParams } = new URL(req.url);

  const status = (searchParams.get("status") || "active").toLowerCase();
  const q = (searchParams.get("q") || "").trim();

  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.max(parseInt(searchParams.get("limit") || "50", 10), 1);
  const offset = (page - 1) * limit;

  const where = {};

  if (status === "active") {
    where.deleted = { [Op.or]: [null, 0] };
  } else if (status === "deleted") {
    where.deleted = { [Op.ne]: null };
  }

  if (q) {
    where.title = { [Op.like]: `%${q}%` };
  }

  const { rows, count } = await findLeaveReasonsPaged(where, limit, offset);

  return { data: rows, meta: { page, limit, total: count } };
}
