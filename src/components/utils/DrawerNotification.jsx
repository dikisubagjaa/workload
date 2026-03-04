// src/components/notifications/DrawerNotification.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Drawer, Button, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { faCircle, faXmark, faRotateRight, faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";
import dayjs from "@/utils/dayjs";
import { getStorageUrl, getProfileImageUrl } from "@/utils/storageHelpers";

// --- helpers fetch ---
async function getJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}
async function patchJson(url, opts = {}) {
  const res = await fetch(url, { method: "PATCH", cache: "no-store", ...opts });
  if (!res.ok) throw new Error(`Patch failed: ${res.status}`);
  return res.json();
}

// --- text helpers ---
function capitalizeFirst(s = "") {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function sentenceCase(s = "") {
  const text = (s || "").trim();
  if (!text) return "";
  return text.replace(/(^\p{L})|([.!?]\s*\p{L})/gu, (m) => m.toUpperCase());
}
const initialsOf = (name = "System") =>
  (name || "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// --- image helpers ---
const BLUR_DATA_URL =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="%23e5e7eb"/></svg>';

function normalizeAvatarSrc(src) {
  if (!src) return "";
  const s = String(src).trim();

  // sudah final
  if (s.startsWith("/api/") || s.startsWith("http://") || s.startsWith("https://")) return s;

  // bentuk lama: /storage/<folder>/[resized]/<file>
  if (s.startsWith("/storage/")) {
    const parts = s.split("/").filter(Boolean);
    const folder = parts[1] || "profile";
    const file = parts[parts.length - 1];
    const resized = parts.includes("resized");
    return getStorageUrl(folder, file, { resized });
  }

  // filename mentah → asumsikan foto profil (resized)
  return getProfileImageUrl(s, { resized: true });
}

function SenderAvatar({ src, name, size = 40 }) {
  const url = normalizeAvatarSrc(src);
  const isExternal = url.startsWith("http");
  const [err, setErr] = useState(false);
  const show = !!url && !err;

  return (
    <div
      className="relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-[11px] font-semibold text-gray-600 select-none"
      style={{ width: size, height: size }}
      aria-label={name || "avatar"}
      title={name || "avatar"}
    >
      {show ? (
        <Image
          src={url}
          alt={name || "avatar"}
          fill
          sizes={`${size}px`}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          onError={() => setErr(true)}
          unoptimized={isExternal}       // aman untuk URL eksternal tanpa remotePatterns
          style={{ objectFit: "cover" }}
        />
      ) : (
        <span>{initialsOf(name)}</span>
      )}
    </div>
  );
}

/**
 * Props:
 * - drawerNotification (bool)
 * - setDrawerNotification (fn(bool))
 * - userId (number)
 * - onChanged (fn)
 */
export default function DrawerNotification({
  drawerNotification,
  setDrawerNotification,
  userId = 1,
  onChanged,
}) {
  const isMobile = useMobileQuery();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const hasMore = useMemo(() => page < totalPages, [page, totalPages]);

  const fetchPage = async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const data = await getJson(`/api/notification?userId=${userId}&page=${pageNum}&limit=10`);
      setTotalPages(data?.meta?.totalPages || 1);
      setPage(data?.meta?.page || 1);
      setItems((prev) => (append ? [...prev, ...(data?.data || [])] : data?.data || []));
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (drawerNotification) fetchPage(1, false);
  }, [drawerNotification]);

  const close = () => setDrawerNotification(false);
  const reload = () => fetchPage(1, false);

  const markRead = async (notificationId) => {
    try {
      await patchJson(`/api/notification/${notificationId}/read`);
      setItems((prev) =>
        prev.map((it) => (it.notificationId === notificationId ? { ...it, isRead: true } : it))
      );
      onChanged?.();
    } catch (e) {
      message.error(e.message);
    }
  };

  const markAll = async () => {
    setBulkLoading(true);
    try {
      await patchJson(`/api/notification/read-all?userId=${userId}`);
      setItems((prev) => prev.map((it) => ({ ...it, isRead: true })));
      onChanged?.();
    } catch (e) {
      message.error(e.message);
    } finally {
      setBulkLoading(false);
    }
  };

  const loadMore = () => {
    if (!hasMore || loading) return;
    fetchPage(page + 1, true);
  };

  return (
    <Drawer
      open={drawerNotification}
      className="drawer-notification"
      classNames={{ mask: "custom-mask", body: "border" }}
      onClose={close}
      zIndex={isMobile ? 3 : 4}
      width={isMobile ? "100%" : 480}
      closeIcon={false}
      title={null}
      footer={null}
    >
      {/* Header */}
      <div className="px-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            <FontAwesomeIcon icon={faBell} className="text-lg fc-blue me-2" />
            Notifications
          </h3>

          <div className="flex items-center gap-2">
            <Button
              type="text"
              size="small"
              title="Reload"
              onClick={reload}
              loading={loading}
              icon={<FontAwesomeIcon icon={faRotateRight} className="text-base" />}
            />
            <Button
              type="text"
              size="small"
              title="Mark All As Read"
              onClick={markAll}
              loading={bulkLoading}
              icon={<FontAwesomeIcon icon={faCheckDouble} className="text-base" />}
            />
            <button onClick={close} aria-label="Close">
              <FontAwesomeIcon icon={faXmark} className="text-base" />
            </button>
          </div>
        </div>
        <hr className="mt-3" />
      </div>

      {/* List */}
      <ul className="scrollbar px-5">
        {items.length === 0 && !loading ? (
          <li className="py-10 text-center text-[#a7a7a7]">No Notifications</li>
        ) : null}

        {items.map((item) => {
          const rel = item.created ? dayjs.unix(item.created).fromNow() : "";
          const href = item.url || "#";
          const senderName = capitalizeFirst(item.sender || "System");
          const descDisplay = sentenceCase(item.description || item.title || "");
          const unread = !item.isRead;
          const onClickDot = (e) => {
            e.preventDefault();
            if (unread) markRead(item.notificationId);
          };

          // sumber avatar dari API/DB (mendukung banyak format)
          const rawSrc = item.avatar || item.senderPhoto || "";
          return (
            <li key={item.notificationId}>
              <Link
                href={href}
                className="flex items-center gap-3 border-b py-6 text-[#757575]"
                onClick={() => {
                  if (unread) markRead(item.notificationId);
                }}
              >
                <div className="flex-shrink-0">
                  <SenderAvatar src={rawSrc} name={senderName} size={40} />
                </div>

                <div>
                  <p className="text-sm">
                    <b>{senderName}</b>{" "}
                    <span className={unread ? "text-red-500" : ""}>{descDisplay}</span>
                  </p>
                  <p className="text-xs text-[#a7a7a7]">{rel}</p>
                </div>

                {unread ? (
                  <button
                    onClick={onClickDot}
                    className="ms-auto"
                    aria-label="Mark As Read"
                    title="Mark As Read"
                  >
                    <FontAwesomeIcon icon={faCircle} className="text-[10px] fc-blue" />
                  </button>
                ) : null}
              </Link>
            </li>
          );
        })}

        {hasMore ? (
          <li className="flex justify-center mt-3 mb-6">
            <Button onClick={loadMore} disabled={loading}>
              {loading ? "Loading..." : "Load More"}
            </Button>
          </li>
        ) : null}
      </ul>
    </Drawer>
  );
}
