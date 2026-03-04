"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingOutlined } from "@ant-design/icons";

export default function PullRefresh({ children }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const startYRef = useRef(0);
  const canPullRef = useRef(false); // true kalau gesture DIMULAI saat di atas
  const scrollElementRef = useRef(null);

  const router = useRouter();

  const getScrollElement = () => {
    if (typeof document === "undefined") return null;

    const mainEl = document.getElementById("main-scroll-container");
    if (mainEl) return mainEl;

    return (
      document.scrollingElement ||
      document.documentElement ||
      document.body ||
      null
    );
  };

  const triggerRefresh = () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setPullDistance(0);

    if (router && typeof router.refresh === "function") {
      router.refresh();
    }

    // Biar loading kelihatan
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;

    const scrollEl = scrollElementRef.current || getScrollElement();
    if (!scrollEl) return;

    scrollElementRef.current = scrollEl;

    const scrollTop = scrollEl.scrollTop || 0;
    const atTop = scrollTop <= 0;

    // HANYA boleh pull kalau gesture DIMULAI saat di atas
    canPullRef.current = atTop;
    startYRef.current = e.touches[0].clientY;

    setIsDragging(false);
    setPullDistance(0);
  };

  const handleTouchMove = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    if (!canPullRef.current || isRefreshing) return; // kalau mulai dari tengah → biarin scroll biasa

    const currentY = e.touches[0].clientY;
    const delta = currentY - startYRef.current;

    if (delta <= 0) {
      // geser ke atas / balik lagi → batal efek pull
      setPullDistance(0);
      setIsDragging(false);
      return;
    }

    // Di titik ini: gesture dimulai dari atas & lagi tarik ke bawah
    if (typeof e.cancelable !== "undefined" && e.cancelable) {
      e.preventDefault(); // cegah scroll native, kita yang kontrol offset
    }

    setIsDragging(true);

    const resistance = 0.5;
    const maxPull = 90;
    const dist = Math.min(delta * resistance, maxPull);

    setPullDistance(dist);
  };

  const handleTouchEnd = () => {
    const threshold = 55; // minimal jarak sebelum dianggap "refresh"

    if (canPullRef.current && pullDistance >= threshold) {
      // beneran refresh
      triggerRefresh();
    } else {
      // snap balik
      setPullDistance(0);
    }

    canPullRef.current = false;
    setIsDragging(false);
  };

  return (
    <div
      className="relative min-h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Indicator area di atas konten */}
      <div
        className="flex items-center justify-center text-xs text-gray-500 overflow-hidden"
        style={{
          height: isDragging || isRefreshing ? 40 : 0,
          transition: isDragging ? "none" : "height 150ms ease, opacity 150ms ease",
          opacity: isDragging || isRefreshing ? 1 : 0,
        }}
      >
        {isRefreshing ? (
          <div className="flex items-center gap-2">
            <LoadingOutlined spin className="text-sm" />
            <span>Refreshing data...</span>
          </div>
        ) : (
          <span>Pull down to refresh ⬇️</span>
        )}
      </div>

      {/* Konten digeser turun saat ditarik */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isDragging ? "none" : "transform 150ms ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}
