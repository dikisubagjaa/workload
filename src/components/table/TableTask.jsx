"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Select, Table, Skeleton } from "antd";
import ModalTotalTime from "@components/modal/ModalTotalTIme";
import { useMobileQuery } from "../libs/UseMediaQuery";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { setTaskFocusItem } from "@/utils/focusItemStore";
import { renderColorTodo, fmtDate, fmtDueTime, toUnix } from "@/utils/taskDateHelpers";


/**
 * Status locked for STAFF (cannot change from these).
 * Revision is represented by revise_hod / revise_account.
 */
const STAFF_LOCKED_STATUSES = [
  "revise_account",
  "need_review_hod",
  "need_review_ae",
  "revise_hod",
  "revise_account",
  "approved_ae",
  "completed",
  "pending",
  "cancel",
  "todo",
  "review",
  "done",
];

const buildDesktopTodoOptions = (isAccount) => {
  if (isAccount) {
    return [
      { value: "need_review_ae", label: "Need Review AE" },
      { value: "revise_account", label: "Revise Account" },
      { value: "approved_ae", label: "Approve AE" },
      { value: "completed", label: "Completed" },
    ];
  }

  return [
    { value: "new", label: "New" },
    { value: "in_progress", label: "In Progress" },
    { value: "need_review_hod", label: "Need Review HOD" },
  ];
};

const buildMobileTodoOptions = (isAccount) => {
  if (isAccount) {
    return [
      { value: "need_review_ae", label: "Need Review AE" },
      { value: "revise_account", label: "Revise Account" },
      { value: "approved_ae", label: "Approve AE" },
      { value: "completed", label: "Completed" },
    ];
  }

  return [
    { value: "new", label: "New" },
    { value: "in_progress", label: "In Progress" },
    { value: "need_review_hod", label: "Need Review HOD" },
  ];
};

const isRevisionStatus = (todo) => todo === "revise_hod" || todo === "revise_account";

// ===== Desktop columns =====
const makeDesktopColumns = (
  onOpenTotalTime,
  onChangeStatus,
  onOpenTaskDetail,
  baseTodoOptions,
  isAccount
) => [
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
      <p className="text-sm text-[#383F50]">{record.last_version ?? "-"}</p>
    ),
  },
  {
    title: "Project Name",
    dataIndex: "projectClient",
    key: "projectClient",
    render: (_v, record) => (
      <p className="text-sm text-[#383F50]">{record.projectClient || "-"}</p>
    ),
  },
  {
    title: "Start Date",
    dataIndex: "startTime",
    key: "startTime",
    render: (_v, record) => (
      <p className="text-sm font-normal text-[#383F50]">
        {fmtDate(toUnix(record.start_date))}
      </p>
    ),
  },
  {
    title: "Due Date",
    dataIndex: "dueDate",
    key: "dueDateReview",
    render: (_v, record) => (
      <p className="text-sm font-normal text-[#383F50]">
        {fmtDate(toUnix(record.end_date))}
      </p>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: "15%",
    render: (_v, record) => {
      const current = record.todo;

      let disabledBase = false;
      if (!isAccount) {
        disabledBase = STAFF_LOCKED_STATUSES.includes(current);
      }

      const disabledCheck =
        record.btnCheck !== undefined && record.btnCheck !== null ? record.btnCheck : disabledBase;

      let options = baseTodoOptions;
      if (isRevisionStatus(current)) {
        options = [{ value: current, label: "Revision", disabled: true }, ...baseTodoOptions];
      }

      return (
        <div className="flex items-center gap-5">
          <Select
            className="text-gray-400 w-40"
            value={current}
            options={options}
            onChange={(val) => onChangeStatus?.(record, val)}
            disabled={disabledCheck}
          />
        </div>
      );
    },
  },
];

// ===== Mobile =====
const MobileColumns = (
  onOpenTotalTime,
  onChangeStatus,
  onOpenTaskDetail,
  baseTodoOptions,
  isAccount
) => [
  {
    title: "Task Name",
    dataIndex: "name",
    key: "taskName",
    className: "h-full",
    colSpan: 2,
    align: "left",
    render: (_v, record) => {
      const due = record.end_date;

      let disabledBase = false;
      if (!isAccount) {
        disabledBase = STAFF_LOCKED_STATUSES.includes(record.todo);
      }
      const disabledCheck =
        record.btnCheck !== undefined && record.btnCheck !== null ? record.btnCheck : disabledBase;

      let options = baseTodoOptions;
      if (isRevisionStatus(record.todo)) {
        options = [{ value: record.todo, label: "Revision", disabled: true }, ...baseTodoOptions];
      }

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
              <div>Project: {record.projectClient || "-"}</div>
              <div>
                Due:{" "}
                {record.end_date
                  ? `${fmtDate(toUnix(record.end_date))} (${fmtDueTime(toUnix(record.end_date))})`
                  : "-"}
              </div>
              <div>Status: {record.todo}</div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <Select
                className="text-gray-400 w-40"
                value={record.todo}
                options={options}
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
      <h3 className="text-sm font-semibold mb-2">Version</h3>
      <p className="text-sm text-[#383F50]">{record.version ?? "-"}</p>
    </li>
    <li>
      <h3 className="text-sm font-semibold mb-2">Project Name</h3>
      <p className="text-sm text-[#383F50]">{record.projectClient || "-"}</p>
    </li>
    <li>
      <h3 className="text-sm font-semibold mb-2">Start Time</h3>
      <p className="text-sm font-normal text-[#383F50]">
        {record.start_date
          ? `${fmtDate(toUnix(record.start_date))} (${fmtDueTime(toUnix(record.start_date))})`
          : "-"}
      </p>
    </li>
    <li>
      <h3 className="text-sm font-semibold mb-2">Due Date</h3>
      <p className="text-sm font-normal text-[#383F50]">
        {record.end_date
          ? `${fmtDate(toUnix(record.end_date))} (${fmtDueTime(toUnix(record.end_date))})`
          : "-"}
      </p>
    </li>
  </ul>
);

export default function TableTask({ dataTask = [], loading = false, onChangeStatus, onOpenTotalTime }) {
  const [modalTotalTime, setModalTotalTime] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [desktopTodoOptions, setDesktopTodoOptions] = useState([]);
  const [mobileTodoOptions, setMobileTodoOptions] = useState([]);

  const isMobile = useMobileQuery();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const userRole = session?.user?.user_role;
  const isAccount = userRole === "account";

  useEffect(() => {
    setDesktopTodoOptions(buildDesktopTodoOptions(isAccount));
    setMobileTodoOptions(buildMobileTodoOptions(isAccount));
  }, [isAccount]);

  const handleOpenTotalTime = useCallback((open, task) => {
    setSelectedTask(open ? task : null);
    setModalTotalTime(open);
    onOpenTotalTime?.(open, task);
  }, [onOpenTotalTime]);

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

  const columns = useMemo(
    () =>
      isMobile
        ? MobileColumns(
            handleOpenTotalTime,
            onChangeStatus,
            handleOpenTaskDetail,
            mobileTodoOptions,
            isAccount
          )
        : makeDesktopColumns(
            handleOpenTotalTime,
            onChangeStatus,
            handleOpenTaskDetail,
            desktopTodoOptions,
            isAccount
          ),
    [
      isMobile,
      onChangeStatus,
      handleOpenTaskDetail,
      handleOpenTotalTime,
      desktopTodoOptions,
      mobileTodoOptions,
      isAccount,
    ]
  );

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
        expandable={isMobile ? { expandedRowRender: (record) => <ExpandTable record={record} /> } : undefined}
      />

      <ModalTotalTime
        modalTotalTime={modalTotalTime}
        setModalTotalTime={setModalTotalTime}
        task={selectedTask}
      />
    </>
  );
}
