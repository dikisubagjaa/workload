import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const enabled = String(process.env.DEBUG_RUNTIME_ENABLE || "").toLowerCase() === "true";
  if (!enabled) {
    return NextResponse.json(
      {
        ok: false,
        msg: "Debug endpoint disabled. Set DEBUG_RUNTIME_ENABLE=true then restart PM2.",
      },
      { status: 404 }
    );
  }

  const now = new Date().toISOString();
  const publicKey = "NEXT_PUBLIC_APP_URL";
  const appUrl = process.env[publicKey] || null;
  const nextAuthUrl = process.env.NEXTAUTH_URL || null;
  const nodeEnv = process.env.NODE_ENV || null;
  const hasValue = (v) => String(v || "").trim().length > 0;
  const mask = (v, keep = 4) => {
    const s = String(v || "");
    if (!s) return null;
    if (s.length <= keep * 2) return `${"*".repeat(Math.max(0, s.length - keep))}${s.slice(-keep)}`;
    return `${s.slice(0, keep)}...${s.slice(-keep)}`;
  };

  const url = new URL(req.url);
  return NextResponse.json(
    {
      ok: true,
      now,
      cwd: process.cwd(),
      host: url.host,
      env: {
        NODE_ENV: nodeEnv,
        NEXT_PUBLIC_APP_URL: appUrl,
        NEXTAUTH_URL: nextAuthUrl,
      },
      checks: {
        email: {
          EMAIL_FROM: (process.env.EMAIL_FROM),
          EMAIL_SMTP_HOST: (process.env.EMAIL_SMTP_HOST),
          EMAIL_SMTP_PORT: (process.env.EMAIL_SMTP_PORT),
         },
        firebase: {
           FIREBASE_CLIENT_EMAIL: (process.env.FIREBASE_CLIENT_EMAIL),
          FIREBASE_PRIVATE_KEY: hasValue(process.env.FIREBASE_PRIVATE_KEY),
          FCM_ENABLE_PUSH: process.env.FCM_ENABLE_PUSH || null,
        },
      },
    },
    { status: 200 }
  );
}
