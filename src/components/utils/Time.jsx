// src/components/utils/Time.jsx
"use client";
import { useEffect, useRef, useState } from "react";

export default function Time({
    tz = "Asia/Jakarta",
    locale = "id-ID",
    className = "text-xs text-gray-500",
}) {
    const [now, setNow] = useState(null); // null saat SSR => tidak ada markup waktu di HTML server
    const timerRef = useRef(null);

    useEffect(() => {
        setNow(new Date()); // set pertama setelah mount
        timerRef.current = setInterval(() => setNow(new Date()), 1000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    if (!now) return null; // hindari hydration mismatch

    const day = new Intl.DateTimeFormat(locale, { day: "2-digit", timeZone: tz }).format(now);
    const month = new Intl.DateTimeFormat(locale, { month: "long", timeZone: tz }).format(now).toLowerCase();
    const year = new Intl.DateTimeFormat(locale, { year: "numeric", timeZone: tz }).format(now);
    const time = new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: tz,
    }).format(now);

    return <h3 className={className}>{`${Number(day)} ${month} ${year} - ${time} WIB`}</h3>;
}
