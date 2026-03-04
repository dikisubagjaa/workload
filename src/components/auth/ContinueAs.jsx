"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Button, Avatar, Typography } from "antd";

const { Text } = Typography;

export default function ContinueAs({ next = "/dashboard" }) {
    const [last, setLast] = useState(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("wl:lastUser");
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed?.email) setLast(parsed);
        } catch { }
    }, []);

    if (!last?.email) return null;

    const cb = `${window.location.origin}/post-login-location-check?next=${encodeURIComponent(
        next
    )}`;

    const onContinue = () => {
        // Pre-pilih akun yg sama dengan login_hint
        return signIn("google", { callbackUrl: cb }, { login_hint: last.email });
    };

    const onUseOther = () => {
        // Kalau mau ganti akun, paksa chooser
        return signIn("google", { callbackUrl: cb }, { prompt: "select_account" });
    };

    const onClearAndChoose = () => {
        try { localStorage.removeItem("wl:lastUser"); } catch { }
        onUseOther();
    };

    return (
        <div className="w-full">
            <div className="mx-auto max-w-md rounded-2xl border p-5 text-center shadow-sm">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <Avatar size={48} src={last.image} alt={last.name} />
                    <div className="text-left">
                        <div className="font-semibold text-base leading-tight">
                            Continue as {last.name || "User"}
                        </div>
                        {/* Email di tengah (secara visual center via container) */}
                        <Text type="secondary" className="block text-center w-full">
                            {last.email}
                        </Text>
                    </div>
                </div>

                <Button type="primary" size="large" className="w-full" onClick={onContinue}>
                    Continue
                </Button>

                <div className="mt-3 text-sm">
                    <button
                        type="button"
                        onClick={onClearAndChoose}
                        className="text-blue-600 hover:underline"
                    >
                        Use another account
                    </button>
                </div>
            </div>
        </div>
    );
}
