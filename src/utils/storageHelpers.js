// src/utils/storageHelpers.js

/**
 * Bangun URL API file dari folder di /storage.
 * Contoh hasil: "/api/storage?folder=profile&file=abcd.jpg&resized=1"
 *
 * @param {string} folder - nama folder top-level di storage (mis: "profile", "task")
 * @param {string} filename - nama file (basename), contoh "abcd.jpg"
 * @param {object} [opts]
 * @param {boolean} [opts.resized] - jika true, tambahkan ?resized=1 → ambil versi resized (.webp)
 * @param {('sm'|'small')} [opts.size] - alternatif: ?size=sm
 * @returns {string}
 */
export function getStorageUrl(folder, filename, opts = {}) {
  const f = String(folder || "").trim();
  const name = String(filename || "").trim();
  if (!f || !name) return "";

  const params = new URLSearchParams();
  params.set("folder", f);
  params.set("file", name);

  if (opts.resized) {
    params.set("resized", "1");
  } else if (opts.size === "sm" || opts.size === "small") {
    params.set("size", "sm");
  }

  return `/api/file?${params.toString()}`;
}

/**
 * Helper khusus untuk foto profil.
 * Default: pakai versi resized (webp 300x300) agar ringan.
 *
 * @param {string} filename
 * @param {{resized?: boolean, size?: 'sm'|'small'}} [opts]
 * @returns {string}
 */
export function getProfileImageUrl(filename, opts = { resized: true }) {
  const name = String(filename || "").trim();
  if (!name) return "";
  return getStorageUrl("profile", name, { resized: opts?.resized !== false, size: opts?.size });
}

export default {
  getStorageUrl,
  getProfileImageUrl,
};
