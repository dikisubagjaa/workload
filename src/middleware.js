// src/middleware.js
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ===== custom email-only session (biarkan) =====
const APP_SESSION_COOKIE = "app_session";
const APP_SECRET =
  process.env.APP_SESSION_SECRET || process.env.NEXTAUTH_SECRET;


// ===== Timesheet enforcement =====
const ENFORCEMENT_ENDPOINT = "/api/timesheet/enforcement";
const ENFORCEMENT_ALLOW_PAGES = ["/timesheet"];
const ENFORCEMENT_BYPASS_PREFIXES = ["/api/timesheet/enforcement"];
const PATH_ACCESS_ENDPOINT = "/api/auth/path-access";

// ===== Live-check throttle via cookie =====
const LIVE_OK_COOKIE = "wl_act"; // "1" jika sudah active → skip pending gate
const LIVE_TTL_COOKIE = "wl_ck_ts"; // timestamp ms terakhir cek
const LIVE_CHECK_TTL = parseInt(
  process.env.NEXT_PUBLIC_LIVE_CHECK_TTL ?? "8000",
  10
); // 8s default

// ===== Helpers =====
function buildAbsoluteUrl(req, path) {
  const base = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  return `${base.replace(/\/+$/, "")}/${String(path || "").replace(/^\/+/, "")}`;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

// Hanya dipakai untuk cek live status (pakai [userId])
async function fetchLiveUserStatus(req, userId) {
  if (!userId) return null;
  try {
    const url = buildAbsoluteUrl(req, `/api/user/${userId}`);
    const res = await fetchWithTimeout(
      url,
      {
        headers: { cookie: req.headers.get("cookie") || "" },
        cache: "no-store",
      },
      2500
    );
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    const status = data?.user?.status ?? null;
    return typeof status === "string" ? status : null;
  } catch {
    return null;
  }
}

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token || null;

    // cookies
    const liveOk = req.cookies.get(LIVE_OK_COOKIE)?.value === "1";
    const lastTsRaw = req.cookies.get(LIVE_TTL_COOKIE)?.value;
    const lastTs = lastTsRaw ? parseInt(lastTsRaw, 10) : 0;
    const now = Date.now();

    const statusInToken = token?.status;
    const isPendingToken = statusInToken === "new" || statusInToken === "waiting";
    const userId = token?.user_id ?? null;

    // kalau sudah active via cookie → jangan block pending lagi
    const isPending = isPendingToken && !liveOk;

    // ===== bypass khusus =====
    if (pathname.startsWith("/api/auth/verify-location")) {
      return NextResponse.next();
    }
    if (pathname.startsWith(PATH_ACCESS_ENDPOINT)) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

    // ===== Halaman /profile: boleh masuk, tapi kalau pending coba live-check (throttle) =====
    if (pathname.startsWith("/profile")) {
      if (isPending && userId) {
        const withinThrottle = lastTs && now - lastTs < LIVE_CHECK_TTL;

        if (!withinThrottle) {
          const live = await fetchLiveUserStatus(req, userId);
          if (live === "active") {
            const res = NextResponse.next();
            res.cookies.set(LIVE_OK_COOKIE, "1", {
              path: "/",
              maxAge: 60 * 60 * 24,
            });
            res.cookies.set(LIVE_TTL_COOKIE, String(now), {
              path: "/",
              maxAge: 60 * 5,
            });
            return res;
          }
        }

        const res = NextResponse.next();
        res.cookies.set(LIVE_TTL_COOKIE, String(now), {
          path: "/",
          maxAge: 60 * 5,
        });
        return res;
      }
      return NextResponse.next();
    }

    // ===== Halaman non-/profile: kalau pending → paksa ke /profile =====
    if (isPending) {
      const url = req.nextUrl.clone();
      url.pathname = "/profile";
      return NextResponse.redirect(url);
    }

    // ====== Menu access guard: block URL access not granted by role menu ======
    try {
      const isGet = (req.method || "GET").toUpperCase() === "GET";
      if (isGet) {
        const accessUrl = buildAbsoluteUrl(
          req,
          `${PATH_ACCESS_ENDPOINT}?path=${encodeURIComponent(pathname)}`
        );
        const res = await fetchWithTimeout(
          accessUrl,
          {
            headers: { cookie: req.headers.get("cookie") || "" },
            cache: "no-store",
          },
          2500
        );

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.allowed === false) {
            const fallback = pathname.startsWith("/dashboard") ? "/profile" : "/dashboard";
            const redirectUrl = new URL(fallback, req.url);
            return NextResponse.redirect(redirectUrl);
          }
        }
      }
    } catch {
      // no-op (fail-open agar tidak lockout saat endpoint timeout)
    }

    // ====== Timesheet enforcement (pakai timeout biar gak “muter” lama) ======
    try {
      const isBypass = ENFORCEMENT_BYPASS_PREFIXES.some((p) =>
        pathname.startsWith(p)
      );
      const isTimesheetPage = ENFORCEMENT_ALLOW_PAGES.some((p) =>
        pathname.startsWith(p)
      );
      const isGet = (req.method || "GET").toUpperCase() === "GET";

      if (!isBypass && isGet && !isTimesheetPage) {
        const url = buildAbsoluteUrl(req, ENFORCEMENT_ENDPOINT);
        const res = await fetchWithTimeout(
          url,
          {
            headers: { cookie: req.headers.get("cookie") || "" },
            cache: "no-store",
          },
          2500
        );

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.required) {
            const redirectUrl = new URL("/timesheet", req.url);
            return NextResponse.redirect(redirectUrl);
          }
        }
      }
    } catch {
      // no-op
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/attendance/:path*",
    "/calendar/:path*",
    "/client/:path*",
    "/leads/:path*",
    "/customer/:path*",
    "/crm/:path*",
    "/dashboard/:path*",
    "/department/:path*",
    "/holiday/:path*",
    "/profile/:path*",
    "/menu/:path*",
    "/role/:path*",
    "/task/:path*",
    "/task-hod/:path*",
    "/task-review/:path*",
    "/leave/:path*",
    "/timesheet/:path*",
    "/settings/:path*",
    "/setting/:path*",
    "/project/:path*",
    "/reason/:path*",
    "/tracker/:path*",
    "/user/:path*",
    "/website/:path*",
    "/performance-score/:path*",
    "/appraisal/:path*",
    "/annual-review/:path*",
    "/blast-message/:path*",
    "/notification/:path*",
  ],
};
