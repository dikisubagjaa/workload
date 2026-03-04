// src/app/layout.jsx
import "@public/static/styles/globals.css";
import "@public/static/styles/responsive.css";
import Provider from "@/components/libs/Provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import MainLayout from "@/components/layout/MainLayout";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import ModalGateway from "@/components/modal/ModalGateway";
import { avenir } from "@/components/libs/Fonts";
import AppInitNotification from "@/components/AppInitNotification";
import TimesheetEnforcer from "@/components/timesheet/TimesheetEnforcer"; // ⬅️ ini yang baru

dayjs.extend(utc);
dayjs.extend(timezone);

const defaultTimezone =
    process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Jakarta";
dayjs.tz.setDefault(defaultTimezone);

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
};

export const metadata = {
    title: "VP Workload",
    description: "Connecting with VP-Digital",
    manifest: "/manifest.json",
    keywords: ["vp-workload"],
    icons: {
        icon: [{ url: "/static/icon-pwa/icon-192x192.png" }],
        apple: [{ url: "/static/icon-pwa/icon-192x192.png" }],
    },
    other: {
        "color-scheme": "light",
        "theme-color": "#ffffff",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "default",
        "apple-mobile-web-app-title": "VP Workload",
        "mobile-web-app-capable": "yes",
    },
};

export default async function RootLayout({ children }) {
    const session = await getServerSession(authOptions);
    return (
        <html lang="en" className={`${avenir.variable}`}>
            <body>
                <Provider session={session}>
                    {/* init push notif global */}
                    <AppInitNotification />

                    {/* guard timesheet di client, fallback kalau user pindah halaman via SPA */}
                    <TimesheetEnforcer />

                    <MainLayout>
                        {children}
                        <ModalGateway />
                    </MainLayout>
                </Provider>
            </body>
        </html>
    );
}
