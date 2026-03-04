"use client";
import { useState, useEffect, useCallback } from "react";
import { Select, Table, Skeleton } from "antd";
import ModalTotalTime from "@components/modal/ModalTotalTIme";
import { useMobileQuery } from "../libs/UseMediaQuery";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { setTaskFocusItem } from "@/utils/focusItemStore";
import { renderColorTodo, fmtDate, fmtDueTime, toUnix } from "@/utils/taskDateHelpers";


// HOD todo options & rules
const HOD_TODO_OPTIONS = [
  { value: "need_review_hod", label: "Need Review HOD" },
  { value: "revise_hod", label: "Revise HOD" },
  { value: "need_review_ae", label: "Need Review AE" },
];

// HOD can only edit when current status is in this list.
// Once forwarded to AE (need_review_ae, etc.), it's read-only.
const HOD_EDITABLE_STATUSES = ["need_review_hod", "revise_hod"];

// ===== Desktop columns =====
const makeDesktopColumns = (onOpenTotalTime, onChangeStatus, onOpenTaskDetail) => [
  {
    title: "Task Name",
    dataIndex: "name",
    key: "taskName",
    className: "h-full",
    render: (_v, record) => {
      const due = record.end_date;
      return (
        <div className="flex items-center gap-5">
          <div
            className="w-2 rounded-full min-h-12"
            style={{ backgroundColor: renderColorTodo(due) }}
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenTaskDetail?.(record);
              }}
              className="text-left text-sm font-medium text-[#0FA3B1] hover:underline decoration-dotted hover:decoration-solid"
              title="Open task detail"
            >
              {record.title}
            </button>
          </div>
        </div>
      );
    },
  },
  {
    title: "Version",
    dataIndex: "version",
    key: "version",
    render: (_v, record) => (
      <p className="text-sm text-[#383F50]">{record.version ?? "-"}</p>
    ),
  },
  {
    title: "Project Name",
    dataIndex: "projectClient",
    key: "projectClient",
    render: (_v, record) => (
      <p className="text-sm text-[#383F50]">
        {record.projectClient || record.project_name || "-"}
      </p>
    ),
  },
  {
    title: "Start Time",
    dataIndex: "startTime",
    key: "startTime",
    render: (_v, record) => (
      <p className="text-sm font-normal text-[#383F50]">{fmtDate(record.start_date)}</p>
    ),
  },
  {
    title: "Due Date",
    dataIndex: "dueDate",
    key: "dueDate",
    render: (_v, record) => (
      <p className="text-sm font-normal text-[#383F50]">{fmtDate(record.end_date)}</p>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: "15%",
    render: (_v, record) => {
      const current = record.todo;

      // HOD can only edit when current status is in HOD_EDITABLE_STATUSES.
      const disabledBase = !HOD_EDITABLE_STATUSES.includes(current);

      const disabledCheck =
        record.btnCheck !== undefined && record.btnCheck !== null
          ? record.btnCheck
          : disabledBase;

      return (
        <div className="flex items-center gap-5">
          <Select
            className="text-gray-400 w-40"
            value={current}
            options={HOD_TODO_OPTIONS}
            onChange={(val) => onChangeStatus?.(record, val)}
            disabled={disabledCheck}
          />
        </div>
      );
    },
  },
];

// ===== Mobile =====
const MobileColumns = (onOpenTotalTime, onChangeStatus, onOpenTaskDetail) => [
  {
    title: "Task Name",
    dataIndex: "name",
    key: "taskName",
    className: "h-full",
    colSpan: 2,
    align: "left",
    render: (_v, record) => {
      const due = record.end_date;
      const current = record.todo;

      const disabledBase = !HOD_EDITABLE_STATUSES.includes(current);
      const disabledCheck =
        record.btnCheck !== undefined && record.btnCheck !== null
          ? record.btnCheck
          : disabledBase;

      return (
        <div className="flex items-center gap-5">
          <div
            className="w-2 rounded-full min-h-12"
            style={{ backgroundColor: renderColorTodo(due) }}
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenTaskDetail?.(record);
              }}
              className="text-left text-sm font-medium text-[#0FA3B1] hover:underline decoration-dotted hover:decoration-solid"
              title="Open task detail"
            >
              {record.title}
            </button>

            <div className="text-xs text-[#383F50]">
              <div>Project: {record.projectClient || record.project_name || "-"}</div>
              <div>
                Due:{" "}
                {record.end_date
                  ? `${fmtDate(record.end_date)} (${fmtDueTime(record.end_date)})`
                  : "-"}
              </div>
              <div>Status: {record.todo}</div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <Select
                className="text-gray-400 w-40"
                value={current}
                options={HOD_TODO_OPTIONS}
                onChange={(val) => onChangeStatus?.(record, val)}
                disabled={disabledCheck}
              />
            </div>
          </div>
        </div>
      );
    },
  },
];

const ExpandTable = ({ record }) => (
  <ul className="flex flex-col gap-4">
    <li>
      <h3 className="text-sm font-semibold mb-2">Assigned To</h3>
      <p className="text-sm text-[#383F50]">{record.assignedName ?? "-"}</p>
    </li>
    <li>
      <h3 className="text-sm font-semibold mb-2">Version</h3>
      <p className="text-sm text-[#383F50]">{record.version ?? "-"}</p>
    </li>
    <li>
      <h3 className="text-sm font-semibold mb-2">Project Name</h3>
      <p className="text-sm text-[#383F50]">
        {record.projectClient || record.project_name || "-"}
      </p>
    </li>
    <li>
      <h3 className="text-sm font-semibold mb-2">Start Time</h3>
      <p className="text-sm font-normal text-[#383F50]">{fmtDate(record.start_date)}</p>
    </li>
    <li>
      <h3 className="text-sm font-semibold mb-2">Due Date</h3>
      <p className="text-sm font-normal text-[#383F50]">{fmtDate(record.end_date)}</p>
    </li>
  </ul>
);

export default function TableTaskHod({
  dataTask = [],
  loading = false,
  onChangeStatus,
  onOpenTotalTime,
}) {
  const [modalTotalTime, setModalTotalTime] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [columns, setColumns] = useState([]);

  const isMobile = useMobileQuery();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleOpenTotalTime = useCallback(
    (open, task) => {
      setSelectedTask(open ? task : null);
      setModalTotalTime(open);
      onOpenTotalTime?.(open, task);
    },
    [onOpenTotalTime]
  );

  const handleOpenTaskDetail = useCallback(
    (task) => {
      const taskId = task?.task_id;
      if (!taskId) return;

      const currentQs = searchParams?.toString() || "";
      const returnTo = `${pathname}${currentQs ? `?${currentQs}` : ""}`;
      let targetTaskId = taskId;

      const parentId = task?.parent_id;
      if (parentId) {
        setTaskFocusItem(parentId, taskId);
        targetTaskId = parentId;
      }

      router.push(
        `/task/create?task=${encodeURIComponent(targetTaskId)}&returnTo=${encodeURIComponent(returnTo)}`
      );
    },
    [router, pathname, searchParams]
  );

  // ✅ no useMemo: columns dibuat via effect
  useEffect(() => {
    const nextColumns = isMobile
      ? MobileColumns(handleOpenTotalTime, onChangeStatus, handleOpenTaskDetail)
      : makeDesktopColumns(handleOpenTotalTime, onChangeStatus, handleOpenTaskDetail);

    setColumns(nextColumns);
  }, [isMobile, handleOpenTotalTime, onChangeStatus, handleOpenTaskDetail]);

  return (
    <>
      <Table
        dataSource={dataTask}
        columns={columns}
        rowKey={(r) => r.task_id ?? r.key}
        scroll={isMobile ? undefined : { x: "max-content" }}
        pagination={false}
        loading={{
          spinning: loading,
          tip: "Loading tasks...",
          indicator: <Skeleton active title paragraph={false} />,
        }}
        expandable={
          isMobile ? { expandedRowRender: (record) => <ExpandTable record={record} /> } : undefined
        }
      />

      <ModalTotalTime
        modalTotalTime={modalTotalTime}
        setModalTotalTime={setModalTotalTime}
        task={selectedTask}
      />
    </>
  );
}
