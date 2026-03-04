import { jsonResponse } from "@/utils/apiResponse";
import { withAuth } from "@/utils/session";
import { buildSessionMenuByEmail } from "@/utils/authMenu";

function normalizePath(input) {
  const raw = String(input || "").trim();
  if (!raw) return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const noTrailing = withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
  return noTrailing.toLowerCase();
}

function collectPagePaths(nodes, out = new Set()) {
  if (!Array.isArray(nodes)) return out;
  for (const n of nodes) {
    const p = n?.path;
    if (typeof p === "string" && p.trim()) out.add(normalizePath(p));
    if (Array.isArray(n?.children) && n.children.length > 0) {
      collectPagePaths(n.children, out);
    }
  }
  return out;
}

function isAllowedByPath(targetPath, allowedPaths) {
  const aliases = [targetPath];
  if (targetPath === "/leads" || targetPath.startsWith("/leads/")) aliases.push(targetPath.replace(/^\/leads/, "/client"));
  if (targetPath === "/customer" || targetPath.startsWith("/customer/")) aliases.push(targetPath.replace(/^\/customer/, "/client"));

  for (const candidate of aliases) {
    for (const base of allowedPaths) {
      if (candidate === base) return true;
      if (candidate.startsWith(`${base}/`)) return true;
    }
  }
  return false;
}

export const GET = withAuth(async function GET_HANDLER(req, _ctx, currentUser) {
  const { searchParams } = new URL(req.url);
  const path = normalizePath(searchParams.get("path"));

  // halaman profil tetap boleh diakses untuk update data user
  if (path.startsWith("/profile")) {
    return jsonResponse({ allowed: true, reason: "profile-whitelisted" }, { status: 200 });
  }

  const isSuperadmin = String(currentUser?.is_superadmin) === "true";
  if (isSuperadmin) {
    return jsonResponse({ allowed: true, reason: "superadmin" }, { status: 200 });
  }

  const menu = await buildSessionMenuByEmail(currentUser?.email);
  const allowedPaths = collectPagePaths(menu?.pages);
  const allowed = isAllowedByPath(path, allowedPaths);

  return jsonResponse(
    {
      allowed,
      reason: allowed ? "menu-allowed" : "menu-denied",
    },
    { status: 200 }
  );
});
