// src/server/push/sendPush.js
import db from "@/database/models";
import { getAdmin } from "./firebaseAdmin";

/**
 * Kirim push ke semua device milik user (web).
 * Sekarang kita kirim **notification + data** supaya:
 * - browser bisa langsung tampilkan notifikasi (standar FCM)
 * - service worker kamu yang listen 'push' tetap bisa broadcast ke tab
 */
export async function sendPushToUser(userId, { title, body, data = {} }) {
    const { NotificationPush } = db;

    // Ambil semua token aktif milik user
    const rows = await NotificationPush.findAll({
        where: { created_by: userId, status: "active" },
        attributes: ["token"],
    });
    const tokens = rows.map((r) => r.token).filter(Boolean);

    if (!tokens.length) {
        return { success: 0, failure: 0 };
    }

    const admin = getAdmin();

    // FCM mensyaratkan semua nilai 'data' adalah string.
    const payloadData = Object.fromEntries(
        Object.entries({
            title: title || "Notification",
            body: body || "",
            ...data,
        }).map(([k, v]) => [String(k), String(v)])
    );

    // kirim notification + data
    const resp = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
            title: title || "Notification",
            body: body || "",
        },
        data: payloadData,
        // kalau mau webpush spesifik:
        // webpush: {
        //   headers: { TTL: "60" },
        // },
    });

    // Bersihkan token invalid
    const invalid = [];
    resp.responses.forEach((r, i) => {
        if (!r.success) {
            const code = r.error?.errorInfo?.code || r.error?.code || "";
            if (
                code.includes("registration-token-not-registered") ||
                code.includes("invalid-argument")
            ) {
                invalid.push(tokens[i]);
            }
        }
    });
    if (invalid.length) {
        await NotificationPush.destroy({
            where: { created_by: userId, token: invalid },
        });
    }

    return { success: resp.successCount, failure: resp.failureCount };
}
