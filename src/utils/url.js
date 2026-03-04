
const ABSOLUTE_RE = /^https?:\/\//i;

export function toAbsoluteUrl(path, origin =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  ''
) {
  if (!path) return path;
  if (ABSOLUTE_RE.test(path)) return path;               // sudah absolut
  if (!origin) return path;                          // fallback: tetap relatif
  const base = origin.endsWith('/') ? origin.slice(0, -1) : origin;
  const rel = path.startsWith('/') ? path : `/${path}`;
  return `${base}${rel}`;
}

export function buildModalUrl({
  module,
  id,
  commentId,
  basePath = '/dashboard',
  compat = true,
  origin,
}) {
  const search = buildModalSearch({ module, id, commentId, compat });
  const path = `${basePath}${search}`;
  return toAbsoluteUrl(path, origin);
}

export function buildTaskWorkspaceUrl({
  taskId,
  returnTo = "/dashboard",
  origin,
}) {
  const q = new URLSearchParams();
  q.set("task", String(taskId));
  if (returnTo) q.set("returnTo", String(returnTo));
  const path = `/task/create?${q.toString()}`;
  return toAbsoluteUrl(path, origin);
}

// Bangun query standar popup + param kompat lama
export function buildModalSearch({ module, id, commentId, compat = true }) {
  const q = new URLSearchParams();
  q.set('openmodal', 'true');
  q.set('modul', module);
  q.set(`${module}`, String(id));
  return `?${q.toString()}`;
}


export function parseModalParams(searchParams) {
  const get = (k) => (typeof searchParams?.get === 'function' ? searchParams.get(k) : null);

  const modalStr = get('modal') ?? get('openmodal');

  let moduleParam = get('module') ?? get('modul');
  if (!moduleParam) {
    if (get('task')) moduleParam = 'task';
    else if (get('project')) moduleParam = 'project';
    else if (get('pitching')) moduleParam = 'pitching';
  }

  let id = get('id');
  if (!id && moduleParam) {
    id = get(`${moduleParam}`) ?? get(moduleParam);
  }

  const commentId = get('c');
  const allowWithoutId = moduleParam === "project";
  const open = ((modalStr === 'true' || modalStr === '1') && !!moduleParam && (allowWithoutId || !!id));

  return {
    open,
    module: moduleParam || null,
    id: id ? Number(id) : null,
    commentId: commentId ? Number(commentId) : null,
  };
}

const isProd = process.env.NODE_ENV === "production";
const forceAbs = process.env.NEXT_PUBLIC_ABSOLUTE_URLS === "1";
const ABS_MODE = isProd || forceAbs;

function stripTrailingSlash(s = "") {
  return String(s).replace(/\/+$/, "");
}

function toLeadingSlash(s = "") {
  return `/${String(s).replace(/^\/+/, "")}`;
}

function getOrigin() {
  const env = stripTrailingSlash(process.env.NEXT_PUBLIC_APP_URL || "");
  if (env) return env;
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL;
}

function getBasePath() {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!raw || raw === "/") return "";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return stripTrailingSlash(withSlash);
}

function getAssetPrefix() {
  return stripTrailingSlash(process.env.NEXT_PUBLIC_ASSET_PREFIX || "");
}

export function publicBaseUrl() {
  // Selalu origin (tanpa trailing slash)
  return getOrigin();
}

// Dev: kembalikan path relatif (menghormati basePath)
// Prod: kembalikan absolute (origin + basePath + path)
export function withBasePath(path = "") {
  if (!path) return "";

  const bp = getBasePath();
  const clean = toLeadingSlash(path);

  return `${bp}${clean}`;
}

// Selalu absolute — pakai ini untuk kebutuhan link email/OG
export function absoluteUrl(path = "") {
  const bp = getBasePath();
  const clean = toLeadingSlash(path || "");
  return `${getOrigin()}${bp}${clean}`;
}

export function asset(path = "") {
  const clean = toLeadingSlash(path || "");
  const ap = getAssetPrefix();
  const bp = getBasePath();

  return `${bp}${clean}`;
}
export function closeEntityModal(router, pathname, sp) {
  try {
    const current = (sp && typeof sp.toString === 'function')
      ? sp.toString()
      : (typeof window !== 'undefined' ? window.location.search : '');

    const params = new URLSearchParams(current);

    [
      'modal',      // varian baru
      'openmodal',  // varian lama
      'module',
      'modul',
      'id',
      'task',
      'project',
      'pitching',
      'c',          // commentId
    ].forEach((k) => params.delete(k));

    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;

    // Next.js App Router – ganti URL tanpa nambah history
    router.replace(url, { scroll: false });
  } catch (e) {
    // fallback paling aman
    try { router.back(); } catch { }
  }
}

export function storageUrl({ folder = "profile", filename, useResized = true }) {
  if (!filename) return ABS_MODE ? "" : "";

  let name = String(filename).trim();


  // Kalau sudah path (mengandung "/"), anggap relatif terhadap app
  if (name.includes("/")) {
    return withBasePath(name);
  }

  // Tanpa ekstensi -> default .webp
  if (!/\.[a-z0-9]+$/i.test(name)) name += ".webp";

  const rel = useResized
    ? `/storage/${folder}/resized/${name}`
    : `/storage/${folder}/${name}`;


  return `${getBasePath()}${rel}`;
}
