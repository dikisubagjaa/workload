import dayjs from "dayjs";
import { findRevisionsByStatus, findRevisionById, updateRevisionById } from "@/server/queries/revisionQueries";

export async function listUnderReviewRevisions(req) {
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const statusList = statusParam ? statusParam.split(",").map((s) => s.trim()) : ["in_review", "revise"];

  const rows = await findRevisionsByStatus(statusList);

  const seen = new Set();
  const latest = [];
  for (const r of rows) {
    const t = r.Task;
    if (!t) continue;
    if (seen.has(t.task_id)) continue;
    seen.add(t.task_id);
    latest.push(r);
  }

  const dataTaskReview = latest.map((r) => {
    const t = r.Task;
    const p = t?.Project;
    const submitted = r.created || r.submitted_at || r.updated || dayjs().unix();
    const daysSince = Math.max(0, dayjs().diff(dayjs.unix(submitted), "day"));

    return {
      key: String(r.revision_id),
      revision_id: r.revision_id,
      task_id: t.task_id,
      name: t.title || t.name || `Task #${t.task_id}`,
      version: r.version ? `v${String(r.version).padStart(2, "0")}` : "v01",
      projectClient: p?.title || p?.name || "-",
      progress: Number(t.progress ?? 0),
      SubmittedDated: dayjs.unix(submitted).format("DD MMM YYYY"),
      DaysSince: `${daysSince} Days`,
      status: (r.status || "in_review").replace("_", " "),
      btnCheck: r.status === "done",
    };
  });

  return { dataTaskReview };
}

export async function updateRevisionStatus(revisionId, body, currentUser) {
  const now = dayjs().unix();

  const rev = await findRevisionById(revisionId);
  if (!rev) return { httpStatus: 404, msg: "Revision not found." };

  const fields = {
    updated: now,
    updated_by: currentUser?.user_id ?? null,
  };

  if (body.status) {
    const s = String(body.status).toLowerCase();
    if (!["in_review", "revise", "done"].includes(s)) {
      return { httpStatus: 400, msg: "Invalid status." };
    }
    fields.status = s;
    if (s === "done") fields.done_at = now;
  }

  if (typeof body.note === "string") fields.note = body.note;

  await updateRevisionById(revisionId, fields);
  const updated = await findRevisionById(revisionId);

  return { msg: "Revision updated.", revision: updated?.toJSON ? updated.toJSON() : updated };
}
