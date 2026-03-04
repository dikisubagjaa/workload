"use client";
import { useEffect, useState } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { Button, Select, Table } from "antd";
import ModalRevise from "@/components/modal/ModalRevise";
import { useMobileQuery } from "../libs/UseMediaQuery";

import dayjs from "dayjs";
import { renderColorTodo, toUnix } from "@/utils/taskDateHelpers";

/** Ambil tanggal submit ke client: pakai start_revision kalau ada, fallback ke start_date */
const getSubmittedDate = (record) => {
  const raw = record?.start_revision ?? record?.start_date;
  const unix = toUnix(raw);
  if (!Number.isFinite(unix)) return null;
  return dayjs.unix(unix);
};

const formatSubmittedDate = (record) => {
  const d = getSubmittedDate(record);
  return d ? d.format("DD MMM YYYY") : "-";
};

const formatDaysSinceSubmission = (record) => {
  const d = getSubmittedDate(record);
  if (!d) return "-";
  const diff = dayjs().startOf("day").diff(d.startOf("day"), "day");
  const days = diff < 0 ? 0 : diff;
  return `${days} Days`;
};

// AE status options ↔ todo flags
const AE_STATUS_OPTIONS = [
  { value: "need_review_ae", label: "Under Review" },
  { value: "revise_account", label: "Revision" },
  { value: "completed", label: "Completed" },
];

// ===== Columns (desktop) =====
const buildDesktopColumns = (onOpenRevise) => [
  {
    title: "Task Name",
    dataIndex: "name",
    key: "taskName",
    className: "h-full",
    render: (_value, record, index) => {
      const due = record.end_date;
      return (
        <div className="flex items-center gap-5" key={index}>
          <div
            className="w-2 rounded-full min-h-12"
            style={{ backgroundColor: renderColorTodo(due) }}
          />
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-[#383F50]">{record.title}</h3>
          </div>
        </div>
      );
    },
  },
  {
    title: "Version",
    dataIndex: "version",
    key: "version",
    render: (_value, record) => (
      <p className="text-sm text-[#383F50]">
        {record.last_version ?? record.version ?? "-"}
      </p>
    ),
  },
  {
    title: "Project Name",
    dataIndex: "projectClient",
    key: "projectClient",
    render: (_value, record) => (
      <p className="text-sm text-[#383F50]">
        {record.projectClient || record.project_name || "-"}
      </p>
    ),
  },
  {
    title: "Submitted Date",
    dataIndex: "submittedDate",
    key: "submittedDate",
    render: (_value, record) => (
      <p className="text-sm text-[#383F50]">{formatSubmittedDate(record)}</p>
    ),
  },
  {
    title: "Days Since Submission",
    dataIndex: "daysSinceSubmission",
    key: "daysSinceSubmission",
    render: (_value, record) => (
      <p className="text-sm text-[#383F50]">{formatDaysSinceSubmission(record)}</p>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: "15%",
    render: (_value, record) => {
      const currentTodo = record.todo || record.status || "need_review_ae";

      const handleChange = (val) => {
        if (val === "revise_account") onOpenRevise(record);
      };

      return (
        <div className="flex items-center gap-5">
          <Select
            className="text-gray-400 w-40"
            value={currentTodo}
            options={AE_STATUS_OPTIONS}
            onChange={handleChange}
          />
          <Button
            disabled={record.btnCheck}
            className="btn-blue px-2"
            size="small"
            onClick={() => onOpenRevise(record)}
          >
            <CheckOutlined />
          </Button>
        </div>
      );
    },
  },
];

// ===== Columns (mobile) – ringkas, detail di ExpandTable =====
const buildMobileColumns = () => [
  {
    title: "Task Name",
    dataIndex: "name",
    key: "taskName",
    className: "h-full",
    colSpan: 2,
    align: "left",
    render: (_value, record, index) => {
      const due = record.end_date;
      return (
        <div className="flex items-center gap-5" key={index}>
          <div
            className="w-2 rounded-full min-h-12"
            style={{ backgroundColor: renderColorTodo(due) }}
          />
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-[#383F50]">{record.title}</h3>
          </div>
        </div>
      );
    },
  },
];

const ExpandTable = ({ record, onOpenRevise }) => {
  const currentTodo = record.todo || record.status || "need_review_ae";

  const handleChange = (val) => {
    if (val === "revise_account") onOpenRevise(record);
  };

  return (
    <ul className="flex flex-col gap-4">
      <li>
        <h3 className="text-sm font-semibold mb-2">Version</h3>
        <p className="text-sm text-[#383F50]">
          {record.last_version ?? record.version ?? "-"}
        </p>
      </li>
      <li>
        <h3 className="text-sm font-semibold mb-2">Project Name</h3>
        <p className="text-sm text-[#383F50]">
          {record.projectClient || record.project_name || "-"}
        </p>
      </li>
      <li>
        <h3 className="text-sm font-semibold mb-2">Submitted Date</h3>
        <p className="text-sm text-[#383F50]">{formatSubmittedDate(record)}</p>
      </li>
      <li>
        <h3 className="text-sm font-semibold mb-2">Days Since Submission</h3>
        <p className="text-sm text-[#383F50]">{formatDaysSinceSubmission(record)}</p>
      </li>
      <li>
        <h3 className="text-sm font-semibold mb-2">Status</h3>
        <div className="flex items-center gap-5">
          <Select
            className="text-gray-400 w-40"
            value={currentTodo}
            options={AE_STATUS_OPTIONS}
            onChange={handleChange}
          />
          <Button
            disabled={record.btnCheck}  // ✅ FIX: konsisten sama desktop
            className="btn-blue px-2"
            size="small"
            onClick={() => onOpenRevise(record)}
          >
            <CheckOutlined />
          </Button>
        </div>
      </li>
    </ul>
  );
};

export default function TableUnderReview({ dataTaskReview = [], fetchDashboard }) {
  const [modalRevise, setModalRevise] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [columns, setColumns] = useState([]);

  const isMobile = useMobileQuery();

  const onOpenRevise = (row) => {
    setSelectedRow(row);
    setModalRevise(true);
  };

  useEffect(() => {
    setColumns(isMobile ? buildMobileColumns() : buildDesktopColumns(onOpenRevise));
  }, [isMobile]);

  return (
    <>
      <Table
        dataSource={dataTaskReview}
        columns={columns}
        scroll={isMobile ? null : { x: "max-content" }}
        pagination={false}
        expandable={
          isMobile
            ? {
                expandedRowRender: (record) => (
                  <ExpandTable record={record} onOpenRevise={onOpenRevise} />
                ),
              }
            : null
        }
        rowKey={(r) => r.key || `${r.task_id}-${r.revision_id || ""}`}
      />

      <ModalRevise
        modalRevise={modalRevise}
        setModalRevise={setModalRevise}
        revisionTarget={selectedRow}
        fetchDashboard={fetchDashboard}
      />
    </>
  );
}
