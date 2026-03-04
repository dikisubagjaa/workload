// src/components/leave/TableLeave.jsx
"use client";

import { useEffect, useState } from "react";
import { Table, Tag, Button, message, Popconfirm, Space, Input, DatePicker, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { RiResetLeftLine } from "react-icons/ri";
import dayjs from "dayjs";
import axiosInstance from "@/utils/axios";
import { fetchUsers as fetchUsersList, buildUserOptions } from "@/utils/userHelpers";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";
import { useSession } from "next-auth/react";

export default function TableLeave() {
  const isMobile = useMobileQuery();
  const { data: session } = useSession();

  const myUserId = Number(session?.user?.user_id || 0);

  const isSuperadmin = session?.user?.is_superadmin === "true";
  const isHrd = session?.user?.is_hrd === "true";
  const isDirectorOperational = session?.user?.is_director_operational === "true";

  const canSetApprover = isSuperadmin || isHrd || isDirectorOperational;

  const [mode, setMode] = useState("history"); // history | approval
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [staffId, setStaffId] = useState(null);
  const [q, setQ] = useState("");

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    period: "all",
    from: null,
    to: null,
    q: "",
  });

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });

  const [tableRows, setTableRows] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  const [pickApprover, setPickApprover] = useState({});
  // shape: { [leaveId]: { hrd: number|null, operational_director: number|null } }

  useEffect(() => {
    if (!myUserId) return;
    fetchLeave(query);
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUserId, query.page, query.limit, query.period, query.from, query.to, query.q]);

  useEffect(() => {
    const map = new Map();
    for (const r of rows) {
      const u = r?.User;
      if (!u?.user_id) continue;
      if (!map.has(u.user_id)) {
        map.set(u.user_id, {
          value: u.user_id,
          label: u.fullname || u.email || `User #${u.user_id}`,
        });
      }
    }
    setStaffOptions(Array.from(map.values()));
  }, [rows]);

  useEffect(() => {
    let list = rows;

    if ((isSuperadmin || isHrd) && staffId) {
      list = list.filter((r) => Number(r.user_id || 0) === Number(staffId));
    }

    if (mode === "approval") {
      list = list.filter((r) => {
        const st = String(r.status || "").toLowerCase();
        if (st !== "pending") return false;

        if (isSuperadmin || isHrd) return true;

        const uid = myUserId;
        return (
          Number(r.assign_to || 0) === uid ||
          Number(r.hod || 0) === uid ||
          Number(r.hrd || 0) === uid ||
          Number(r.operational_director || 0) === uid
        );
      });
    }

    setTableRows(list);
  }, [rows, mode, staffId, isSuperadmin, isHrd, myUserId]);

  async function fetchLeave(nextQuery) {
    const qx = nextQuery || query;
    setLoading(true);
    try {
      const params = { page: qx.page, limit: qx.limit };
      if (qx.period === "today") params.period = "today";
      if (qx.period === "period") {
        params.period = "period";
        if (qx.from) params.from = qx.from;
        if (qx.to) params.to = qx.to;
      }
      if (qx.q) params.q = qx.q;

      const { data } = await axiosInstance.get("/leave", { params });

      if (!data?.success) {
        message.error(data?.msg || "Failed loading");
        setRows([]);
        setMeta({ page: qx.page, limit: qx.limit, total: 0 });
        return;
      }

      const list = Array.isArray(data.data) ? data.data : [];
      setRows(list);
      setMeta(data.meta || { page: qx.page, limit: qx.limit, total: list.length });
    } catch (err) {
      message.error(err?.response?.data?.msg || err?.message || "Failed loading");
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      const users = await fetchUsersList({ page: 1, limit: 200 });
      const opts = buildUserOptions(users);
      setUserOptions(opts);
    } catch (e) {
      setUserOptions([]);
    }
  }

  async function cancelRequest(r) {
    try {
      const { data } = await axiosInstance.post(`/leave/${r.leave_id}`, { action: "cancel" });
      if (data?.success) {
        message.success("Request cancelled");
        fetchLeave(query);
      } else {
        message.error(data?.msg || "Failed to cancel");
      }
    } catch (err) {
      message.error(err?.response?.data?.msg || err?.message || "Failed to cancel");
    }
  }

  async function setApprover(leaveId, payload) {
    try {
      const { data } = await axiosInstance.post(`/leave/${leaveId}`, { action: "set_approver", ...payload });
      if (data?.success) {
        message.success("Approver updated");
        fetchLeave(query);
      } else {
        message.error(data?.msg || "Failed");
      }
    } catch (err) {
      message.error(err?.response?.data?.msg || err?.message || "Failed");
    }
  }

  // ✅ approve/reject: no scope for normal user (API auto-detect)
  // ✅ superadmin: send target so action is explicit per column button
  async function doApprove(leaveId, targetScope) {
    try {
      const payload = { action: "approve" };
      if (isSuperadmin) payload.target = targetScope;

      const { data } = await axiosInstance.post(`/leave/${leaveId}`, payload);
      if (data?.success) {
        message.success("Approved");
        fetchLeave(query);
      } else {
        message.error(data?.msg || "Failed");
      }
    } catch (err) {
      message.error(err?.response?.data?.msg || err?.message || "Failed");
    }
  }

  async function doReject(leaveId, targetScope) {
    try {
      const payload = { action: "reject" };
      if (isSuperadmin) payload.target = targetScope;

      const { data } = await axiosInstance.post(`/leave/${leaveId}`, payload);
      if (data?.success) {
        message.success("Rejected");
        fetchLeave(query);
      } else {
        message.error(data?.msg || "Failed");
      }
    } catch (err) {
      message.error(err?.response?.data?.msg || err?.message || "Failed");
    }
  }

  function labelUser(u, id) {
    if (u?.fullname) return u.fullname;
    if (u?.email) return u.email;
    if (id) return `User #${id}`;
    return "-";
  }

  function fmtDateOnly(d) {
    if (!d) return "-";
    const m = dayjs(d);
    return m.isValid() ? m.format("DD/MM/YYYY") : "-";
  }

  function fmtUnix(u) {
    const n = Number(u || 0);
    if (!n) return "-";
    const m = dayjs.unix(n);
    return m.isValid() ? m.format("DD/MM/YYYY HH:mm:ss") : "-";
  }

  function statusTag(st) {
    const v = String(st || "").toLowerCase();
    const map = { pending: "orange", approved: "green", rejected: "red", cancelled: "default" };
    return <Tag color={map[v] || "default"}>{(v || "unknown").toUpperCase()}</Tag>;
  }

  function ApprovalButtons({ leaveId, scope, disabled }) {
    return (
      <Space wrap>
        <Button size="small" type="primary" disabled={disabled} onClick={() => doApprove(leaveId, scope)}>
          Approve
        </Button>
        <Button size="small" danger disabled={disabled} onClick={() => doReject(leaveId, scope)}>
          Reject
        </Button>
      </Space>
    );
  }

  const columns = [
    {
      title: "Status",
      key: "status",
      width: 160,
      render: (_v, r) => {
        const st = String(r.status || "").toLowerCase();
        const canCancel = st === "pending" && Number(r.user_id || 0) === myUserId;

        return (
          <div className="text-xs">
            {statusTag(st)}
            {canCancel && (
              <div className="mt-2">
                <Popconfirm title="Cancel this request?" onConfirm={() => cancelRequest(r)}>
                  <Button size="small">Cancel</Button>
                </Popconfirm>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Staff",
      key: "staff",
      width: 240,
      render: (_v, r) => {
        const u = r?.User;
        return (
          <div className="text-xs">
            <div className="font-medium text-sm">{labelUser(u, u?.user_id)}</div>
            <div className="text-gray-500">{u?.email || "-"}</div>
            <div className="text-gray-500">{u?.phone || ""}</div>
            <div className="mt-2">
              <b>Quota Leave:</b> {r?.quota_leave ?? "-"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Assign To",
      key: "assign",
      width: 280,
      render: (_v, r) => {
        const u = r?.AssignedTo;
        const approvedAt = Number(r?.approval_assign_to_at || 0);
        const assignId = Number(r.assign_to || 0);

        const canAct =
          String(r.status || "").toLowerCase() === "pending" &&
          approvedAt <= 0 &&
          assignId > 0 &&
          (assignId === myUserId || isSuperadmin);

        return (
          <div className="text-xs">
            {assignId > 0 ? (
              <>
                <div className="font-medium text-sm">{labelUser(u, assignId)}</div>
                <div className="text-gray-500">{u?.email || "-"}</div>
                <div className="text-gray-500">{u?.phone || ""}</div>
              </>
            ) : (
              <div>-</div>
            )}

            <div className="mt-2">
              <div className="text-gray-500">Approved:</div>
              {assignId <= 0 ? (
                <div>-</div>
              ) : approvedAt > 0 ? (
                <div>{fmtUnix(approvedAt)}</div>
              ) : (
                <div className="mt-1">
                  <ApprovalButtons leaveId={r.leave_id} scope="assign_to" disabled={!canAct} />
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Head of Department",
      key: "hod",
      width: 280,
      render: (_v, r) => {
        const u = r?.HOD;
        const approvedAt = Number(r?.approval_hod_at || 0);
        const hodId = Number(r.hod || 0);

        const canAct =
          String(r.status || "").toLowerCase() === "pending" &&
          approvedAt <= 0 &&
          hodId > 0 &&
          (hodId === myUserId || isSuperadmin);

        return (
          <div className="text-xs">
            {hodId > 0 ? (
              <>
                <div className="font-medium text-sm">{labelUser(u, hodId)}</div>
                <div className="text-gray-500">{u?.email || "-"}</div>
                <div className="text-gray-500">{u?.phone || ""}</div>
              </>
            ) : (
              <div>-</div>
            )}

            <div className="mt-2">
              <div className="text-gray-500">Approved:</div>
              {hodId <= 0 ? (
                <div>-</div>
              ) : approvedAt > 0 ? (
                <div>{fmtUnix(approvedAt)}</div>
              ) : (
                <div className="mt-1">
                  <ApprovalButtons leaveId={r.leave_id} scope="hod" disabled={!canAct} />
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "HRD",
      key: "hrd",
      width: 320,
      render: (_v, r) => {
        const u = r?.HRD;
        const hrdId = Number(r?.hrd || 0);
        const approvedAt = Number(r?.approval_hrd_at || 0);

        const canAct =
          String(r.status || "").toLowerCase() === "pending" &&
          approvedAt <= 0 &&
          hrdId > 0 &&
          (hrdId === myUserId || isSuperadmin || isHrd);

        const pick = (pickApprover[r.leave_id]?.hrd ?? (hrdId || null)) || null;

        return (
          <div className="text-xs">
            {hrdId > 0 ? (
              <>
                <div className="font-medium text-sm">{labelUser(u, hrdId)}</div>
                <div className="text-gray-500">{u?.email || "-"}</div>
                <div className="text-gray-500">{u?.phone || ""}</div>
              </>
            ) : (
              <div>-</div>
            )}

            {canSetApprover && (
              <div className="mt-2">
                <div className="text-gray-500 mb-1">Set HRD:</div>
                <Space wrap>
                  <Select
                    style={{ width: 220 }}
                    placeholder="Pick HRD"
                    value={pick}
                    onChange={(v) =>
                      setPickApprover((s) => ({
                        ...s,
                        [r.leave_id]: { ...(s[r.leave_id] || {}), hrd: v || null },
                      }))
                    }
                    allowClear
                    options={userOptions}
                  />
                  <Button size="small" onClick={() => setApprover(r.leave_id, { hrd: pick || null })} disabled={!pick}>
                    Set
                  </Button>
                </Space>
              </div>
            )}

            <div className="mt-2">
              <div className="text-gray-500">Approved:</div>
              {hrdId <= 0 ? (
                <div>-</div>
              ) : approvedAt > 0 ? (
                <div>{fmtUnix(approvedAt)}</div>
              ) : (
                <div className="mt-1">
                  <ApprovalButtons leaveId={r.leave_id} scope="hrd" disabled={!canAct} />
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Director",
      key: "director",
      width: 340,
      render: (_v, r) => {
        const u = r?.OperationalDirector;
        const dirId = Number(r?.operational_director || 0);
        const approvedAt = Number(r?.approval_operational_director_at || 0);

        const canAct =
          String(r.status || "").toLowerCase() === "pending" &&
          approvedAt <= 0 &&
          dirId > 0 &&
          dirId === myUserId;

        const pick = (pickApprover[r.leave_id]?.operational_director ?? (dirId || null)) || null;

        return (
          <div className="text-xs">
            {dirId > 0 ? (
              <>
                <div className="font-medium text-sm">{labelUser(u, dirId)}</div>
                <div className="text-gray-500">{u?.email || "-"}</div>
                <div className="text-gray-500">{u?.phone || ""}</div>
              </>
            ) : (
              <div>-</div>
            )}

            {canSetApprover && (
              <div className="mt-2">
                <div className="text-gray-500 mb-1">Set Director:</div>
                <Space wrap>
                  <Select
                    style={{ width: 220 }}
                    placeholder="Pick Director"
                    value={pick}
                    onChange={(v) =>
                      setPickApprover((s) => ({
                        ...s,
                        [r.leave_id]: {
                          ...(s[r.leave_id] || {}),
                          operational_director: v || null,
                        },
                      }))
                    }
                    allowClear
                    options={userOptions}
                  />
                  <Button
                    size="small"
                    onClick={() => setApprover(r.leave_id, { operational_director: pick || null })}
                    disabled={!pick}
                  >
                    Set
                  </Button>
                </Space>
              </div>
            )}

            <div className="mt-2">
              <div className="text-gray-500">Approved:</div>
              {dirId <= 0 ? (
                <div>-</div>
              ) : approvedAt > 0 ? (
                <div>{fmtUnix(approvedAt)}</div>
              ) : (
                <div className="mt-1">
                  <ApprovalButtons leaveId={r.leave_id} scope="operational_director" disabled={!canAct} />
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Date",
      key: "date",
      width: 220,
      render: (_v, r) => (
        <div className="text-xs">
          <div>
            <b>Leave Start Date:</b>
            <div>{fmtDateOnly(r.start_date)}</div>
          </div>
          <div className="mt-2">
            <b>Leave End Date:</b>
            <div>{fmtDateOnly(r.end_date)}</div>
          </div>
          <div className="mt-2">
            <b>Created:</b>
            <div>{fmtUnix(r.created)}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Reason",
      key: "reason",
      width: 280,
      render: (_v, r) => (
        <div className="text-xs">
          <div className="font-semibold">{String(r.reason || "-").toUpperCase()}</div>
          <div className="mt-2">
            <b>Job Note For Assign:</b>
            <div>{r.assign_note || "-"}</div>
          </div>
          <div className="mt-2">
            <b>Why you apply for leave?:</b>
            <div>{r.detail || "-"}</div>
          </div>
        </div>
      ),
    },
  ];

  const mobileColumns = [
    {
      title: "Leave",
      key: "mobile",
      render: (_v, r) => {
        const u = r?.User;
        const st = String(r.status || "").toLowerCase();
        return (
          <div className="text-sm">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{labelUser(u, u?.user_id)}</div>
              {statusTag(st)}
            </div>
            <div className="text-xs text-gray-500">{u?.email || "-"}</div>
            <div className="mt-2 text-xs">
              <div>
                <b>Start:</b> {fmtDateOnly(r.start_date)}
              </div>
              <div>
                <b>End:</b> {fmtDateOnly(r.end_date)}
              </div>
              <div>
                <b>Reason:</b> {r.reason || "-"}
              </div>
              <div>
                <b>Quota:</b> {r?.quota_leave ?? "-"}
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
        <Select
          value={mode}
          onChange={(v) => setMode(v)}
          options={[
            { value: "history", label: "Leave History" },
            { value: "approval", label: "Leave Approval" },
          ]}
          className="w-full"
        />

        <DatePicker
          value={fromDate}
          onChange={setFromDate}
          placeholder="From Date"
          allowClear
          format="DD/MM/YYYY"
          className="w-full"
        />

        <DatePicker
          value={toDate}
          onChange={setToDate}
          placeholder="To Date"
          allowClear
          format="DD/MM/YYYY"
          className="w-full"
        />

        <Select
          value={isSuperadmin || isHrd ? staffId || null : myUserId}
          disabled={!(isSuperadmin || isHrd)}
          placeholder="Select staff"
          onChange={(v) => setStaffId(v || null)}
          allowClear
          options={
            isSuperadmin || isHrd
              ? staffOptions
              : [
                  {
                    value: myUserId,
                    label:
                      session?.user?.fullname ||
                      session?.user?.email ||
                      (myUserId ? `User #${myUserId}` : "-"),
                  },
                ]
          }
          className="w-full"
        />

        <Input
          className="sm:col-span-2"
          placeholder="Search"
          allowClear
          value={q}
          onChange={(e) => setQ(e.target.value)}
          suffix={<SearchOutlined />}
          onPressEnter={() => setQuery((old) => ({ ...old, page: 1, q: (q || "").trim() }))}
        />

        <Button
          type="default"
          onClick={() => {
            setMode("history");
            setFromDate(null);
            setToDate(null);
            setStaffId(null);
            setQ("");
            setPickApprover({});
            setQuery({ page: 1, limit: query.limit, period: "all", from: null, to: null, q: "" });
          }}
        >
          <RiResetLeftLine /> Reset
        </Button>

        <Button
          type="primary"
          onClick={() => {
            const next = {
              page: 1,
              limit: query.limit,
              period: "all",
              from: null,
              to: null,
              q: (q || "").trim(),
            };

            if (fromDate && toDate) {
              next.period = "period";
              next.from = dayjs(fromDate).format("YYYY-MM-DD");
              next.to = dayjs(toDate).format("YYYY-MM-DD");
            }

            setQuery(next);
          }}
        >
          Apply
        </Button>
      </div>

      <Table
        rowKey="leave_id"
        loading={loading}
        dataSource={tableRows}
        columns={isMobile ? mobileColumns : columns}
        scroll={isMobile ? null : { x: "max-content" }}
        pagination={{
          current: meta.page,
          pageSize: meta.limit,
          total: meta.total,
          showSizeChanger: true,
          onChange: (page, pageSize) => {
            setQuery((old) => ({ ...old, page, limit: pageSize || old.limit }));
          },
        }}
        showHeader={!isMobile}
        locale={{ emptyText: loading ? "Loading…" : "No data" }}
      />
    </>
  );
}
