// src/components/utils/DrawerMenu.jsx
"use client";

import { Badge, Drawer, Menu as AntMenu, Spin } from "antd";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getMenuIconComponent } from "@/components/menu/menuIcons";

const TIMESHEET_PATH = "/timesheet";

export default function DrawerMenu({ drawerMenu, handleCloseDrawerMenu }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [menuItems, setMenuItems] = useState([]);
  const [liveMenu, setLiveMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openKeys, setOpenKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);

  // [NEW] status enforcement dari API
  const [enforced, setEnforced] = useState(false);
  const [enforcedDate, setEnforcedDate] = useState(null);

  // helper ikon: baca key string dari DB → React Icon component
  const renderIconForAntMenu = useCallback((iconKey /*, altText */) => {
    if (!iconKey) return null;
    return getMenuIconComponent(iconKey) || null;
  }, []);

  // [NEW] fetch enforcement setiap kali route berubah / session siap
  useEffect(() => {
    let cancelled = false;
    async function checkEnforcement() {
      try {
        const res = await fetch("/api/timesheet/enforcement", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setEnforced(!!data?.required);
          setEnforcedDate(data?.date || null);
        }
      } catch {
        if (!cancelled) {
          setEnforced(false);
          setEnforcedDate(null);
        }
      }
    }
    if (status === "authenticated") checkEnforcement();
    return () => {
      cancelled = true;
    };
  }, [status, pathname]);

  // Ambil menu live dari DB agar perubahan role/menu langsung terasa setelah refresh.
  useEffect(() => {
    let cancelled = false;
    async function loadLiveMenu() {
      if (status !== "authenticated") return;
      try {
        const res = await fetch("/api/auth/menu", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!cancelled && res.ok) {
          setLiveMenu(data?.menu || null);
        }
      } catch {
        if (!cancelled) setLiveMenu(null);
      }
    }
    loadLiveMenu();
    return () => {
      cancelled = true;
    };
  }, [status, pathname]);

  // build menu dari session
  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    const pages = liveMenu?.pages || session?.user?.menu?.pages || [];
    if (status === "authenticated" && Array.isArray(pages) && pages.length > 0) {
      const formatted = pages.map((menu) => {
        const hasTimesheetChild = Array.isArray(menu.children)
          ? menu.children.some((c) => c.path === TIMESHEET_PATH)
          : false;

        const subMenus = Array.isArray(menu.children)
          ? menu.children.map((sub) => {
              const disabledChild = enforced && sub.path !== TIMESHEET_PATH;
              const labelNode = disabledChild ? (
                <span className="nav-link opacity-50 cursor-not-allowed">
                  <div className="flex items-center w-full">
                    <span>{sub.label}</span>
                  </div>
                </span>
              ) : (
                <Link
                  href={sub.path || "#"}
                  onClick={handleCloseDrawerMenu}
                  className="nav-link"
                >
                  <div className="flex items-center w-full">
                    <span>{sub.label}</span>
                  </div>
                </Link>
              );

              return {
                key: sub.path || sub.key,
                icon: renderIconForAntMenu(sub.icon, sub.label),
                label: labelNode,
                disabled: disabledChild,
              };
            })
          : undefined;

        const disabledParent =
          enforced && !hasTimesheetChild && menu.path !== TIMESHEET_PATH;

        const parentLabelNode = disabledParent ? (
          <span className="nav-link opacity-50 cursor-not-allowed">
            <div className="flex items-center w-full">
              <span>{menu.label}</span>
            </div>
          </span>
        ) : (
          <Link href={menu.path || "#"} className="nav-link">
            <div className="flex items-center w-full">
              <span>{menu.label}</span>
            </div>
          </Link>
        );

        return {
          key: menu.path || menu.key,
          icon: renderIconForAntMenu(menu.icon, menu.label),
          label: parentLabelNode,
          children: subMenus,
          disabled: disabledParent,
        };
      });

      setMenuItems(formatted);
      setLoading(false);
    } else {
      setMenuItems([]);
      setLoading(false);
    }
  }, [session, liveMenu, status, renderIconForAntMenu, enforced, handleCloseDrawerMenu]);

  useEffect(() => {
    if (!menuItems.length) return;

    let foundKey = null;
    let parentKey = null;

    for (const menu of menuItems) {
      if (menu.key === pathname) {
        foundKey = menu.key;
        break;
      }
      if (menu.children) {
        const child = menu.children.find((c) => c.key === pathname);
        if (child) {
          foundKey = child.key;
          parentKey = menu.key;
          break;
        }
      }
    }

    const allParentKeys = menuItems
      .filter((m) => m.children?.length)
      .map((m) => m.key);
    setOpenKeys(allParentKeys);

    if (foundKey) {
      setSelectedKeys([foundKey]);
      if (parentKey) {
        setOpenKeys((prev) => Array.from(new Set([...prev, parentKey])));
      }
    }
  }, [pathname, menuItems]);

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      document.documentElement.style.setProperty(
        "--app-height",
        `${height}px`
      );
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Drawer
      open={drawerMenu}
      onClose={handleCloseDrawerMenu}
      mask
      width={220}
      placement="left"
      className="drawer-menu"
      classNames={{
        mask: "custom-mask",
        header: "pt-3",
        content: "drawer-full-height",
      }}
      zIndex={3}
    >
      {loading ? (
        <div className="flex items-center justify-center h-full min-h-[200px]">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {enforced && enforcedDate ? (
            <div className="px-3 py-2 mb-2 text-sm rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
              Wajib isi timesheet <b>{enforcedDate}</b> dulu. Menu lain dikunci
              sementara.
            </div>
          ) : null}

          <AntMenu
            mode="inline"
            className="nav-menu"
            items={menuItems}
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={(keys) => setOpenKeys(keys)}
          />
        </>
      )}
    </Drawer>
  );
}
