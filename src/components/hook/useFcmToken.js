"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getMessagingIfSupported } from "@/components/libs/firebaseClient";
import { getToken, onMessage } from "firebase/messaging";

/**
 * useFcmToken
 *
 * pemakaian:
 * const { permission, ensureRegistered, registerIfGranted } = useFcmToken({ userId, onForegroundMessage })
 *
 * - registerIfGranted()  → ringan, TIDAK minta izin. Kalau belum granted ya udahan.
 * - ensureRegistered()   → minta izin kalau perlu, lalu daftar.
 */
export default function useFcmToken({ userId, onForegroundMessage } = {}) {
    const [permission, setPermission] = useState(
        typeof Notification !== "undefined" ? Notification.permission : "default"
    );
    const unsubRef = useRef(null);
    const swMsgBoundRef = useRef(false);

    /**
     * core register: diasumsikan permission SUDAH granted
     * ini yang dipakai 2x: sama registerIfGranted dan sama ensureRegistered
     */
    const doRegister = useCallback(
        async () => {
            if (typeof window === "undefined") {
                return { ok: false, reason: "no-window" };
            }

            try {
                if (!userId) return { ok: false, reason: "no-user" };
                if (!process.env.NEXT_PUBLIC_FCM_VAPID_KEY)
                    return { ok: false, reason: "no-vapid" };

                // service worker buat Firebase Messaging
                const reg = await navigator.serviceWorker.register(
                    "/firebase-messaging-sw.js"
                );

                // init messaging
                const messaging = await getMessagingIfSupported();
                if (!messaging) return { ok: false, reason: "unsupported" };

                // ambil token FCM
                const token = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
                    serviceWorkerRegistration: reg,
                });
                if (!token) return { ok: false, reason: "no-token" };

                // kirim ke backend
                const res = await fetch("/api/push/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, token }),
                });

                if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    return {
                        ok: false,
                        reason: `register-failed:${res.status}`,
                        detail: txt,
                    };
                }

                // listener pesan saat tab aktif
                if (!unsubRef.current) {
                    unsubRef.current = onMessage(messaging, (payload) => {
                        if (typeof onForegroundMessage === "function") {
                            onForegroundMessage(payload);
                        }
                    });
                }

                // listener pesan yang dikirim SW ke tab
                if (!swMsgBoundRef.current && navigator?.serviceWorker) {
                    navigator.serviceWorker.addEventListener("message", (e) => {
                        if (e?.data?.type === "fcm:received") {
                            if (typeof onForegroundMessage === "function") {
                                onForegroundMessage(e.data.payload);
                            }
                        }
                    });
                    swMsgBoundRef.current = true;
                }

                return { ok: true };
            } catch (e) {
                return {
                    ok: false,
                    reason: "error",
                    detail: String(e?.message || e),
                };
            }
        },
        [userId, onForegroundMessage]
    );

    /**
     * 1) JALUR RINGAN
     * tidak minta permission. cocok dipanggil dari navbar/drawer.
     */
    const registerIfGranted = useCallback(async () => {
        if (typeof Notification === "undefined") {
            return { ok: false, reason: "no-notification-api" };
        }

        const current = Notification.permission;
        setPermission(current);

        if (current !== "granted") {
            // jangan paksa minta izin di sini
            return { ok: false, reason: "not-granted" };
        }

        // kalau sudah granted → lanjut daftar
        return await doRegister();
    }, [doRegister]);

    /**
     * 2) JALUR PENUH
     * ini yang minta izin kalau belum granted
     */
    const ensureRegistered = useCallback(async () => {
        try {
            if (typeof Notification === "undefined") {
                return { ok: false, reason: "no-notification-api" };
            }

            let perm = Notification.permission;
            if (perm !== "granted") {
                // minta izin di sini
                perm = await Notification.requestPermission();
                setPermission(perm);
                if (perm !== "granted") {
                    return { ok: false, reason: "denied" };
                }
            } else {
                setPermission(perm);
            }

            // di titik ini sudah granted → tinggal daftar
            return await doRegister();
        } catch (e) {
            return {
                ok: false,
                reason: "error",
                detail: String(e?.message || e),
            };
        }
    }, [doRegister]);

    // cleanup listener
    useEffect(() => {
        return () => {
            try {
                if (unsubRef.current) unsubRef.current();
            } catch {
                /* ignore */
            }
        };
    }, []);

    return {
        permission,
        ensureRegistered,     // minta izin kalau perlu
        registerIfGranted,    // TIDAK minta izin, aman buat navbar/drawer
    };
}
