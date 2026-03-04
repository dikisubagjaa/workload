// src/app/post-login-location-check/page.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { message, Spin, Button } from "antd";
import axiosInstance from "@/utils/axios";

export default function PostLoginLocationCheckPage() {
  const { status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const called = useRef(false);

  const [loading, setLoading] = useState(true);
  const [fatal, setFatal] = useState(null); // string | null

  const run = async () => {
    setFatal(null);
    setLoading(true);

    try {
      const stored = sessionStorage.getItem("user-location");
      if (!stored) {
        throw new Error("Location data not found. Please login again.");
      }

      let payload = {};
      try {
        payload = JSON.parse(stored) || {};
      } catch {
        throw new Error("Invalid location data. Please login again.");
      }

      const body = {
        latitude: payload.latitude,
        longitude: payload.longitude,
        device_info: typeof navigator !== "undefined" ? navigator.userAgent : "",
      };

      await axiosInstance.post("/auth/verify-location", body);

      // IMPORTANT: refresh session/jwt so middleware reads latest user state
      if (typeof update === "function") {
        await update();
      }

      sessionStorage.removeItem("user-location");
      const next = searchParams.get("next") || "/dashboard";
      router.replace(next);
    } catch (err) {
      console.error("Verify location failed:", err);

      const errMsg =
        err?.response?.data?.msg ||
        err?.message ||
        "Failed to verify location. Please try again.";

      message.error(errMsg);
      setFatal(errMsg);

      // allow retry from same page (don’t auto-bounce to "/" and cause loops)
      called.current = false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading" || called.current) return;

    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    called.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (fatal && !loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 12,
          padding: 24,
          textAlign: "center",
        }}
      >
        <p style={{ fontWeight: 600 }}>Verify location failed</p>
        <p style={{ fontSize: 13, color: "#666" }}>{fatal}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={() => router.replace("/")}>Back to Login</Button>
          <Button type="primary" onClick={run}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <Spin size="large" />
      <p style={{ marginTop: 20 }}>Verifying your location...</p>
      <p style={{ fontSize: 12, color: "#888" }}>
        Please ensure location services are enabled on your device.
      </p>
    </div>
  );
}
