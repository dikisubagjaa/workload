export const dynamic = "force-dynamic";
export const revalidate = 0;

import dayjs from "dayjs";
import { NextResponse } from "next/server";
import { withAuth } from "@/utils/session";
import { findAllClients } from "@/server/queries/clientQueries";

function isTruthy(v) {
  const s = String(v ?? "").toLowerCase();
  return s === "true" || s === "1";
}

function toPositiveInt(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

function toUnix(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (Number.isFinite(n)) return n > 1e12 ? Math.floor(n / 1000) : Math.floor(n);
  const d = dayjs(v);
  return d.isValid() ? d.unix() : null;
}

function parseDateUnix(value, mode = "start") {
  if (!value) return null;
  const d = dayjs(value);
  if (!d.isValid()) return null;
  return mode === "end" ? d.endOf("day").unix() : d.startOf("day").unix();
}

function normalizeStatus(row) {
  const status = String(row?.lead_status || "").toLowerCase();
  const hasWon = !!toUnix(row?.won) || status === "won";
  const hasLost = !!toUnix(row?.lost) || status === "lost";
  const hasContacted = !!toUnix(row?.contacted);
  const isValidated = status === "validate";

  // Keep pipeline stage mutually-exclusive and aligned with computeLeadstatusSlug().
  if (hasWon) return { status, contacted: false, won: true, lost: false, validated: false, isNew: false };
  if (hasLost) return { status, contacted: false, won: false, lost: true, validated: false, isNew: false };
  if (hasContacted) return { status, contacted: true, won: false, lost: false, validated: false, isNew: false };
  if (isValidated) return { status, contacted: false, won: false, lost: false, validated: true, isNew: false };
  return { status, contacted: false, won: false, lost: false, validated: false, isNew: true };
}

function mapDetailRow(row, flags) {
  const aeId = Number(row?.assign_to || 0) || 0;
  const createdUnix = toUnix(row?.created);
  return {
    key: String(row?.client_id || `${row?.client_name || "client"}-${aeId}`),
    client_id: Number(row?.client_id || 0) || null,
    client_name: row?.client_name || "-",
    client_type: row?.client_type || "-",
    ae_id: aeId || null,
    ae_name:
      row?.AssignTo?.fullname ||
      row?.AssignTo?.email ||
      (aeId > 0 ? `User #${aeId}` : "Unassigned"),
    lead_status: row?.Leadstatus?.title || row?.lead_status || "-",
    follow_up: toUnix(row?.follow_up),
    created: createdUnix,
    created_month_key: createdUnix ? dayjs.unix(createdUnix).format("YYYY-MM") : null,
    contacted: !!flags?.contacted,
    validated: !!flags?.validated,
    is_new: !!flags?.isNew,
    won: !!flags?.won,
    lost: !!flags?.lost,
  };
}

export const GET = withAuth(async function GET_HANDLER(req, _ctx, currentUser) {
  try {
    const sp = req.nextUrl.searchParams;
    const scopeRaw = String(sp.get("scope") || "all").toLowerCase();
    const scope = ["all", "leads", "customer"].includes(scopeRaw) ? scopeRaw : "all";

    const dateFieldRaw = String(sp.get("date_field") || "created").toLowerCase();
    const dateField = ["created", "updated", "follow_up"].includes(dateFieldRaw) ? dateFieldRaw : "created";

    const dateFromStr = sp.get("date_from");
    const dateToStr = sp.get("date_to");
    const dateFrom = parseDateUnix(dateFromStr, "start");
    const dateTo = parseDateUnix(dateToStr, "end");

    const requestedAeId = toPositiveInt(sp.get("ae_id"));
    const userRole = String(currentUser?.user_role || currentUser?.role || "").toLowerCase();
    const canSelectAe =
      isTruthy(currentUser?.is_hod) ||
      isTruthy(currentUser?.is_superadmin) ||
      userRole === "superadmin" ||
      userRole === "superuser";

    const effectiveAeId = canSelectAe ? requestedAeId : toPositiveInt(currentUser?.user_id);

    const rowsRaw = await findAllClients();
    const rows = rowsRaw.map((r) => (r?.toJSON ? r.toJSON() : r));

    const filtered = rows.filter((row) => {
      if (scope !== "all" && String(row?.client_type || "").toLowerCase() !== scope) return false;
      if (effectiveAeId && Number(row?.assign_to || 0) !== Number(effectiveAeId)) return false;

      if (dateFrom || dateTo) {
        const ts = toUnix(row?.[dateField]);
        if (!ts) return false;
        if (dateFrom && ts < dateFrom) return false;
        if (dateTo && ts > dateTo) return false;
      }
      return true;
    });

    const stats = {
      total_records: filtered.length,
      total_leads: 0,
      total_customer: 0,
      won: 0,
      lost: 0,
      contacted: 0,
      validated: 0,
      new: 0,
      follow_up_overdue: 0,
      follow_up_today: 0,
    };

    const byAeMap = new Map();
    const byMonthMap = new Map();
    const detail = {
      total_records: [],
      total_leads: [],
      total_customer: [],
      won: [],
      lost: [],
      contacted: [],
      validated: [],
      new: [],
      win_rate_decisions: [],
      follow_up_today: [],
      follow_up_overdue: [],
      conversion_customers: [],
    };

    const todayStart = dayjs().startOf("day").unix();
    const todayEnd = dayjs().endOf("day").unix();

    for (const row of filtered) {
      const type = String(row?.client_type || "").toLowerCase();
      if (type === "leads") stats.total_leads += 1;
      if (type === "customer") stats.total_customer += 1;

      const flags = normalizeStatus(row);
      const detailRow = mapDetailRow(row, flags);
      detail.total_records.push(detailRow);
      if (type === "leads") detail.total_leads.push(detailRow);
      if (type === "customer") detail.total_customer.push(detailRow);
      if (flags.won) stats.won += 1;
      if (flags.lost) stats.lost += 1;
      if (flags.contacted) stats.contacted += 1;
      if (flags.validated) stats.validated += 1;
      if (flags.isNew) stats.new += 1;
      if (flags.won) detail.won.push(detailRow);
      if (flags.lost) detail.lost.push(detailRow);
      if (flags.contacted) detail.contacted.push(detailRow);
      if (flags.validated) detail.validated.push(detailRow);
      if (flags.isNew) detail.new.push(detailRow);
      if (flags.won || flags.lost) detail.win_rate_decisions.push(detailRow);

      const fu = toUnix(row?.follow_up);
      if (fu) {
        if (fu >= todayStart && fu <= todayEnd) {
          stats.follow_up_today += 1;
          detail.follow_up_today.push(detailRow);
        }
        if (fu < todayStart && !flags.won && !flags.lost) {
          stats.follow_up_overdue += 1;
          detail.follow_up_overdue.push(detailRow);
        }
      }

      if (type === "customer") {
        detail.conversion_customers.push(detailRow);
      }

      const aeId = Number(row?.assign_to || 0) || 0;
      const aeName =
        row?.AssignTo?.fullname ||
        row?.AssignTo?.email ||
        (aeId > 0 ? `User #${aeId}` : "Unassigned");
      const aeKey = aeId > 0 ? String(aeId) : "unassigned";
      if (!byAeMap.has(aeKey)) {
        byAeMap.set(aeKey, {
          key: aeKey,
          ae_id: aeId || null,
          ae_name: aeName,
          total: 0,
          won: 0,
          lost: 0,
          contacted: 0,
          validated: 0,
          new: 0,
        });
      }
      const aeRow = byAeMap.get(aeKey);
      aeRow.total += 1;
      if (flags.won) aeRow.won += 1;
      if (flags.lost) aeRow.lost += 1;
      if (flags.contacted) aeRow.contacted += 1;
      if (flags.validated) aeRow.validated += 1;
      if (flags.isNew) aeRow.new += 1;

      const createdTs = toUnix(row?.created);
      if (createdTs) {
        const monthKey = dayjs.unix(createdTs).format("YYYY-MM");
        const monthLabel = dayjs.unix(createdTs).format("MMM YYYY");
        if (!byMonthMap.has(monthKey)) {
          byMonthMap.set(monthKey, { key: monthKey, label: monthLabel, total: 0, won: 0, lost: 0 });
        }
        const m = byMonthMap.get(monthKey);
        m.total += 1;
        if (flags.won) m.won += 1;
        if (flags.lost) m.lost += 1;
      }
    }

    const totalDecisions = stats.won + stats.lost;
    const winRate = totalDecisions > 0 ? Number(((stats.won / totalDecisions) * 100).toFixed(1)) : 0;
    const conversionRate =
      stats.total_records > 0 ? Number(((stats.total_customer / stats.total_records) * 100).toFixed(1)) : 0;

    const byAe = Array.from(byAeMap.values()).sort((a, b) => b.total - a.total);
    const byMonth = Array.from(byMonthMap.values()).sort((a, b) => a.key.localeCompare(b.key));

    return NextResponse.json(
      {
        meta: {
          can_select_ae: canSelectAe,
          effective_ae_id: effectiveAeId || null,
          filters: {
            scope,
            date_field: dateField,
            date_from: dateFromStr || null,
            date_to: dateToStr || null,
            ae_id: effectiveAeId || null,
          },
        },
        stats: {
          ...stats,
          win_rate: winRate,
          conversion_rate: conversionRate,
        },
        breakdown: {
          by_ae: byAe,
          by_month: byMonth,
        },
        detail,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/crm/report error:", error);
    return NextResponse.json({ msg: "Failed to build CRM report." }, { status: 500 });
  }
});
