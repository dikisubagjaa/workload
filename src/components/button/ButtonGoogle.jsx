// src/components/auth/ButtonGoogle.jsx
"use client";
import { Button, message } from "antd";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { asset } from "@/utils/url";

export default function ButtonGoogle() {
    const handleGoogleLogin = () => {
        if (!navigator.geolocation) {
            message.error("Browser Anda tidak mendukung geolocation. Login dibatalkan.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                // simpan lokasi untuk dipakai di halaman post login
                sessionStorage.setItem("user-location", JSON.stringify(location));

                // bawa tujuan akhir kalau ada (?callbackUrl=...), default ke /dashboard
                const params = new URLSearchParams(window.location.search);
                const next = params.get("callbackUrl") || "/dashboard";

                // callback absolut → selalu kembali ke origin saat ini (dev/prod)
                const cb = `${window.location.origin}/post-login-location-check?next=${encodeURIComponent(
                    next
                )}`;

                signIn("google", { callbackUrl: cb }, { prompt: "select_account" });
            },
            (error) => {
                console.error("Gagal mendapatkan lokasi:", error);
                message.error("Anda harus mengaktifkan geolocation untuk login.");
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    return (
        <Button
            className="btn-blue rounded-full flex items-center shadow-md py-5 px-5"
            onClick={handleGoogleLogin}
        >
            <Image
                src={asset('static/images/google.png')}
                alt="Google"
                width={100}
                height={100}
                className="w-4 me-2"
            />
            Login Dengan Google
        </Button>
    );
}
