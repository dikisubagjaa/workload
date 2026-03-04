// src/app/role/[roleId]/menu/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Divider,
  Spin,
  Tag,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";

export default function RoleMenuAccessPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params?.roleId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [role, setRole] = useState(null);
  const [menus, setMenus] = useState([]);
  const [selectedMenuIds, setSelectedMenuIds] = useState(new Set());
  const [initialSelected, setInitialSelected] = useState(new Set());
  const [error, setError] = useState("");
  const [syncToMembers, setSyncToMembers] = useState(true);

  // ===== FETCH ROLE + MENUS =====
  useEffect(() => {
    if (!roleId) return;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [roleRes, menuRes] = await Promise.all([
          axiosInstance.get(`/role/${roleId}`),
          axiosInstance.get("/menu"),
        ]);

        const roleData =
          roleRes.data?.role ||
          roleRes.data?.data ||
          roleRes.data;

        const menuData = menuRes.data?.menus || menuRes.data || [];

        setRole(roleData);
        setMenus(menuData);

        const accessArray = normalizeMenuAccess(roleData?.menu_access, menuData);
        const accessSet = new Set(accessArray);
        setSelectedMenuIds(accessSet);
        setInitialSelected(new Set(accessArray));
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.msg ||
            "Failed to load role or menus data."
        );
        message.error("Failed to load role or menus data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [roleId]);

  // Normalise menu_access from API (array of ids or array of objects)
  function normalizeMenuAccess(menu_access, menuData = []) {
    if (!Array.isArray(menu_access)) return [];
    const pathToId = new Map(
      menuData
        .filter((m) => m?.path)
        .map((m) => [String(m.path).trim().toLowerCase(), Number(m.menu_id)])
    );

    const normalized = menu_access
      .map((entry) => {
        if (entry == null) return null;

        if (typeof entry === "number" && Number.isFinite(entry)) return entry;

        if (typeof entry === "string") {
          const s = entry.trim();
          if (!s) return null;
          if (/^\d+$/.test(s)) return Number(s);
          const byPath = pathToId.get(s.toLowerCase());
          return Number.isFinite(byPath) ? byPath : s;
        }

        if (typeof entry === "object") {
          if (entry.menu_id != null && Number.isFinite(Number(entry.menu_id))) {
            return Number(entry.menu_id);
          }
          if (typeof entry.path === "string" && entry.path.trim()) {
            const byPath = pathToId.get(entry.path.trim().toLowerCase());
            return Number.isFinite(byPath) ? byPath : entry.path.trim();
          }
        }

        return null;
      })
      .filter((v) => v !== null && v !== undefined && v !== "");

    return normalized.filter((v, i) => normalized.findIndex((x) => x === v) === i);
  }

  // Helper: global show/hidden flag
  const isMenuShown = (menu) => {
    const v = menu?.is_show;
    return v === true || v === "true" || v === 1 || v === "1";
  };

  // ===== MEMO: MAP MENU, CHILDREN, ROOT =====
  const normalizeParentId = (v) => {
    if (v === null || v === undefined || v === "" || v === 0 || v === "0") return null;
    return v;
  };

  const menuById = useMemo(
    () => Object.fromEntries(menus.map((m) => [m.menu_id, m])),
    [menus]
  );

  const childrenMap = useMemo(() => {
    const map = {};
    menus.forEach((m) => {
      const parentKey = normalizeParentId(m.parent_id);
      if (!map[parentKey]) map[parentKey] = [];
      map[parentKey].push(m);
    });

    // sort by ordered asc
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => (a.ordered || 0) - (b.ordered || 0));
    });

    return map;
  }, [menus]);

  const rootMenus = useMemo(
    () =>
      (childrenMap[null] || []).sort(
        (a, b) => (a.ordered || 0) - (b.ordered || 0)
      ),
    [childrenMap]
  );

  // ===== HANDLER: TOGGLE MENU =====
  const toggleMenu = (menuId, checked) => {
    setSelectedMenuIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(menuId);
      } else {
        next.delete(menuId);
      }
      return next;
    });
  };

  const toggleGroup = (rootMenu, checked) => {
    const allDescendantIds = collectDescendantIds(rootMenu.menu_id);
    setSelectedMenuIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        allDescendantIds.forEach((id) => next.add(id));
      } else {
        allDescendantIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  };

  const isGroupFullySelected = (rootMenu) => {
    const allIds = collectDescendantIds(rootMenu.menu_id);
    return allIds.every((id) => selectedMenuIds.has(id));
  };

  const isGroupPartiallySelected = (rootMenu) => {
    const allIds = collectDescendantIds(rootMenu.menu_id);
    const someChecked = allIds.some((id) => selectedMenuIds.has(id));
    const allChecked = allIds.every((id) => selectedMenuIds.has(id));
    return someChecked && !allChecked;
  };

  const collectDescendantIds = (menuId) => {
    const out = [];
    const stack = [menuId];
    while (stack.length > 0) {
      const currentId = stack.pop();
      out.push(currentId);
      const children = childrenMap[currentId] || [];
      for (const c of children) stack.push(c.menu_id);
    }
    return out;
  };

  const renderDescendants = (parentId, level = 0) => {
    const list = childrenMap[parentId] || [];
    if (list.length === 0) return null;

    return (
      <div
        className={
          level === 0
            ? "border-t border-dashed pt-2 mt-2 space-y-1"
            : "space-y-1 ml-4 border-l border-gray-200 pl-3"
        }
      >
        {list.map((child) => {
          const childShown = isMenuShown(child);
          return (
            <div key={child.menu_id}>
              <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 px-2 rounded hover:bg-gray-50"
                style={{ paddingLeft: `${12 + level * 18}px` }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Checkbox
                    checked={selectedMenuIds.has(child.menu_id)}
                    onChange={(e) => toggleMenu(child.menu_id, e.target.checked)}
                  >
                    <span className="text-sm">{child.title}</span>
                  </Checkbox>
                  {child.type && (
                    <Tag
                      size="small"
                      color={
                        child.type === "button"
                          ? "purple"
                          : child.type === "dashboard"
                            ? "green"
                            : "blue"
                      }
                    >
                      {child.type}
                    </Tag>
                  )}
                  <Tag size="small" color={childShown ? "green" : "red"}>
                    {childShown ? "Shown" : "Hidden"}
                  </Tag>
                </div>
                <div className="text-xs text-gray-500 mt-1 sm:mt-0">
                  {child.path || "-"}
                </div>
              </div>
              {renderDescendants(child.menu_id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  const hasChanges = useMemo(() => {
    if (initialSelected.size !== selectedMenuIds.size) return true;
    for (const id of selectedMenuIds) {
      if (!initialSelected.has(id)) return true;
    }
    return false;
  }, [initialSelected, selectedMenuIds]);

  // ===== SAVE =====
  const handleSave = async () => {
    if (!role) return;
    setSaving(true);
    try {
      const payload = {
        menu_access: Array.from(selectedMenuIds),
        sync_to_members: syncToMembers,
      };

      const res = await axiosInstance.put(`/role/${role.role_id}`, payload);

      setInitialSelected(new Set(selectedMenuIds));
      const synced = Number(res?.data?.sync_members_count || 0);
      message.success(`Role access updated. Synced ${synced} member(s).`);
    } catch (err) {
      console.error(err);
      message.error(
        err?.response?.data?.msg || "Failed to update role access."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedMenuIds(new Set(initialSelected));
  };

  const handleBack = () => {
    router.push("/role");
  };

  // ===== UI RENDER =====
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className="mb-2"
        >
          Back to Roles
        </Button>
        <Alert
          type="error"
          message="Role not found"
          description={error || "Unable to load this role."}
          showIcon
        />
      </div>
    );
  }

  const totalSelected = selectedMenuIds.size;
  const totalMenus = menus.length;

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header & Back */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="mr-1"
          >
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold">
              Edit Role Access: {role.title}
            </h1>
            <p className="text-xs text-gray-500">
              Slug: <code>{role.slug}</code>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Checkbox
            checked={syncToMembers}
            onChange={(e) => setSyncToMembers(e.target.checked)}
          >
            Sync access to all members in this role
          </Checkbox>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            disabled={!hasChanges}
          >
            Save changes
          </Button>
        </div>
      </div>

      {/* Info Role & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card size="small" title="Role information" className="lg:col-span-2">
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-semibold">Title:</span>{" "}
              <span>{role.title}</span>
            </div>
            <div>
              <span className="font-semibold">Slug:</span>{" "}
              <code>{role.slug}</code>
            </div>
            <div>
              <span className="font-semibold">Description:</span>{" "}
              <span>{role.description || "-"}</span>
            </div>
            <div>
              <span className="font-semibold">Created at:</span>{" "}
              <span>
                {role.created
                  ? dayjs.unix(role.created).format("DD MMM YYYY HH:mm")
                  : "-"}
              </span>
            </div>
          </div>
        </Card>

        <Card size="small" title="Access summary">
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-semibold">Selected menus:</span>{" "}
              <span>
                {totalSelected} / {totalMenus}
              </span>
            </div>
            <div>
              <span className="font-semibold">Status:</span>{" "}
              {hasChanges ? (
                <Tag color="orange">Unsaved changes</Tag>
              ) : (
                <Tag color="green">All changes saved</Tag>
              )}
            </div>
            <div className="text-xs text-gray-500">
              This page controls which menus the role is allowed to access.
              Menus marked as{" "}
              <Tag color="red" style={{ marginInline: 2 }}>
                Hidden
              </Tag>
              (global <code>is_show = false</code>) will not appear in the
              sidebar, even if they are checked here.
            </div>
          </div>
        </Card>
      </div>

      <Divider />

      {/* Menu categories per parent */}
      <div className="space-y-4">
        {rootMenus.length === 0 && (
          <Alert
            type="info"
            message="No menus found"
            description="There are no menus configured yet. Please add menus in the Menu Management page first."
            showIcon
          />
        )}

        {rootMenus.map((root) => {
          const totalDescendants = collectDescendantIds(root.menu_id).length - 1;
          const groupChecked = isGroupFullySelected(root);
          const groupIndeterminate = isGroupPartiallySelected(root);
          const rootShown = isMenuShown(root);

          return (
            <Card
              key={root.menu_id}
              size="small"
              className="border border-gray-100 shadow-sm"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Checkbox
                    checked={groupChecked}
                    indeterminate={groupIndeterminate}
                    onChange={(e) => toggleGroup(root, e.target.checked)}
                  >
                    <span className="font-semibold">{root.title}</span>
                  </Checkbox>
                  {root.type && (
                    <Tag size="small" color="blue">
                      {root.type}
                    </Tag>
                  )}
                  <Tag
                    size="small"
                    color={rootShown ? "green" : "red"}
                  >
                    {rootShown ? "Shown" : "Hidden"}
                  </Tag>
                  {root.path && (
                    <span className="text-xs text-gray-500">
                      ({root.path})
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-400">
                  {totalDescendants} submenu
                </div>
              </div>

              {renderDescendants(root.menu_id)}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
