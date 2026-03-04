"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function RememberLastUser() {
    const { data: session } = useSession();

    useEffect(() => {
        const u = session?.user;
        if (!u?.email) return;
        try {
            localStorage.setItem(
                "wl:lastUser",
                JSON.stringify({
                    name: u.name || (u.email?.split("@")[0] || ""),
                    email: u.email,
                    image: u.image || null,
                })
            );
        } catch { }
    }, [session?.user?.email]);

    return null;
}
