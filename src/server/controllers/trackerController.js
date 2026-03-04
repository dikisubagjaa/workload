import dayjs, { TZ } from "@/utils/dayjs";
import { Op, findRecentProjects, findProjectsByRange, findProposalsByRange, findPurchaseOrdersByRange } from "@/server/queries/trackerQueries";

function toYMD(s) {
  const d = dayjs(String(s || "").trim(), "YYYY-MM-DD", true);
  return d.isValid() ? d.format("YYYY-MM-DD") : null;
}

function toUnixStart(ymd) {
  if (!ymd) return null;
  return dayjs.tz(ymd, "YYYY-MM-DD", TZ).startOf("day").unix();
}

function toUnixEnd(ymd) {
  if (!ymd) return null;
  return dayjs.tz(ymd, "YYYY-MM-DD", TZ).endOf("day").unix();
}

function toYMDFromCreated(created) {
  if (created == null) return null;
  if (typeof created === "number") return dayjs.unix(created).tz(TZ).format("YYYY-MM-DD");
  const d = dayjs(created);
  return d.isValid() ? d.tz(TZ).format("YYYY-MM-DD") : null;
}

function normRow({ id, category, title, client, created }) {
  return {
    id,
    category,
    title: title || "-",
    client: client || "-",
    date: toYMDFromCreated(created),
    status: null,
    _created: typeof created === "number" ? created : (dayjs(created).isValid() ? dayjs(created).unix() : 0),
  };
}

export async function getRecentActivity() {
  const recentActivity = await findRecentProjects(10);
  return { data: recentActivity };
}

export async function getTrackerList(req) {
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

  const category = (searchParams.get("category") || "all").toLowerCase();
  const q = (searchParams.get("q") || "").trim();
  const from = toYMD(searchParams.get("from"));
  const to = toYMD(searchParams.get("to"));
  const fromUnix = toUnixStart(from);
  const toUnix = toUnixEnd(to);

  const sortBy = (searchParams.get("sortBy") || "date").toLowerCase();
  const sortDir = (searchParams.get("sortDir") || "desc").toLowerCase() === "asc" ? "asc" : "desc";

  const rangeWhere = (modelField = "created") => {
    if (fromUnix != null && toUnix != null) {
      return { [modelField]: { [Op.between]: [fromUnix, toUnix] } };
    }
    return {};
  };

  const results = [];

  if (category === "project" || category === "all") {
    const rows = await findProjectsByRange(rangeWhere);
    rows.forEach((r) => {
      const j = r.toJSON();
      results.push(
        normRow({
          id: j.project_id,
          category: "project",
          title: j.title,
          client: j.Client?.client_name,
          created: j.created,
        })
      );
    });
  }

  if (category === "proposal" || category === "all") {
    const pqRows = await findProposalsByRange(rangeWhere);
    pqRows.forEach((r) => {
      const j = r.toJSON();
      results.push(
        normRow({
          id: j.pq_id,
          category: "proposal",
          title: j.quotation_number || j.Project?.title,
          client: j.Project?.Client?.client_name,
          created: j.created,
        })
      );
    });
  }

  if (category === "po" || category === "all") {
    const poRows = await findPurchaseOrdersByRange(rangeWhere);
    poRows.forEach((r) => {
      const j = r.toJSON();
      results.push(
        normRow({
          id: j.po_id,
          category: "po",
          title: j.po_number || j.Quotation?.quotation_number || j.Quotation?.Project?.title,
          client: j.Quotation?.Project?.Client?.client_name,
          created: j.created,
        })
      );
    });
  }

  let filtered = results;
  if (q) {
    const qq = q.toLowerCase();
    filtered = filtered.filter((it) => {
      const T = (it.title || "").toLowerCase();
      const C = (it.client || "").toLowerCase();
      return T.includes(qq) || C.includes(qq);
    });
  }

  const sorter = {
    date: (a, b) => (a._created || 0) - (b._created || 0),
    title: (a, b) => String(a.title || "").localeCompare(String(b.title || ""), undefined, { sensitivity: "base" }),
    client: (a, b) => String(a.client || "").localeCompare(String(b.client || ""), undefined, { sensitivity: "base" }),
    category: (a, b) => String(a.category || "").localeCompare(String(b.category || ""), undefined, { sensitivity: "base" }),
  }[sortBy] || ((a, b) => (a._created || 0) - (b._created || 0));

  filtered.sort(sorter);
  if (sortDir === "desc") filtered.reverse();

  const total = filtered.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const pageData = filtered.slice(start, end).map(({ _created, ...rest }) => rest);

  return { data: pageData, meta: { page, limit, total } };
}
