// src/utils/imageHelpers.js
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import axios from "axios";
import sharp from "sharp";

/** ====== Konfigurasi dasar ====== */
const allowedImages = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif", // GIF tidak di-resize (biar aman, kita treat sebagai non-animated static → kalau butuh, bisa diubah)
]);

const allowedDocs = new Set([
    "application/pdf",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
]);

const DEFAULT_RESIZE = { width: 300, height: 300 };

/** ====== Util umum ====== */
function storageRoot() {
    // Penyimpanan "sejajar" dengan public
    return path.join(process.cwd(), "storage");
}

async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true });
}

function toSlugBase(name = "") {
    const base = String(name).trim().replace(/\.[^.]+$/, "");
    return base
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "file";
}

function safeExtFromName(name = "", fallback = ".bin") {
    const ext = path.extname(String(name)).toLowerCase();
    if (!ext || ext.length > 10) return fallback;
    return ext;
}

function randomKey(n = 8) {
    return crypto.randomBytes(n).toString("hex");
}

function nowStamp() {
    return Date.now();
}

/**
 * Ekstrak nama file dari:
 * - URL absolut: https://domain.com/storage/profile/abc.jpg
 * - path: /storage/profile/abc.jpg atau profile/abc.jpg
 * - atau langsung nama file: abc.jpg
 */
export function getFilename(input) {
    if (!input) return "";
    try {
        // Jika URL
        const u = new URL(String(input));
        const last = u.pathname.split("/").filter(Boolean).pop();
        return last || "";
    } catch {
        // Bukan URL: treat as path
        const clean = String(input).split("?")[0].split("#")[0];
        const last = clean.split("/").filter(Boolean).pop();
        return last || "";
    }
}

/**
 * Dapatkan path absolut untuk original & resized di folder yang diminta.
 * Tidak membuat folder — gunakan ensureDir secara terpisah.
 */
function resolveStoragePaths(folder, filename, opts = { resized: true }) {
    const root = storageRoot();
    const dir = path.join(root, folder);
    const originalAbs = path.join(dir, filename);

    let resizedAbs = null;
    if (opts?.resized) {
        const base = toSlugBase(filename);
        const resizedDir = path.join(dir, "resized");
        // Simpan resized sebagai .webp untuk konsistensi & hemat
        const resizedName = `${base}.webp`;
        resizedAbs = path.join(resizedDir, resizedName);
        return { originalAbs, resizedAbs, resizedName, dir, resizedDir };
    }
    return { originalAbs, resizedAbs: null, resizedName: null, dir, resizedDir: null };
}

/** Simpan buffer ke file tujuan (overwrite aman). */
async function writeFileAbs(absPath, buffer) {
    await ensureDir(path.dirname(absPath));
    await fs.writeFile(absPath, buffer);
}

/**
 * Resize gambar jadi WEBP (fit: cover).
 * @param {string} inputPath - path gambar input
 * @param {string} outputPath - path output .webp
 * @param {number} width
 * @param {number} height
 */
export async function resizeImage(inputPath, outputPath, width = DEFAULT_RESIZE.width, height = DEFAULT_RESIZE.height) {
    // Jika input GIF animasi, sharp akan ambil frame pertama; untuk sekarang kita biarkan default.
    await ensureDir(path.dirname(outputPath));
    await sharp(inputPath)
        .resize(width, height, { fit: "cover", withoutEnlargement: true })
        .toFormat("webp")
        .toFile(outputPath);
}

/**
 * Upload file dari multipart/form-data (Next.js Web File/Blob).
 * - Simpan ke storage/<folder>/<unique>.<ext>
 * - Jika image → buat resized di storage/<folder>/resized/<slug>.webp
 * @param {File|Blob} file
 * @param {string} folder
 * @returns {Promise<{ original: string, resized?: string }>}
 */
export async function uploadFile(file, folder = "uploads") {
    if (!file) throw new Error("File tidak ditemukan");

    // Deteksi tipe
    const mime = String(file.type || "").toLowerCase();
    const isImage = allowedImages.has(mime);
    const isDoc = allowedDocs.has(mime);

    if (!isImage && !isDoc) {
        throw new Error("Format file tidak didukung");
    }

    // Dapatkan buffer & nama aman
    const buf = Buffer.from(await file.arrayBuffer());
    const ext = isImage ? safeExtFromName(file.name || "image", ".jpg") : safeExtFromName(file.name || "doc", ".bin");

    const baseSlug = toSlugBase(file.name || (isImage ? "image" : "file"));
    const unique = `${nowStamp()}-${randomKey(6)}-${baseSlug}`.slice(0, 120);
    const originalName = `${unique}${ext}`;

    // Path absolut
    const { originalAbs, resizedAbs, resizedName, dir, resizedDir } = resolveStoragePaths(folder, originalName, { resized: isImage });

    // Tulis original
    await ensureDir(dir);
    await writeFileAbs(originalAbs, buf);

    // Resize bila image
    let out = { original: originalName };
    if (isImage && resizedAbs && resizedName) {
        await ensureDir(resizedDir);
        // Resize dari originalAbs (agar EXIF sudah fix)
        await resizeImage(originalAbs, resizedAbs, DEFAULT_RESIZE.width, DEFAULT_RESIZE.height);
        out.resized = resizedName;
    }

    return out;
}

/**
 * Unduh gambar dari URL, simpan sebagai original, dan buat resized webp.
 * Hanya untuk image (akan lempar error jika MIME bukan image).
 * @param {string} imageUrl
 * @param {string} folder
 * @returns {Promise<{ original: string, resized?: string }>}
 */
export async function downloadAndSaveImage(imageUrl, folder = "uploads") {
    if (!imageUrl) throw new Error("URL gambar tidak ditemukan");

    // Download sebagai buffer
    const res = await axios.get(imageUrl, { responseType: "arraybuffer", validateStatus: (s) => s >= 200 && s < 400 });
    const contentType = String(res.headers?.["content-type"] || "").toLowerCase();

    if (!allowedImages.has(contentType)) {
        throw new Error(`Tipe konten tidak didukung: ${contentType || "unknown"}`);
    }

    // Tentukan nama
    let urlExt = ".jpg";
    try {
        const u = new URL(imageUrl);
        const pext = path.extname(u.pathname);
        if (pext) urlExt = pext.toLowerCase();
    } catch {
        // abaikan
    }

    const baseSlug = toSlugBase(path.basename(imageUrl));
    const unique = `${nowStamp()}-${randomKey(6)}-${baseSlug}`.slice(0, 120);
    const originalName = `${unique}${urlExt}`;

    const { originalAbs, resizedAbs, resizedName, dir, resizedDir } = resolveStoragePaths(folder, originalName, { resized: true });

    await ensureDir(dir);
    await writeFileAbs(originalAbs, Buffer.from(res.data));

    await ensureDir(resizedDir);
    await resizeImage(originalAbs, resizedAbs, DEFAULT_RESIZE.width, DEFAULT_RESIZE.height);

    return { original: originalName, resized: resizedName };
}

/** ====== (Opsional) Helper kecil untuk path publik statis — tidak dipakai untuk API viewer ====== */
/** Menghasilkan path relatif "storage/<folder>/<filename>" bila kamu butuh path fisik. */
export function buildStorageRelativePath(folder, filename) {
    const cleanFolder = String(folder || "").replace(/^[\\/]+|[\\/]+$/g, "");
    const cleanFile = getFilename(filename);
    return path.join("storage", cleanFolder, cleanFile).replace(/\\/g, "/");
}

/** Cek keberadaan file di storage */
export async function existsInStorage(folder, filename, { resized = false } = {}) {
    const f = getFilename(filename);
    const { originalAbs, resizedAbs } = resolveStoragePaths(folder, f, { resized });
    try {
        await fs.stat(resized ? resizedAbs : originalAbs);
        return true;
    } catch {
        return false;
    }
}
