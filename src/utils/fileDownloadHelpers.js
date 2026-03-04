// src/utils/fileDownloadHelpers.js
import { getStorageUrl } from "@/utils/storageHelpers";

/**
 * Ambil ekstensi file dari input (bisa path biasa atau /api/file?file=xxx.pdf)
 */
export function getFileExtension(input) {
  const s = String(input || "").trim();
  if (!s) return "";

  if (s.startsWith("/api/file?")) {
    try {
      const u = new URL(s, "http://localhost");
      const f = u.searchParams.get("file") || "";
      return getFileExtension(f);
    } catch {
      return "";
    }
  }

  const base = s.split("?")[0].split("/").pop() || "";
  const idx = base.lastIndexOf(".");
  if (idx <= 0) return "";
  return base.slice(idx + 1).toLowerCase();
}

/**
 * Normalize stored value → URL yang bisa diakses.
 * Legacy support:
 * - quotation: "/uploads/quotations/<file>" -> storage folder "quotation/quotations"
 * - po:       "/uploads/po/<file>"         -> storage folder "poquotation/po"
 *
 * Format baru (setelah backend rapih):
 * - "<basename>" -> "project/quotation" atau "project/po"
 */
export function resolveProjectDocumentUrl(raw, type) {
  if (!raw) return null;

  const s = String(raw).trim();
  if (!s) return null;

  // sudah gateway
  if (s.startsWith("/api/file?")) return s;

  // absolute URL (kalau ada)
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  const basename = s.split("?")[0].split("/").pop() || "";

  // legacy mapping
  if (type === "quotation" && s.includes("/uploads/quotations/")) {
    return getStorageUrl("quotation/quotations", basename);
  }
  if (type === "po" && s.includes("/uploads/po/")) {
    return getStorageUrl("poquotation/po", basename);
  }

  // format baru: basename saja
  const looksLikeBasenameOnly = !s.includes("/");
  if (looksLikeBasenameOnly) {
    if (type === "quotation") return getStorageUrl("project/quotation", basename);
    return getStorageUrl("project/po", basename);
  }

  // fallback biar gak ngerusak behavior lama yg mungkin udah ok
  return s;
}

/**
 * Download file dari URL (fetch blob → save as).
 * Return true kalau sukses, false kalau gagal.
 */
export async function downloadUrlAsFile(href, filename = "file") {
  const url = String(href || "").trim();
  if (!url) return false;

  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objUrl;
    a.download = filename || "file";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(objUrl);
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return false;
  }
}

export default {
  resolveProjectDocumentUrl,
  downloadUrlAsFile,
  getFileExtension,
};
