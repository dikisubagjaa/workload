// Client-side helper to keep attendance localStorage cache minimal and fresh.
// Key format used by ClockButton: attendance:<userId>:YYYY-MM-DD

function parseAttendanceKey(key) {
  const m = /^attendance:(\d+):(\d{4}-\d{2}-\d{2})$/.exec(String(key || ""));
  if (!m) return null;
  return { userId: Number(m[1]), date: m[2] };
}

export function cleanupAttendanceStorage({ keepUserId = null, keepDate = null } = {}) {
  if (typeof window === "undefined") return { removed: 0, kept: 0 };

  let removed = 0;
  let kept = 0;
  const storage = window.localStorage;

  for (let i = storage.length - 1; i >= 0; i -= 1) {
    const key = storage.key(i);
    if (!key || !key.startsWith("attendance:")) continue;

    const parsed = parseAttendanceKey(key);
    if (!parsed) {
      storage.removeItem(key);
      removed += 1;
      continue;
    }

    const isOtherUser = keepUserId != null && Number(parsed.userId) !== Number(keepUserId);
    const isOtherDate = keepDate != null && parsed.date !== String(keepDate);
    const isOldDate = keepDate != null && parsed.date < String(keepDate);

    if (isOtherUser || isOtherDate || isOldDate) {
      storage.removeItem(key);
      removed += 1;
    } else {
      kept += 1;
    }
  }

  return { removed, kept };
}

