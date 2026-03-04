// src/components/appraisal/TableAppraisal.jsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Modal } from "antd";

import { Table, Tag, message, Select, Input, Button, Space, Popover } from "antd";
import { MoreOutlined, SearchOutlined } from "@ant-design/icons";
import { RiResetLeftLine } from "react-icons/ri";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";
import axiosInstance from "@/utils/axios";
import { fetchUsers as fetchUsersList, getUserLabel } from "@/utils/userHelpers";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(tz);

const { Search } = Input;

const ZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Jakarta";
const DEFAULT_LIMIT = 10;

const STATUS_COLOR = {
  draft: "default",
  submitted: "blue",
  approved: "green",
  decline: "red",
};

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "decline", label: "Decline" },
];

const TITLE_OPTIONS = [
  { value: "", label: "All Titles" },
  {
    value: "Performance Appraisal (Probation Period)",
    label: "Performance Appraisal (Probation Period)",
  },
];

function fmtDateTime(unix) {
  if (unix == null || unix === "") return "-";
  try {
    const n = Number(unix);
    if (Number.isFinite(n)) return dayjs.unix(n).tz(ZONE).format("DD/MM/YYYY HH:mm:ss");
    return dayjs.tz(unix, ZONE).format("DD/MM/YYYY HH:mm:ss");
  } catch {
    return String(unix);
  }
}

function safeText(v, fallback = "-") {
  const s = (v ?? "").toString().trim();
  return s ? s : fallback;
}

function getAnswerValue(answersJson, questionId) {
  if (!answersJson || typeof answersJson !== "object") return null;
  const a = answersJson[String(questionId)];
  if (a && typeof a === "object") return a.value ?? null;
  return a ?? null;
}

function normalizeStatus(s) {
  return String(s || "").toLowerCase();
}

function renderApprover(approver) {
  if (!approver) return "-";
  const name = safeText(approver.fullname, "");
  const job = safeText(approver.job_position, "");
  const email = safeText(approver.email, "");
  const approvedAt = approver.approved_at ? fmtDateTime(approver.approved_at) : "";

  if (!name && !email) return "-";

  return (
    <div className="text-xs leading-5">
      <div className="font-semibold">{name || "-"}</div>
      {job ? <div>{job}</div> : null}
      {email ? <div>{email}</div> : null}
      {approvedAt ? <div className="mt-1">Approved: {approvedAt}</div> : null}
    </div>
  );
}

export default function TableAppraisal() {
  const isMobile = useMobileQuery();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const me = session?.user || {};

  const isSuperadmin = me?.is_superadmin === "true";
  const isHod = me?.is_hod === "true";
  const isHrd = me?.is_hrd === "true";
  const isDirector = me?.is_operational_director === "true";
  // master
  const [departments, setDepartments] = useState([]);
  const departmentOptions = useMemo(() => {
    const base = [{ value: "", label: "All Departments" }];
    const list = (departments || []).map((d) => ({
      value: String(d.department_id ?? d.id ?? ""),
      label: d.title ?? d.name ?? String(d.department_id ?? d.id ?? "-"),
    }));
    return base.concat(list);
  }, [departments]);

  // staff options
  const [staffOptions, setStaffOptions] = useState([{ value: "", label: "All Staff" }]);
  const [staffSearchLoading, setStaffSearchLoading] = useState(false);

  // list state
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [staffId, setStaffId] = useState("");

  const [sortBy, setSortBy] = useState("created");
  const [sortDir, setSortDir] = useState("desc");

  // popover action
  const [openActionFor, setOpenActionFor] = useState(null);

  // hydrate URL (sekali)
  useEffect(() => {
    const sp = new URLSearchParams(searchParams?.toString() || "");
    if (sp.size === 0) return;

    setPage(Number(sp.get("page") || 1));
    setLimit(Number(sp.get("limit") || DEFAULT_LIMIT));
    setQ(sp.get("q") || "");
    setStatus(sp.get("status") || "");
    setTitle(sp.get("title") || "");
    setDepartmentId(sp.get("departmentId") || "");
    setStaffId(sp.get("staffId") || "");
    setSortBy(sp.get("sortBy") || "created");
    setSortDir(sp.get("sortDir") || "desc");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync state -> URL
  useEffect(() => {
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("limit", String(limit));
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    if (title) sp.set("title", title);
    if (departmentId) sp.set("departmentId", departmentId);
    if (staffId) sp.set("staffId", staffId);
    sp.set("sortBy", sortBy);
    sp.set("sortDir", sortDir);

    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }, [page, limit, q, status, title, departmentId, staffId, sortBy, sortDir, pathname, router]);

  const fetchDepartments = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/department");
      setDepartments(data?.departments || data?.data || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const fetchStaff = useCallback(async (keyword = "") => {
    setStaffSearchLoading(true);
    try {
      const list = await fetchUsersList({ q: keyword || undefined, limit: 50 });
      const opts = [{ value: "", label: "All Staff" }].concat(
        list.slice(0, 50).map((u) => ({
          value: String(u.user_id ?? u.id),
          label: `${safeText(getUserLabel(u))} (${safeText(u.email, "-")})`,
        }))
      );
      setStaffOptions(opts);
    } catch {
      // ignore
    } finally {
      setStaffSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff("");
  }, [fetchStaff]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, sortBy, sortDir };
      if (q) params.q = q;
      if (status) params.status = status;
      if (title) params.title = title;
      if (departmentId) params.department_id = departmentId;
      if (staffId) params.staffId = staffId;

      const { data } = await axiosInstance.get("/appraisal", { params });
      if (!data?.success) throw new Error(data?.msg || "Failed to fetch appraisal");

      setTotal(Number(data?.meta?.total || 0));

      const mapped = (data?.data || []).map((r) => {
        const staff = r.staff_snapshot_json || {};
        const emp = r.employment_snapshot_json || {};
        const approvals = r.approvals_json || {}; // { hod, hrd, director }
        const questions = Array.isArray(r.questions_json) ? r.questions_json : [];
        const answers = r.answers_json || {};
        const scoring = r.scoring_json || {};

        const appraisalId = r.appraisal_id ?? r.id;

        return {
          key: appraisalId,
          appraisalId,

          title: r.title || "-",
          status: r.status || "-",

          staffName: safeText(staff.fullname),
          staffEmail: safeText(staff.email),
          staffPhone: safeText(staff.phone),
          staffJob: safeText(staff.job_position),

          beforeStatus: safeText(emp.before_status),
          afterStatus: safeText(emp.after_status),

          totalScore: r.total_score ?? scoring.total_score ?? 0,
          averageScore: r.average_score ?? scoring.average_score ?? 0,
          grade: r.grade ?? scoring.grade ?? "-",

          questions,
          answers,

          hod: approvals?.hod || null,
          hrd: approvals?.hrd || null,
          director: approvals?.director || null,

          created: r.created,
          submittedAt: r.submitted_at,
        };
      });

      setRows(mapped);
    } catch (err) {
      console.error("Fetch appraisal error:", err);
      message.error(err?.message || "Failed to load appraisal history");
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, status, title, departmentId, staffId, sortBy, sortDir]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReset = () => {
    setPage(1);
    setLimit(DEFAULT_LIMIT);
    setQ("");
    setStatus("");
    setTitle("");
    setDepartmentId("");
    setStaffId("");
    setSortBy("created");
    setSortDir("desc");
  };

  const handleTableChange = (_pagination, _filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (!s || !s.field) return;

    const nextSortBy = String(s.field);
    const nextSortDir = s.order === "ascend" ? "asc" : "desc";

    setSortBy(nextSortBy);
    setSortDir(nextSortDir);
  };

  const doApprove = async (record, action) => {
    try {
      await axiosInstance.post("/appraisal/approve", {
        appraisalId: record.appraisalId,
        action, // "approve" | "decline"
      });
      message.success(action === "approve" ? "Approved" : "Declined");
      fetchData();
    } catch (e) {
      message.error(e?.response?.data?.msg || "Failed");
    }
  };

  const confirmAction = (record, action) => {
    Modal.confirm({
      title: action === "approve" ? "Approve appraisal?" : "Decline appraisal?",
      content: `${record.staffName} - ${record.title}`,
      okText: action === "approve" ? "Approve" : "Decline",
      okButtonProps: { danger: action === "decline" },
      onOk: () => doApprove(record, action),
    });
  };

  const renderApproveButtons = (record) => (
    <Space>
      <Button size="small" type="primary" onClick={() => confirmAction(record, "approve")}>
        Approve
      </Button>
      <Button size="small" danger onClick={() => confirmAction(record, "decline")}>
        Decline
      </Button>
    </Space>
  );

  // ✅ urutan approval berdasar NULL: HOD -> HRD -> Director
  // status "submitted" = semua pertanyaan sudah dijawab (ready for approval)
  const getApproveTurn = (record) => {
    const st = normalizeStatus(record?.status);
    if (st !== "submitted") return null;

    if (!record?.hod) return "hod";
    if (!record?.hrd) return "hrd";
    if (!record?.director) return "director";
    return null;
  };

  const renderApprovalCell = (record, roleKey) => {
    const st = normalizeStatus(record?.status);
    const turn = getApproveTurn(record);

    if (record?.[roleKey]) return renderApprover(record[roleKey]);

    if (st === "draft") return <Tag>Draft</Tag>;
    if (st === "approved") return "-";
    if (st === "decline") return "-";
    if (st !== "submitted") return "-";

    if (turn !== roleKey) {
      const label =
        roleKey === "hod" ? "Waiting HOD" : roleKey === "hrd" ? "Waiting HRD" : "Waiting Director";
      return <Tag>{label}</Tag>;
    }

    const can =
      roleKey === "hod"
        ? isHod || isSuperadmin
        : roleKey === "hrd"
          ? isHrd || isSuperadmin
          : isDirector || isSuperadmin;

    if (!can) {
      const label =
        roleKey === "hod" ? "Waiting HOD" : roleKey === "hrd" ? "Waiting HRD" : "Waiting Director";
      return <Tag>{label}</Tag>;
    }

    return renderApproveButtons(record);
  };

  const columns = useMemo(() => {
    return [
      {
        title: "Staff",
        dataIndex: "staffName",
        key: "staffName",
        field: "staffName",
        render: (_v, record) => (
          <div className="text-nowrap">
            <div className="font-semibold">{record.staffName}</div>
            <div className="text-xs">{record.staffJob}</div>
            <div className="text-xs">{record.staffEmail}</div>
            <div className="text-xs">{record.staffPhone}</div>
          </div>
        ),
      },
      {
        title: "Assessment",
        dataIndex: "title",
        key: "title",
        field: "title",
        render: (_v, record) => (
          <div className="text-sm leading-5">
            <div className="font-semibold">{record.title}</div>
            <div className="mt-1">
              <div>
                <b>Before:</b> {record.beforeStatus}
              </div>
              <div>
                <b>After:</b> {record.afterStatus}
              </div>
            </div>
            <div className="mt-2">
              <Tag color={STATUS_COLOR[normalizeStatus(record.status)] || "default"}>
                {record.status}
              </Tag>
            </div>
          </div>
        ),
      },
      {
        title: "Grade",
        dataIndex: "grade",
        key: "grade",
        field: "grade",
        sorter: true,
        render: (_v, record) => {
          const qs = record.questions || [];
          return (
            <div className="text-xs leading-5">
              <div>
                <b>Total:</b> {record.totalScore}
              </div>
              <div>
                <b>Average:</b> {record.averageScore}
              </div>
              <div>
                <b>Grade:</b>{" "}
                <Tag color={record.grade === "A" ? "green" : "default"}>{record.grade}</Tag>
              </div>

              {qs.length ? (
                <div className="mt-1">
                  {qs
                    .slice()
                    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
                    .map((q) => {
                      const val = getAnswerValue(record.answers, q.question_id);
                      return (
                        <div key={q.question_id}>
                          Q{q.sort_order} = {val ?? "-"} / 5
                        </div>
                      );
                    })}
                </div>
              ) : null}
            </div>
          );
        },
      },
      {
        title: "Head of Department",
        dataIndex: "hod",
        key: "hod",
        render: (_v, record) => (
          <div className="flex flex-col gap-2">{renderApprovalCell(record, "hod")}</div>
        ),
      },
      {
        title: "HRD",
        dataIndex: "hrd",
        key: "hrd",
        render: (_v, record) => (
          <div className="flex flex-col gap-2">{renderApprovalCell(record, "hrd")}</div>
        ),
      },
      {
        title: "Director",
        dataIndex: "director",
        key: "director",
        render: (_v, record) => (
          <div className="flex flex-col gap-2">{renderApprovalCell(record, "director")}</div>
        ),
      },
      {
        title: "",
        dataIndex: "action",
        key: "action",
        width: 70,
        render: (_v, record) => {
          const st = normalizeStatus(record?.status);
          const canEdit = st === "draft"; // ✅ draft masih bisa edit

          const content = (
            <div className="flex flex-col gap-2">
              <Button
                size="small"
                onClick={() => {
                  setOpenActionFor(null);
                  router.push(`/appraisal/${record.appraisalId}`);
                }}
              >
                View
              </Button>

              {canEdit ? (
                <Button
                  size="small"
                  type="default"
                  onClick={() => {
                    setOpenActionFor(null);
                    // ✅ edit route: samain dengan routing form kamu.
                    // default: /appraisal/[id]/edit
                    router.push(`/appraisal/${record.appraisalId}/edit`);
                  }}
                >
                  Edit
                </Button>
              ) : null}

              <Button
                size="small"
                type="primary"
                className="btn-blue-filled"
                onClick={() => {
                  setOpenActionFor(null);
                  window.open(`/api/appraisal/pdf?appraisalId=${record.appraisalId}`, "_blank");
                }}
              >
                PDF
              </Button>
            </div>
          );

          return (
            <Popover
              content={content}
              trigger="click"
              open={openActionFor === record.appraisalId}
              onOpenChange={(open) => setOpenActionFor(open ? record.appraisalId : null)}
              placement="bottomRight"
            >
              <Button icon={<MoreOutlined />} />
            </Popover>
          );
        },
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openActionFor, router, isSuperadmin, isHod, isHrd, isDirector]);

  const mobileColumns = useMemo(() => {
    return [
      {
        title: "Appraisal",
        key: "mobile",
        render: (_v, record) => {
          const st = normalizeStatus(record?.status);
          const canEdit = st === "draft";

          return (
            <div className="text-xs leading-5">
              <div className="font-semibold">{record.staffName}</div>
              <div>{record.staffJob}</div>

              <div className="mt-2">
                <div className="font-semibold">{record.title}</div>
                <div>
                  <b>Before:</b> {record.beforeStatus}
                </div>
                <div>
                  <b>After:</b> {record.afterStatus}
                </div>
              </div>

              <div className="mt-2">
                <b>Grade:</b> {record.grade} | <b>Avg:</b> {record.averageScore}
              </div>

              <div className="mt-2">
                <Tag color={STATUS_COLOR[normalizeStatus(record.status)] || "default"}>
                  {record.status}
                </Tag>
              </div>

              <div className="mt-2 flex gap-2 flex-wrap">
                <Button size="small" onClick={() => router.push(`/appraisal/${record.appraisalId}`)}>
                  View
                </Button>

                {canEdit ? (
                  <Button
                    size="small"
                    onClick={() => router.push(`/appraisal/${record.appraisalId}/edit`)}
                  >
                    Edit
                  </Button>
                ) : null}

                <Button
                  size="small"
                  type="primary"
                  className="btn-blue-filled"
                  onClick={() =>
                    window.open(`/api/appraisal/pdf?appraisalId=${record.appraisalId}`, "_blank")
                  }
                >
                  PDF
                </Button>
              </div>
            </div>
          );
        },
      },
    ];
  }, [router]);

  return (
    <>
      {/* FILTER BAR (ikut style user) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <Select
          value={title}
          onChange={(v) => {
            setTitle(v);
            setPage(1);
          }}
          options={TITLE_OPTIONS}
          placeholder="Title"
        />

        <Select
          value={departmentId}
          onChange={(v) => {
            setDepartmentId(v);
            setPage(1);
          }}
          options={departmentOptions}
          placeholder="Department"
        />

        {/* staff filter ini tetap boleh ada (superadmin) */}
        <Select
          value={staffId}
          onChange={(v) => {
            setStaffId(v);
            setPage(1);
          }}
          options={staffOptions}
          loading={staffSearchLoading}
          showSearch
          filterOption={false}
          onSearch={(kw) => fetchStaff(kw)}
          placeholder="Staff"
        />

        <Select
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
          placeholder="Status"
        />

        <div className="flex flex-col sm:flex-row items-center sm:col-span-2 gap-3">
          <Search
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onSearch={() => setPage(1)}
            allowClear
            placeholder="Search name/email/phone..."
            prefix={<SearchOutlined />}
          />

          <Button onClick={handleReset} icon={<RiResetLeftLine />} className="w-full sm:w-auto">
            Reset
          </Button>

          <Button onClick={fetchData} className="btn btn-blue-filled w-full sm:w-auto">Refresh</Button>
        </div>
      </div>

      <Table
        loading={loading}
        dataSource={rows}
        columns={isMobile ? mobileColumns : columns}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "25", "50", "100"],
          onChange: (p, ps) => {
            setPage(p);
            setLimit(ps);
          },
        }}
        scroll={{ x: 1400 }}
      />
    </>
  );
}
