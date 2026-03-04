// src/utils/session.js
import "server-only";

import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/database/models";

const { User, Role } = db || {};
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const ROLE_FLAG_KEYS = [
  "is_hod",
  "is_superadmin",
  "is_operational_director",
  "is_hrd",
  "is_ae",
];

// =====================
// 1. Helper untuk PAGE / SERVER COMPONENT
// =====================

/**
 * Ambil current user dari NextAuth session via getServerSession.
 * Ini dipakai untuk Server Components / pages (bukan untuk API route).
 * Kalau tidak ada user → throw Error.
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

// =====================
// 2. Helper TOKEN untuk API ROUTE
// =====================

/**
 * Ambil token NextAuth dari NextRequest (API Route).
 * Ini tidak memakai `headers()` / `cookies()` dari next/headers,
 * jadi tidak memicu "Dynamic server usage: headers".
 */
async function getApiToken(req) {
  if (!NEXTAUTH_SECRET) {
    console.warn(
      "[session] NEXTAUTH_SECRET belum di-set, getToken bisa gagal decode."
    );
  }

  // `req` di Route Handler adalah NextRequest, jadi aman dipakai di sini.
  const token = await getToken({
    req,
    secret: NEXTAUTH_SECRET,
  });

  return token;
}

/**
 * Merge data token dengan data user dari DB (kalau ada).
 * - Token → isi yang kamu set di callback NextAuth (id, role, menu, dsb).
 * - DB User → fullname, status, department_id, dll.
 */
async function buildCurrentUserFromToken(token) {
  if (!token) return null;

  // Default: pakai token apa adanya
  let currentUser = { ...token };

  // Kalau ada user_id di token dan model User tersedia → sync dengan DB
  if (User && token.user_id != null) {
    const dbUser = await User.findOne({
      where: { user_id: token.user_id },
      raw: true,
    });

    if (!dbUser) {
      // Kalau user di DB sudah tidak ada, anggap unauthorized
      return null;
    }

    // DB biasanya lebih "ground truth" untuk status, jabatan, dsb.
    currentUser = {
      ...token,
      ...dbUser,
    };

    // Lengkapi role flags dari tabel Role agar tidak bergantung pada token lama/stale.
    if (Role && dbUser?.user_role) {
      const roleRow = await Role.findOne({
        where: { slug: dbUser.user_role },
        attributes: ROLE_FLAG_KEYS,
        raw: true,
      });

      if (roleRow) {
        for (const k of ROLE_FLAG_KEYS) {
          if (roleRow[k] !== undefined && roleRow[k] !== null) {
            currentUser[k] = roleRow[k];
          }
        }
      }
    }
  }

  return currentUser;
}

// =====================
// 3. withAuth untuk API ROUTE
// =====================

/**
 * Wrapper untuk API Route supaya wajib login.
 *
 * Contoh penggunaan:
 *   export const GET = withAuth(async (req, ctx, currentUser) => {
 *     // currentUser sudah berisi data dari token + DB
 *     ...
 *   });
 *
 * Opsi (opsional):
 *   withAuth(handler, {
 *     requireRole: "superadmin",
 *     allowRoles: ["superadmin", "hrd"],
 *   })
 */
export function withAuth(handler, options = {}) {
  const { requireRole, allowRoles } = options;

  return async (req, ctx) => {
    try {
      // 1) Ambil token dari NextAuth JWT
      const token = await getApiToken(req);

      if (!token) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      // 2) Bangun objek currentUser dari token + DB
      const currentUser = await buildCurrentUserFromToken(token);

      if (!currentUser) {
        return NextResponse.json(
          { error: "User not found or inactive" },
          { status: 401 }
        );
      }

      // 3) Cek role kalau diminta
      const role = currentUser.user_role || currentUser.role || "";

      if (requireRole && role !== requireRole) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }

      if (
        Array.isArray(allowRoles) &&
        allowRoles.length > 0 &&
        !allowRoles.includes(role)
      ) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }

      // 4) Kalau semua ok → teruskan ke handler asli
      return handler(req, ctx, currentUser);
    } catch (error) {
      console.error("withAuth error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}

// =====================
// 4. withActive untuk API ROUTE
// =====================

/**
 * withActive = withAuth + cek status user "active".
 *
 * Dipakai di route macam:
 *   export const GET = withActive(async (req, ctx, currentUser) => { ... });
 */
export function withActive(handler, options = {}) {
  return withAuth(
    async (req, ctx, currentUser) => {
      const status =
        currentUser.status ||
        currentUser.user_status ||
        currentUser.account_status ||
        "active";

      if (status !== "active") {
        return NextResponse.json(
          { error: "Forbidden", redirect: "/profile" },
          { status: 403 }
        );
      }

      return handler(req, ctx, currentUser);
    },
    options
  );
}
