export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import {
  getAnnualAssessmentAnswers,
  getAnnualAssessmentPdfQuestions,
  getAnnualAssessmentPdfSingleData,
  getAnnualAssessmentPdfUsers,
  getAnnualAssessmentPdfZipData,
} from "@/server/controllers/annualAssestmentController";

import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { PassThrough, Readable } from "stream";

function getRunningPeriod() {
  const year = new Date().getFullYear();
  return { periodFromYear: year - 1, periodToYear: year };
}

function normalizeBool(v) {
  return v === true || v === "true" || v === 1 || v === "1";
}

function getRole(currentUser) {
  return String(currentUser?.user_role || currentUser?.role || "").toLowerCase();
}

function isSuperOrHrd(currentUser) {
  const r = getRole(currentUser);
  return r === "superadmin" || r === "hrd";
}

function isHod(currentUser) {
  return normalizeBool(currentUser?.is_hod);
}

function isDirector(currentUser) {
  return normalizeBool(currentUser?.is_director_operational);
}

function ratingLabel(n) {
  const num = Number(n);
  if (num === 1) return "1 - Mengecewakan";
  if (num === 2) return "2 - Perlu Ditingkatkan";
  if (num === 3) return "3 - Baik / Cukup Baik";
  if (num === 4) return "4 - Sangat Baik";
  if (num === 5) return "5 - Di Atas Rata-rata";
  return String(n ?? "-");
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeText(v, fallback = "-") {
  const s = (v ?? "").toString().trim();
  return s ? s : fallback;
}

function toBase64(filePath) {
  const buf = fs.readFileSync(filePath);
  return buf.toString("base64");
}

function formatDateDDMMYYYYFromUnix(unix) {
  if (!unix) return "";
  const n = Number(unix);
  if (!Number.isFinite(n)) return "";
  const d = new Date(n * 1000);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

function findLogoDataUri() {
  const candidates = [
    path.join(process.cwd(), "public", "static", "images", "logo.png"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const ext = path.extname(p).toLowerCase();
      const mime =
        ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".svg"
            ? "image/svg+xml"
            : "image/png";
      const b64 = toBase64(p);
      return `data:${mime};base64,${b64}`;
    }
  }
  return null;
}

function getAnswerValue(raw) {
  if (raw == null) return null;
  if (typeof raw === "object") {
    if (typeof raw.value !== "undefined") return raw.value;
    return null;
  }
  return raw;
}

function getAnswerText(raw) {
  if (raw == null) return "";
  if (typeof raw === "object") {
    if (typeof raw.text === "string") return raw.text;
    if (typeof raw.note === "string") return raw.note;
    return "";
  }
  if (typeof raw === "string") return raw;
  return "";
}

function sanitizeFileName(s) {
  return String(s || "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

async function assertCanDownloadSingle({ currentUser, targetStaffId, assestmentRow }) {
  const meId = Number(currentUser?.user_id);

  // superadmin/hrd: bebas
  if (isSuperOrHrd(currentUser)) return;

  // director: dirinya sendiri atau assignment
  if (isDirector(currentUser)) {
    if (Number(targetStaffId) === meId) return;
    const dirId = Number(assestmentRow?.operational_director_id || 0);
    if (dirId && dirId === meId) return;
  }

  // staff biasa: hanya dirinya sendiri
  if (!isHod(currentUser)) {
    if (Number(targetStaffId) !== meId) {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }
    return;
  }

  // HOD: boleh dirinya sendiri, atau staff yang dia review (hod_id match)
  if (Number(targetStaffId) === meId) return;

  const hodId = Number(assestmentRow?.hod_id || 0);
  if (hodId && hodId === meId) return;

  const err = new Error("Forbidden");
  err.statusCode = 403;
  throw err;
}

function buildHtml({ assestmentRow, staff, hod, hrd, director, questions, staffAnswers, hodAnswers }) {
  const periodFrom = assestmentRow?.period_from_year ?? "-";
  const periodTo = assestmentRow?.period_to_year ?? "-";
  const status = assestmentRow?.status || "-";

  const staffName =
    staff?.fullname || staff?.name || staff?.full_name || `Staff ${assestmentRow?.staff_id}`;
  const hodName = hod?.fullname || hod?.name || hod?.full_name || "-";
  const hrdName = hrd?.fullname || hrd?.name || hrd?.full_name || "-";
  const dirName = director?.fullname || director?.name || director?.full_name || "-";

  const fontRegularPath = path.join(process.cwd(), "public", "static", "fonts", "Nunito-Regular.ttf");
  const fontBoldPath = path.join(process.cwd(), "public", "static", "fonts", "Nunito-Bold.ttf");

  if (!fs.existsSync(fontRegularPath)) throw new Error(`Font not found: ${fontRegularPath}`);
  if (!fs.existsSync(fontBoldPath)) throw new Error(`Font not found: ${fontBoldPath}`);

  const nunitoRegularB64 = toBase64(fontRegularPath);
  const nunitoBoldB64 = toBase64(fontBoldPath);
  const logoUri = findLogoDataUri();

  const rows = (questions || [])
    .map((q, idx) => {
      const key = q.question_key || q.questionKey || q.key;
      if (!key) return "";
      const inputType = String(q.input_type || q.inputType || "rating").toLowerCase();
      const staffRaw = staffAnswers?.[key];
      const hodRaw = hodAnswers?.[key];

      if (inputType === "rating") {
        const sVal = getAnswerValue(staffRaw);
        const sNote = getAnswerText(staffRaw);
        const hVal = getAnswerValue(hodRaw);
        const hNote = getAnswerText(hodRaw);

        return `
          <tr>
            <td class="qCol">
              <div class="qTitle">${idx + 1}. ${escapeHtml(safeText(q.title, "-"))}</div>
              ${q.description ? `<div class="qDesc">${escapeHtml(String(q.description))}</div>` : ""}
            </td>
            <td class="aCol">
              <div class="aLine">Staff: ${escapeHtml(sVal ? ratingLabel(sVal) : "-")}</div>
              ${sNote ? `<div class="aNote">${escapeHtml(sNote)}</div>` : ""}
            </td>
            <td class="aCol">
              <div class="aLine">HOD: ${escapeHtml(hVal ? ratingLabel(hVal) : "-")}</div>
              ${hNote ? `<div class="aNote">${escapeHtml(hNote)}</div>` : ""}
            </td>
          </tr>
        `;
      }

      const sText = getAnswerText(staffRaw);
      return `
        <tr>
          <td class="qCol">
            <div class="qTitle">${idx + 1}. ${escapeHtml(safeText(q.title, "-"))}</div>
            ${q.description ? `<div class="qDesc">${escapeHtml(String(q.description))}</div>` : ""}
          </td>
          <td class="aCol" colspan="2">
            <div class="aLine">Staff: ${escapeHtml(sText || "-")}</div>
          </td>
        </tr>
      `;
    })
    .join("");

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: A4; margin: 9mm; }
    @font-face {
      font-family: "NunitoEmbed";
      src: url("data:font/ttf;base64,${nunitoRegularB64}") format("truetype");
      font-weight: 400;
    }
    @font-face {
      font-family: "NunitoEmbed";
      src: url("data:font/ttf;base64,${nunitoBoldB64}") format("truetype");
      font-weight: 700;
    }
    * { box-sizing: border-box; }
    body { font-family: "NunitoEmbed", Arial, sans-serif; font-size: 10px; color: #000; margin: 0; }
    .top { width: 100%; display: table; table-layout: fixed; margin-bottom: 6px; }
    .top .left, .top .right { display: table-cell; vertical-align: top; }
    .top .left { width: 45%; }
    .top .right { width: 55%; text-align: right; }
    .logo { width: 90px; height: auto; opacity: 0.95; }
    .title { text-align: center; margin: 8px 0 10px; font-weight: 700; font-size: 14px; }
    .metaTable { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    .metaTable td { border: 1px solid #000; padding: 4px 6px; }
    .qTable { width: 100%; border-collapse: collapse; }
    .qTable th, .qTable td { border: 1px solid #000; padding: 6px; vertical-align: top; }
    .qHead { font-weight: 700; text-align: center; }
    .qCol { width: 52%; }
    .aCol { width: 24%; }
    .qTitle { font-weight: 700; margin-bottom: 4px; }
    .qDesc { font-size: 9px; line-height: 1.25; }
    .aLine { font-weight: 400; }
    .aNote { font-size: 9px; color: #333; margin-top: 3px; }
    .signWrap { margin-top: 14px; }
    .signCols { width: 100%; display: table; table-layout: fixed; }
    .signCol { display: table-cell; width: 33.33%; text-align: center; vertical-align: top; }
    .signRole { font-weight: 700; margin-bottom: 22px; }
    .signName { margin-top: 28px; font-size: 9px; }
    .signDate { margin-top: 6px; font-size: 9px; }
  </style>
</head>
<body>
  <div class="top">
    <div class="left">
      ${logoUri ? `<img class="logo" src="${logoUri}" />` : ""}
    </div>
    <div class="right">
      <div>${escapeHtml("Annual Review")}</div>
      <div>${escapeHtml(`Period ${periodFrom} - ${periodTo}`)}</div>
    </div>
  </div>

  <div class="title">ANNUAL PERFORMANCE REVIEW</div>

  <table class="metaTable">
    <tr>
      <td>Staff</td>
      <td>${escapeHtml(safeText(staffName))}</td>
      <td>Status</td>
      <td>${escapeHtml(safeText(status))}</td>
    </tr>
    <tr>
      <td>HOD</td>
      <td>${escapeHtml(safeText(hodName))}</td>
      <td>HRD</td>
      <td>${escapeHtml(safeText(hrdName))}</td>
    </tr>
    <tr>
      <td>Director</td>
      <td>${escapeHtml(safeText(dirName))}</td>
      <td>Generated</td>
      <td>${escapeHtml(new Date().toLocaleString("en-GB"))}</td>
    </tr>
  </table>

  <table class="qTable">
    <tr class="qHead">
      <th>Question</th>
      <th>Staff</th>
      <th>HOD</th>
    </tr>
    ${rows}
  </table>

  <div class="signWrap">
    <div class="signCols">
      <div class="signCol">
        <div class="signRole">HOD</div>
        <div class="signName">${escapeHtml(safeText(hod?.fullname, "-"))}</div>
        <div class="signDate">${escapeHtml(formatDateDDMMYYYYFromUnix(assestmentRow?.approval_hod_at) || "")}</div>
      </div>
      <div class="signCol">
        <div class="signRole">HRD</div>
        <div class="signName">${escapeHtml(safeText(hrd?.fullname, "-"))}</div>
        <div class="signDate">${escapeHtml(formatDateDDMMYYYYFromUnix(assestmentRow?.approval_hrd_at) || "")}</div>
      </div>
      <div class="signCol">
        <div class="signRole">Director</div>
        <div class="signName">${escapeHtml(safeText(director?.fullname, "-"))}</div>
        <div class="signDate">${escapeHtml(
          formatDateDDMMYYYYFromUnix(assestmentRow?.approval_operational_director_at) || ""
        )}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

async function renderPdfFromHtml(html, browser) {
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "load" });
    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
    });
  } finally {
    await page.close();
  }
}

function jsonError(message, status = 500) {
  return jsonResponse({ msg: message }, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET = withActive(async function GET_HANDLER(req, ctx, currentUser) {
  try {
    const url = new URL(req.url);

    const download = String(url.searchParams.get("download") || "").toLowerCase(); // 'zip' untuk all
    const scope = String(url.searchParams.get("scope") || "").toLowerCase(); // 'all'
    const statusFilterRaw = String(url.searchParams.get("status") || "approved").toLowerCase(); // approved|all
    const statusFilter = statusFilterRaw === "finalized" ? "approved" : statusFilterRaw;

    const yearParam = url.searchParams.get("year");
    const { periodToYear } = getRunningPeriod();
    const year = yearParam ? Number(yearParam) : periodToYear;

    if (!year || Number.isNaN(year)) {
      return jsonError("Invalid year", 400);
    }

    // =========================
    // ZIP MODE (superadmin/hrd only)
    // =========================
    if (download === "zip") {
      if (!isSuperOrHrd(currentUser)) {
        return jsonError("Forbidden", 403);
      }

      // scope=all (default all)
      const wantAll = scope === "all" || !scope;

      if (!wantAll) {
        return jsonError("Invalid scope. Use scope=all for ZIP.", 400);
      }

      const where = {
        period_to_year: year,
      };

      if (statusFilter !== "all") {
        where.status = "approved";
      }

      const rows = await getAnnualAssessmentPdfZipData({ year, statusFilter });

      const pass = new PassThrough();
      const zip = archiver("zip", { zlib: { level: 9 } });

      zip.on("error", (err) => {
        pass.destroy(err);
      });

      zip.pipe(pass);

      const browser = await chromium.launch({ headless: true });
      try {
        // generate sequential (lebih aman untuk memory)
        for (const row of rows) {
        const staffId = Number(row.staff_id);
        const hodId = row.hod_id ? Number(row.hod_id) : null;
        const hrdId = row.hrd_id ? Number(row.hrd_id) : null;
        const directorId = row.operational_director_id ? Number(row.operational_director_id) : null;

        const { staff, hod, hrd, director } = await getAnnualAssessmentPdfUsers({
          staffId,
          hodId,
          hrdId,
          directorId,
        });
        const staffName =
          staff?.fullname || staff?.name || staff?.full_name || `staff_${staffId}`;

        const questions = await getAnnualAssessmentPdfQuestions(row);
        const staffAnswers = getAnnualAssessmentAnswers(row, "staff");
        const hodAnswers = getAnnualAssessmentAnswers(row, "hod");

        const html = buildHtml({
          assestmentRow: row,
          staff,
          hod,
          hrd,
          director,
          questions,
          staffAnswers,
          hodAnswers,
        });
        const pdfBuffer = await renderPdfFromHtml(html, browser);

        const fileName = sanitizeFileName(
          `${year}_AnnualReview_${staffName}_ID${staffId}.pdf`
        );

        zip.append(pdfBuffer, { name: fileName });
      }
      } finally {
        await browser.close();
      }

      await zip.finalize();

      const webStream = Readable.toWeb(pass);

      return new Response(webStream, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="annual_review_${year}_all.zip"`,
        },
      });
    }

    // =========================
    // SINGLE PDF MODE
    // =========================
    const staffIdParam = url.searchParams.get("staffId");
    const targetStaffId = staffIdParam ? Number(staffIdParam) : Number(currentUser?.user_id);

    if (!targetStaffId || Number.isNaN(targetStaffId)) {
      return jsonError("Invalid staffId", 400);
    }

    const row = await getAnnualAssessmentPdfSingleData({ targetStaffId, year });

    if (!row) {
      return jsonError("Assessment not found", 404);
    }

    await assertCanDownloadSingle({
      currentUser,
      targetStaffId,
      assestmentRow: row,
    });

    const staffId = Number(row.staff_id);
    const hodId = row.hod_id ? Number(row.hod_id) : null;
    const hrdId = row.hrd_id ? Number(row.hrd_id) : null;
    const directorId = row.operational_director_id ? Number(row.operational_director_id) : null;
    const { staff, hod, hrd, director } = await getAnnualAssessmentPdfUsers({
      staffId,
      hodId,
      hrdId,
      directorId,
    });

    const questions = await getAnnualAssessmentPdfQuestions(row);
    const staffAnswers = getAnnualAssessmentAnswers(row, "staff");
    const hodAnswers = getAnnualAssessmentAnswers(row, "hod");

    const html = buildHtml({
      assestmentRow: row,
      staff,
      hod,
      hrd,
      director,
      questions,
      staffAnswers,
      hodAnswers,
    });
    const browser = await chromium.launch({ headless: true });
    const pdfBuffer = await renderPdfFromHtml(html, browser);
    await browser.close();

    const staffName =
      staff?.fullname || staff?.name || staff?.full_name || `staff_${staffId}`;
    const fileName = sanitizeFileName(`${year}_AnnualReview_${staffName}.pdf`);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (e) {
    const code = e?.statusCode || 500;
    return jsonError(e?.message || "Internal error", code);
  }
});
