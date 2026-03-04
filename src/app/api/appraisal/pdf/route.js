// src/app/api/appraisal/pdf/route.js
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { jsonResponse } from "@/utils/apiResponse";
import { withActive } from "@/utils/session";
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { isTrue, getStaffIdField } from "@/utils/appraisalHelpers";
import { getAppraisalPdfData } from "@/server/controllers/appraisalController";

const LABEL_MAP = {
  1: "Tidak Memuaskan",
  2: "Kurang Memuaskan",
  3: "Cukup Memuaskan",
  4: "Memuaskan",
  5: "Sangat Memuaskan",
};

const COMPANY = {
  name: "PT. Alpha Guna Media",
  addressLines: [
    "Jl. Mas Putih Blok D No. 33, Kel. Grogol Utara, Kec.",
    "Kebayoran Lama",
    "Jakarta Selatan DKI Jakarta",
    "12210",
  ],
};

function sanitizeFileName(s) {
  return String(s || "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

function safeText(v, fallback = "-") {
  const s = (v ?? "").toString().trim();
  return s ? s : fallback;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

function ratingLabelFromAnswers(answersJson, questionId) {
  const ans = answersJson && typeof answersJson === "object" ? answersJson : {};
  const raw = ans[String(questionId)];
  const val = raw && typeof raw === "object" ? raw.value : raw;
  const n = val == null || val === "" ? NaN : Number(val);
  if (!Number.isFinite(n)) return "";
  return LABEL_MAP[n] || "";
}

function pickReviewer(approvalsJson) {
  const a = approvalsJson && typeof approvalsJson === "object" ? approvalsJson : {};
  return a.director || a.hod || a.superadmin || a.hrd || null;
}

function pickSignatures(approvalsJson) {
  const a = approvalsJson && typeof approvalsJson === "object" ? approvalsJson : {};
  return {
    manager: a.hod || null,
    hrd: a.hrd || null,
    director: a.director || a.superadmin || null,
  };
}

// Kalau path logomu beda, tinggal tambahin kandidatnya.
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

function buildHtml(row) {
  const staff = row.staff_snapshot_json || {};
  const emp = row.employment_snapshot_json || {};
  const approvals = row.approvals_json || {};
  const questions = Array.isArray(row.questions_json) ? row.questions_json : [];
  const answers = row.answers_json || {};

  const reviewer = pickReviewer(approvals);
  const { manager, hrd, director } = pickSignatures(approvals);

  const grade = safeText(row.grade || row?.scoring_json?.grade || "-", "-");

  // Font (sesuai project kamu)
  const fontRegularPath = path.join(process.cwd(), "public", "static", "fonts", "Nunito-Regular.ttf");
  const fontBoldPath = path.join(process.cwd(), "public", "static", "fonts", "Nunito-Bold.ttf");

  if (!fs.existsSync(fontRegularPath)) throw new Error(`Font not found: ${fontRegularPath}`);
  if (!fs.existsSync(fontBoldPath)) throw new Error(`Font not found: ${fontBoldPath}`);

  const nunitoRegularB64 = toBase64(fontRegularPath);
  const nunitoBoldB64 = toBase64(fontBoldPath);

  const logoUri = findLogoDataUri();

  const sortedQs = questions.slice().sort((a, b) => Number(a.sort_order) - Number(b.sort_order));

  // Evaluasi: baris tabel, kiri = title+desc (colspan 4), kanan = rating (colspan 1)
  const evalRows = sortedQs
    .map((q) => {
      const title = safeText(q.title, "-").toUpperCase();
      const desc = safeText(q.description, "");
      const label = ratingLabelFromAnswers(answers, q.question_id) || "-";

      return `
        <tr>
          <td class="evalLeft" colspan="4">
            <div class="evalTitle">${escapeHtml(title)}</div>
            ${desc ? `<div class="evalDesc">${escapeHtml(desc)}</div>` : ""}
          </td>
          <td class="evalRight">${escapeHtml(label)}</td>
        </tr>
      `;
    })
    .join("");

  const recAfter = safeText(emp.after_status, "-");
  const comment = safeText(row.general_comment, "");

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

    :root { --b: 1px solid #000; }

    * { box-sizing: border-box; }
    body {
      font-family: "NunitoEmbed", Arial, sans-serif;
      color: #000;
      font-size: 10px;
      margin: 0;
    }

    .top {
      width: 100%;
      display: table;
      table-layout: fixed;
      margin-bottom: 6px;
    }
    .top .left, .top .right {
      display: table-cell;
      vertical-align: top;
    }
    .top .left { width: 45%; }
    .top .right { width: 55%; text-align: right; }
    .logo {
      width: 90px;
      height: auto;
      opacity: 0.95;
    }
    .companyName { font-weight: 700; font-size: 11px; }
    .companyLine { line-height: 1.25; }

    .title {
      text-align: center;
      margin: 10px 0 10px;
    }
    .title .main { font-weight: 700; font-size: 14px; }
    .title .sub { font-weight: 700; font-size: 10px; margin-top: 2px; }

    table { border-collapse: collapse; width: 100%; table-layout: fixed; }

    /* Main big table */
    .mainTable { border: var(--b); }
    .mainTable th, .mainTable td { border: var(--b); padding: 6px 6px; vertical-align: top; }
    .mainHead th { text-align: center; font-weight: 700; padding: 6px 0; }

    .label { width: 20%; font-weight: 400; }
    .value { width: 25%; font-weight: 400; }
    .label2 { width: 15%; }
    .value2 { width: 20%; }
    .gradeCol { width: 20%; text-align: center; vertical-align: middle; }

    .gradeBig { font-weight: 700; font-size: 36px; line-height: 1; }

    .sectionRow td {
      text-align: center;
      font-weight: 700;
      padding: 6px 0;
    }

    /* Evaluasi rows */
    .evalLeft { padding: 8px 8px; }
    .evalRight {
      text-align: center;
      vertical-align: middle;
      font-weight: 400;
      padding: 8px 6px;
    }
    .evalTitle { font-weight: 700; margin-bottom: 4px; }
    .evalDesc { font-size: 9px; line-height: 1.25; }

    /* Rekomendasi table */
    .recTable { border: var(--b); margin-top: 0; }
    .recTable td { border: var(--b); padding: 6px; vertical-align: top; }
    .recLabel { width: 35%; }
    .recValue { width: 65%; font-weight: 700; }
    .recComment { font-size: 9px; line-height: 1.25; }

    /* signatures */
    .signWrap { margin-top: 18px; }
    .signTitle { text-align: center; font-weight: 700; margin-bottom: 12px; }
    .signCols { width: 100%; display: table; table-layout: fixed; }
    .signCol { display: table-cell; width: 33.33%; text-align: center; vertical-align: top; }
    .signRole { font-weight: 700; margin-bottom: 28px; }
    .signName { margin-top: 32px; font-size: 9px; }
    .signDate { margin-top: 6px; font-size: 9px; }

    .footer{
        position: fixed;
        left: 0;
        right: 0;
        bottom: 4mm;          /* jarak dari bawah kertas */
        text-align: center;
        font-size: 9px;
    }
  </style>
</head>
<body>

  <div class="top">
    <div class="left">
      ${logoUri ? `<img class="logo" src="${logoUri}" />` : ""}
    </div>
    <div class="right">
      <div class="companyName">${escapeHtml(COMPANY.name)}</div>
      ${COMPANY.addressLines.map((l) => `<div class="companyLine">${escapeHtml(l)}</div>`).join("")}
    </div>
  </div>

  <div class="title">
    <div class="main">PENILAIAN KINERJA KARYAWAN</div>
    <div class="sub">(Probation Period)</div>
  </div>

  <!-- BIG TABLE: Informasi Umum + Grade + Evaluasi -->
  <table class="mainTable">
    <colgroup>
      <col class="label" />
      <col class="value" />
      <col class="label2" />
      <col class="value2" />
      <col class="gradeCol" />
    </colgroup>

    <tr class="mainHead">
      <th colspan="4">Informasi Umum</th>
      <th>Grade</th>
    </tr>

    <tr>
      <td>Nama Karyawan</td>
      <td>${escapeHtml(safeText(staff.fullname, "-"))}</td>
      <td>Direview Oleh</td>
      <td>${escapeHtml(safeText(reviewer?.fullname, "-"))}</td>
      <td rowspan="3" class="gradeCol"><div class="gradeBig">${escapeHtml(safeText(grade, "-"))}</div></td>
    </tr>

    <tr>
      <td>Masa Percobaan</td>
      <td>${escapeHtml(safeText(emp.before_status, "-"))}</td>
      <td>Jabatan</td>
      <td>${escapeHtml(safeText(reviewer?.job_position, "-"))}</td>
    </tr>

    <tr>
      <td>Jabatan</td>
      <td>${escapeHtml(safeText(staff.job_position, "-"))}</td>
      <td></td>
      <td></td>
    </tr>

    <tr class="sectionRow">
      <td colspan="5">Evaluasi / Penilaian</td>
    </tr>

    ${evalRows}
  </table>

  <!-- Rekomendasi (boxed) -->
  <table class="recTable">
    <tr class="sectionRow">
      <td colspan="2">Rekomendasi</td>
    </tr>
    <tr>
      <td class="recLabel">Terhadap karyawan bersangkutan:</td>
      <td class="recValue">${escapeHtml(recAfter)}</td>
    </tr>
    <tr>
      <td colspan="2" class="recComment">${escapeHtml(comment && comment !== "-" ? comment : "")}</td>
    </tr>
  </table>

  <!-- Sign -->
  <div class="signWrap">
    <div class="signTitle">Telah Disahkan Oleh</div>
    <div class="signCols">
      <div class="signCol">
        <div class="signRole">Manager</div>
        <div class="signName">${escapeHtml(safeText(manager?.fullname, "-"))}</div>
        <div class="signDate">${escapeHtml(formatDateDDMMYYYYFromUnix(manager?.approved_at) || "")}</div>
      </div>
      <div class="signCol">
        <div class="signRole">HRD</div>
        <div class="signName">${escapeHtml(safeText(hrd?.fullname, "-"))}</div>
        <div class="signDate">${escapeHtml(formatDateDDMMYYYYFromUnix(hrd?.approved_at) || "")}</div>
      </div>
      <div class="signCol">
        <div class="signRole">Direktur</div>
        <div class="signName">${escapeHtml(safeText(director?.fullname, "-"))}</div>
        <div class="signDate">${escapeHtml(formatDateDDMMYYYYFromUnix(director?.approved_at) || "")}</div>
      </div>
    </div>

    <div class="footer">1/1</div>
  </div>

</body>
</html>
  `;
}

async function renderPdfFromHtml(html) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });

    // Print setting biar border tipis tetap kelihatan
    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
    });
  } finally {
    await browser.close();
  }
}

export const GET = withActive(async function GET_HANDLER(req, ctx, currentUser) {
  try {
    const { searchParams } = new URL(req.url);
    const appraisalId = Number(searchParams.get("appraisalId"));

    if (!Number.isFinite(appraisalId)) {
      return jsonResponse({ msg: "Invalid appraisalId" }, { status: 400 });
    }

    const row = await getAppraisalPdfData(appraisalId);

    if (!row) return jsonResponse({ msg: "Not found" }, { status: 404 });

    const staffIdField = getStaffIdField();
    const myId = Number(currentUser?.user_id);

    // akses: superadmin atau pemilik
    if (!isTrue(currentUser?.is_superadmin) && Number(row?.[staffIdField]) !== myId) {
      return jsonResponse({ msg: "Forbidden" }, { status: 403 });
    }

    const obj = row.toJSON ? row.toJSON() : row;
    const html = buildHtml(obj);
    const buffer = await renderPdfFromHtml(html);

    const staffName = obj?.staff_snapshot_json?.fullname || `staff_${obj?.[staffIdField]}`;
    const fileName = sanitizeFileName(`PENILAIAN_KINERJA_${staffName}_${appraisalId}.pdf`);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/appraisal/pdf msg:", error);
    return jsonResponse({ msg: error?.message || "Failed." }, { status: 500 });
  }
});
