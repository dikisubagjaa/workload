"use client";

import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, DatePicker, Form, InputNumber, Modal, Select, message } from "antd";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";

import axiosInstance from "@/utils/axios";
import TableMyAnnualReview from "./TableMyAnnualReview";
import TableMemberReview from "./TableMemberReview";

function isTruthy(v) {
  return v === true || v === "true" || v === 1 || v === "1";
}

function unixToDayjs(unixSeconds) {
  if (!unixSeconds) return null;
  const d = dayjs(Number(unixSeconds) * 1000);
  return d.isValid() ? d : null;
}

export default function MainContent() {
  const { data: session, status } = useSession();

  // ✅ session flags (string "true"/"false")
  const isHod = useMemo(() => isTruthy(session?.user?.is_hod), [session]);
  const isSuperadmin = useMemo(() => isTruthy(session?.user?.is_superadmin), [session]);
  const isHrd = useMemo(() => isTruthy(session?.user?.is_hrd), [session]);

  // ✅ HRD & superadmin only
  const canManagePeriod = useMemo(() => {
    return status !== "loading" && (isHrd || isSuperadmin);
  }, [status, isHrd, isSuperadmin]);

  // ✅ HOD only
  const canShowTeamReview = useMemo(() => {
    return status !== "loading" && isHod;
  }, [status, isHod]);

  // Period state (HRD/superadmin)
  const [periodLoading, setPeriodLoading] = useState(false);
  const [periods, setPeriods] = useState([]);

  const [selectedYear, setSelectedYear] = useState(null);
  const [appliedYear, setAppliedYear] = useState(null);

  // Modal add/update period
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [savingPeriod, setSavingPeriod] = useState(false);
  const [periodForm] = Form.useForm();

  const periodOptions = useMemo(() => {
    const years = (periods || [])
      .map((p) => Number(p?.period_to_year))
      .filter((y) => Number.isFinite(y))
      .sort((a, b) => b - a);

    return years.map((y) => ({ label: String(y), value: y }));
  }, [periods]);

  const currentPeriodRow = useMemo(() => {
    if (!appliedYear) return null;
    return (periods || []).find((p) => Number(p?.period_to_year) === Number(appliedYear)) || null;
  }, [periods, appliedYear]);

  const currentPeriodLabel = useMemo(() => {
    if (!currentPeriodRow) return "-";
    const open = unixToDayjs(currentPeriodRow?.open_at);
    const close = unixToDayjs(currentPeriodRow?.close_at);

    const openTxt = open ? open.format("DD MMM YYYY") : "-";
    const closeTxt = close ? close.format("DD MMM YYYY") : "-";

    return `${appliedYear} (${openTxt} → ${closeTxt})`;
  }, [currentPeriodRow, appliedYear]);

  const fetchPeriods = async () => {
    setPeriodLoading(true);
    try {
      const res = await axiosInstance.get("/master/annual-assesment-period");
      const rows = res?.data?.data || [];
      const list = Array.isArray(rows) ? rows : [];
      setPeriods(list);

      const years = list
        .map((p) => Number(p?.period_to_year))
        .filter((y) => Number.isFinite(y))
        .sort((a, b) => b - a);

      const defaultYear = years?.[0] ?? new Date().getFullYear();

      setSelectedYear((prev) => (prev == null ? defaultYear : prev));
      setAppliedYear((prev) => (prev == null ? defaultYear : prev));
    } catch (e) {
      setPeriods([]);
      message.error(e?.response?.data?.msg || "Failed to load period list.");
    } finally {
      setPeriodLoading(false);
    }
  };

  useEffect(() => {
    if (!canManagePeriod) return;
    fetchPeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManagePeriod]);

  const handleApplyYear = () => {
    if (!selectedYear) return;
    setAppliedYear(selectedYear);
  };

  const handleResetYear = () => {
    const years = (periods || [])
      .map((p) => Number(p?.period_to_year))
      .filter((y) => Number.isFinite(y))
      .sort((a, b) => b - a);

    const defaultYear = years?.[0] ?? new Date().getFullYear();
    setSelectedYear(defaultYear);
    setAppliedYear(defaultYear);
  };

  const handleOpenPeriodModal = () => {
    const row =
      (periods || []).find((p) => Number(p?.period_to_year) === Number(appliedYear)) || null;

    periodForm.setFieldsValue({
      year: appliedYear ?? new Date().getFullYear(),
      openAt: row ? unixToDayjs(row.open_at) : null,
      closeAt: row ? unixToDayjs(row.close_at) : null,
    });

    setIsPeriodModalOpen(true);
  };

  const handleSavePeriod = async () => {
    try {
      const values = await periodForm.validateFields();

      const year = Number(values?.year);
      if (!Number.isFinite(year)) {
        message.error("Year is invalid.");
        return;
      }

      const openAtUnix = values?.openAt ? dayjs(values.openAt).startOf("day").unix() : null;
      const closeAtUnix = values?.closeAt ? dayjs(values.closeAt).endOf("day").unix() : null;

      if (!openAtUnix || !closeAtUnix) {
        message.error("Open date and Close date are required.");
        return;
      }

      if (closeAtUnix < openAtUnix) {
        message.error("Close date must be after Open date.");
        return;
      }

      setSavingPeriod(true);

      await axiosInstance.post("/master/annual-assesment-period", {
        periodToYear: year,
        openAt: openAtUnix,
        closeAt: closeAtUnix,
      });

      message.success("Period saved.");
      setIsPeriodModalOpen(false);

      await fetchPeriods();
      setSelectedYear(year);
      setAppliedYear(year);
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.msg || "Failed to save period.");
    } finally {
      setSavingPeriod(false);
    }
  };

  const handleDownloadZip = () => {
    const year = appliedYear ?? new Date().getFullYear();
    window.open(`/api/annual-assestment/pdf?download=zip&scope=all&year=${year}`, "_blank");
  };

  return (
    <section className="container py-10">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <h1 className="text-2xl">Annual Review</h1>

        <div className="flex items-center gap-2">
          {canManagePeriod ? (
            <Button onClick={handleDownloadZip} icon={<DownloadOutlined />}>
              <span className="hidden sm:block">Download ZIP (All PDF)</span>
            </Button>
          ) : null}

          <Link href="/annual-review/form/0">
            <Button type="primary" className="btn-blue-filled">
              <PlusOutlined /> <span className="hidden sm:block">Fill My Annual Review</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* PERIOD (HRD & superadmin ONLY) */}
      {canManagePeriod ? (
        <Card className="card-box mb-5">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-sm">
                <span className="font-semibold">Current Period:</span>{" "}
                <span>{currentPeriodLabel}</span>
              </div>

              <Button
                type="primary"
                className="btn-blue-filled order-first sm:order-last"
                icon={<PlusOutlined />}
                onClick={handleOpenPeriodModal}
                loading={periodLoading}
              >
                ADD PERIOD
              </Button>
            </div>

            <div className="mt-2">
              <h3 className="text-lg fc-base mb-3">Annual Assessment</h3>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <Select
                  showSearch
                  placeholder="Select Period"
                  className="w-full sm:w-[260px]"
                  options={periodOptions}
                  value={selectedYear}
                  onChange={(v) => setSelectedYear(v)}
                  loading={periodLoading}
                  filterOption={(input, option) =>
                    String(option?.label || "")
                      .toLowerCase()
                      .includes(String(input).toLowerCase())
                  }
                />

                <div className="flex items-center gap-2">
                  <Button type="primary" onClick={handleApplyYear} disabled={!selectedYear}>
                    APPLY
                  </Button>
                  <Button onClick={handleResetYear}>RESET</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="card-box mb-5">
        <h3 className="text-lg fc-base mb-3">My Annual Review</h3>
        <TableMyAnnualReview year={appliedYear} />
      </Card>

      {canShowTeamReview ? (
        <Card className="card-box">
          <h3 className="text-lg fc-base mb-3">Team Member’s Review</h3>
          <TableMemberReview year={appliedYear} />
        </Card>
      ) : null}

      <Modal
        title="Add / Update Period"
        open={isPeriodModalOpen}
        onCancel={() => setIsPeriodModalOpen(false)}
        onOk={handleSavePeriod}
        okText="Save"
        confirmLoading={savingPeriod}
        destroyOnClose
      >
        <Form form={periodForm} layout="vertical">
          <Form.Item
            label="Year"
            name="year"
            rules={[
              { required: true, message: "Year is required." },
              () => ({
                validator(_, value) {
                  const y = Number(value);
                  if (!Number.isFinite(y)) return Promise.reject(new Error("Year is invalid."));
                  if (y < 2000 || y > 2100)
                    return Promise.reject(new Error("Year must be between 2000 and 2100."));
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber className="w-full" placeholder="e.g. 2024" />
          </Form.Item>

          <Form.Item
            label="Open Date"
            name="openAt"
            rules={[{ required: true, message: "Open date is required." }]}
          >
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            label="Close Date"
            name="closeAt"
            rules={[{ required: true, message: "Close date is required." }]}
          >
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>

          <div className="text-xs text-gray-500">
            If the year already exists, saving will update the open/close date.
          </div>
        </Form>
      </Modal>
    </section>
  );
}
