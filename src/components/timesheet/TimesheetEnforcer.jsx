// src/components/timesheet/TimesheetEnforcer.jsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function TimesheetEnforcer() {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // kalau memang sudah di halaman timesheet, gak usah cek
        if (pathname.startsWith("/timesheet")) return;

        let canceled = false;

        (async () => {
            try {
                const res = await fetch("/api/timesheet/enforcement", {
                    cache: "no-store",
                });
                if (!res.ok) return;
                const data = await res.json();
                if (canceled) return;
                if (data?.required) {
                    router.replace("/timesheet");
                }
            } catch {
                // diam aja
            }
        })();

        return () => {
            canceled = true;
        };
    }, [pathname, router]);

    return null;
}
