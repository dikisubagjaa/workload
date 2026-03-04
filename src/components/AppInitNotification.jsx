// src/components/AppInitNotification.jsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import useFcmToken from "@/components/hook/useFcmToken";

export default function AppInitNotification() {
    const { data: session } = useSession();
    const userId = session?.user?.user_id;

    const { ensureRegistered } = useFcmToken({
        userId,
        // === FOREGROUND HANDLER ===
        onForegroundMessage: (payload) => {
            // Dipanggil saat:
            // - FCM onMessage() di tab aktif
            // - atau service worker kirim postMessage type: "fcm:received"
            if (typeof window === "undefined") return;

            try {
                window.dispatchEvent(
                    new CustomEvent("notification:new", {
                        detail: payload, // kirim payload kalau mau dipakai di listener
                    })
                );
            } catch (e) {
                // diamkan saja kalau ada error kecil
                console.error("Failed to dispatch notification:new event", e);
            }
        },
    });

    useEffect(() => {
        if (!userId) return;
        // === BACKGROUND & TOKEN REGISTER ===
        // - register FCM token
        // - pasang listener onMessage & listener service worker
        ensureRegistered();
    }, [userId, ensureRegistered]);

    return null;
}
