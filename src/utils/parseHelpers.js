export function parseHHMM(str) {
  if (typeof str !== "string") return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(str.trim());
  if (!m) return null;
  const h = Math.min(23, Math.max(0, Number(m[1])));
  const min = Math.min(59, Math.max(0, Number(m[2])));
  return h * 60 + min;
}

export function formatHHMM(mins) {
  const m = Math.max(0, Math.floor(Number(mins) || 0));
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function normalizeIdArray(val) {
  const toInt = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  if (!val) return [];
  if (Array.isArray(val)) return val.map(toInt).filter(Number.isFinite);

  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(toInt).filter(Number.isFinite);
    } catch {
      // ignore
    }
    const one = toInt(val);
    return Number.isFinite(one) ? [one] : [];
  }

  const one = toInt(val);
  return Number.isFinite(one) ? [one] : [];
}
