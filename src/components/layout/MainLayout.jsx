"use client";

import Navbar from "@/components/utils/Navbar";
import { usePathname } from "next/navigation";
import PullRefresh from "../libs/PullRefresh";

export default function MainLayout({ children }) {
  const pathname = usePathname();

  const noNavbarExactPaths = ["/", "/login", "/reason"];

  const isNoNavbarPath = () => {
    return noNavbarExactPaths.includes(pathname);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {!isNoNavbarPath() && <Navbar />}

      {/* SCROLL CONTAINER UTAMA */}
      <div
        id="main-scroll-container"
        className="flex-1 min-h-0 overflow-y-auto"
      >
        <PullRefresh>{children}</PullRefresh>
      </div>
    </div>
  );
}
