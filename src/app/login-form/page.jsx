// src/app/login-form/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, Input, Button, Alert } from "antd";
import { cleanupAttendanceStorage } from "@/utils/attendanceCache";

export default function LoginFormPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
        callbackUrl: "/dashboard",
      });

      // res bisa null/undefined kalau ada masalah internal
      if (!res) {
        setError("Login gagal (no response).");
        return;
      }

      if (res.error) {
        // error default dari NextAuth untuk credentials
        setError(
          res.error === "CredentialsSignin"
            ? "Username / password salah"
            : res.error
        );
        return;
      }

      // login sukses → NextAuth sudah set cookie JWT
      cleanupAttendanceStorage();
      router.push(res.url || "/dashboard");
    } catch (err) {
      console.error("Login client error:", err);
      setError("Terjadi kesalahan saat login.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card
        style={{ width: 360 }}
        className="shadow-2xl rounded-2xl py-8 px-6"
        classNames={{ body: "p-0" }}
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            VP Workload – Login
          </h1>
        </div>

        {error && (
          <div className="mb-3">
            <Alert type="error" message={error} showIcon />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email
            </label>
            <Input
              size="middle"
              placeholder="Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              data-testid="login-email"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Password
            </label>
            <Input.Password
              size="middle"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              data-testid="login-password"
            />
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            block
            data-testid="login-submit"
          >
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  );
}
