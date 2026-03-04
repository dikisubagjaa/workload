// /src/components/table/TableTimesheet.jsx
"use client";
import { Table, Modal, message } from "antd";
import dayjs from "dayjs";
import axiosInstance from "@/utils/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";

const fmtTime = (t) => (t ? dayjs(t, "HH:mm").format("HH:mm") : "—");
const fmtDate = (d) => (d ? dayjs(d).format("ddd, D MMM YYYY") : "—");

const statusColor = {
  draft: "default",
  submitted: "processing",
  approved: "success",
  rejected: "error",
};

function computeMinutes(row) {
  if (typeof row.duration_minutes === "number") return row.duration_minutes;
  if (row.start_time && row.end_time) {
    const start = dayjs(row.start_time, "HH:mm");
    const end = dayjs(row.end_time, "HH:mm");
    return end.diff(start, "minute");
  }
  return 0;
}

function minutesToHHMM(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function buildColumns({
  onEditClick,
  onDeleteClick,
  onActionSuccess,
  showAction = true,
}) {
  return [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (value) => {
        const isToday = dayjs(value).isSame(dayjs(), "day");
        const isYesterday = dayjs(value).isSame(
          dayjs().subtract(1, "day"),
          "day"
        );
        return (
          <div className="flex flex-col">
            <span>{fmtDate(value)}</span>
            <small className="text-gray-500">
              {isToday ? "Today" : isYesterday ? "Yesterday" : ""}
            </small>
          </div>
        );
      },
    },
    {
      title: "Project / Task",
      key: "task",
      responsive: ["sm"],
      render: (_, r) => {
        const project = r.Project?.title;
        const task = r.Task?.title;
        return `${project || "-"} / ${task || "-"}`;
      },
    },
    {
      title: "Start",
      dataIndex: "start_time",
      key: "start_time",
      width: 100,
      render: (v) => fmtTime(v),
    },
    {
      title: "Finish",
      dataIndex: "end_time",
      key: "end_time",
      width: 100,
      render: (v) => fmtTime(v),
    },
    {
      title: "Hours",
      key: "hours",
      width: 100,
      render: (_, r) => minutesToHHMM(computeMinutes(r)),
    },
    ...(showAction
      ? [
        {
          title: "Action",
          key: "action",
          width: "5%",
          render: (_, record) => {
            const disabled = record.status === "approved";

            const doDelete = async () => {
              if (!record.timesheet_id) {
                message.error("Missing timesheet id");
                return;
              }
              try {
                // ⬅️ sesuaikan dengan route API kamu
                await axiosInstance.delete(
                  `/api/timesheet/${record.timesheet_id}`
                );
                message.success("Timesheet deleted");
                onActionSuccess?.();
              } catch (e) {
                message.error(
                  e?.response?.data?.msg || "Failed to delete."
                );
              }
            };

            return (
              <div className="flex justify-center gap-3">
                <a
                  className={`text-red-500 ${disabled ? "pointer-events-none opacity-40" : ""
                    }`}
                  onClick={() => {
                    if (disabled) return;
                    if (onDeleteClick) {
                      onDeleteClick(record);
                    } else {
                      Modal.confirm({
                        title: "Delete this timesheet entry?",
                        okText: "Delete",
                        okType: "danger",
                        onOk: doDelete,
                      });
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faTrashCan} />
                </a>
              </div>
            );
          },
        },
      ]
      : []),
  ];
}

export function TableTimesheetOverview({
  dataSource = [],
  onEditClick,
  onDeleteClick,
  onActionSuccess,
}) {
  return (
    <Table
      rowKey={(r) =>
        r.timesheet_id || `${r.date}-${r.start_time}-${r.end_time}`
      }
      columns={buildColumns({
        onEditClick,
        onDeleteClick,
        onActionSuccess,
        showAction: true,
      })}
      dataSource={dataSource}
      pagination={false}
    />
  );
}

export function TableTimesheetArchived({ dataSource = [] }) {
  return (
    <Table
      rowKey={(r) =>
        r.timesheet_id || `${r.date}-${r.start_time}-${r.end_time}`
      }
      columns={buildColumns({ showAction: false })}
      dataSource={dataSource}
      pagination={false}
    />
  );
}
