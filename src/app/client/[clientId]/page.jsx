"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, Button, Card, DatePicker, Input, Popconfirm, Select, Spin, Table, Upload, message } from "antd";
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, LeftOutlined, PaperClipOutlined, SaveOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import axiosInstance from "@/utils/axios";
import { buildUserOptions, fetchUsers, isAeUser } from "@/utils/userHelpers";


function initialsOf(name) {
  const s = String(name || "").trim();
  if (!s) return "NA";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "NA";
}

function toBrandLabel(item) {
  if (item == null) return null;
  if (typeof item === "string" || typeof item === "number") return String(item);
  if (typeof item === "object") {
    return (
      item.title ||
      item.label ||
      item.name ||
      item.brand_title ||
      item.brand_name ||
      (item.brand_id != null ? `#${item.brand_id}` : null) ||
      (item.id != null ? `#${item.id}` : null) ||
      (item.value != null ? `#${item.value}` : null)
    );
  }
  return null;
}

function normalizeBrandArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw == null || raw === "") return [];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [raw];
    }
  }
  return [raw];
}

function formatActivityTime(unixTs) {
  const ts = Number(unixTs || 0);
  if (!ts) return "-";
  return dayjs.unix(ts).format("DD MMM YYYY, HH:mm:ss");
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const clientId = params?.clientId;
  const from = String(searchParams.get("from") || "").toLowerCase();
  const backHref = from === "customer" ? "/customer" : from === "leads" ? "/leads" : "/client";
  const [loading, setLoading] = useState(true);
  const [savingHeader, setSavingHeader] = useState(false);
  const [updatingStep, setUpdatingStep] = useState(false);
  const [client, setClient] = useState(null);
  const [activities, setActivities] = useState([]);
  const [assignHistory, setAssignHistory] = useState([]);
  const [leadstatusHistory, setLeadstatusHistory] = useState([]);
  const [note, setNote] = useState("");
  const [uploadNote, setUploadNote] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingNote, setEditingNote] = useState("");
  const [assignOptions, setAssignOptions] = useState([]);
  const [loadingAssignOptions, setLoadingAssignOptions] = useState(false);
  const [assignToId, setAssignToId] = useState(null);
  const [savingAssign, setSavingAssign] = useState(false);

  const [followUpAt, setFollowUpAt] = useState(null);

  const loadData = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const [clientRes, activityRes, assignHistoryRes, leadstatusHistoryRes] = await Promise.all([
        axiosInstance.get(`/client/${clientId}`),
        axiosInstance.get(`/client/${clientId}/activity`),
        axiosInstance.get(`/client/${clientId}/assign-history`),
        axiosInstance.get(`/client/${clientId}/leadstatus-history`),
      ]);

      const c = clientRes.data?.client || null;
      setClient(c);
      setAssignToId(c?.assign_to ?? c?.AssignTo?.user_id ?? null);
      if (c?.AssignTo?.user_id) {
        setAssignOptions((prev) => {
          const exists = prev.some((x) => Number(x.value) === Number(c.AssignTo.user_id));
          if (exists) return prev;
          return [
            ...prev,
            {
              value: c.AssignTo.user_id,
              label: c.AssignTo.fullname || c.AssignTo.email || `User #${c.AssignTo.user_id}`,
            },
          ];
        });
      }
      const followUpUnix = c?.follow_up ?? c?.follow_up_at ?? null;
      setFollowUpAt(followUpUnix ? dayjs.unix(Number(followUpUnix)) : null);
      setActivities(activityRes.data?.activities || []);
      setAssignHistory(assignHistoryRes?.data?.assignHistory || []);
      setLeadstatusHistory(leadstatusHistoryRes?.data?.leadstatusHistory || []);
    } catch (e) {
      message.error(e?.response?.data?.msg || e?.message || "Failed to load client detail.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadAssignableAeUsers = useCallback(async () => {
    setLoadingAssignOptions(true);
    try {
      const users = await fetchUsers({ limit: 500, status: "active" });
      const aeUsers = users.filter(isAeUser);
      setAssignOptions(buildUserOptions(aeUsers));
    } catch (e) {
      message.error(e?.response?.data?.msg || e?.message || "Failed to load AE options.");
    } finally {
      setLoadingAssignOptions(false);
    }
  }, []);

  const onSaveHeader = async () => {
    if (!clientId) return;
    setSavingHeader(true);
    try {
      await axiosInstance.put(`/client/${clientId}`, {
        follow_up: followUpAt ? followUpAt.unix() : null,
      });
      message.success("Follow up updated.");
      await loadData();
    } catch (e) {
      message.error(e?.response?.data?.msg || e?.message || "Failed to save flags.");
    } finally {
      setSavingHeader(false);
    }
  };

  const onSaveAssignTo = async () => {
    if (!clientId) return;
    setSavingAssign(true);
    try {
      await axiosInstance.put(`/client/${clientId}`, {
        assign_to: assignToId || null,
      });
      message.success(`${assignLabel} updated.`);
      await loadData();
    } catch (e) {
      message.error(e?.response?.data?.msg || e?.message || "Failed to update assign.");
    } finally {
      setSavingAssign(false);
    }
  };

  const onQuickStep = async (step) => {
    if (!clientId) return;
    setUpdatingStep(true);
    try {
      const now = dayjs().unix();
      const payload = {};
      const stepWasActive = step === "contacted" ? isContacted : step === "won" ? isWon : isLost;
      const nextContacted = step === "contacted" ? !isContacted : isContacted;
      const nextWon = step === "won" ? !isWon : isWon;
      const nextLost = step === "lost" ? !isLost : isLost;

      if (step === "contacted") {
        payload.contacted = nextContacted ? (client?.contacted || now) : null;
      } else if (step === "won") {
        payload.won = nextWon ? (client?.won || now) : null;
        if (nextWon) {
          payload.lost = null;
          payload.client_type = "customer";
        }
      } else if (step === "lost") {
        payload.lost = nextLost ? (client?.lost || now) : null;
        if (nextLost) payload.won = null;
      }

      if (nextWon) {
        payload.lead_status = "won";
      } else if (nextLost) {
        payload.lead_status = "lost";
      } else if (nextContacted) {
        payload.lead_status = "validate";
      } else {
        payload.lead_status = "new";
      }

      await axiosInstance.put(`/client/${clientId}`, payload);
      message.success(stepWasActive ? `Step "${step}" canceled.` : `Step "${step}" updated.`);
      await loadData();
    } catch (e) {
      message.error(e?.response?.data?.msg || e?.message || "Failed to update step.");
    } finally {
      setUpdatingStep(false);
    }
  };

  const onCreateNote = async () => {
    const payload = String(note || "").trim();
    if (!payload) return;
    try {
      await axiosInstance.post(`/client/${clientId}/activity`, { note: payload });
      setNote("");
      await loadData();
      message.success("Note added.");
    } catch (e) {
      message.error(e?.response?.data?.msg || e?.message || "Failed to add note.");
    }
  };

  const onCreateFile = async () => {
    if (!uploadFile) {
      message.error("Please choose file.");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", uploadFile);
      fd.append("note", uploadNote || "");
      await axiosInstance.post(`/client/${clientId}/activity`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadFile(null);
      setUploadNote("");
      await loadData();
      message.success("File uploaded.");
    } catch (e) {
      message.error(e?.response?.data?.msg || e?.message || "Failed to upload file.");
    }
  };

  const onDeleteActivity = async (activityId) => {
    try {
      await axiosInstance.delete(`/client/${clientId}/activity/${activityId}`);
      await loadData();
      message.success("Activity deleted.");
    } catch (e) {
      message.error(e?.response?.data?.msg || e?.message || "Failed to delete activity.");
    }
  };

  const onSaveEdit = async () => {
    if (!editingId) return;
    const payload = String(editingNote || "").trim();
    if (!payload) {
      message.error("Note cannot be empty.");
      return;
    }
    try {
      await axiosInstance.put(`/client/${clientId}/activity/${editingId}`, { note: payload });
      setEditingId(null);
      setEditingNote("");
      await loadData();
      message.success("Activity updated.");
    } catch (e) {
      message.error(e?.response?.data?.msg || e?.message || "Failed to update activity.");
    }
  };

  const title = useMemo(() => client?.client_name || "Client Detail", [client]);
  const statusLower = String(client?.lead_status || "").toLowerCase();
  const isContacted = statusLower === "validate" || !!client?.contacted;
  const isWon = statusLower === "won" || !!client?.won;
  const isLost = statusLower === "lost" || !!client?.lost;
  const disableContacted = !isContacted && (isWon || isLost);
  const disableWon = !isWon && isLost;
  const disableLost = !isLost && isWon;
  const currentAssignToId = client?.assign_to ?? client?.AssignTo?.user_id ?? null;
  const assignChanged = Number(assignToId || 0) !== Number(currentAssignToId || 0);
  const isLeadsContext = from === "leads" || String(client?.client_type || "").toLowerCase() === "leads";
  const assignLabel = isLeadsContext ? "Assign to" : "Agent In Charge";

  const stepButtonStyle = (active, color) =>
    active
      ? { background: color, borderColor: color, color: "#fff" }
      : { borderColor: color, color };

  const leadInfo = useMemo(() => {
    const brandLabel = (() => {
      const labels = normalizeBrandArray(client?.brand).map(toBrandLabel).filter(Boolean);
      return labels.length > 0 ? labels.join(", ") : "-";
    })();
    const followUpUnix = client?.follow_up ?? client?.follow_up_at ?? null;
    const followUpLabel = followUpUnix ? dayjs.unix(Number(followUpUnix)).format("DD MMM YYYY HH:mm") : "-";

    const assigned = client?.AssignTo || null;
    const agentName = assigned?.fullname || assigned?.email || client?.pic_name || "-";
    const agentEmail = assigned?.email || client?.pic_email || "-";
    const agentPhone = assigned?.phone || client?.pic_phone || "-";

    return {
      leadName: client?.client_name || "-",
      crmType: client?.client_type || "-",
      leadStatus: client?.lead_status || "-",
      leadSource: client?.Leadsource?.title || "-",
      brand: brandLabel,
      followUp: followUpLabel,
      agentName,
      agentEmail,
      agentPhone,
    };
  }, [client]);

  if (loading) {
    return (
      <section className="container py-10">
        <Card className="shadow-md"><Spin /></Card>
      </section>
    );
  }

  return (
    <section className="container py-10">
      <div className="mb-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <button className="btn-back fc-base" onClick={() => router.back()}>
            <h3 className="fc-base text-xl m-0 btn-back"><LeftOutlined /> {title}</h3>
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Popconfirm
                title={isContacted ? "Batalkan step Contacted?" : "Ubah step ke Contacted?"}
                onConfirm={() => onQuickStep("contacted")}
                disabled={disableContacted}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type={isContacted ? "primary" : "default"}
                  style={stepButtonStyle(isContacted, "#0EA5E9")}
                  loading={updatingStep}
                  disabled={disableContacted}
                >
                  Contacted
                </Button>
              </Popconfirm>
              <Popconfirm
                title={isWon ? "Batalkan step Won?" : "Ubah step ke Won?"}
                onConfirm={() => onQuickStep("won")}
                disabled={disableWon}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type={isWon ? "primary" : "default"}
                  style={stepButtonStyle(isWon, "#16A34A")}
                  loading={updatingStep}
                  disabled={disableWon}
                >
                  Won
                </Button>
              </Popconfirm>
              <Popconfirm
                title={isLost ? "Batalkan step Lost?" : "Ubah step ke Lost?"}
                onConfirm={() => onQuickStep("lost")}
                disabled={disableLost}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type={isLost ? "primary" : "default"}
                  style={stepButtonStyle(isLost, "#DC2626")}
                  loading={updatingStep}
                  disabled={disableLost}
                >
                  Lost
                </Button>
              </Popconfirm>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {from === "leads" ? (
                <Button onClick={() => router.push("/customer")} disabled={!isWon}>
                  Go to Customer
                </Button>
              ) : null}
              <span className="text-xs text-gray-500 whitespace-nowrap">Current status: {leadInfo.leadStatus || "-"}</span>
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                value={followUpAt}
                onChange={(value) => setFollowUpAt(value)}
                placeholder="Select follow up"
                className="sm:w-64"
              />
              <Popconfirm
                title="Simpan perubahan follow up?"
                onConfirm={onSaveHeader}
                okText="Yes"
                cancelText="No"
              >
                <Button type="primary" icon={<SaveOutlined />} loading={savingHeader}>
                  Save Follow Up
                </Button>
              </Popconfirm>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5 space-y-5">
          <Card className="shadow-md" title="Lead Info">
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">Lead Name:</span> {leadInfo.leadName}</div>
              <div><span className="font-semibold">CRM Type:</span> {leadInfo.crmType}</div>
              <div><span className="font-semibold">Lead Status:</span> {leadInfo.leadStatus}</div>
              <div><span className="font-semibold">Lead Source:</span> {leadInfo.leadSource}</div>
              <div><span className="font-semibold">Brand:</span> {leadInfo.brand}</div>
              <div><span className="font-semibold">Follow Up:</span> {leadInfo.followUp}</div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-sm">
              <div className="font-semibold text-gray-700">{assignLabel}</div>
              <div><span className="font-semibold">Name:</span> {leadInfo.agentName}</div>
              <div><span className="font-semibold">Email:</span> {leadInfo.agentEmail}</div>
              <div><span className="font-semibold">Phone:</span> {leadInfo.agentPhone}</div>
              <div className="pt-1">
                <div className="text-xs text-gray-500 mb-1">Assign To (AE)</div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    allowClear
                    showSearch
                    placeholder="Pilih AE"
                    value={assignToId}
                    options={assignOptions}
                    loading={loadingAssignOptions}
                    optionFilterProp="label"
                    onOpenChange={(open) => {
                      if (open) loadAssignableAeUsers();
                    }}
                    notFoundContent={loadingAssignOptions ? <Spin size="small" /> : "No AE users"}
                    className="w-full"
                    onChange={(value) => setAssignToId(value ?? null)}
                  />
                  <Popconfirm
                    title="Simpan perubahan assign AE?"
                    onConfirm={onSaveAssignTo}
                    okText="Yes"
                    cancelText="No"
                    disabled={!assignChanged}
                  >
                    <Button type="primary" loading={savingAssign} disabled={!assignChanged}>
                      Update Assign
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
              <div className="text-sm font-semibold text-gray-700">Upload Berkas</div>
              <Input
                value={uploadNote}
                onChange={(e) => setUploadNote(e.target.value)}
                placeholder="Keterangan file..."
              />
              <Upload
                beforeUpload={(file) => {
                  setUploadFile(file);
                  return false;
                }}
                maxCount={1}
                onRemove={() => setUploadFile(null)}
                className="block"
              >
                <Button icon={<PaperClipOutlined />}>Choose File</Button>
              </Upload>
              <Popconfirm
                title="Upload berkas ini?"
                onConfirm={onCreateFile}
                okText="Yes"
                cancelText="No"
              >
                <Button type="primary">Upload</Button>
              </Popconfirm>
            </div>
          </Card>

          <Card className="shadow-md" title="Info & Management">
            <div className="space-y-2 text-sm mb-3">
              <div><span className="font-semibold">Contacted:</span> {client?.contacted ? dayjs.unix(Number(client.contacted)).format("DD MMM YYYY HH:mm") : "-"}</div>
              <div><span className="font-semibold">Won:</span> {client?.won ? dayjs.unix(Number(client.won)).format("DD MMM YYYY HH:mm") : "-"}</div>
              <div><span className="font-semibold">Lost:</span> {client?.lost ? dayjs.unix(Number(client.lost)).format("DD MMM YYYY HH:mm") : "-"}</div>
            </div>
            <div className="text-xs text-gray-500">Follow up dan tombol pengelolaan ada di toolbar paling atas.</div>
          </Card>

          <Card className="shadow-md" title="Assign History">
            <Table
              size="small"
              pagination={{ pageSize: 5 }}
              dataSource={(assignHistory || []).map((row) => ({ ...row, key: row.assign_history_id }))}
              columns={[
                {
                  title: "From",
                  dataIndex: "from_assignee_name",
                  key: "from_assignee_name",
                  render: (v) => v || "-",
                },
                {
                  title: "To",
                  dataIndex: "to_assignee_name",
                  key: "to_assignee_name",
                  render: (v) => v || "-",
                },
                {
                  title: "Assigned At",
                  dataIndex: "assigned_at",
                  key: "assigned_at",
                  render: (v) => (v ? dayjs.unix(Number(v)).format("DD MMM YYYY HH:mm:ss") : "-"),
                },
                {
                  title: "Moved At",
                  dataIndex: "moved_at",
                  key: "moved_at",
                  render: (v) => (v ? dayjs.unix(Number(v)).format("DD MMM YYYY HH:mm:ss") : "Current"),
                },
              ]}
              locale={{ emptyText: "No assignment history." }}
            />
          </Card>

          <Card className="shadow-md" title="Lead Status History">
            <Table
              size="small"
              pagination={{ pageSize: 5 }}
              dataSource={(leadstatusHistory || []).map((row) => ({ ...row, key: row.leadstatus_history_id }))}
              columns={[
                {
                  title: "From",
                  dataIndex: "from_leadstatus_title",
                  key: "from_leadstatus_title",
                },
                {
                  title: "To",
                  dataIndex: "to_leadstatus_title",
                  key: "to_leadstatus_title",
                },
                {
                  title: "Changed At",
                  dataIndex: "changed_at",
                  key: "changed_at",
                  render: (v) => (v ? dayjs.unix(Number(v)).format("DD MMM YYYY HH:mm:ss") : "-"),
                },
                {
                  title: "By",
                  dataIndex: "changer_name",
                  key: "changer_name",
                },
              ]}
              locale={{ emptyText: "No lead status history." }}
            />
          </Card>
        </div>

        <div className="xl:col-span-7">
          <Card className="shadow-md mb-5" title="Add Note">
            <div className="space-y-2">
              <Input.TextArea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write activity note..."
                autoSize={{ minRows: 2, maxRows: 5 }}
              />
              <Popconfirm
                title="Tambah note ini?"
                onConfirm={onCreateNote}
                okText="Yes"
                cancelText="No"
              >
                <Button type="primary">Add Note</Button>
              </Popconfirm>
            </div>
          </Card>

          <Card className="shadow-md h-full" title={`Activity History (${activities.length})`}>
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500">No activity yet.</p>
            ) : (
              <ul className="m-0 p-0 list-none">
                {activities.map((item) => {
                  const author = item?.creator || {};
                  const authorName = author.fullname || author.email || "Unknown";
                  const isEditing = Number(editingId) === Number(item.activity_id);

                  return (
                    <li key={item.activity_id} className="flex gap-3 py-3 border-b border-gray-100">
                      <Avatar src={author.profile_pic || ""}>{initialsOf(authorName)}</Avatar>
                      <div className="flex-1">
                        <div className="text-sm">
                          <b>{authorName}</b>{" "}
                          {item.type === "file" ? <span>uploaded a file</span> : <span>posted note</span>}
                        </div>

                        {isEditing ? (
                          <div className="mt-2 flex gap-2">
                            <Input.TextArea value={editingNote} onChange={(e) => setEditingNote(e.target.value)} autoSize={{ minRows: 2, maxRows: 4 }} />
                            <Popconfirm
                              title="Simpan perubahan note?"
                              onConfirm={onSaveEdit}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button type="primary">Save</Button>
                            </Popconfirm>
                          </div>
                        ) : (
                          <div className="text-sm mt-1 whitespace-pre-wrap">{item.note || "-"}</div>
                        )}

                        {item.type === "file" && item.file_url && (
                          <div className="mt-1">
                            <a href={item.file_url} target="_blank" rel="noreferrer" className="text-sm hover:underline">
                              {item.real_filename || item.file_name}
                            </a>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mt-1">
                          Created: {formatActivityTime(item.created)}
                          {item.updated ? ` | Updated: ${formatActivityTime(item.updated)}` : ""}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setEditingId(item.activity_id);
                            setEditingNote(item.note || "");
                          }}
                        />
                        <Popconfirm
                          title="Delete this activity?"
                          onConfirm={() => onDeleteActivity(item.activity_id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
