// src/services/performanceSelector.js
const dayjs = require('dayjs');

/** Normalisasi ke tanggal (tanpa jam) */
function toD(dateLike) {
    return dayjs(dateLike || dayjs().format('YYYY-MM-DD')).startOf('day');
}

/** -------------------------------
 *  TASK SELESAI → selector
 *  -------------------------------
 *  - early  : completed < deadline  → days = selisih hari lebih cepat
 *  - on_deadline : completed == deadline
 *  - overdue: completed > deadline
 *
 *  Contoh mapping:
 *    early 5 hari  → { type:'task_complete', bucket:'early', days: 5 }
 *    tepat H       → { type:'task_complete', bucket:'on_deadline' }
 *    selesai telat → { type:'task_complete', bucket:'overdue' }
 */
function buildSelectorForTaskCompletion(deadlineDate, completedDate) {
    const due = toD(deadlineDate);
    const done = toD(completedDate);
    if (done.isBefore(due)) {
        const days = due.diff(done, 'day'); // >0
        return { type: 'task_complete', bucket: 'early', days };
    }
    if (done.isSame(due)) {
        return { type: 'task_complete', bucket: 'on_deadline' };
    }
    return { type: 'task_complete', bucket: 'overdue' };
}

/** -----------------------------------------
 *  MISS DEADLINE STEP (cron harian) → selector
 *  -----------------------------------------
 *  Definisi H+0 di sini = HARI PERTAMA SETELAH due date.
 *  Mekanisme:
 *    dayZero   = due + 1 hari
 *    daysSince = today - dayZero (dalam hari, bisa 0/1/2/...)
 *    Jika daysSince ∈ steps (default [0,3,7]) → emit selector 'late' dgn days=daysSince
 *
 *  Contoh:
 *    due = 2025-10-10
 *    today=2025-10-11 → daysSince=0  → H+0
 *    today=2025-10-14 → daysSince=3  → H+3
 *    today=2025-10-18 → daysSince=7  → H+7
 */
function buildMissDeadlineStepForToday(deadlineDate, today = undefined, steps = [0, 3, 7]) {
    const due = toD(deadlineDate);
    const dayZero = due.add(1, 'day');
    const now = toD(today);
    const daysSince = now.diff(dayZero, 'day'); // bisa negatif (belum overdue)
    if (daysSince < 0) return null;
    if (steps.includes(daysSince)) {
        return { type: 'deadline_miss', bucket: 'late', days: daysSince };
    }
    return null; // bukan hari step
}

/** TIMESHEET MISSING (harian) */
function buildSelectorForTimesheetMissing() {
    return { type: 'timesheet_missing' };
}

/** ATTENDANCE LATE (berdasar Attendance.status='late') */
function buildSelectorForAttendanceLate() {
    return { type: 'attendance_late' };
}

module.exports = {
    buildSelectorForTaskCompletion,
    buildMissDeadlineStepForToday,
    buildSelectorForTimesheetMissing,
    buildSelectorForAttendanceLate,
};
