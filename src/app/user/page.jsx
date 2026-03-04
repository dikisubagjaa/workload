// src/app/user/page.jsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { RiResetLeftLine } from "react-icons/ri";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Card,
  Table,
  Tag,
  message,
  Select,
  Input,
  Button,
  Popconfirm,
  Space,
  Popover,
  Modal,
} from "antd";
import { EllipsisOutlined, MoreOutlined, SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { CiExport } from "react-icons/ci";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(tz);

const { Search } = Input;

const ZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Jakarta";
const DEFAULT_LIMIT = 10;

const USER_STATUS_COLOR = {
  new: "default",
  waiting: "orange",
  active: "green",
  banned: "red",
};

const USER_STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "new", label: "New" },
  { value: "waiting", label: "Waiting" },
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" },
];


function safeFullname(u) {
  const f = (u?.fullname || "").trim();
  return f || "-";
}
function fmtYmdOrUnix(val) {
  if (!val && val !== 0) return "-";
  try {
    if (typeof val === "number" || /^\d+$/.test(String(val))) {
      return dayjs.unix(Number(val)).tz(ZONE).format("DD/MM/YYYY");
    }
    return dayjs.tz(val, ZONE).format("DD/MM/YYYY");
  } catch {
    return String(val);
  }
}


export default function UserListPage() {
  const isMobile = useMobileQuery();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ===== master (role & department) =====
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const roleOptions = useMemo(
    () => [{ value: "", label: "All Roles" }].concat(
      roles.map((r) => ({ value: r.slug ?? r.role_id, label: r.title ?? r.name ?? r.slug }))
    ),
    [roles]
  );
  const simpleRoleOptions = useMemo(
    () => roles.map((r) => ({ value: r.slug ?? r.role_id, label: r.title ?? r.name ?? r.slug })),
    [roles]
  );
  const departmentOptions = useMemo(
    () => [{ value: "", label: "All Departments" }].concat(
      departments.map((d) => ({
        value: (d.department_id ?? d.id ?? "").toString(),
        label: d.title ?? d.name ?? String(d.department_id ?? d.id ?? "-"),
      }))
    ),
    [departments]
  );
  const depMap = useMemo(() => {
    const m = new Map();
    departments.forEach((d) => m.set(String(d.department_id ?? d.id), d.title ?? d.name ?? "-"));
    return m;
  }, [departments]);

  // ===== list state =====
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState("");

  const [sortBy, setSortBy] = useState("fullname");
  const [sortDir, setSortDir] = useState("asc");

  // control popover (titik 3) supaya satu-satu yang kebuka
  const [openActionFor, setOpenActionFor] = useState(null); // userId | null

  // ===== Change Password modal state =====
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdSubmitting, setPwdSubmitting] = useState(false);
  const [pwdTarget, setPwdTarget] = useState(null); // record
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");

  const openChangePassword = useCallback((record) => {
    setPwdTarget(record);
    setPwd1("");
    setPwd2("");
    setPwdOpen(true);
    setOpenActionFor(null);
  }, []);

  const handleSubmitPassword = useCallback(async () => {
    if (!pwdTarget?.userId) return;

    const p1 = String(pwd1 || "").trim();
    const p2 = String(pwd2 || "").trim();

    if (!p1) {
      message.error("Password is required.");
      return;
    }
    if (p1.length < 6) {
      message.error("Password minimal 6 karakter.");
      return;
    }
    if (p1 !== p2) {
      message.error("Confirm password tidak sama.");
      return;
    }

    setPwdSubmitting(true);
    try {
      await axiosInstance.put(`/user/${pwdTarget.userId}/password`, { password: p1 });
      message.success("Password updated.");
      setPwdOpen(false);
      setPwdTarget(null);
      setPwd1("");
      setPwd2("");
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.msg || e.message || "Failed to update password.");
    } finally {
      setPwdSubmitting(false);
    }
  }, [pwdTarget, pwd1, pwd2]);

  // ===== hydrate from URL (sekali) =====
  useEffect(() => {
    const sp = new URLSearchParams(searchParams?.toString() || "");
    if (sp.size === 0) return;

    setPage(Number(sp.get("page") || 1));
    setLimit(Number(sp.get("limit") || DEFAULT_LIMIT));
    setQ(sp.get("q") || "");
    setRole(sp.get("role") || "");
    setDepartmentId(sp.get("departmentId") || "");
    setStatus(sp.get("status") || "");
    setSortBy(sp.get("sortBy") || "fullname");
    setSortDir(sp.get("sortDir") || "asc");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== sync state -> URL =====
  useEffect(() => {
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("limit", String(limit));
    if (q) sp.set("q", q);
    if (role) sp.set("role", role);
    if (departmentId) sp.set("departmentId", departmentId);
    if (status) sp.set("status", status);
    sp.set("sortBy", sortBy);
    sp.set("sortDir", sortDir);
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }, [page, limit, q, role, departmentId, status, sortBy, sortDir, pathname, router]);

  // ===== master fetch =====
  const fetchRoles = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/role");
      setRoles(data?.roles || data?.data || []);
    } catch { }
  }, []);
  const fetchDepartments = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/department");
      setDepartments(data?.departments || data?.data || []);
    } catch { }
  }, []);
  useEffect(() => { fetchRoles(); fetchDepartments(); }, [fetchRoles, fetchDepartments]);

  // ===== list fetch =====
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, sortBy, sortDir };
      if (q) params.q = q;
      if (role) params.role = role;
      if (departmentId) params.department_id = departmentId;
      if (status) params.status = status;
      const { data } = await axiosInstance.get("/user", { params });

      const list = data?.data ?? data?.users ?? data?.rows ?? data?.result ?? [];
      const metaTotal = Number(data?.meta?.total) || Number(data?.total) || Number(data?.count) || list.length;

      const mapped = list.map((u) => {
        const id = u.user_id ?? u.id;
        const depId = u.department_id != null ? String(u.department_id) : "";
        return {
          key: id,
          userId: id,
          fullname: safeFullname(u),
          email: u.email || "-",
          phone: u.phone || "-",
          role: u.user_role || u.role || "-",
          departmentId: depId,
          departmentTitle: depId ? (depMap.get(depId) || "-") : "-",
          status: u.status || "-",
          joinDate: fmtYmdOrUnix(u.join_date),
        };
      });

      setRows(mapped);
      setTotal(metaTotal);
    } catch (err) {
      console.error("Fetch users error:", err);
      message.error(err?.response?.data?.msg || err?.message || "Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortDir, q, role, departmentId, status, depMap]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ===== reset & export =====
  const handleReset = () => {
    setQ("");
    setRole("");
    setDepartmentId("");
    setStatus("");
    setPage(1);
    setLimit(DEFAULT_LIMIT);
    setSortBy("fullname");
    setSortDir("asc");
  };

  const handleExport = () => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (role) sp.set("role", role);
    if (departmentId) sp.set("department_id", departmentId);
    if (status) sp.set("status", status);
    sp.set("sortBy", sortBy);
    sp.set("sortDir", sortDir);
    window.open(`/api/user/export?${sp.toString()}`, "_blank");
  };

  // ===== update helpers =====
  const patchRowLocal = (userId, payload) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.userId !== userId) return r;
        const next = { ...r };
        if (payload.userRole != null) next.role = payload.userRole;
        if (payload.status != null) next.status = payload.status;
        return next;
      })
    );
  };

  const updateUserInline = useCallback(async (userId, payload, okMsg) => {
    try {
      await axiosInstance.put(`/user/${userId}`, payload); // payload camelCase
      message.success(okMsg || "Updated.");
      patchRowLocal(userId, payload);
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.msg || e.message || "Failed to update.");
    }
  }, []);

  const handleDelete = useCallback(async (record) => {
    try {
      await axiosInstance.delete(`/user/${record.userId}`);
      message.success("User deleted.");
      setRows((prev) => prev.filter((r) => r.userId !== record.userId));
      setOpenActionFor(null);
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.msg || e.message || "Failed to delete.");
    }
  }, []);

  // ===== columns =====
  const columns = useMemo(() => [
    {
      title: "Fullname",
      dataIndex: "fullname",
      key: "fullname",
      sorter: true,
      render: (_v, r) => (
        <div className="text-nowrap mb-2 sm:mb-0">
          <small className="text-xs font-bold block">Fullname :</small>
          <Link href={`/user/${r.userId}`}>{r.fullname}</Link>
          <h3 className="text-sm">{r.email}</h3>
          <h3 className="text-sm">{r.phone}</h3>
        </div>
      ),
    },
    { title: "Role", dataIndex: "role", key: "role", sorter: true, render: (v) => <h3 className="text-sm">{v}</h3> },
    { title: "Department", dataIndex: "departmentTitle", key: "departmentTitle", sorter: true, render: (v) => <h3 className="text-sm">{v}</h3> },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: true,
      render: (v) => <Tag color={USER_STATUS_COLOR[String(v)?.toLowerCase()] || "default"}>{v}</Tag>,
    },
    { title: "Joined", dataIndex: "joinDate", key: "joinDate", sorter: true, render: (v) => <h3 className="text-sm">{v}</h3> },
    {
      title: "",
      key: "action",
      fixed: "right",
      width: 60,
      render: (_v, r) => {
        const content = (
          <div className="min-w-[260px] max-w-[300px] p-1">
            <div className="text-xs font-semibold opacity-70 px-1 pb-2">Quick actions</div>

            {/* Selectors */}
            <div className="px-1 pt-2">
              <div className="text-xs opacity-70 mb-1">Pilih Role</div>
              <Select
                size="small"
                className="w-full"
                value={r.role}
                options={simpleRoleOptions}
                onChange={(val) => updateUserInline(r.userId, { userRole: val }, "Role updated.")}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="px-1 pt-2">
              <div className="text-xs opacity-70 mb-1">Ubah Status</div>
              <Select
                size="small"
                className="w-full"
                value={r.status}
                options={USER_STATUS_OPTIONS.filter((o) => o.value)}
                onChange={(val) => updateUserInline(r.userId, { status: val }, "Status updated.")}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Password button (separate from Edit) */}
            <div className="px-1 pt-3">
              <Button
                size="small"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  openChangePassword(r);
                }}
              >
                Change Password
              </Button>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between gap-2 px-1 pt-3">
              <Link href={`/user/${r.userId}`} onClick={() => setOpenActionFor(null)}>
                <Button size="small" type="default" className="w-24">Edit</Button>
              </Link>
              <Popconfirm
                title="Delete this user?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => handleDelete(r)}
              >
                <Button size="small" danger className="w-24">Delete</Button>
              </Popconfirm>
            </div>
          </div>
        );

        return (
          <Popover
            trigger="click"
            placement="bottomRight"
            open={openActionFor === r.userId}
            onOpenChange={(v) => setOpenActionFor(v ? r.userId : null)}
            content={content}
          >
            <Button size="small" type="text" icon={<MoreOutlined />} />
          </Popover>
        );
      },
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [openActionFor, simpleRoleOptions]);

  const mobileColumns = useMemo(() => [
    {
      title: "Fullname",
      dataIndex: "fullname",
      key: "fullname",
      sorter: true,
      render: (_v, r) => {
        const content = (
          <div className="min-w-[260px] max-w-[300px] p-1">
            <div className="text-xs font-semibold opacity-70 px-1 pb-2">Quick actions</div>

            {/* Selectors */}
            <div className="px-1 pt-2">
              <div className="text-xs opacity-70 mb-1">Pilih Role</div>
              <Select
                size="small"
                className="w-full"
                value={r.role}
                options={simpleRoleOptions}
                onChange={(val) => updateUserInline(r.userId, { userRole: val }, "Role updated.")}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="px-1 pt-2">
              <div className="text-xs opacity-70 mb-1">Ubah Status</div>
              <Select
                size="small"
                className="w-full"
                value={r.status}
                options={USER_STATUS_OPTIONS.filter((o) => o.value)}
                onChange={(val) => updateUserInline(r.userId, { status: val }, "Status updated.")}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Password button (separate from Edit) */}
            <div className="px-1 pt-3">
              <Button
                size="small"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  openChangePassword(r);
                }}
              >
                Change Password
              </Button>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between gap-2 px-1 pt-3">
              <Link href={`/user/${r.userId}`} onClick={() => setOpenActionFor(null)}>
                <Button size="small" type="default" className="w-24">Edit</Button>
              </Link>
              <Popconfirm
                title="Delete this user?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => handleDelete(r)}
              >
                <Button size="small" danger className="w-24">Delete</Button>
              </Popconfirm>
            </div>
          </div>
        );

        return (
          <div className="flex items-center">
            <div className="text-nowrap mb-2 sm:mb-0">
              <small className="text-xs font-bold block">Fullname :</small>
              <Link href={`/user/${r.userId}`}>{r.fullname}</Link>
              <h3 className="text-sm">{r.email}</h3>
              <h3 className="text-sm">{r.phone}</h3>
            </div>

            <Popover
              trigger="click"
              placement="bottomRight"
              open={openActionFor === r.userId}
              onOpenChange={(v) => setOpenActionFor(v ? r.userId : null)}
              content={content}
              className="ms-auto"
            >
              <Button
                size="small"
                type="text"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Popover>
          </div>
        );
      },
    },
  ], [openActionFor, simpleRoleOptions, updateUserInline, handleDelete, openChangePassword]);

  const ExpandTable = ({ record }) => (
    <ul className="flex flex-col gap-4">
      <li><h4 className="text-sm font-semibold">Role :</h4><h3 className="text-sm">{record.role}</h3></li>
      <li><h4 className="text-sm font-semibold">Department :</h4><h3 className="text-sm">{record.departmentTitle}</h3></li>
      <li><h4 className="text-sm font-semibold">Status :</h4><Tag color={USER_STATUS_COLOR[String(record.status)?.toLowerCase()] || "default"}>{record.status}</Tag></li>
      <li><h4 className="text-sm font-semibold">Joined :</h4><h3 className="text-sm">{record.joinDate}</h3></li>
    </ul>
  );

  const handleTableChange = (pagination, _filters, sorter) => {
    if (pagination?.current) setPage(pagination.current);
    if (pagination?.pageSize) setLimit(pagination.pageSize);

    if (sorter && sorter.field) {
      let nextSortBy = "fullname";
      if (sorter.field === "departmentTitle") nextSortBy = "department_id";
      else if (sorter.field === "status") nextSortBy = "status";
      else if (sorter.field === "joinDate") nextSortBy = "join_date";
      else if (sorter.field === "role") nextSortBy = "user_role";
      else if (sorter.field === "fullname") nextSortBy = "fullname";
      setSortBy(nextSortBy);
      setSortDir(sorter.order === "ascend" ? "asc" : "desc");
    }
  };

  return (
    <section className="container pt-10">
      <Card
        className="card-box mb-5"
        title={<h3 className="text-xl">Users</h3>}
        extra={
          <Link href="/user/create">
            <Button type="primary" icon={<PlusOutlined />}>
              Add User
            </Button>
          </Link>
        }
      >
        {/* Header filter */}
        <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
          <Select
            size="middle"
            options={roleOptions}
            value={role}
            onChange={(v) => { setRole(v || ""); setPage(1); }}
            placeholder="All Roles"
          />
          <Select
            size="middle"
            options={departmentOptions}
            value={departmentId}
            onChange={(v) => { setDepartmentId(v || ""); setPage(1); }}
            placeholder="All Departments"
          />
          <Select
            size="middle"
            options={USER_STATUS_OPTIONS}
            value={status}
            onChange={(v) => { setStatus(v || ""); setPage(1); }}
            placeholder="All Status"
          />
          <Input
            className="sm:col-span-2"
            placeholder="Search"
            allowClear
            size="middle"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onSearch={(val) => { setQ(val || ""); setPage(1); }}
            suffix={<SearchOutlined />}
          />

          <Button size="middle" type="default" onClick={handleReset}>
            <RiResetLeftLine /> Reset
          </Button>
          <Button size="middle" type="default" className="bg-green-500 text-white border-0" onClick={handleExport}>
            <CiExport /> Export CSV
          </Button>
        </div>

        {/* Tabel */}
        <Table
          rowKey="key"
          loading={loading}
          dataSource={rows}
          columns={isMobile ? mobileColumns : columns}
          scroll={isMobile ? null : { x: "max-content" }}
          pagination={{ current: page, pageSize: limit, total, showSizeChanger: true }}
          sortDirections={["descend", "ascend"]}
          showHeader={!isMobile}
          onChange={handleTableChange}
          expandable={isMobile ? { expandedRowRender: (record) => <ExpandTable record={record} /> } : null}
          locale={{ emptyText: loading ? "Loading…" : "No data" }}
        />

        {/* Change Password Modal */}
        <Modal
          title={`Change Password${pwdTarget?.fullname ? ` — ${pwdTarget.fullname}` : ""}`}
          open={pwdOpen}
          onCancel={() => {
            setPwdOpen(false);
            setPwdTarget(null);
            setPwd1("");
            setPwd2("");
          }}
          okText="Update Password"
          onOk={handleSubmitPassword}
          confirmLoading={pwdSubmitting}
          destroyOnClose
        >
          <div className="text-xs opacity-70 mb-3">
            Password user akan diganti (overwrite).
          </div>

          <div className="mb-3">
            <div className="text-xs font-semibold mb-1">New Password</div>
            <Input.Password
              value={pwd1}
              onChange={(e) => setPwd1(e.target.value)}
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <div className="text-xs font-semibold mb-1">Confirm Password</div>
            <Input.Password
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
              placeholder="Repeat password"
              onPressEnter={handleSubmitPassword}
            />
          </div>
        </Modal>
      </Card>
    </section>
  );
}
