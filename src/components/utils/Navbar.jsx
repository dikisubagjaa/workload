// src/components/utils/Navbar.jsx
"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCommentDots } from "@fortawesome/free-regular-svg-icons";
import { Badge } from "antd";
import { useSession } from "next-auth/react";
import DrawerMenu from "@components/utils/DrawerMenu";
import DrawerNotification from "@components/utils/DrawerNotification";
import DrawerProfile from "@components/utils/DrawerProfile";
import ModalSearch from "../modal/ModalSearch";
import useFcmToken from "@/components/hook/useFcmToken";
import AvatarImg from "@components/common/AvatarImg";
import axiosInstance from "@/utils/axios";
import { useLaptopQuery } from "../libs/UseMediaQuery";
import { Fade as Hamburger } from "hamburger-react";
import ClockButton from "../attendance/ClockButton";
import DrawerChat from "./DrawerChat";

export default function Navbar() {
  const { data: session } = useSession();
  const userId = session?.user?.user_id;
  const pathname = usePathname();
  const roomId = pathname || "/";

  const [drawerProfile, setDrawerProfile] = useState(false);
  const [drawerMenu, setDrawerMenu] = useState(false);
  const [drawerNotification, setDrawerNotification] = useState(false);
  const [modalSearch, setModalSearch] = useState(false);
  const [drawerChat, setDrawerChat] = useState(false);
  const [drawerChannel, setDrawerChannel] = useState(false);
  const [drawerReply, setDrawerReply] = useState(false);
  const isLaptop = useLaptopQuery?.();

  const [unreadCount, setUnreadCount] = useState(0);

  // avatar realtime
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFilename, setAvatarFilename] = useState(null);

  const fetchUnread = useCallback(async () => {
    try {
      if (!userId) return;
      const { data } = await axiosInstance.get("/notification/unread-count", {
        params: { userId },
      });
      const next =
        typeof data?.unread === "number"
          ? data.unread
          : typeof data?.count === "number"
            ? data.count
            : 0;
      setUnreadCount(next);
    } catch {
      // noop
    }
  }, [userId]);

  // FCM – tetap di-init, tapi jangan dipaksa pas buka drawer
  const { permission, ensureRegistered } = useFcmToken({
    userId,
    onForegroundMessage: () => {
      setUnreadCount((c) => c + 1);
      setTimeout(() => {
        fetchUnread();
      }, 500);
    },
  });

  // hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const notifTitle =
    mounted && permission !== "granted"
      ? "Enable notifications"
      : "Notifications";

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  useEffect(() => {
    const onFocus = () => fetchUnread();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchUnread]);

  // 🔴 tambahan: dengarkan event dari AppInitNotification (foreground FCM)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleNewNotification = () => {
      // naikin dulu biar kerasa instant
      setUnreadCount((c) => c + 1);
      // lalu sync ke server (jaga-jaga selisih)
      setTimeout(() => {
        fetchUnread();
      }, 500);
    };

    window.addEventListener("notification:new", handleNewNotification);
    return () => {
      window.removeEventListener("notification:new", handleNewNotification);
    };
  }, [fetchUnread]);

  const handleNotifChanged = () => {
    fetchUnread();
  };

  // versi ringan: buka drawer dulu, gak daftar FCM di sini
  const handleDrawerNotification = () => {
    const next = !drawerNotification;
    setDrawerNotification(next);
    setModalSearch(false);
    setDrawerMenu(false);
    setDrawerProfile(false);
    setDrawerChat(false);
    setDrawerChannel(false);
    setDrawerReply(false);

    // kalau drawer ditutup, refresh unread
    if (!next) {
      fetchUnread();
    }
  };

  const handleDrawerChat = () => {
    if (!drawerChat && !drawerChannel && !drawerReply) {
      setDrawerChat(true);
      setDrawerChannel(true);
      setDrawerReply(false);
      setDrawerMenu(false);
      setDrawerProfile(false);
      setDrawerNotification(false);
    } else {
      setDrawerChat(false);
      setDrawerChannel(false);
      setDrawerReply(false);
    }
  };

  const handleModalSearch = () => {
    setModalSearch(!modalSearch);
    setDrawerNotification(false);
    setDrawerMenu(false);
    setDrawerProfile(false);
  };

  const handleDrawerMenu = () => {
    setDrawerMenu(!drawerMenu);
    setDrawerNotification(false);
    setModalSearch(false);
    setDrawerProfile(false);
    setDrawerChat(false);
    setDrawerChannel(false);
    setDrawerReply(false);
  };

  const handleCloseDrawerMenu = () => {
    setDrawerMenu(false);
    setDrawerNotification(false);
    setModalSearch(false);
    setDrawerProfile(false);
  };

  const handleDrawerProfile = () => {
    setDrawerProfile(!drawerProfile);
    setDrawerMenu(false);
    setDrawerNotification(false);
    setModalSearch(false);
    setDrawerChat(false);
    setDrawerChannel(false);
    setDrawerReply(false);
  };

  // avatar realtime listeners
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
      if (!d?.userId || d.userId !== userId) return;
      if (d.filename) {
        setAvatarFilename(d.filename);
        try {
          localStorage.setItem(`avatarFilename:${userId}`, d.filename);
        } catch { }
      }
      if (d.url) {
        setAvatarUrl(d.url);
        try {
          localStorage.setItem(`avatarUrl:${userId}`, d.url);
        } catch { }
      }
      const ver = Number(d.ts || Date.now());
      setAvatarVersion(ver);
      try {
        localStorage.setItem(`avatarVersion:${userId}`, String(ver));
      } catch { }
    };

    const onStorage = (e) => {
      if (!e) return;
      if (e.key === `avatarVersion:${userId}` && e.newValue) {
        setAvatarVersion(Number(e.newValue));
      }
      if (e.key === `avatarFilename:${userId}`) {
        setAvatarFilename(e.newValue || null);
      }
      if (e.key === `avatarUrl:${userId}`) {
        setAvatarUrl(e.newValue || null);
      }
    };

    window.addEventListener("avatar:updated", onAvatarUpdated);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("avatar:updated", onAvatarUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, [userId]);

  const avatarSrc = avatarUrl || avatarFilename || session?.user?.profile_pic;
  const avatarCacheKey = avatarVersion || avatarSrc || 0;

  return (
    <>
      <nav className="navbar shadow-md sticky top-0 left-0 z-10">
        <ul className="flex items-center gap-0 me-auto">
          <li className="relative h-7 w-10 sm:w-12">
            <button
              className="absolute -top-[10px] -left-[10px] lg:left-0"
              onClick={handleDrawerMenu}
            >
              <Hamburger
                toggled={drawerMenu}
                toggle={setDrawerMenu}
                size={24}
                distance="lg"
                color="#0FA3B1"
                rounded
              />
            </button>
          </li>
          <li>
            <h3 className="text-3xl me-3 text-gray-200">|</h3>
          </li>
          <li>
            <Link href="/">
              <h2 className="fc-blue text-xl sm:text-3xl">WORKLOAD</h2>
            </Link>
          </li>
        </ul>

        <ul className="flex items-center gap-5 lg:gap-6">
          <li className="hidden sm:block">
            {session && session.user.status === "active" && <ClockButton />}
          </li>

          {/* trigger chat */}
          <li>
            <button onClick={handleDrawerChat}>
              <FontAwesomeIcon
                size="lg"
                icon={faCommentDots}
                className={`${drawerChat ? "fc-blue" : "text-[#2f2f2f]"}`}
              />
            </button>
          </li>

          <li>
            <button
              onClick={handleDrawerNotification}
              suppressHydrationWarning
              title={notifTitle}
            >
              <Badge size="small" count={unreadCount} overflowCount={99}>
                <FontAwesomeIcon
                  icon={faBell}
                  size="lg"
                  className={`${drawerNotification ? "fc-blue" : ""}`}
                />
              </Badge>
            </button>
          </li>

          <li>
            <button
              className="flex items-center gap-2"
              onClick={handleDrawerProfile}
            >
              <AvatarImg
                src={avatarSrc}
                cacheKey={avatarCacheKey}
                name={session?.user?.fullname}
                size={32}
                alt={session?.user?.fullname || "avatar"}
              />
            </button>
          </li>
        </ul>
      </nav>

      <DrawerMenu
        drawerMenu={drawerMenu}
        handleCloseDrawerMenu={handleCloseDrawerMenu}
      />
      <DrawerNotification
        drawerNotification={drawerNotification}
        setDrawerNotification={setDrawerNotification}
        userId={userId}
        onChanged={handleNotifChanged}
      // kalau mau nanti bisa dikasih handleEnablePush={handleEnablePush}
      />
      <DrawerProfile
        drawerProfile={drawerProfile}
        setDrawerProfile={setDrawerProfile}
      />
      <ModalSearch modalSearch={modalSearch} setModalSearch={setModalSearch} />

      <DrawerChat
        drawerChat={drawerChat}
        setDrawerChat={setDrawerChat}
        drawerReply={drawerReply}
        setDrawerReply={setDrawerReply}
        drawerChannel={drawerChannel}
        setDrawerChannel={setDrawerChannel}
        isLaptop={isLaptop}
        roomId={roomId}   
      />
    </>
  );
}
