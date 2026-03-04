import db from "@/database/models";
import { nowUnix } from "@/utils/dateHelpers";
import { notify as notifyUser } from "@/utils/notifier";
import dayjs from "dayjs";
import {
  findUsers,
  findUserById,
  createUser,
  updateUserInstance,
  findActiveEmployment,
  createEmployment,
  updateEmploymentInstance,
  getUserAttributes,
  getEmploymentAttributes,
  findUsersForExport,
} from "@/server/queries/userQueries";

const { Sequelize, Role } = db;
const { Op } = Sequelize;

// -----------------------------
// Helpers
// -----------------------------
function parseIntParam(v, def) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function readParam(searchParams, snakeKey, camelKey) {
  return (
    (snakeKey ? searchParams.get(snakeKey) : null) ??
    (camelKey ? searchParams.get(camelKey) : null) ??
    ""
  );
}

function toEnumTrueFalse(v) {
  if (v === true || v === 1 || String(v) === "true") return "true";
  if (v === false || v === 0 || String(v) === "false") return "false";
  return null;
}

function normalizeSalaryJson(v) {
  if (v == null) return null;
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function parseOrder(sortBy, sortDir) {
  const allowed = new Set([
    "created",
    "updated",
    "fullname",
    "email",
    "phone",
    "user_type",
    "status",
    "user_role",
    "department_id",
    "join_date",
    "job_position",
  ]);

  const raw = String(sortBy || "").trim();
  const field = allowed.has(raw) ? raw : "created";
  const dir = String(sortDir || "").toLowerCase() === "asc" ? "ASC" : "DESC";
  return [[field, dir]];
}

function pickEmploymentDetails(body, type) {
  const contract_details = body?.contract_details ?? body?.contractDetails ?? null;
  const staff_details = body?.staff_details ?? body?.staffDetails ?? null;
  const probation_details = body?.probation_details ?? body?.probationDetails ?? null;

  const t = String(type || "staff").toLowerCase();
  if (t === "contract") return contract_details || {};
  if (t === "probation") return probation_details || {};
  return staff_details || {};
}

function buildEmploymentCreatePayload({ userId, sessionUserId, type, startDate, details }) {
  const t = String(type || "staff").toLowerCase();
  const base = {
    user_id: userId,
    type: t,
    start_date: startDate,
    end_date: null,
    notes: details?.notes ?? null,
    created: nowUnix(),
    created_by: sessionUserId || null,
    updated: nowUnix(),
    deleted: null,
  };

  if (t === "contract") {
    return {
      ...base,
      contract_number: details?.contract_number ?? null,
      duration_months:
        details?.contract_duration_months != null
          ? Number(details.contract_duration_months)
          : null,
      salary_json: normalizeSalaryJson(details?.salary_details ?? null),
    };
  }

  if (t === "probation") {
    return {
      ...base,
      evaluation_notes: details?.evaluation_notes ?? null,
      recommended_status: details?.recommended_status ?? null,
    };
  }

  return base;
}

const ALLOWED_FIELDS = [
  "job_position", "email", "phone",
  "status",
  "fullname", "birthdate", "marital_status", "nationality",
  "address", "address_on_identity",
  "identity_number", "identity_type", "npwp_number",
  "tax_start_date",
  "bank_code", "bank_account_number", "beneficiary_name", "currency",
  "bpjs_tk_number", "bpjs_tk_reg_date", "bpjs_tk_term_date",
  "bpjs_kes_number", "bpjs_kes_reg_date", "bpjs_kes_term_date",
  "pension_number",
  "emergency_fullname", "emergency_relationship",
  "emergency_contact", "emergency_address",
  "department_id",
  "user_role",
  "status",
  "user_type",
  "attendance_type",
  "absent_type",
  "is_timesheet",
  "absent_type",
  "join_date",
  "contract_number", "start_date", "end_date",
  "duration_months", "salary_json",
  "evaluation_notes", "recommended_status",
  "notes",
];

function filterAttrs(payload, rawAttrs) {
  return Object.fromEntries(
    Object.entries(payload).filter(([k]) => rawAttrs?.[k])
  );
}

function toStrBoolEnum(v) {
  return String(v) === "true" || v === true ? "true" : "false";
}

function isTruthy(v) {
  return v === "true" || v === true || v === 1 || v === "1";
}

function isSuperadminUser(currentUser) {
  return isTruthy(currentUser?.is_superadmin) || currentUser?.user_role === "superadmin";
}

function normDateLike(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v;
  if (typeof v === "string") return v;
  if (v instanceof Date) return dayjs(v).format("YYYY-MM-DD");
  return v;
}

// -----------------------------
// Controllers
// -----------------------------
export async function listUsers(req) {
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseIntParam(readParam(searchParams, "page"), 1));
  const limit = Math.min(100, Math.max(1, parseIntParam(readParam(searchParams, "limit"), 10)));
  const offset = (page - 1) * limit;

  const q = String(readParam(searchParams, "q")).trim();
  const status = String(readParam(searchParams, "status")).trim();
  const userType = String(readParam(searchParams, "user_type", "userType")).trim();

  const role = String(readParam(searchParams, "role")).trim();
  const departmentId = String(readParam(searchParams, "department_id", "departmentId")).trim();
  const sortBy = String(readParam(searchParams, "sortBy")).trim();
  const sortDir = String(readParam(searchParams, "sortDir")).trim();
  const order = parseOrder(sortBy, sortDir);

  const where = {};
  if (q) {
    where[Op.or] = [
      { fullname: { [Op.like]: `%${q}%` } },
      { email: { [Op.like]: `%${q}%` } },
      { phone: { [Op.like]: `%${q}%` } },
    ];
  }
  if (status) where.status = status;
  if (userType) where.user_type = userType;
  if (role) where.user_role = role;
  if (departmentId) where.department_id = Number(departmentId);

  const { rows, count } = await findUsers({
    where,
    limit,
    offset,
    order,
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Role,
        as: "RoleDetail",
        attributes: ["slug", "title", "is_ae"],
        required: false,
      },
    ],
  });

  // Normalize role flags even when user_role stores role_id (numeric string) or slug.
  const roleRows = await Role.findAll({
    where: { deleted: null, deleted_by: null },
    attributes: ["role_id", "slug", "is_ae"],
    raw: true,
  });
  const roleBySlug = new Map();
  const roleById = new Map();
  for (const r of roleRows) {
    const slugKey = String(r?.slug || "").trim().toLowerCase();
    const idKey = String(r?.role_id ?? "").trim();
    if (slugKey) roleBySlug.set(slugKey, r);
    if (idKey) roleById.set(idKey, r);
  }

  const normalizedRows = (Array.isArray(rows) ? rows : []).map((row) => {
    const user = row?.toJSON ? row.toJSON() : row;
    const roleVal = String(user?.user_role ?? "").trim();
    const roleFromAssoc = user?.RoleDetail || null;
    const roleResolved =
      roleFromAssoc ||
      roleBySlug.get(roleVal.toLowerCase()) ||
      roleById.get(roleVal) ||
      null;

    return {
      ...user,
      is_ae: String(roleResolved?.is_ae ?? "false"),
    };
  });

  return { data: normalizedRows, meta: { page, limit, total: count } };
}

export async function createUserWithEmployment(req, locals) {
  const t = await db.sequelize.transaction();
  try {
    const sessionUserId = locals?.user?.user_id || null;
    const body = await req.json();

    const fullname = (body?.fullname || "").trim();
    const email = (body?.email || "").trim();
    const password = body?.password || "";
    const job_position = (body?.job_position ?? body?.jobPosition ?? "").trim();

    const phone = (body?.phone ?? "").trim() || null;
    const user_role = body?.user_role ?? body?.userRole ?? null;
    const department_id = body?.department_id ?? body?.departmentId ?? null;
    const user_type = String(body?.user_type ?? body?.userType ?? "staff").toLowerCase();
    const status = String(body?.status ?? "new").toLowerCase();

    const join_date_raw = body?.join_date ?? body?.joinDate ?? null;
    const join_date =
      join_date_raw != null && join_date_raw !== "" ? Number(join_date_raw) : nowUnix();

    const attendance_type = body?.attendance_type ?? body?.attendanceType ?? null;
    const absent_type = body?.absent_type ?? body?.absentType ?? null;

    const is_timesheet = toEnumTrueFalse(body?.is_timesheet ?? body?.isTimesheet);
    if (!fullname || !email) {
      await t.rollback();
      return { status: 400, msg: "fullname and email are required." };
    }
    if (!job_position) {
      await t.rollback();
      return { status: 400, msg: "job_position is required." };
    }
    if (!password || String(password).length < 6) {
      await t.rollback();
      return { status: 400, msg: "password is required (min 6 characters)." };
    }

    const bcrypt = (await import("bcryptjs")).default;
    const hashed = await bcrypt.hash(String(password), 10);

    const createPayload = {
      fullname,
      email,
      password: hashed,
      phone,
      job_position: job_position || null,
      user_role,
      department_id: department_id != null && department_id !== "" ? Number(department_id) : null,
      user_type: user_type || "staff",
      status: status || "new",
      join_date,

      created: nowUnix(),
      created_by: sessionUserId,
      updated: nowUnix(),
      updated_by: null,
      deleted: null,
      deleted_by: null,
    };

    if (attendance_type) createPayload.attendance_type = attendance_type;
    if (absent_type) createPayload.absent_type = absent_type;
    if (is_timesheet != null) createPayload.is_timesheet = is_timesheet;

    const newUser = await createUser(createPayload, t);

    const details = pickEmploymentDetails(body, user_type);
    const empPayload = buildEmploymentCreatePayload({
      userId: newUser.user_id,
      sessionUserId,
      type: user_type,
      startDate: join_date,
      details,
    });

    await createEmployment(empPayload, t);
    await t.commit();

    const userJson = newUser.toJSON();
    delete userJson.password;
    return { status: 201, msg: "User created successfully!", user: userJson };
  } catch (error) {
    if (t.finished !== "commit") await t.rollback();
    if (error?.name === "SequelizeUniqueConstraintError") {
      return { status: 409, msg: "User with this email already exists." };
    }
    return { status: 500, msg: error?.message || "Failed to create user." };
  }
}

export async function updateUserAndEmployment(req, params, currentUser) {
  const isSuperadmin = isSuperadminUser(currentUser);
  if (!isSuperadmin) return { status: 403, msg: "Forbidden: superadmin only." };

  const userId = Number(params?.userId);
  if (!Number.isInteger(userId)) return { status: 400, msg: "Invalid user id" };

  let body;
  try {
    body = await req.json();
  } catch {
    return { status: 400, msg: "Invalid JSON body" };
  }

  const t = await db.sequelize.transaction();
  try {
    const user = await findUserById(userId, t);
    if (!user) {
      await t.rollback();
      return { status: 404, msg: "User not found" };
    }

    const userAttrs = getUserAttributes();
    const prevStatus = user.status;

    // Terima payload snake_case dan camelCase dari UI.
    const aliasMap = {
      userRole: "user_role",
      departmentId: "department_id",
      userType: "user_type",
      joinDate: "join_date",
      isTimesheet: "is_timesheet",
      directorUserId: "director_user_id",
    };

    const normalizedBody = { ...body };
    for (const [alias, target] of Object.entries(aliasMap)) {
      if (
        Object.prototype.hasOwnProperty.call(body, alias) &&
        !Object.prototype.hasOwnProperty.call(normalizedBody, target)
      ) {
        normalizedBody[target] = body[alias];
      }
    }

    const incoming = {};
    for (const k of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(normalizedBody, k)) {
        incoming[k] = normalizedBody[k];
      }
    }

    if (incoming.is_timesheet !== undefined) incoming.is_timesheet = toStrBoolEnum(incoming.is_timesheet);
    if (incoming.join_date !== undefined && incoming.join_date !== null) {
      incoming.join_date = Number(incoming.join_date);
    }

    if (incoming.status === "active" && !user.join_date && !incoming.join_date) {
      incoming.join_date = nowUnix();
    }

    if (incoming.director_user_id !== undefined && userAttrs["id_director"]) {
      incoming.id_director = incoming.director_user_id;
      delete incoming.director_user_id;
    }

    const safeUserUpdate = filterAttrs(incoming, userAttrs);
    if (Object.keys(safeUserUpdate).length > 0) {
      if (safeUserUpdate.birthdate !== undefined) {
        safeUserUpdate.birthdate = normDateLike(safeUserUpdate.birthdate);
      }
      if (safeUserUpdate.tax_start_date !== undefined) {
        safeUserUpdate.tax_start_date = normDateLike(safeUserUpdate.tax_start_date);
      }
      for (const k of [
        "bpjs_tk_reg_date", "bpjs_tk_term_date",
        "bpjs_kes_reg_date", "bpjs_kes_term_date",
      ]) {
        if (safeUserUpdate[k] !== undefined) {
          safeUserUpdate[k] = normDateLike(safeUserUpdate[k]);
        }
      }
      await updateUserInstance(user, safeUserUpdate, t);
    }

    const empAttrs = getEmploymentAttributes();
    const nowTs = nowUnix();
    const userType = (incoming.user_type ?? user.user_type) || "staff";

    let employment = await findActiveEmployment(userId, t);
    if (!employment) {
      const empPayload = filterAttrs({
        user_id: userId,
        type: userType,
        start_date: body.start_date ?? user.join_date ?? nowTs,
        contract_number: body.contract_number ?? null,
        end_date: body.end_date ?? null,
        duration_months: body.duration_months ?? null,
        salary_json: body.salary_json ?? null,
        evaluation_notes: body.evaluation_notes ?? null,
        recommended_status: body.recommended_status ?? null,
        notes: body.notes ?? null,
        created: nowTs,
        created_by: currentUser?.user_id ?? 1,
        updated: nowTs,
      }, empAttrs);
      await createEmployment(empPayload, t);
    } else if (employment.type !== userType) {
      employment.end_date = employment.end_date || nowTs;
      employment.deleted = employment.deleted ?? nowTs;
      employment.updated = nowTs;
      await employment.save({ transaction: t });

      const newEmp = filterAttrs({
        user_id: userId,
        type: userType,
        start_date: body.start_date ?? user.join_date ?? nowTs,
        contract_number: body.contract_number ?? null,
        end_date: body.end_date ?? null,
        duration_months: body.duration_months ?? null,
        salary_json: body.salary_json ?? null,
        evaluation_notes: body.evaluation_notes ?? null,
        recommended_status: body.recommended_status ?? null,
        notes: body.notes ?? null,
        created: nowTs,
        created_by: currentUser?.user_id ?? 1,
        updated: nowTs,
      }, empAttrs);
      await createEmployment(newEmp, t);
    } else {
      const empUpdate = {};
      if (body.start_date !== undefined) empUpdate.start_date = body.start_date ? Number(body.start_date) : null;
      if (body.end_date !== undefined) empUpdate.end_date = body.end_date ? Number(body.end_date) : null;

      if (userType === "contract") {
        if (body.contract_number !== undefined) empUpdate.contract_number = body.contract_number ?? null;
        if (body.duration_months !== undefined) empUpdate.duration_months = body.duration_months ?? null;
        if (body.salary_json !== undefined) empUpdate.salary_json = body.salary_json ?? null;
      } else if (userType === "probation") {
        if (body.evaluation_notes !== undefined) empUpdate.evaluation_notes = body.evaluation_notes ?? null;
        if (body.recommended_status !== undefined) empUpdate.recommended_status = body.recommended_status ?? null;
      }
      if (body.notes !== undefined) empUpdate.notes = body.notes ?? null;

      if (Object.keys(empUpdate).length > 0) {
        const safeEmpUpdate = filterAttrs({ ...empUpdate, updated: nowTs }, empAttrs);
        await updateEmploymentInstance(employment, safeEmpUpdate, t);
      }
    }

    const newStatus = incoming.status ?? user.status;
    if (prevStatus !== "active" && newStatus === "active") {
      try {
        const activatedBy =
          currentUser?.fullname ||
          currentUser?.email ||
          currentUser?.user_role ||
          "Administrator";
        await notifyUser({
          userId: user.user_id,
          type: "user_status_changed",
          sender: activatedBy,
          title: "Your account has been activated",
          description: `Hello ${user.fullname || user.email}, your account is now active. You can continue to the dashboard.`,
          url: "/dashboard",
          email: true,
          meta: {
            user_id: user.user_id,
            user_name: user.fullname || null,
            user_email: user.email || null,
            status_from: prevStatus,
            status_to: newStatus,
            activated_by: activatedBy,
            activated_at: nowUnix(),
          },
        });
      } catch (e) {
        console.warn("Failed to send status change notification:", e?.message || e);
      }
    }

    await t.commit();
    return { status: 200, msg: "User updated", user: user.toJSON() };
  } catch (err) {
    await t.rollback();
    return { status: 500, msg: "Failed to update user." };
  }
}

export async function updateUserPassword(req, params, currentUser) {
  const isSuperadmin = isSuperadminUser(currentUser);
  if (!isSuperadmin) return { status: 403, msg: "Forbidden: superadmin only." };

  const userId = Number(params?.userId);
  if (!Number.isInteger(userId)) return { status: 400, msg: "Invalid user id" };

  let body;
  try {
    body = await req.json();
  } catch {
    return { status: 400, msg: "Invalid JSON body" };
  }

  const password = String(body?.password ?? "").trim();
  if (!password) return { status: 400, msg: "Password is required." };
  if (password.length < 6) return { status: 400, msg: "Password must be at least 6 characters." };

  const t = await db.sequelize.transaction();
  try {
    const user = await findUserById(userId, t);
    if (!user) {
      await t.rollback();
      return { status: 404, msg: "User not found" };
    }

    const bcrypt = (await import("bcryptjs")).default;
    const hashed = await bcrypt.hash(password, 10);
    const ts = nowUnix();

    await updateUserInstance(
      user,
      {
        password: hashed,
        updated: ts,
        updated_by: currentUser?.user_id ?? null,
      },
      t
    );

    await t.commit();
    return { status: 200, msg: "Password updated." };
  } catch (err) {
    await t.rollback();
    return { status: 500, msg: "Failed to update password." };
  }
}

export async function exportUsersCsv(req, currentUser) {
  const role = currentUser?.user_role || currentUser?.role;
  const canExport = role === "superadmin" || role === "hrd";
  if (!canExport) return { status: 403, msg: "Forbidden" };

  const urlObj = "nextUrl" in req ? req.nextUrl : new URL(req.url);
  const searchParams = urlObj.searchParams;

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10000);

  const q = (searchParams.get("q") || "").trim();
  const roleFilter = searchParams.get("role") || "";
  const departmentId = searchParams.get("department_id") || "";
  const status = searchParams.get("status") || "";

  const SORT_MAP = {
    fullname: "fullname",
    user_role: "user_role",
    department_id: "department_id",
    status: "status",
    join_date: "join_date",
  };
  const sortBy = SORT_MAP[searchParams.get("sortBy")] || "fullname";
  const sortDir =
    (searchParams.get("sortDir") || "asc").toUpperCase() === "DESC"
      ? "DESC"
      : "ASC";

  const where = {};
  if (q) {
    where[Op.or] = [
      { fullname: { [Op.like]: `%${q}%` } },
      { email: { [Op.like]: `%${q}%` } },
      { phone: { [Op.like]: `%${q}%` } },
    ];
  }
  if (roleFilter) where.user_role = roleFilter;
  if (departmentId) where.department_id = Number(departmentId);
  if (status) where.status = status;

  const rows = await findUsersForExport({
    where,
    order: [[sortBy, sortDir]],
    limit,
    offset: (page - 1) * limit,
  });

  const headers = [
    "User ID",
    "Fullname",
    "Email",
    "Phone",
    "Role",
    "Department ID",
    "Status",
    "HOD",
    "HRD",
    "Operational Director",
    "Join Date",
  ];

  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return s.includes(",") || s.includes("\n") || s.includes('"')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.user_id,
        r.fullname,
        r.email,
        r.phone,
        r.user_role,
        r.department_id,
        r.status,
        r.RoleDetail?.is_hod ?? "false",
        r.RoleDetail?.is_hrd ?? "false",
        r.RoleDetail?.is_operational_director ?? "false",
        r.join_date ?? "",
      ]
        .map(escape)
        .join(",")
    );
  }

  return { status: 200, csv: lines.join("\n") };
}
