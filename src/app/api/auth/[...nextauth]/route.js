import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { findOrCreateUser } from "@/database/services/authService";
import { User, Role } from "@/database/models";
import { buildSessionMenuByEmail } from "@/utils/authMenu";

const ROLE_FLAG_KEYS = [
  "is_hod",
  "is_superadmin",
  "is_operational_director",
  "is_hrd",
  "is_ae",
];

async function loadRoleFlagsForUser(userRow) {
  if (!userRow?.user_role) {
    const out = {};
    for (const k of ROLE_FLAG_KEYS) out[k] = "false";
    return out;
  }

  const roleRow = await Role.findOne({
    where: { slug: userRow.user_role },
    attributes: ROLE_FLAG_KEYS,
    raw: true,
  });

  const out = {};
  for (const k of ROLE_FLAG_KEYS) {
    out[k] = roleRow?.[k] ?? "false";
  }
  return out;
}

export const authOptions = {
  trustHost: true,
  debug: process.env.AUTH_GOOGLE_DEBUG,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          hd: process.env.AUTH_GOOGLE_DOMAIN || "vp-digital.com",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials ?? {};

        if (!username || !password) return null;

        // SESUAIKAN dengan struktur tabel user kamu
        // Di sini diasumsikan ada kolom: username, password_hash, dll.
        const user = await User.findOne({
          where: { email: username },
          raw: true,
        });

        if (!user) return null;

        // Bandingkan password
        const bcrypt = (await import("bcryptjs")).default;
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return {
          user_id: user.user_id,
          uuid: user.uuid,
          fullname: user.fullname,
          email: user.email,
          job_position: user.job_position || null,
          user_role: user.user_role,
          profile_pic: user.profile_pic,
          department_id: user.department_id,
          status: user.status,
          attendance_type: user.attendance_type,
          menu_access: user.menu_access,
        };
      },
    })
  ],
  cookies: {
    state: {
      name: "__Secure-next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
      },
    },
  },

  callbacks: {
    // 1) signIn: pastikan user ada (create jika belum)
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
      
        const dbUser = await findOrCreateUser(user);
        return !!dbUser;
      }

      if (account?.provider === "credentials" && user?.email) {
        // authorize() sudah cek ke DB, jadi di sini cukup true
        return true;
      }
      return false;
    },

    // 2) jwt: rehydrate + role fallback (user.menu_access → role.menu_access)
    async jwt({ token, user, account, profile, trigger }) {
      const isGoogle = account?.provider === "google" && profile?.email;
      const isCredentials = account?.provider === "credentials" && user;
      const firstGoogleLogin = account?.provider === "google" && profile?.email;
      const tokenIncomplete = !token?.user_id || !token?.email || !token?.fullname;
      const forced = trigger === "update";

      if (!firstGoogleLogin && !tokenIncomplete && !forced) {
        return token;
      }

      let dbUser = null;
      if (isGoogle) {
        // Login via Google → tetap pakai findOrCreateUser
        dbUser = await findOrCreateUser(profile);
      } else if (isCredentials) {
        // Login via credentials → pakai user hasil authorize()
        dbUser = user;
      } else if (token?.email) {
        // Refresh / update → ambil ulang dari DB
        dbUser = await User.findOne({
          where: { email: token.email },
          raw: true,
        });
      }

      // ---- Ambil user
      if (!dbUser) return token;

      // ---- Isi token basic
      token.user_id = dbUser.user_id;
      token.uuid = dbUser.uuid || null;
      token.fullname = dbUser.fullname;
      token.email = dbUser.email;
      token.job_position = dbUser.job_position || null;
      token.user_role = dbUser.user_role || null;
      token.profile_pic = dbUser.profile_pic || null;
      token.department_id = dbUser.department_id || null;
      const roleFlags = await loadRoleFlagsForUser(dbUser);
      token.is_hod = roleFlags.is_hod;
      token.is_hrd = roleFlags.is_hrd;
      token.is_ae = roleFlags.is_ae;
      token.is_superadmin = roleFlags.is_superadmin;
      token.is_operational_director = roleFlags.is_operational_director;
      token.status = dbUser.status ?? null;
      token.attendance_type = dbUser.attendance_type ?? null;

      return token;
    },

   async session({ session, token }) {
      // Basic user info dari token (kecil saja)
      session.user = {
        uuid: token.uuid || null,
        user_id: token.user_id,
        email: token.email,
        fullname: token.fullname,
        job_position: token.job_position || null,
        user_role: token.user_role,
        profile_pic: token.profile_pic,
        department_id: token.department_id,
        is_hod: token.is_hod,
        is_hrd: token.is_hrd,
        is_superadmin: token.is_superadmin,
        is_ae: token.is_ae,
        status: token.status,
        attendance_type: token.attendance_type,
        menu: { pages: [], dashboardKeys: [], buttons: [] }, // default kosong
      };

      try {
        session.user.menu = await buildSessionMenuByEmail(token?.email);
      } catch (err) {
        console.error("Error building menu in session callback:", err);
      }

      return session;
    },
  },

  pages: { signIn: "/", signOut: "/" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
