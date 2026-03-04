"use client";

import { Table, Button, Tag, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axiosInstance from "@/utils/axios";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";

function normalizeBool(v) {
  return v === true || v === "true" || v === 1 || v === "1";
}

function formatDate(unixSeconds) {
  if (!unixSeconds) return "-";
  const d = new Date(Number(unixSeconds) * 1000);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function mapStatusToUi(status) {
  if (status === "approved") return { text: "approved", color: "green" };
  if (status === "finalized") return { text: "approved", color: "green" };
  if (status === "reviewed_by_hod") return { text: "reviewed", color: "blue" };
  if (status === "submitted_by_staff") return { text: "submitted", color: "gold" };
  if (status === "draft") return { text: "draft", color: "green" };
  if (status === "rejected") return { text: "rejected", color: "red" };
  return { text: String(status || "-"), color: "default" };
}

export default function TableMemberReview({ year }) {
  const { data: session, status: sessionStatus } = useSession();
  const isMobile = useMobileQuery();

  const isHod = useMemo(() => normalizeBool(session?.user?.is_hod), [session]);

  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);

  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const buildYearQuery = () => {
    const y = Number(year);
    return Number.isFinite(y) ? `?year=${y}` : "";
  };

  const handleDownloadPdf = (record) => {
    if (!record?.staffId) return;

    const y = Number(year);
    const qs = Number.isFinite(y) ? `&year=${y}` : "";
    window.open(`/api/annual-assestment/pdf?staffId=${record.staffId}${qs}`, "_blank");
  };

  useEffect(() => {
    const fetchList = async () => {
      if (sessionStatus === "loading") return;

      // ✅ hard gate: non-HOD jangan fetch sama sekali
      if (!isHod) return;

      setLoading(true);
      try {
        const res = await axiosInstance.get(`/annual-assestment/hod/list${buildYearQuery()}`);
        const rows = res?.data?.data || [];

        const mapped = (Array.isArray(rows) ? rows : []).map((r, idx) => {
          // ✅ strict sesuai API hod/list
          const staffId = r?.staff_id ? Number(r.staff_id) : null;

          const staffName =
            r?.staff?.fullname ||
            r?.staff?.name ||
            (staffId ? `Staff ${staffId}` : "Staff -");

          const status = r?.status || "-";
          const submittedAt = r?.staff_submitted_at || null;

          const periodFrom = r?.period_from_year ?? null;
          const periodTo = r?.period_to_year ?? null;

          return {
            key: `${staffId || "x"}-${idx}`,
            staffId,
            staffName,
            period: periodFrom && periodTo ? `${periodFrom}-${periodTo}` : "-",
            date: formatDate(submittedAt),
            rawStatus: status,
          };
        });

        setTableData(mapped);
      } catch (e) {
        const code = e?.response?.status;
        if (code === 401 || code === 403) {
          setTableData([]);
          return;
        }
        message.error(e?.response?.data?.msg || "Failed to load Team Member’s Review.");
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [isHod, sessionStatus, year]);

  // ✅ hide total untuk non-HOD
  if (sessionStatus === "loading") return null;
  if (!isHod) return null;

  const columns = [
    {
      title: "Staff",
      dataIndex: "staffName",
      key: "staffName",
      sorter: (a, b) => String(a.staffName).localeCompare(String(b.staffName)),
      render: (_v, r) => (
        <div className="flex flex-col">
          <div className="text-sm font-semibold">{r.staffName}</div>
          <div className="text-xs text-gray-500">Period: {r.period}</div>
        </div>
      ),
    },
    {
      title: "Submitted Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => String(a.date).localeCompare(String(b.date)),
      render: (_v, r) => <span className="text-sm">{r.date}</span>,
      responsive: ["sm"],
    },
    {
      title: "Status",
      dataIndex: "rawStatus",
      key: "rawStatus",
      render: (_v, r) => {
        const s = mapStatusToUi(r.rawStatus);
        return (
          <Tag className="rounded-full px-2" variant="outlined" color={s.color}>
            {s.text}
          </Tag>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Action",
      key: "actions",
      width: 170,
      fixed: "right",
      render: (_v, r) => (
        <div className="flex items-center gap-2">
          <Link href={`/annual-review/draft/${r.staffId || 0}`}>
            <Button type="link" className="fc-blue" disabled={!r.staffId}>
              Review
            </Button>
          </Link>

          <Button
            type="link"
            className="fc-blue"
            onClick={() => handleDownloadPdf(r)}
            disabled={!r.staffId}
          >
            PDF <DownloadOutlined />
          </Button>
        </div>
      ),
    },
  ];

  const mobileColumns = [
    {
      title: "Staff",
      dataIndex: "staffName",
      key: "staffName",
      render: (_v, r) => (
        <div className="flex flex-col gap-1">
          <div className="text-sm font-semibold">{r.staffName}</div>
          <div className="text-xs text-gray-500">
            {r.period} • {r.date}
          </div>
          <div className="mt-1">
            <Tag
              className="rounded-full px-2"
              variant="outlined"
              color={mapStatusToUi(r.rawStatus).color}
            >
              {mapStatusToUi(r.rawStatus).text}
            </Tag>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Link href={`/annual-review/draft/${r.staffId || 0}`}>
              <Button size="small" disabled={!r.staffId}>
                Review
              </Button>
            </Link>
            <Button size="small" onClick={() => handleDownloadPdf(r)} disabled={!r.staffId}>
              PDF
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Table
      rowKey={(r) => r.key}
      loading={loading}
      dataSource={tableData}
      columns={isMobile ? mobileColumns : columns}
      pagination={{
        current: currentPage,
        pageSize: perPage,
        showSizeChanger: true,
        pageSizeOptions: [5, 10, 20, 50, 100],
        onChange: (page, pageSize) => {
          setCurrentPage(page);
          setPerPage(pageSize || 10);
        },
      }}
    />
  );
}
