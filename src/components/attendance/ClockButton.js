"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Tooltip, message, Tag, Modal } from "antd";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { useSession } from "next-auth/react";
import ModalLateReason from "@/components/modal/ModalLateReason";
import { ClockCircleOutlined } from "@ant-design/icons";
import { cleanupAttendanceStorage } from "@/utils/attendanceCache";

dayjs.extend(utc);
dayjs.extend(tz);

const ZONE = "Asia/Jakarta";
const EIGHT_HOURS = 8 * 60 * 60; // detik

// === Client-side defaults (fallback UX saja; server tetap source of truth)
const CLIENT_OPEN_AT = "06:00";
const CLIENT_LATE_CUTOFF = "10:00";

// ====== Helpers cache ======
function lsKey(userId, date) {
  return `attendance:${userId}:${date}`;
}
function loadCache(userId, date) {
  try {
    const raw = localStorage.getItem(lsKey(userId, date));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      (typeof parsed.inUnix === "number" ||
        typeof parsed.outUnix === "number" ||
        typeof parsed.blocked === "boolean" ||
        typeof parsed.blocked_reason === "string")
    ) {
      return parsed; // { inUnix, outUnix, late?, blocked?, blocked_reason?, cachedAt }
    }
    return null;
  } catch {
    return null;
  }
}
function saveCache(userId, date, data) {
  try {
    localStorage.setItem(
      lsKey(userId, date),
      JSON.stringify({ ...data, cachedAt: Date.now() })
    );
  } catch {}
}

// ====== UI helper: geolocation blocking ======
function showGeoBlock(status = "unknown") {
  const title = "Location is required for attendance";
  let content = (
    <div>
      <p>
        The browser can’t access your location (status: <b>{String(status)}</b>).
      </p>
      <ul style={{ marginLeft: 16 }}>
        <li>Enable GPS/Location on your device.</li>
        <li>Allow location access for this site in your browser settings.</li>
        <li>
          Open the site over <b>HTTPS</b> or <b>localhost</b> (not HTTP).
        </li>
        <li>If it still fails, move to an area with better GPS signal.</li>
      </ul>
    </div>
  );

  if (status === "insecure") {
    content = (
      <div>
        <p>
          The site is opened over <b>HTTP</b> so the browser blocks geolocation.
        </p>
        <ul style={{ marginLeft: 16 }}>
          <li>
            Use a domain with <b>HTTPS</b>, or run via <b>localhost</b>.
          </li>
          <li>Then refresh the page and try again.</li>
        </ul>
      </div>
    );
  }

  if (status === "denied") {
    content = (
      <div>
        <p>
          Location permission is <b>denied</b>.
        </p>
        <ul style={{ marginLeft: 16 }}>
          <li>Open browser settings → Site settings → Location.</li>
          <li>Allow location for this site.</li>
          <li>Refresh the page and try again.</li>
        </ul>
      </div>
    );
  }

  Modal.warning({
    title,
    content,
    okText: "OK",
  });
}

function parseHHmm(str = "00:00") {
  const [h, m] = String(str).split(":");
  const hh = Math.max(0, Math.min(23, parseInt(h || "0", 10) || 0));
  const mm = Math.max(0, Math.min(59, parseInt(m || "0", 10) || 0));
  return { hh, mm };
}

/** getGeo with detailed status — location is mandatory: if not "ok", attendance is blocked */
const getGeo = () =>
  new Promise((resolve) => {
    try {
      if (typeof window === "undefined") return resolve({ status: "unsupported" });
      if (!window.isSecureContext) return resolve({ status: "insecure" });
      if (!navigator?.geolocation) return resolve({ status: "unsupported" });

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            status: "ok",
            coords: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            },
          });
        },
        (err) => {
          // 1: denied, 2: position_unavailable, 3: timeout
          if (err?.code === 1) return resolve({ status: "denied" });
          if (err?.code === 2) return resolve({ status: "unavailable" });
          if (err?.code === 3) return resolve({ status: "timeout" });
          resolve({ status: "unknown" });
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    } catch {
      resolve({ status: "unknown" });
    }
  });

function buildGeoPayload(geo) {
  return {
    latitude: geo?.coords?.latitude,
    longitude: geo?.coords?.longitude,
    accuracy: geo?.coords?.accuracy,
  };
}

export default function ClockButton({ fetchWeeklyAttendance }) {
  const { data: session } = useSession();
  const userId = session?.user?.user_id ?? null;

  // if available in session, use it for UX pre-check; otherwise rely on server
  const isTimeable =
    String(session?.user?.absent_type || "").toLowerCase() === "timeable";

  const [loading, setLoading] = useState(true);
  const [inUnix, setInUnix] = useState(null);
  const [outUnix, setOutUnix] = useState(null);
  const [late, setLate] = useState(false);

  // server-side gate (weekend/holiday for timeable user)
  const [blocked, setBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState(null);

  // Late reason modal
  const [needReason, setNeedReason] = useState(false);
  const [pendingReason, setPendingReason] = useState("");
  const [clockInLocked, setClockInLocked] = useState(false);

  // WIB date for cache key
  const [today, setToday] = useState(dayjs().tz(ZONE).format("YYYY-MM-DD"));

  // ticker detik
  const [nowTs, setNowTs] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    let intervalId;
    const tick = () => setNowTs(Math.floor(Date.now() / 1000));
    const msToNextSec = 1000 - (Date.now() % 1000);
    const startTimeout = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 1000);
    }, msToNextSec);

    return () => {
      clearTimeout(startTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // update today every minute (WIB) — supaya midnight rollover
  useEffect(() => {
    const id = setInterval(() => {
      setToday(dayjs().tz(ZONE).format("YYYY-MM-DD"));
    }, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!userId || !today) return;
    cleanupAttendanceStorage({ keepUserId: userId, keepDate: today });
  }, [userId, today]);

  // load attendance status (cache + server)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!userId) return;

      try {
        setLoading(true);

        // 1) hydrate cepat dari cache (kalau ada)
        const cached = loadCache(userId, today);
        if (cached && !cancelled) {
          setInUnix(cached.inUnix ?? null);
          setOutUnix(cached.outUnix ?? null);
          setLate(Boolean(cached.late));
          setBlocked(Boolean(cached.blocked));
          setBlockedReason(cached.blocked_reason ?? null);
        }

        // 2) tetap ambil dari server (source of truth)
        const { data } = await axiosInstance.get("/attendance");

        const initIn = typeof data?.in_unix === "number" ? data.in_unix : null;
        const initOut = typeof data?.out_unix === "number" ? data.out_unix : null;
        const initLate = String(data?.status || "").toLowerCase() === "late";

        const initBlocked = Boolean(data?.blocked);
        const initBlockedReason =
          typeof data?.blocked_reason === "string" ? data.blocked_reason : null;

        const fresh = {
          inUnix: initIn,
          outUnix: initOut,
          late: initLate,
          blocked: initBlocked,
          blocked_reason: initBlockedReason,
        };

        saveCache(userId, today, fresh);

        if (!cancelled) {
          setInUnix(initIn);
          setOutUnix(initOut);
          setLate(Boolean(initLate));
          setBlocked(Boolean(initBlocked));
          setBlockedReason(initBlockedReason);
          setLoading(false);
        }
      } catch (e) {
        console.error("LOAD attendance error:", e);
        message.error("Failed to load attendance status.");
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, today]);

  // reset saat berganti hari
  const prevTodayRef = useRef(today);
  useEffect(() => {
    if (prevTodayRef.current !== today) {
      setInUnix(null);
      setOutUnix(null);
      setLate(false);
      setBlocked(false);
      setBlockedReason(null);
    }
    prevTodayRef.current = today;
  }, [today]);

  const hasClockedIn = !!inUnix;
  const hasClockedOut = !!outUnix;

  const workedSeconds = useMemo(() => {
    if (!hasClockedIn) return 0;
    const end = hasClockedOut ? outUnix : nowTs;
    return Math.max(0, end - inUnix);
  }, [hasClockedIn, hasClockedOut, inUnix, outUnix, nowTs]);

  const canClockOut = hasClockedIn && !hasClockedOut && workedSeconds >= EIGHT_HOURS;

  const fmtHMS = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
  };

  const untilRequired = Math.max(0, EIGHT_HOURS - workedSeconds);

  // === Client-side late pre-check (only for timeable users when field is available)
  const isLateClient = useMemo(() => {
    void nowTs; // trigger recompute each second
    if (!isTimeable) return false;
    const now = dayjs().tz(ZONE);
    const { hh: oh, mm: om } = parseHHmm(CLIENT_OPEN_AT);
    const { hh: ch, mm: cm } = parseHHmm(CLIENT_LATE_CUTOFF);
    const openAt = now.clone().hour(oh).minute(om).second(0);
    const cutoff = now.clone().hour(ch).minute(cm).second(0);

    if (now.isBefore(openAt)) return false;
    return now.isAfter(cutoff);
  }, [isTimeable, nowTs]);

  // ===== ACTIONS =====
  async function getGeoOrBlock() {
    const geo = await getGeo();
    if (geo.status !== "ok") {
      showGeoBlock(geo.status);
      throw new Error("geo_required");
    }
    return geo;
  }

  async function handleClockIn() {
    if (hasClockedIn && !hasClockedOut) {
      message.warning("You have already clocked in today.");
      return;
    }

    if (blocked) {
      message.error(blockedReason || "Attendance is not available today.");
      return;
    }

    if (isLateClient) {
      setNeedReason(true);
      setClockInLocked(true);
      return;
    }

    try {
      const geo = await getGeoOrBlock(); // ⛔ location required
      const payload = { ...buildGeoPayload(geo) };

      const { data } = await axiosInstance.post(
        `/attendance?action=clock-in`,
        payload
      );
      const t = data?.in_unix;
      if (typeof t === "number") {
        setInUnix(t);
        setLate(Boolean(data?.late));
        setBlocked(false);
        setBlockedReason(null);
        saveCache(userId, today, {
          inUnix: t,
          outUnix,
          late: Boolean(data?.late),
          blocked: false,
          blocked_reason: null,
        });

        // refresh weekly attendance
        try {
          if (typeof fetchWeeklyAttendance === "function") {
            await fetchWeeklyAttendance();
          } else {
            window.location.reload();
          }
        } catch (refreshErr) {
          console.error("Error saat refresh setelah clock-in:", refreshErr);
          window.location.reload();
        }

        message.success("Clock-in successful.");
      } else {
        message.warning("Clock-in succeeded, but the response is incomplete.");
      }
    } catch (e) {
      if (e?.message === "geo_required") return; // sudah ditangani modal
      const data = e?.response?.data;
      if (data?.blocked) {
        setBlocked(true);
        setBlockedReason(data?.blocked_reason || data?.msg || null);
        message.error(
          data?.blocked_reason || data?.msg || "Attendance is not available today."
        );
      } else if (data?.need_reason) {
        setNeedReason(true);
        setClockInLocked(true);
      } else {
        const errMsg =
          (await parseError(e)) || data?.msg || "Clock-in gagal.";
        message.error(errMsg);
      }
    }
  }

  async function submitLateReason(reason) {
    try {
      if (blocked) {
        message.error(blockedReason || "Attendance is not available today.");
        return;
      }

      const geo = await getGeoOrBlock(); // ⛔ location required
      const payload = { late_reason: reason, ...buildGeoPayload(geo) };

      const { data } = await axiosInstance.post(
        `/attendance?action=clock-in`,
        payload
      );
      const t = data?.in_unix;
      if (typeof t === "number") {
        setInUnix(t);
        setLate(true);
        setBlocked(false);
        setBlockedReason(null);
        saveCache(userId, today, {
          inUnix: t,
          outUnix,
          late: true,
          blocked: false,
          blocked_reason: null,
        });

        // refresh weekly attendance
        try {
          if (typeof fetchWeeklyAttendance === "function") {
            await fetchWeeklyAttendance();
          } else {
            window.location.reload();
          }
        } catch (refreshErr) {
          console.error("Error saat refresh setelah clock-in:", refreshErr);
          window.location.reload();
        }

        message.success("Clock-in successful (late with reason).");
      } else {
        message.warning("Clock-in succeeded, but the response is incomplete.");
      }
      setPendingReason("");
      setNeedReason(false);
      setClockInLocked(false);
    } catch (e) {
      if (e?.message === "geo_required") return; // sudah ditangani modal
      const data = e?.response?.data;
      if (data?.blocked) {
        setBlocked(true);
        setBlockedReason(data?.blocked_reason || data?.msg || null);
        message.error(
          data?.blocked_reason || data?.msg || "Attendance is not available today."
        );
        return;
      }
      const errMsg =
        (await parseError(e)) || data?.msg || "Failed to submit reason.";
      message.error(errMsg);
    }
  }

  async function handleClockOut() {
    try {
      const geo = await getGeoOrBlock(); // ⛔ location required
      const payload = { ...buildGeoPayload(geo) };

      const { data } = await axiosInstance.post(
        `/attendance?action=clock-out`,
        payload
      );
      const t = data?.out_unix;
      if (typeof t === "number") {
        setOutUnix(t);
        saveCache(userId, today, {
          inUnix,
          outUnix: t,
          late,
          blocked,
          blocked_reason: blockedReason,
        });

        // refresh weekly attendance
        try {
          if (typeof fetchWeeklyAttendance === "function") {
            await fetchWeeklyAttendance();
          } else {
            window.location.reload();
          }
        } catch (refreshErr) {
          console.error("Error saat refresh setelah clock-out:", refreshErr);
          window.location.reload();
        }

        message.success("Clock-out successful.");
      } else {
        message.warning("Clock-out succeeded, but the response is incomplete.");
      }
    } catch (e) {
      if (e?.message === "geo_required") return; // sudah ditangani modal
      const data = e?.response?.data;

      const secondsRemaining =
        typeof data?.need_seconds === "number"
          ? data.need_seconds
          : typeof data?.seconds_remaining === "number"
          ? data.seconds_remaining
          : null;

      if (typeof secondsRemaining === "number") {
        const minutes = Math.ceil(secondsRemaining / 60);
        message.warning(
          `Insufficient working duration. About ${minutes} minutes remaining.`
        );
      } else {
        const errMsg = (await parseError(e)) || data?.msg || "Clock-out gagal.";
        message.error(errMsg);
      }
    }
  }

  const LateTag = late ? (
    <Tag color="orange" style={{ marginLeft: 8 }}>
      Late
    </Tag>
  ) : null;

  const BlockedTag = blocked ? (
    <Tooltip title={blockedReason || "Attendance is not available today."}>
      <Tag color="red" style={{ marginLeft: 8 }}>
        Not available
      </Tag>
    </Tooltip>
  ) : null;

  // ====== RENDER ======
  if (loading || !userId) {
    return (
      <>
        <Button loading>Loading...</Button>
      </>
    );
  }

  if (needReason) {
    return (
      <>
        <ModalLateReason
          open={needReason}
          value={pendingReason}
          onChange={setPendingReason}
          onCancel={() => {
            setNeedReason(false);
            setClockInLocked(false);
          }}
          onSubmit={submitLateReason}
        />
      </>
    );
  }

  if (!hasClockedIn) {
    return (
      <>
        <span>
          <Button
            type="primary"
            className="btn-blue-filled px-5"
            onClick={handleClockIn}
            disabled={clockInLocked || blocked}
          >
            <ClockCircleOutlined /> Clock In
          </Button>
        </span>
        {LateTag}
        {BlockedTag}
        <ModalLateReason
          open={needReason}
          value={pendingReason}
          onChange={setPendingReason}
          onCancel={() => {
            setNeedReason(false);
            setClockInLocked(false);
          }}
          onSubmit={submitLateReason}
        />
      </>
    );
  }

  if (!canClockOut) {
    const startedAt = dayjs.unix(inUnix).tz(ZONE).format("HH:mm");
    return (
      <>
        <Tooltip title={`Started ${startedAt} • ${fmtHMS(workedSeconds)} worked`}>
          <span>
            <Button type="default" className="text-xs" disabled>
              <ClockCircleOutlined /> Clock out in {fmtHMS(untilRequired)}
            </Button>
          </span>
        </Tooltip>
        {LateTag}
      </>
    );
  }

  return (
    <>
      <span>
        <Button color="danger" variant="filled" onClick={handleClockOut}>
          <ClockCircleOutlined /> Clock Out
        </Button>
      </span>
      {LateTag}
      <ModalLateReason
        open={needReason}
        value={pendingReason}
        onChange={setPendingReason}
        onCancel={() => {
          setNeedReason(false);
          setClockInLocked(false);
        }}
        onSubmit={submitLateReason}
      />
    </>
  );
}

// Helper error
async function parseError(e) {
  try {
    const data = e?.response?.data;
    if (typeof data?.msg === "string") return data.msg;
    if (typeof data === "string") return data;
    return null;
  } catch {
    return null;
  }
}
