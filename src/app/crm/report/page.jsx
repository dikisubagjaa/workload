"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, DatePicker, Modal, Progress, Select, Spin, Table, Tag } from "antd";
import dayjs from "dayjs";
import axiosInstance from "@/utils/axios";
import { buildUserOptions, fetchUsers, isAeUser } from "@/utils/userHelpers";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const { RangePicker } = DatePicker;

function percent(part, total) {
  if (!total) return 0;
  return Math.round((Number(part || 0) / Number(total || 1)) * 100);
}

export default function CrmReportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [aeOptions, setAeOptions] = useState([]);
  const [loadingAe, setLoadingAe] = useState(false);
  const [detailModal, setDetailModal] = useState({
    open: false,
    title: "",
    rows: [],
  });

  const [scope, setScope] = useState("all");
  const [dateField, setDateField] = useState("created");
  const [range, setRange] = useState([dayjs().subtract(30, "day"), dayjs()]);
  const [aeId, setAeId] = useState(null);

  const loadReport = useCallback(async ({ nextScope, nextDateField, nextRange, nextAeId } = {}) => {
    setLoading(true);
    setError("");
    try {
      const selectedScope = nextScope ?? scope;
      const selectedDateField = nextDateField ?? dateField;
      const selectedRange = nextRange ?? range;
      const selectedAeId = nextAeId !== undefined ? nextAeId : aeId;

      const params = {
        scope: selectedScope,
        date_field: selectedDateField,
      };
      if (Array.isArray(selectedRange) && selectedRange[0] && selectedRange[1]) {
        params.date_from = selectedRange[0].format("YYYY-MM-DD");
        params.date_to = selectedRange[1].format("YYYY-MM-DD");
      }
      if (selectedAeId) params.ae_id = selectedAeId;

      const res = await axiosInstance.get("/crm/report", { params });
      setReport(res.data || null);
      const forcedAeId = res?.data?.meta?.effective_ae_id || null;
      if (!res?.data?.meta?.can_select_ae) setAeId(forcedAeId);
    } catch (e) {
      setError(e?.response?.data?.msg || e?.message || "Failed to load CRM report.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [scope, dateField, range, aeId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  useEffect(() => {
    const canSelect = report?.meta?.can_select_ae;
    if (!canSelect) return;
    setLoadingAe(true);
    fetchUsers({ limit: 500, status: "active" })
      .then((users) => {
        const aeUsers = users.filter(isAeUser);
        setAeOptions(buildUserOptions(aeUsers));
      })
      .catch(() => setAeOptions([]))
      .finally(() => setLoadingAe(false));
  }, [report?.meta?.can_select_ae]);

  const stats = useMemo(() => report?.stats || {}, [report?.stats]);
  const detail = useMemo(() => report?.detail || {}, [report?.detail]);
  const allDetailRows = useMemo(
    () => (Array.isArray(report?.detail?.total_records) ? report.detail.total_records : []),
    [report?.detail?.total_records]
  );
  const total = Number(stats.total_records || 0);
  const byAeRows = Array.isArray(report?.breakdown?.by_ae) ? report.breakdown.by_ae : [];
  const byMonthRows = Array.isArray(report?.breakdown?.by_month) ? report.breakdown.by_month : [];
  const todayLabel = dayjs().format("DD MMM YYYY");

  const statusRows = useMemo(
    () => [
      { key: "new", label: "New", value: Number(stats.new || 0), color: "#f59e0b" },
      { key: "validated", label: "Validated", value: Number(stats.validated || 0), color: "#3b82f6" },
      { key: "contacted", label: "Contacted", value: Number(stats.contacted || 0), color: "#06b6d4" },
      { key: "won", label: "Won", value: Number(stats.won || 0), color: "#22c55e" },
      { key: "lost", label: "Lost", value: Number(stats.lost || 0), color: "#ef4444" },
    ],
    [stats]
  );

  const summaryCards = useMemo(
    () => [
      { key: "total_leads", title: "Total Leads", value: Number(stats.total_leads || 0), suffix: "", color: "#1d4ed8" },
      { key: "total_customer", title: "Total Customer", value: Number(stats.total_customer || 0), suffix: "", color: "#7c3aed" },
      { key: "win_rate_decisions", title: "Win Rate", value: Number(stats.win_rate || 0), suffix: "%", color: "#16a34a" },
      { key: "won", title: "Won", value: Number(stats.won || 0), suffix: "", color: "#16a34a" },
      { key: "lost", title: "Lost", value: Number(stats.lost || 0), suffix: "", color: "#dc2626" },
      { key: "validated", title: "Validated", value: Number(stats.validated || 0), suffix: "", color: "#2563eb" },
      { key: "contacted", title: "Contacted", value: Number(stats.contacted || 0), suffix: "", color: "#0891b2" },
    ],
    [stats]
  );

  const openDetailModal = useCallback((key) => {
    const map = {
      total_records: {
        title: "All Records (current filter)",
        rows: Array.isArray(detail?.total_records) ? detail.total_records : [],
      },
      total_leads: {
        title: "All Leads (current filter)",
        rows: Array.isArray(detail?.total_leads) ? detail.total_leads : [],
      },
      total_customer: {
        title: "All Customers (current filter)",
        rows: Array.isArray(detail?.total_customer) ? detail.total_customer : [],
      },
      won: {
        title: "Won Records",
        rows: Array.isArray(detail?.won) ? detail.won : [],
      },
      lost: {
        title: "Lost Records",
        rows: Array.isArray(detail?.lost) ? detail.lost : [],
      },
      contacted: {
        title: "Contacted Records",
        rows: Array.isArray(detail?.contacted) ? detail.contacted : [],
      },
      validated: {
        title: "Validated Records",
        rows: Array.isArray(detail?.validated) ? detail.validated : [],
      },
      new: {
        title: "New Records",
        rows: Array.isArray(detail?.new) ? detail.new : [],
      },
      win_rate_decisions: {
        title: "Win Rate Basis (Won + Lost)",
        rows: Array.isArray(detail?.win_rate_decisions) ? detail.win_rate_decisions : [],
      },
      follow_up_today: {
        title: `Follow Up Due Today (${todayLabel})`,
        rows: Array.isArray(detail?.follow_up_today) ? detail.follow_up_today : [],
      },
      follow_up_overdue: {
        title: `Overdue Follow Up (before ${todayLabel})`,
        rows: Array.isArray(detail?.follow_up_overdue) ? detail.follow_up_overdue : [],
      },
      conversion_customers: {
        title: "Converted Customers (for Conversion Rate)",
        rows: Array.isArray(detail?.conversion_customers) ? detail.conversion_customers : [],
      },
    };

    const selected = map[key];
    if (!selected) return;
    setDetailModal({
      open: true,
      title: selected.title,
      rows: selected.rows,
    });
  }, [detail, todayLabel]);

  const openAeDetailModal = useCallback((aeRow, metricKey = "total") => {
    const aeKey = aeRow?.ae_id ? String(aeRow.ae_id) : "unassigned";
    let rows = allDetailRows.filter((r) => {
      const rowKey = r?.ae_id ? String(r.ae_id) : "unassigned";
      return rowKey === aeKey;
    });

    if (metricKey === "won") rows = rows.filter((r) => !!r.won);
    if (metricKey === "lost") rows = rows.filter((r) => !!r.lost);
    if (metricKey === "validated") rows = rows.filter((r) => !!r.validated);
    if (metricKey === "contacted") rows = rows.filter((r) => !!r.contacted);
    if (metricKey === "new") rows = rows.filter((r) => !!r.is_new);

    const metricLabelMap = {
      total: "Total",
      won: "Won",
      lost: "Lost",
      validated: "Validated",
      contacted: "Contacted",
      new: "New",
    };
    const metricLabel = metricLabelMap[metricKey] || "Total";
    const aeName = aeRow?.ae_name || "Unassigned";

    setDetailModal({
      open: true,
      title: `AE: ${aeName} - ${metricLabel}`,
      rows,
    });
  }, [allDetailRows]);

  const openMonthDetailModal = useCallback((monthRow, metricKey = "total") => {
    let rows = allDetailRows.filter((r) => r?.created_month_key === monthRow?.key);
    if (metricKey === "won") rows = rows.filter((r) => !!r.won);
    if (metricKey === "lost") rows = rows.filter((r) => !!r.lost);

    const metricLabelMap = {
      total: "Total",
      won: "Won",
      lost: "Lost",
    };
    const metricLabel = metricLabelMap[metricKey] || "Total";
    const monthLabel = monthRow?.label || monthRow?.key || "-";

    setDetailModal({
      open: true,
      title: `Month: ${monthLabel} - ${metricLabel}`,
      rows,
    });
  }, [allDetailRows]);

  return (
    <section className="container py-8 space-y-5">
      <Card className="shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold m-0">CRM Report</h2>
            <p className="text-sm text-gray-500 m-0">Statistik lead performance, conversion, dan follow up.</p>
          </div>
          {!report?.meta?.can_select_ae && report?.meta?.effective_ae_id ? (
            <Tag color="blue">AE Scope: Myself</Tag>
          ) : (
            <Tag color="purple">AE Scope: Flexible</Tag>
          )}
        </div>
      </Card>

      <Card className="shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 items-end">
          <div className="xl:col-span-2">
            <div className="text-xs text-gray-500 mb-1">Date Range</div>
            <RangePicker value={range} onChange={(v) => setRange(v)} className="w-full" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Date Basis</div>
            <Select
              value={dateField}
              onChange={setDateField}
              className="w-full"
              options={[
                { value: "created", label: "Created Date" },
                { value: "updated", label: "Updated Date" },
                { value: "follow_up", label: "Follow Up Date" },
              ]}
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Scope</div>
            <Select
              value={scope}
              onChange={setScope}
              className="w-full"
              options={[
                { value: "all", label: "All CRM" },
                { value: "leads", label: "Leads Only" },
                { value: "customer", label: "Customer Only" },
              ]}
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">AE</div>
            <Select
              allowClear
              value={aeId}
              onChange={(v) => setAeId(v || null)}
              className="w-full"
              disabled={!report?.meta?.can_select_ae}
              loading={loadingAe}
              placeholder={report?.meta?.can_select_ae ? "All AE" : "Locked to myself"}
              options={aeOptions}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="primary"
              className="w-full"
              onClick={() => loadReport({ nextScope: scope, nextDateField: dateField, nextRange: range, nextAeId: aeId })}
            >
              Apply
            </Button>
            <Button
              className="w-full"
              onClick={() => {
                const nextRange = [dayjs().subtract(30, "day"), dayjs()];
                setScope("all");
                setDateField("created");
                setRange(nextRange);
                setAeId(null);
                loadReport({ nextScope: "all", nextDateField: "created", nextRange, nextAeId: null });
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {error ? <Alert type="error" message={error} showIcon /> : null}

      <Spin spinning={loading}>
        <div className="mb-3">
          <Swiper
            spaceBetween={15}
            slidesPerView={1.1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1280: { slidesPerView: 3 },
            }}
          >
            <SwiperSlide>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-sky-50 h-full">
                <div className="text-xs uppercase tracking-wide text-blue-700 font-semibold mb-1">Daily Action</div>
                <div className="text-sm text-gray-700 mb-3">Follow up due exactly on <span className="font-semibold">{todayLabel}</span>.</div>
                <button
                  type="button"
                  className="text-4xl leading-none font-bold text-blue-700 hover:text-blue-800 transition-colors"
                  onClick={() => openDetailModal("follow_up_today")}
                >
                  {stats.follow_up_today || 0}
                </button>
                <div className="text-xs text-gray-500 mt-2">Click number to view lead/customer list</div>
              </Card>
            </SwiperSlide>

            <SwiperSlide>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 to-orange-50 h-full">
                <div className="text-xs uppercase tracking-wide text-rose-700 font-semibold mb-1">Needs Attention</div>
                <div className="text-sm text-gray-700 mb-3">Open follow up date before <span className="font-semibold">{todayLabel}</span>.</div>
                <button
                  type="button"
                  className="text-4xl leading-none font-bold text-rose-700 hover:text-rose-800 transition-colors"
                  onClick={() => openDetailModal("follow_up_overdue")}
                >
                  {stats.follow_up_overdue || 0}
                </button>
                <div className="text-xs text-gray-500 mt-2">Click number to view lead/customer list</div>
              </Card>
            </SwiperSlide>

            <SwiperSlide>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 h-full">
                <div className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-1">Conversion</div>
                <div className="text-sm text-gray-700 mb-3">Customers / all records in current filter scope.</div>
                <button
                  type="button"
                  className="text-4xl leading-none font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  onClick={() => openDetailModal("conversion_customers")}
                >
                  {stats.conversion_rate || 0}%
                </button>
                <div className="text-xs text-gray-500 mt-2">Click number to view converted customer list</div>
              </Card>
            </SwiperSlide>
          </Swiper>
        </div>

        <div className="mb-3">
          <Swiper
            spaceBetween={15}
            slidesPerView={2.1}
            breakpoints={{
              640: { slidesPerView: 2.1 },
              1024: { slidesPerView: 3.1 },
              1280: { slidesPerView: 4.1 },
            }}
          >
            {summaryCards.map((card) => (
              <SwiperSlide key={card.key}>
                <Card className="h-full">
                  <div className="text-sm text-gray-500 mb-1">{card.title}</div>
                  <button
                    type="button"
                    className="text-3xl leading-none font-bold hover:opacity-80 transition-opacity"
                    style={{ color: card.color }}
                    onClick={() => openDetailModal(card.key)}
                  >
                    {card.value}{card.suffix}
                  </button>
                  <div className="text-xs text-gray-400 mt-2">Click number to view details</div>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 mt-3">
          <Card className="xl:col-span-5" title="Pipeline Breakdown">
            <div className="space-y-3">
              {statusRows.map((row) => (
                <div key={row.key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">{row.label}</span>
                    <button
                      type="button"
                      className="font-semibold hover:opacity-80"
                      style={{ color: row.color }}
                      onClick={() => openDetailModal(row.key)}
                    >
                      {row.value}
                    </button>
                  </div>
                  <Progress
                    percent={percent(row.value, total)}
                    showInfo={false}
                    strokeColor={row.color}
                    trailColor="#eef2f7"
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="xl:col-span-7" title="Performance by AE">
            <Table
              size="small"
              pagination={{ pageSize: 6 }}
              scroll={{ x: 760 }}
              dataSource={byAeRows}
              rowKey={(r) => r.key}
              columns={[
                { title: "AE", dataIndex: "ae_name", key: "ae_name", width: 220 },
                {
                  title: "Total",
                  dataIndex: "total",
                  key: "total",
                  width: 70,
                  render: (v, r) => (
                    <button type="button" className="font-semibold hover:opacity-80" onClick={() => openAeDetailModal(r, "total")}>
                      {v}
                    </button>
                  ),
                },
                {
                  title: "Won",
                  dataIndex: "won",
                  key: "won",
                  width: 70,
                  render: (v, r) => (
                    <button type="button" onClick={() => openAeDetailModal(r, "won")}>
                      <Tag color="green">{v}</Tag>
                    </button>
                  ),
                },
                {
                  title: "Lost",
                  dataIndex: "lost",
                  key: "lost",
                  width: 70,
                  render: (v, r) => (
                    <button type="button" onClick={() => openAeDetailModal(r, "lost")}>
                      <Tag color="red">{v}</Tag>
                    </button>
                  ),
                },
                {
                  title: "Validated",
                  dataIndex: "validated",
                  key: "validated",
                  width: 90,
                  render: (v, r) => (
                    <button type="button" className="hover:opacity-80" onClick={() => openAeDetailModal(r, "validated")}>
                      {v}
                    </button>
                  ),
                },
                {
                  title: "Contacted",
                  dataIndex: "contacted",
                  key: "contacted",
                  width: 90,
                  render: (v, r) => (
                    <button type="button" className="hover:opacity-80" onClick={() => openAeDetailModal(r, "contacted")}>
                      {v}
                    </button>
                  ),
                },
                {
                  title: "New",
                  dataIndex: "new",
                  key: "new",
                  width: 70,
                  render: (v, r) => (
                    <button type="button" className="hover:opacity-80" onClick={() => openAeDetailModal(r, "new")}>
                      {v}
                    </button>
                  ),
                },
              ]}
            />
          </Card>
        </div>

        <Card className="mt-3" title="Monthly Trend">
          <Table
            size="small"
            pagination={{ pageSize: 8 }}
            dataSource={byMonthRows}
            rowKey={(r) => r.key}
            columns={[
              { title: "Month", dataIndex: "label", key: "label" },
              {
                title: "Total",
                dataIndex: "total",
                key: "total",
                width: 90,
                render: (v, r) => (
                  <button type="button" className="font-semibold hover:opacity-80" onClick={() => openMonthDetailModal(r, "total")}>
                    {v}
                  </button>
                ),
              },
              {
                title: "Won",
                dataIndex: "won",
                key: "won",
                width: 90,
                render: (v, r) => (
                  <button type="button" onClick={() => openMonthDetailModal(r, "won")}>
                    <Tag color="green">{v}</Tag>
                  </button>
                ),
              },
              {
                title: "Lost",
                dataIndex: "lost",
                key: "lost",
                width: 90,
                render: (v, r) => (
                  <button type="button" onClick={() => openMonthDetailModal(r, "lost")}>
                    <Tag color="red">{v}</Tag>
                  </button>
                ),
              },
            ]}
          />
        </Card>

        <Modal
          open={detailModal.open}
          title={detailModal.title}
          onCancel={() => setDetailModal({ open: false, title: "", rows: [] })}
          footer={null}
          width={980}
        >
          <Table
            size="small"
            pagination={{ pageSize: 8 }}
            rowKey={(r) => r.key}
            dataSource={detailModal.rows}
            columns={[
              {
                title: "Client / Company",
                dataIndex: "client_name",
                key: "client_name",
                render: (v) => <div className="font-medium">{v || "-"}</div>,
              },
              {
                title: "Type",
                dataIndex: "client_type",
                key: "client_type",
                width: 110,
                render: (v) => <Tag color={String(v).toLowerCase() === "customer" ? "purple" : "blue"}>{String(v || "-").toUpperCase()}</Tag>,
              },
              { title: "AE", dataIndex: "ae_name", key: "ae_name", width: 180 },
              { title: "Lead Status", dataIndex: "lead_status", key: "lead_status", width: 150 },
              {
                title: "Follow Up Date",
                dataIndex: "follow_up",
                key: "follow_up",
                width: 150,
                render: (v) => (v ? dayjs.unix(Number(v)).format("DD MMM YYYY") : "-"),
              },
            ]}
          />
        </Modal>
      </Spin>
    </section>
  );
}
