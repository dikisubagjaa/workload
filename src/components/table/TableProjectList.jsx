// /src/components/table/TableProjectList.jsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useMobileQuery } from "../libs/UseMediaQuery";
import {
  Avatar,
  Progress,
  Table,
  Tag,
  Tooltip,
  Dropdown,
  message,
  Popconfirm,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getAvatar } from "@/utils/avatarHelpers";

// Helper warna progress bar
const renderColorProgress = (progress) => {
  if (progress >= 100) return "#14AE5C"; // hijau
  if (progress > 50) return "#E8B931"; // kuning
  return "#EC221F"; // merah
};

// Helper untuk tag tipe proyek
const RenderTagsType = ({ type }) => {
  if (type === "project") {
    return (
      <Tag color="success" bordered={false} className="px-2 w-fit rounded-xl">
        Project
      </Tag>
    );
  }
  if (type === "pitching") {
    return (
      <Tag color="warning" bordered={false} className="px-2 w-fit rounded-xl">
        Pitching
      </Tag>
    );
  }
  return null;
};

// Expandable (mobile)
const ExpandTable = ({
  record,
  onDeleteClick,
  onOpenProjectModal,
  onChangeStatus,
}) => {
  const completed = Number(record?.completed_task_count) || 0;
  const remaining = Number(record?.remaining_task_count) || 0;
  const total = completed + remaining;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const members = Array.isArray(record?.members) ? record.members : [];

  const doChangeStatus = async (status) => {
    try {
      if (onChangeStatus) {
        await onChangeStatus(record.project_id, status);
      } else {
        const res = await fetch(`/api/project/${record.project_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Failed to change status");
      }
      message.success(`Status changed to ${status}`);
    } catch (e) {
      message.error(e.message || "Failed to change status");
    }
  };

  const menuItems = [
    { key: "edit", label: "Edit" },
    { type: "divider" },
    { key: "delete", label: <span className="text-red-500">Delete</span> },
  ];

  const onMenuClick = ({ key }) => {
    if (key === "edit") return onOpenProjectModal(record);
    if (key === "delete") return onDeleteClick?.(record.project_id);
    if (key.startsWith("status:")) return doChangeStatus(key.split(":")[1]);
  };

  return (
    <ul className="flex flex-col gap-4">
      <li>
        <h3 className="text-sm font-semibold mb-2">Progress</h3>
        <div className="flex items-center gap-3">
          <Progress
            strokeColor={renderColorProgress(percent)}
            percent={percent}
            showInfo={false}
            size={["100%", 12]}
          />
          <span
            className="text-sm font-medium"
            style={{ color: renderColorProgress(percent) }}
          >
            {percent}%
          </span>
        </div>
      </li>

      <li>
        <h3 className="text-sm font-semibold mb-2">Team Members</h3>
        <div className="flex justify-between">
          {members.length ? (
            <Avatar.Group max={{ count: 3 }}>
              {members.map((m) => {
                const title = m.fullname.trim() || "Member";
                const { src, text } = getAvatar({
                  profile_pic: m.profile_pic,
                  fullname: m.fullname,
                  lastname: m.lastname,
                });
                return (
                  <Tooltip title={title} placement="bottom" key={m.user_id ?? title}>
                    <Avatar src={src}>{!src ? text : null}</Avatar>
                  </Tooltip>
                );
              })}
            </Avatar.Group>
          ) : (
            <span className="text-xs text-[#98A2B3]">-</span>
          )}
        </div>
      </li>

      <li>
        <h3 className="text-sm font-semibold mb-2">Client</h3>
        <p className="text-sm text-[#383F50]">
          {record?.Client?.client_name || "-"}
        </p>
      </li>

      <li>
        <h3 className="text-sm font-semibold mb-2">Due Date</h3>
        <p className="text-sm text-[#383F50]">
          {record?.due_date ? dayjs(record.due_date).format("DD MMM YYYY") : "-"}
        </p>
      </li>
    </ul>
  );
};

export default function TableProjectList({
  dataSource = [],
  onEditClick,
  onDeleteClick,
  onChangeStatus, // optional handler; kalau tidak ada akan PUT langsung
}) {
  const isMobile = useMobileQuery();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openProjectModalURL = (projectId) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("modul", "project");
    params.set("openmodal", "true");
    if (projectId) params.set("project", String(projectId));
    router.push(`${pathname}?${params.toString()}`);
  };

  const doChangeStatus = async (record, status) => {
    try {
      if (onChangeStatus) {
        await onChangeStatus(record.project_id, status);
      } else {
        const res = await fetch(`/api/project/${record.project_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Failed to change status");
      }
      message.success(`Status changed to ${status}`);
    } catch (e) {
      message.error(e.message || "Failed to change status");
    }
  };

  const handleOpenProjectModal = (record) => {
    openProjectModalURL(record?.project_id);
    onEditClick?.(record);
  };

  // kolom desktop
  const desktopColumns = [
    {
      title: "Projects Name",
      dataIndex: "title",
      key: "title",
      render: (text, record) => {
        // ONLY change: saat project ON GOING (status 'remaining'), klik judul -> ke /project/[projectId]
        // status lain (completed/archived/dll) tetap membuka modal (logika lama tidak diubah).
        const isOngoing =
          String(record?.status || "").toLowerCase() === "remaining";

        return (
          <div className="flex gap-5">
            <div
              className="w-2 rounded-full flex-none"
              style={{ backgroundColor: "#ccc" /* TODO: priority color */ }}
            />
            <div className="cursor-pointer">
              {isOngoing ? (
                <Link href={`/project/${record.project_id}`} prefetch={false}>
                  <h3 className="text-sm font-medium text-[#383F50] hover:underline">
                    {text}
                  </h3>
                </Link>
              ) : (
                <div onClick={() => handleOpenProjectModal(record)}>
                  <h3 className="text-sm font-medium text-[#383F50] hover:underline">
                    {text}
                  </h3>
                </div>
              )}
            </div>
            <RenderTagsType type={record.type} />
          </div>
        );
      },
    },
    {
      title: "Team Members",
      dataIndex: "members",
      key: "members",
      width: "10%",
      render: (members = []) => {
        const list = Array.isArray(members) ? members : [];
        return list.length ? (
          <Avatar.Group max={{ count: 3 }}>
            {list.map((m) => {
              const title = m.fullname.trim() || "Member";
              const { src, text } = getAvatar({
                profile_pic: m.profile_pic,
                fullname: m.fullname,
              });
              return (
                <Tooltip title={title} placement="bottom" key={m.user_id ?? title}>
                  <Avatar src={src}>{!src ? text : null}</Avatar>
                </Tooltip>
              );
            })}
          </Avatar.Group>
        ) : (
          <span className="text-xs text-[#98A2B3]">-</span>
        );
      },
    },
    {
      title: "Progress",
      key: "progress",
      width: "15%",
      render: (_, record) => {
        const completed = Number(record?.completed_task_count) || 0;
        const remaining = Number(record?.remaining_task_count) || 0;
        const total = completed + remaining;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
          <div className="flex flex-col items-center justify-center gap-2">
            <Progress
              strokeColor={renderColorProgress(percent)}
              percent={percent}
              showInfo={false}
              size={["100%", 12]}
            />
            <h4
              className="text-base font-medium"
              style={{ color: renderColorProgress(percent) }}
            >
              {percent}%
            </h4>
          </div>
        );
      },
    },
    {
      title: "Client",
      key: "client",
      render: (_, record) => (
        <p className="text-sm font-normal text-[#383F50]">
          {record?.Client?.client_name || "-"}
        </p>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date) => (
        <p className="text-sm font-normal text-[#383F50]">
          {date ? dayjs(date).format("DD MMM YYYY") : "-"}
        </p>
      ),
    },
    {
      title: "",
      key: "action",
      align: "right",
      width: 48,
      render: (_, record) => {
        const items = [
          { key: "edit", label: "Edit" },
          { type: "divider" },
          {
            key: "delete",
            label: (
              <Popconfirm
                title="Delete this project?"
                description="This action cannot be undone."
                okText="Yes"
                cancelText="No"
                onConfirm={() => onDeleteClick?.(record.project_id)}
              >
                <span
                  className="text-red-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  Delete
                </span>
              </Popconfirm>
            ),
          },
        ];
        const onClick = ({ key }) => {
          if (key === "edit") return handleOpenProjectModal(record);
          if (key.startsWith("status:")) {
            const status = key.split(":")[1];
            return doChangeStatus(record, status);
          }
        };
        return (
          <Dropdown menu={{ items, onClick }} trigger={["click"]}>
            <button className="p-2 rounded hover:bg-neutral-100">
              <MoreOutlined />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  // kolom mobile cukup satu kolom, detail di expandable
  const mobileColumns = [
    {
      title: "Projects",
      dataIndex: "title",
      key: "title",
      render: (text, record) => {
        const items = [
          { key: "edit", label: "Edit" },
          { type: "divider" },
          {
            key: "delete",
            label: (
              <Popconfirm
                title="Delete this project?"
                description="This action cannot be undone."
                okText="Yes"
                cancelText="No"
                onConfirm={() => onDeleteClick?.(record.project_id)}
              >
                <span
                  className="text-red-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  Delete
                </span>
              </Popconfirm>
            ),
          },
        ];

        const onClick = ({ key }) => {
          if (key === "edit") return handleOpenProjectModal(record);
          if (key.startsWith("status:")) {
            const status = key.split(":")[1];
            return doChangeStatus(record, status);
          }
        };

        return (
          <div className="flex gap-5">
            <div className="w-2 rounded-full flex-none" style={{ backgroundColor: "#ccc" }} />
            <div className="flex-1">
              <Link href={`/project/${record.project_id}`}>
                <h3 className="text-sm font-medium text-[#383F50] hover:underline">
                  {text}
                </h3>
              </Link>
              <RenderTagsType type={record.type} />
            </div>

            <Dropdown menu={{ items, onClick }} trigger={["click"]}>
              <button className="p-2 rounded hover:bg-neutral-100">
                <MoreOutlined />
              </button>
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <Table
      dataSource={dataSource}
      columns={isMobile ? mobileColumns : desktopColumns}
      rowKey="project_id"
      scroll={isMobile ? undefined : { x: "max-content" }}
      pagination={false}
      showHeader={isMobile ? false : true}
      expandable={
        isMobile
          ? {
            expandedRowRender: (record) => (
              <ExpandTable
                record={record}
                onDeleteClick={onDeleteClick}
                onOpenProjectModal={handleOpenProjectModal}
                onChangeStatus={(id, status) =>
                  doChangeStatus({ project_id: id }, status)
                }
              />
            ),
          }
          : undefined
      }
    />
  );
}
