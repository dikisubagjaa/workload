"use client";

import { Table, Button, Tag } from "antd";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";
import { DownloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import Link from "next/link";
import axiosInstance from "@/utils/axios";

export default function TableMyAnnualReview({ year }) {
  const isMobile = useMobileQuery();
  const [perPage, setPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);

  const formatDate = (unixSeconds) => {
    if (!unixSeconds) return "-";
    const d = new Date(Number(unixSeconds) * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const mapStatusToTag = (status) => {
    // UI tag lama: approved | pending | rejected
    if (status === "approved") return "approved";
    if (status === "finalized") return "approved";
    if (status === "reviewed_by_hod") return "pending";
    if (status === "submitted_by_staff") return "pending";
    if (status === "draft") return "pending";
    if (status === "rejected") return "rejected";
    return "pending";
  };

  const canEditForm = (record) => {
    // staff hanya boleh masuk form ketika draft
    return record?.rawStatus === "draft";
  };

  const canDownloadPdf = (record) => {
    // staff lihat hasil lengkap via PDF, hanya setelah approved
    return record?.rawStatus === "approved" || record?.rawStatus === "finalized";
  };

  const handleDownload = (record) => {
    if (!record?.annualAssestmentId) return;
    if (!canDownloadPdf(record)) return;

    const qYear = Number(year);
    const qs = Number.isFinite(qYear) ? `?year=${qYear}` : "";

    // staff: endpoint default = PDF miliknya (ikut year kalau ada)
    window.open(`/api/annual-assestment/pdf${qs}`, "_blank");
  };

  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
      try {
        const qYear = Number(year);
        const qs = Number.isFinite(qYear) ? `?year=${qYear}` : "";

        const res = await axiosInstance.get(`/annual-assestment/me${qs}`);
        const row = res?.data?.data;

        if (!row) {
          setTableData([]);
          return;
        }

        const docTitle = `Annual Assestment ${row.period_from_year}-${row.period_to_year}`;
        const docDate = row.staff_submitted_at
          ? formatDate(row.staff_submitted_at)
          : row.created
          ? formatDate(row.created)
          : "-";

        const statusTag = mapStatusToTag(row.status);

        setTableData([
          {
            title: docTitle,
            date: docDate,
            status: statusTag,
            annualAssestmentId: row.annual_assestment_id,
            rawStatus: row.status,
          },
        ]);
      } catch (e) {
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [year]);

  const colomnDetail = () => [
    {
      title: "Document Name",
      dataIndex: "Document_Name",
      key: "Document_Name",
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (_, record) => {
        const href = `/annual-review/form/${record.annualAssestmentId || 0}`;

        // hanya link kalau draft, selain itu text biasa
        return canEditForm(record) ? (
          <Link href={href}>
            <h3 className="text-sm fc-base">{record.title}</h3>
          </Link>
        ) : (
          <h3 className="text-sm fc-base">{record.title}</h3>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => a.date.localeCompare(b.date),
      render: (_, record) => <p className="text-sm fc-base">{record.date}</p>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (_, record) => (
        <Tag
          className="rounded-full px-2"
          variant="outlined"
          color={
            record.status === "approved"
              ? "green"
              : record.status === "pending"
              ? "gold"
              : "red"
          }
        >
          {record.status}
        </Tag>
      ),
    },
    {
      key: "actions",
      width: 110,
      fixed: "right",
      render: (_v, r) => (
        <Button
          type="link"
          className="fc-blue"
          onClick={() => handleDownload(r)}
          disabled={!r.annualAssestmentId || !canDownloadPdf(r)}
        >
          Download <DownloadOutlined />
        </Button>
      ),
    },
  ];

  const mobileColomnDetail = () => [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (_v, r) => (
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-sm">{r.title}</h3>
          <div className="text-xs text-gray-500">{r.date}</div>
        </div>
      ),
    },
  ];

  const ExpandTable = ({ record }) => (
    <ul className="flex flex-col gap-3">
      <li>
        <div className="flex justify-between">
          <div>
            <h4 className="text-sm font-semibold">Date:</h4>
            <p className="text-sm fc-base">{record.date}</p>
          </div>

          <Button
            type="link"
            className="fc-blue"
            onClick={() => handleDownload(record)}
            disabled={!record.annualAssestmentId || !canDownloadPdf(record)}
          >
            Download <DownloadOutlined />
          </Button>
        </div>
      </li>

      <li>
        <h4 className="text-sm font-semibold">Status:</h4>
        <Tag
          className="rounded-full px-2"
          variant="outlined"
          color={
            record.status === "approved"
              ? "green"
              : record.status === "pending"
              ? "gold"
              : "red"
          }
        >
          {record.status}
        </Tag>
      </li>

      {!canDownloadPdf(record) ? (
        <li className="text-xs text-gray-500">
          PDF will be available after HOD finalizes the review.
        </li>
      ) : null}
    </ul>
  );

  return (
    <Table
      rowKey={(record) => record.title}
      loading={loading}
      dataSource={tableData}
      columns={isMobile ? mobileColomnDetail() : colomnDetail()}
      showHeader={!isMobile}
      expandable={
        isMobile
          ? {
              expandedRowRender: (record) => <ExpandTable record={record} />,
            }
          : null
      }
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
