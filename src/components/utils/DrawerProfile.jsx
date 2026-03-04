// src/components/utils/DrawerProfile.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Avatar, Button, Calendar, Drawer, Select, Tooltip, Badge, message } from "antd";
import Link from "next/link";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket, faPlus } from "@fortawesome/free-solid-svg-icons";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { getAvatar } from "@/utils/avatarHelpers";
import { getStorageUrl, getProfileImageUrl } from "@/utils/storageHelpers";
import ModalEvent from "../modal/ModalEvent";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import AvatarImg from "../common/AvatarImg";
import { EditOutlined } from "@ant-design/icons";

dayjs.extend(utc);
dayjs.extend(timezone);
const ZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Jakarta";

// Normalisasi sumber avatar agar selalu pakai /api/storage yang benar
function normalizeAvatarSrc(src) {
    if (!src) return "";
    const s = String(src).trim();
    if (s.startsWith("/api/") || s.startsWith("http://") || s.startsWith("https://")) return s;

    if (s.startsWith("/storage/")) {
        const parts = s.split("/").filter(Boolean); // ["storage","folder",("resized"),"file"]
        const folder = parts[1] || "profile";
        const file = parts[parts.length - 1];
        const resized = parts.includes("resized");
        return getStorageUrl(folder, file, { resized });
    }

    // filename mentah → asumsi foto profil (resized)
    return getProfileImageUrl(s, { resized: true });
}

// Ambil FILENAME dari apa pun (url /api/file, http, /storage, atau filename mentah)
function extractFilenameFromAny(src) {
    if (!src) return "";
    const s = String(src).trim();
    try {
        if (s.startsWith("/api/") || s.startsWith("http://") || s.startsWith("https://")) {
            const u = new URL(s, typeof window !== "undefined" ? window.location.origin : "http://localhost");
            const f = u.searchParams.get("file");
            if (f) return f;
            const parts = u.pathname.split("/").filter(Boolean);
            return parts[parts.length - 1] || s;
        }
    } catch { }
    if (s.startsWith("/storage/")) {
        const parts = s.split("/").filter(Boolean);
        return parts[parts.length - 1] || s;
    }
    const parts = s.split("/").filter(Boolean);
    return parts[parts.length - 1] || s;
}

export default function DrawerProfile({ drawerProfile, setDrawerProfile }) {
    const [modalEvent, setModalEvent] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs().tz(ZONE).format("YYYY-MM-DD"));
    const [viewDate, setViewDate] = useState(dayjs().tz(ZONE));
    const [mapByDay, setMapByDay] = useState({}); // { 'YYYY-MM-DD': [events] }
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [profileJobPosition, setProfileJobPosition] = useState("");

    const isMobile = useMobileQuery();

    const { data: session } = useSession();
    const user = session?.user;
    const userId = user?.user_id ?? user?.id;

    // Kompatibel: getAvatar bisa return string URL atau { src, text }
    const ava = getAvatar(user);
    const baseSrc = typeof ava === "string" ? ava : (ava?.src || "");
    const avatarSrc = normalizeAvatarSrc(baseSrc);
    const avatarText = typeof ava === "object" ? (ava?.text || "") : "";

    // ===== Realtime avatar (listener event + cache-buster) =====
    const [avatarVersion, setAvatarVersion] = useState(0);      // timestamp untuk bust cache
    const [avatarUrl, setAvatarUrl] = useState(null);           // bisa datang sebagai URL /api/file...
    const [avatarFilename, setAvatarFilename] = useState(null); // atau langsung filename

    // Init dari localStorage + listener event
    useEffect(() => {
        if (!userId) return;

        try {
            const v = Number(localStorage.getItem(`avatarVersion:${userId}`) || 0);
            const fn = localStorage.getItem(`avatarFilename:${userId}`);
            const url = localStorage.getItem(`avatarUrl:${userId}`);
            if (v) setAvatarVersion(v);
            if (fn) setAvatarFilename(fn);
            if (url) setAvatarUrl(url);
        } catch { }

        const onAvatarUpdated = (e) => {
            const d = e?.detail || {};
            if (!d?.userId || String(d.userId) !== String(userId)) return;

            if (d.filename) {
                setAvatarFilename(d.filename);
                try { localStorage.setItem(`avatarFilename:${userId}`, d.filename); } catch { }
            }
            if (d.url) {
                setAvatarUrl(d.url);
                try { localStorage.setItem(`avatarUrl:${userId}`, d.url); } catch { }
            }

            const ver = Number(d.ts || Date.now());
            setAvatarVersion(ver);
            try { localStorage.setItem(`avatarVersion:${userId}`, String(ver)); } catch { }
        };

        const onStorage = (e) => {
            if (!e) return;
            if (e.key === `avatarVersion:${userId}` && e.newValue) setAvatarVersion(Number(e.newValue));
            if (e.key === `avatarFilename:${userId}`) setAvatarFilename(e.newValue || null);
            if (e.key === `avatarUrl:${userId}`) setAvatarUrl(e.newValue || null);
        };

        window.addEventListener("avatar:updated", onAvatarUpdated);
        window.addEventListener("storage", onStorage);
        return () => {
            window.removeEventListener("avatar:updated", onAvatarUpdated);
            window.removeEventListener("storage", onStorage);
        };
    }, [userId]);

    // Rehydrate saat drawer dibuka (kalau event terlewat waktu drawer tertutup)
    useEffect(() => {
        if (!drawerProfile || !userId) return;
        try {
            const v = Number(localStorage.getItem(`avatarVersion:${userId}`) || 0);
            const fn = localStorage.getItem(`avatarFilename:${userId}`);
            const url = localStorage.getItem(`avatarUrl:${userId}`);
            if (fn) setAvatarFilename(fn);
            if (url) setAvatarUrl(url);
            setAvatarVersion(v || Date.now());
        } catch { }
    }, [drawerProfile, userId]);

    // Tentukan FILENAME final untuk AvatarImg (konsisten dengan Navbar)
    const finalAvatarFilename = extractFilenameFromAny(avatarFilename || avatarUrl || session?.user?.profile_pic);
    const finalCacheKey = avatarVersion || finalAvatarFilename || 0;

    const fetchEvents = useCallback(async (monthDate) => {
        setLoadingEvents(true);
        try {
            const start = monthDate.startOf("month").format("YYYY-MM-DD");
            const end = monthDate.endOf("month").format("YYYY-MM-DD");
            const { data } = await axiosInstance.get("/calendar/events", {
                params: { from: start, to: end, limit: 500, sortBy: "start_at", sortDir: "asc" },
            });
            if (!data?.success) throw new Error(data?.msg || "Failed to fetch events");

            const byDay = {};
            for (const ev of (data.data || [])) {
                const key = dayjs.unix(ev.start_at).tz(ZONE).format("YYYY-MM-DD");
                (byDay[key] ||= []).push(ev);
            }
            setMapByDay(byDay);
        } catch (e) {
            console.error(e);
            message.error(e?.message || "Failed to load events");
        } finally {
            setLoadingEvents(false);
        }
    }, []);

    useEffect(() => {
        if (user?.status === "active" && drawerProfile) {
            fetchEvents(viewDate);
        }
    }, [user?.status, drawerProfile, viewDate, fetchEvents]);

    // Fallback: profile page reads fresh DB data, while session can be stale.
    // When drawer opens, fetch profile once so job position stays consistent.
    useEffect(() => {
        if (!drawerProfile || !userId) return;
        let cancelled = false;

        (async () => {
            try {
                const { data } = await axiosInstance.get(`/profile/${userId}`);
                if (cancelled) return;
                const nextJob = data?.user?.job_position || "";
                setProfileJobPosition(nextJob);
            } catch {
                if (!cancelled) setProfileJobPosition("");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [drawerProfile, userId]);

    useEffect(() => {
        const handleResize = () => {
            const height = window.innerHeight;
            document.documentElement.style.setProperty('--app-height', `${height}px`);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const cellRender = (current, info) => {
        if (info.type !== "date") return info.originNode;
        const key = dayjs(current).tz(ZONE).format("YYYY-MM-DD");
        const list = mapByDay[key] || [];
        if (!list.length) return null;
        const top = list.slice(0, 2);
        return (
            <ul className="events">
                {top.map((ev) => (
                    <li key={`${ev.event_id}_${ev.start_at}`} className="truncate">
                        <Badge color={ev.color || "#1677ff"} text={ev.title} />
                    </li>
                ))}
                {list.length > 2 && (
                    <li className="text-[11px] text-gray-500">+{list.length - 2} more</li>
                )}
            </ul>
        );
    };

    return (
        <>
            <Drawer
                open={drawerProfile}
                className="drawer-profile shadow-2xl"
                classNames={{
                    mask: "custom-mask",
                    header: "pt-3",
                    content: "drawer-full-height"
                }}
                onClose={() => setDrawerProfile(false)}
                zIndex={isMobile ? 3 : 5}
                width={isMobile ? "100%" : 400}
            >
                <div className="profile-bio border-b py-5">
                    <div>
                        <button
                            className="absolute right-4 top-5 text-red-500"
                            onClick={() =>
                                signOut({
                                    callbackUrl: "/",
                                })
                            }
                        >
                            <FontAwesomeIcon icon={faArrowRightFromBracket} /> Log Out
                        </button>
                    </div>

                    <div className="text-center">
                        <div className="flex flex-col items-center">
                            <Link href="/profile" className="inline-block" onClick={() => setDrawerProfile(false)}>
                                <div className="wrapper-profile">
                                    <AvatarImg
                                        // Sebelumnya: src={session?.user?.profile_pic}
                                        // Realtime: pakai filename final + cache-buster supaya langsung berubah
                                        src={finalAvatarFilename}
                                        cacheKey={finalCacheKey}
                                        name={session?.user?.fullname}
                                        size={104}
                                        alt={session?.user?.fullname || "avatar"}
                                        className="shadow-lg"
                                    />
                                    <EditOutlined className="icon shadow-lg" />
                                    <div className="overlay">
                                        <span>Edit Profile</span>
                                    </div>
                                </div>
                            </Link>
                            <h3 className="fc-base text-lg font-bold">{user?.fullname}</h3>
                            {/* <h4 className="fc-base text-xs mb-4">
                                {user?.job_position || user?.jobPosition || profileJobPosition || "-"}
                            </h4> */}
                            <div className="fc-base text-xs text-gray-500 mb-4">
                                Level: {user?.user_role || user?.role || "-"}
                            </div>
                        </div>

                        <div className="flex justify-center items-center gap-4">
                            <Link href="/attendance" onClick={() => setDrawerProfile(false)}>
                                <Tooltip placement="bottom" title="Attendance">
                                    <Image
                                        src="/static/images/icon/icon-attendance.png"
                                        width={32}
                                        height={32}
                                        alt="Attendance"
                                    />
                                </Tooltip>
                            </Link>

                            <Link href="/timesheet" onClick={() => setDrawerProfile(false)}>
                                <Tooltip placement="bottom" title="Timesheet">
                                    <Image
                                        src="/static/images/icon/icon-timesheet.png"
                                        width={32}
                                        height={32}
                                        alt="Timesheet"
                                    />
                                </Tooltip>
                            </Link>

                            <Link href="/leave" onClick={() => setDrawerProfile(false)}>
                                <Tooltip placement="bottom" title="Leave">
                                    <Image
                                        src="/static/images/icon/icon-leave.png"
                                        width={32}
                                        height={32}
                                        alt="Leave"
                                    />
                                </Tooltip>
                            </Link>
                        </div>
                    </div>
                </div>
                {user && user?.status == "active" && (
                    <div className="py-5 px-4">
                        <Calendar
                            fullscreen={false}
                            cellRender={cellRender}
                            headerRender={({ value, onChange }) => {
                                const start = 0;
                                const end = 12;
                                const monthOptions = [];
                                let current = value.clone();
                                const localeData = value.localeData();
                                const months = [];
                                for (let i = 0; i < 12; i++) {
                                    current = current.month(i);
                                    months.push(localeData.monthsShort(current));
                                }
                                for (let i = start; i < end; i++) {
                                    monthOptions.push(
                                        <Select.Option key={i} value={i} className="month-item">
                                            {months[i]}
                                        </Select.Option>
                                    );
                                }
                                const year = value.year();
                                const month = value.month();
                                const options = [];
                                for (let i = year - 10; i < year + 10; i += 1) {
                                    options.push(
                                        <Select.Option key={i} value={i} className="year-item">
                                            {i}
                                        </Select.Option>
                                    );
                                }
                                return (
                                    <>
                                        <h3 className="text-lg font-semibold text-gray-500 mb-4">Calendar</h3>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex gap-2">
                                                <Select
                                                    size="middle"
                                                    popupMatchSelectWidth={false}
                                                    className="my-year-select"
                                                    value={year}
                                                    onChange={(newYear) => {
                                                        const now = value.clone().year(newYear);
                                                        onChange(now);
                                                        setViewDate(dayjs(now).tz(ZONE));
                                                    }}
                                                >
                                                    {options}
                                                </Select>

                                                <Select
                                                    size="middle"
                                                    popupMatchSelectWidth={false}
                                                    value={month}
                                                    onChange={(newMonth) => {
                                                        const now = value.clone().month(newMonth);
                                                        onChange(now);
                                                        setViewDate(dayjs(now).tz(ZONE));
                                                    }}
                                                >
                                                    {monthOptions}
                                                </Select>
                                            </div>
                                            <Button
                                                color="default"
                                                variant="outlined"
                                                className="btn-outline-blue"
                                                onClick={() => {
                                                    setSelectedDate(viewDate.format("YYYY-MM-DD"));
                                                    setModalEvent(true);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faPlus} className="me-1" /> Add Event
                                            </Button>
                                        </div>

                                        <div className="flex justify-center gap-3 mb-3">
                                            {/* Legend (opsional) */}
                                        </div>
                                    </>
                                );
                            }}
                            onPanelChange={(val) => setViewDate(dayjs(val).tz(ZONE))}
                            onChange={(val) => setViewDate(dayjs(val).tz(ZONE))}
                            onSelect={(date) => {
                                setSelectedDate(dayjs(date).tz(ZONE).format("YYYY-MM-DD"));
                                setModalEvent(true);
                            }}
                        />

                        <div className="bg-[#F5F5F5] px-4 py-2 rounded-md mb-3 mt-5">
                            <h3 className="text-base">Events and reminders</h3>
                        </div>

                        <ul className="divide-y">
                            {(() => {
                                const items = mapByDay[selectedDate] || [];
                                if (loadingEvents) return <li className="py-3 text-xs text-gray-500">Loading…</li>;
                                if (!items.length) return <li className="py-3 text-xs text-gray-500">No events</li>;
                                return items.slice(0, 5).map((ev) => (
                                    <li key={`${ev.event_id}_${ev.start_at}`} className="py-4 text-[#757575]">
                                        <h4 className="text-sm mb-1">
                                            {dayjs.unix(ev.start_at).tz(ZONE).format("ddd, DD MMM YYYY • HH:mm")} –{" "}
                                            {dayjs.unix(ev.end_at).tz(ZONE).format("HH:mm")}
                                        </h4>
                                        <div>
                                            <h5 className="text-xs text-[#a7a7a7]">{ev.is_public ? "Public" : "Private"}</h5>
                                            <h5 className="font-semibold text-base truncate">{ev.title}</h5>
                                        </div>
                                    </li>
                                ));
                            })()}
                        </ul>
                    </div>
                )}
            </Drawer>

            <ModalEvent
                modalEvent={modalEvent}
                setModalEvent={setModalEvent}
                selectedDate={selectedDate}
                onSaved={() => fetchEvents(viewDate)}
            />
        </>
    );
}
