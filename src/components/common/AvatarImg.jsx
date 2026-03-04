// components/common/AvatarImg.jsx
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { buildProfileImageUrl } from "@/utils/avatarHelpers";

const BLUR_DATA_URL =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><rect width='8' height='8' fill='%23e5e7eb'/></svg>";

function initialsFromName(name) {
    const n = String(name || "").trim();
    if (!n) return "?";
    const [a, b] = n.split(/\s+/);
    const ab = ((a?.[0] || "") + (b?.[0] || "")).toUpperCase();
    return ab || (a?.[0] || "?").toUpperCase();
}

export default function AvatarImg({
    src,
    name,
    initials = "",
    alt = "avatar",
    size = 32,
    className = "",
}) {
    const [err, setErr] = useState(false);

    // src kamu pasti relatif → gunakan helper supaya path benar (storage/profile/resized/..)
    const url = useMemo(() => {
        const s = String(src || "").trim();
        return s ? buildProfileImageUrl(s) : "";
    }, [src]);

    const letters = useMemo(
        () => (String(initials).trim() || initialsFromName(name)).toUpperCase(),
        [initials, name]
    );

    const dim = Number(size) || 32;
    const showImg = !!url && !err;

    return (
        <div
            className={`relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-[11px] font-semibold text-gray-600 ${className}`}
            style={{ width: dim, height: dim }}
            aria-label={alt}
            title={alt}
        >
            {showImg ? (
                <Image
                    src={url}
                    alt={alt}
                    fill
                    sizes={`${dim}px`}
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    style={{ objectFit: "cover" }}
                    onError={() => setErr(true)}
                />
            ) : (
                <span>{letters}</span>
            )}
        </div>
    );
}
