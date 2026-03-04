// database/services/performanceService.js
import db from "@/database/models";
import { QueryTypes } from "sequelize";
import { nowUnix } from "@/utils/dateHelpers";

const { User, PerformanceEventLog, sequelize } = db;

const curYear = () => new Date().getFullYear();
const toDateYmdFromEpoch = (sec) => {
    const d = new Date((Number(sec) || 0) * 1000);
    // format YYYY-MM-DD (UTC)
    return d.toISOString().slice(0, 10);
};
const yearOfYmd = (ymd) => Number(String(ymd).slice(0, 4));

/**
 * Pastikan user.performance_year == tahun berjalan.
 * Jika beda, reset performance_score=0 dan set performance_year ke tahun sekarang.
 */
export async function ensurePerfYear(userId) {
    const u = await User.findOne({
        where: { user_id: userId },
        attributes: ["user_id", "performance_score", "performance_year"],
    });
    if (!u) throw new Error("User not found");

    const thisYear = curYear();
    if (u.performance_year !== thisYear) {
        await User.update(
            { performance_year: thisYear, performance_score: 0 },
            { where: { user_id: userId } }
        );
    }
}

/**
 * Catat event ke performance_event_log (idempotent via dedup_key),
 * lalu update kolom agregat user.performance_score jika tahun event == performance_year user.
 */
export async function logPerfEvent({
    userId,
    eventType,
    points,
    occurred,        // epoch seconds (optional; default: now)
    dateYmd,         // optional; kalau kosong dihitung dari occurred
    taskId = null,
    attendanceId = null,
    meta = null,     // bisa object atau string
    dedupKey,        // WAJIB untuk mencegah duplikat
}) {
    if (!userId) throw new Error("userId is required");
    if (!eventType) throw new Error("eventType is required");
    if (typeof points !== "number") throw new Error("points must be number");
    if (!dedupKey) throw new Error("dedupKey is required");

    // Cegah duplikat sederhana
    const existed = await PerformanceEventLog.findOne({
        where: { dedup_key: dedupKey },
        attributes: ["log_id"],
    });
    if (existed) {
        return { ok: true, skipped: true, reason: "duplicate" };
    }

    const occurredSec = Number(occurred) || nowUnix();
    const ymd = dateYmd || toDateYmdFromEpoch(occurredSec);

    // 1) Insert log
    await PerformanceEventLog.create({
        user_id: userId,
        event_type: eventType,
        points,
        occurred: occurredSec,
        date_ymd: ymd,
        task_id: taskId,
        attendance_id: attendanceId,
        meta: typeof meta === "object" ? JSON.stringify(meta) : meta,
        dedup_key: dedupKey,
        created: nowUnix(),
        updated: nowUnix(),
    });

    // 2) Sinkronisasi agregat (kolom di tabel user)
    await ensurePerfYear(userId); // auto-reset kalau ganti tahun
    const u = await User.findOne({
        where: { user_id: userId },
        attributes: ["performance_score", "performance_year"],
    });
    if (!u) return { ok: true, updated: false };

    if (yearOfYmd(ymd) === u.performance_year) {
        const newScore = (u.performance_score || 0) + points;
        await User.update(
            { performance_score: newScore },
            { where: { user_id: userId } }
        );
        return { ok: true, updated: true, newScore };
    }

    // event bukan tahun berjalan → tidak memengaruhi agregat sekarang
    return { ok: true, updated: false };
}

/**
 * Hitung ulang skor dari log untuk tahun tertentu (default tahun berjalan),
 * lalu simpan ke kolom agregat user.performance_score.
 */
export async function recalcUserScore(userId, year = null) {
    const targetYear = year || curYear();
    const rows = await sequelize.query(
        `
    SELECT COALESCE(SUM(points), 0) AS total
    FROM performance_event_log
    WHERE user_id = ?
      AND YEAR(date_ymd) = ?
      AND (deleted IS NULL OR deleted = 0)
    `,
        { replacements: [userId, targetYear], type: QueryTypes.SELECT }
    );

    const total = Number(rows?.[0]?.total || 0);
    await User.update(
        { performance_score: total, performance_year: targetYear },
        { where: { user_id: userId } }
    );
    return total;
}

/**
 * Ambil skor agregat yang tersimpan di tabel user.
 * Selalu dipastikan tahun up-to-date lewat ensurePerfYear().
 */
export async function getPerfScore(userId) {
    await ensurePerfYear(userId);
    const u = await User.findOne({
        where: { user_id: userId },
        attributes: ["performance_score", "performance_year"],
    });
    if (!u) throw new Error("User not found");
    return { score: u.performance_score, year: u.performance_year };
}
