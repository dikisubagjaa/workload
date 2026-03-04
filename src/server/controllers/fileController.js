import { NextResponse } from "next/server";
import fsMod from "fs";
import path from "path";
import crypto from "crypto";

const fs = fsMod.promises;

const RAW_STORAGE_DIR = process.env.STORAGE_DIR || "storage";
const STORAGE_DIR = path.isAbsolute(RAW_STORAGE_DIR)
  ? RAW_STORAGE_DIR
  : path.resolve(process.cwd(), RAW_STORAGE_DIR);

const EMPTY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=";

function placeholderResponse() {
  const buf = Buffer.from(EMPTY_PNG_BASE64, "base64");
  const headers = new Headers();
  headers.set("Content-Type", "image/png");
  headers.set("Content-Length", String(buf.length));
  headers.set("Cache-Control", "public, max-age=60");
  return new NextResponse(buf, { status: 200, headers });
}

function extToMime(ext) {
  switch (ext.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".avif":
      return "image/avif";
    case ".bmp":
      return "image/bmp";
    default:
      return "application/octet-stream";
  }
}

function sanitize(p) {
  const norm = path.posix.normalize(String(p || "").replace(/\\/g, "/"));
  if (norm.startsWith("..") || path.isAbsolute(norm)) return null;
  if (norm.includes("\0")) return null;
  return norm;
}

async function readFileWithStat(absPath) {
  const stat = await fs.stat(absPath);
  if (!stat.isFile()) throw new Error("Not a file");
  const data = await fs.readFile(absPath);
  return { data, stat };
}

function makeETag(stat) {
  const mtime = stat.mtimeMs?.toString() || "";
  const size = stat.size?.toString() || "";
  const hash = crypto.createHash("sha1").update(size + ":" + mtime).digest("hex").slice(0, 16);
  return `"w-${hash}"`;
}

export async function getFileResponse(req) {
  try {
    const urlObj = "nextUrl" in req ? req.nextUrl : new URL(req.url);
    const searchParams = urlObj.searchParams;

    const folder = sanitize(searchParams.get("folder") || "");
    const file = sanitize(searchParams.get("file") || "");
    const explicitSize = searchParams.get("size");
    const wantResized = searchParams.has("resized") || explicitSize === "sm";
    const asDownload = searchParams.get("download") === "1";

    if (!folder || !file) {
      return placeholderResponse();
    }

    const folderAbs = path.resolve(STORAGE_DIR, folder);
    if (!folderAbs.startsWith(STORAGE_DIR)) {
      return placeholderResponse();
    }

    const base = path.posix.basename(file);
    const origAbsPath = path.resolve(folderAbs, base);

    const resizedName = base.replace(/\.[^.]+$/, ".webp");
    const resizedAbsPath = path.resolve(folderAbs, "resized", resizedName);

    const candidates = wantResized ? [resizedAbsPath, origAbsPath] : [origAbsPath];

    let chosen = null;
    let payload = null;
    let stat = null;

    for (const p of candidates) {
      try {
        const res = await readFileWithStat(p);
        chosen = p;
        payload = res.data;
        stat = res.stat;
        break;
      } catch {
        // ignore
      }
    }

    if (!chosen || !payload || !stat) {
      return placeholderResponse();
    }

    const mime = extToMime(path.extname(chosen));

    const etag = makeETag(stat);
    const ifNoneMatch = req.headers.get("if-none-match") || "";
    if (ifNoneMatch.replace(/-gzip$/, "") === etag) {
      const notModified = new NextResponse(null, { status: 304 });
      notModified.headers.set("ETag", etag);
      notModified.headers.set("Cache-Control", "public, max-age=31536000, immutable");
      notModified.headers.set("Last-Modified", stat.mtime.toUTCString());
      return notModified;
    }

    const headers = new Headers();
    headers.set("Content-Type", mime);
    headers.set("Content-Length", String(payload.length));
    headers.set("ETag", etag);
    headers.set("Last-Modified", stat.mtime.toUTCString());
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    if (asDownload) {
      headers.set(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodeURIComponent(path.basename(chosen))}`
      );
    } else {
      headers.set(
        "Content-Disposition",
        `inline; filename*=UTF-8''${encodeURIComponent(path.basename(chosen))}`
      );
    }

    return new NextResponse(payload, { status: 200, headers });
  } catch (err) {
    console.error("[api/file] msg:", err?.message || err);
    return placeholderResponse();
  }
}

export async function headFileResponse(req) {
  const res = await getFileResponse(req);
  return new NextResponse(null, { status: res.status, headers: res.headers });
}
