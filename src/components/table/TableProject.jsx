"use client";
import { Avatar, Progress, Table, Tag, Tooltip } from "antd";
import { useMobileQuery } from "../libs/UseMediaQuery";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAvatar } from "@/utils/avatarHelpers";

const colorMap = { low: "#EC221F", medium: "#E8B931", high: "#14AE5C" };

const renderColorProgress = (progress) => {
  const p = Number(progress) || 0;
  const range = p < 50 ? "low" : p < 99 ? "medium" : "high";
  return colorMap[range];
};

const TAG_COLOR = {
  Project: "success",
  Pitching: "warning",
  Meeting: "error",
};

const RenderTagsType = ({ type }) => {
  const color = TAG_COLOR[type];
  if (!color) return null;

  return (
    <Tag color={color} bordered={false} className="px-2 w-fit rounded-xl">
      {type}
    </Tag>
  );
};

const getProjectLink = (record) => {
  const id = record?.project_id ?? record?.projectId ?? record?.id ?? record?.projectID;
  return id ? `/projects/${id}` : "/projects";
};

// columns (desktop)
const colomnsProject = [
  {
    title: "Projects Name",
    dataIndex: "projectName",
    key: "projectName",
    render: (value, record, index) => {
      return (
        <div className="flex gap-5" key={index}>
          <div
            className="w-2 rounded-full flex-none"
            style={{ backgroundColor: record.priority }}
          />
          <div className="flex-1">
            <div className="flex flex-col gap-2">
              <Link href={getProjectLink(record)}>
                <h3 className="text-sm lg:text-base font-medium text-[#383F50]">
                  {record.name}
                </h3>
              </Link>
              <RenderTagsType type={record.type} />
            </div>
          </div>
        </div>
      );
    },
  },
  {
    title: "Team Members",
    dataIndex: "members",
    key: "members",
    render: (value, record, index) => {
      const list = Array.isArray(record.members) ? record.members : [];
      return (
        <Avatar.Group max={{ count: 3 }} key={index}>
          {list.map((m, i) => {
            const title = `${m.fullname ?? ""}`.trim() || "Member";
            const { src, text } = getAvatar({
              profile_pic: m.profile_pic,
              fullname: m.fullname,
            });
            return (
              <Tooltip title={title} placement="bottom" key={m.user_id ?? i}>
                <Avatar size="default" src={src}>
                  {!src ? text : null}
                </Avatar>
              </Tooltip>
            );
          })}
        </Avatar.Group>
      );
    },
    width: "10%",
  },
  {
    title: "Progress",
    dataIndex: "progress",
    key: "progress",
    render: (value, record) => {
      const p = Number(record.progress) || 0;
      return (
        <div className="flex flex-col items-center justify-center gap-2">
          <Progress
            strokeColor={renderColorProgress(p)}
            percent={p}
            showInfo={false}
            size={["100%", 12]}
          />
          <h4 className="text-base font-medium" style={{ color: renderColorProgress(p) }}>
            {p}%
          </h4>
        </div>
      );
    },
    width: "15%",
  },
  {
    title: "Project Type",
    dataIndex: "projectType",
    key: "projectType",
    render: (value, record) => {
      const list = Array.isArray(record.projectType) ? record.projectType : [];
      return (
        <ul className="list-disc ps-4">
          {list.map((type, index) => (
            <li key={index}>
              <p>{type}</p>
            </li>
          ))}
        </ul>
      );
    },
  },
  {
    title: "Company Product",
    dataIndex: "company_product",
    key: "company_product",
    render: (value, record) => (
      <p className="text-sm font-normal text-[#383F50]">{record.company_product || "-"}</p>
    ),
  },
  {
    title: "Due Date",
    dataIndex: "dueDate",
    key: "dueDate",
    render: (value, record) => (
      <p className="text-sm font-normal text-[#383F50]">{record.dueDate}</p>
    ),
  },
];

// columns (mobile)
const mobileColomnsProject = [
  {
    title: "Projects Name",
    dataIndex: "projectName",
    key: "projectName",
    colSpan: 2,
    align: "left",
    render: (value, record, index) => {
      return (
        <div className="flex gap-5" key={index}>
          <div
            className="w-2 rounded-full flex-none"
            style={{ backgroundColor: record.priority }}
          />
          <div className="flex-1">
            <div className="flex flex-col gap-2">
              <Link href={getProjectLink(record)}>
                <h3 className="text-sm lg:text-base font-medium text-[#383F50]">
                  {record.name}
                </h3>
              </Link>
              <RenderTagsType type={record.type} />
            </div>
          </div>
        </div>
      );
    },
  },
];

const ExpandTable = ({ record }) => {
  const list = Array.isArray(record.members) ? record.members : [];
  const p = Number(record.progress) || 0;

  return (
    <ul className="flex flex-col gap-4">
      <li>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold mb-2">Progress</h3>
          <h4 className="text-base font-medium" style={{ color: renderColorProgress(p) }}>
            {p}%
          </h4>
        </div>
        <Progress strokeColor={renderColorProgress(p)} percent={p} showInfo={false} size={["100%", 12]} />
      </li>

      <li>
        <h3 className="text-sm font-semibold mb-2">Team Members</h3>
        <Avatar.Group max={{ count: 3 }}>
          {list.map((m, i) => {
            const title = `${m.fullname ?? ""}`.trim() || "Member";
            const { src, text } = getAvatar({
              profile_pic: m.profile_pic,
              fullname: m.fullname,
            });
            return (
              <Tooltip title={title} placement="bottom" key={m.user_id ?? i}>
                <Avatar size="default" src={src}>
                  {!src ? text : null}
                </Avatar>
              </Tooltip>
            );
          })}
        </Avatar.Group>
      </li>

      <li>
        <h3 className="text-sm font-semibold mb-2">Project Type</h3>
        <ul className="list-disc ps-4">
          {(Array.isArray(record.projectType) ? record.projectType : []).map((type, index) => (
            <li key={index}>
              <p>{type}</p>
            </li>
          ))}
        </ul>
      </li>

      <li>
        <h3 className="text-sm font-semibold mb-2">Company Product</h3>
        <p className="text-sm font-normal text-[#383F50]">{record.company_product || "-"}</p>
      </li>

      <li>
        <h3 className="text-sm font-semibold mb-2">Due Date</h3>
        <p className="text-sm font-normal text-[#383F50]">{record.dueDate}</p>
      </li>
    </ul>
  );
};

export default function TableProject({ dataProject = [] }) {
  const isMobile = useMobileQuery();

  const [columns, setColumns] = useState([]);
  const [expandable, setExpandable] = useState(null);

  useEffect(() => {
    setColumns(isMobile ? mobileColomnsProject : colomnsProject);
    setExpandable(
      isMobile
        ? { expandedRowRender: (record) => <ExpandTable record={record} /> }
        : null
    );
  }, [isMobile]);

  return (
    <Table
      dataSource={dataProject}
      columns={columns}
      scroll={isMobile ? null : { x: "max-content" }}
      pagination={false}
      expandable={expandable}
      rowKey={(r) => r.project_id ?? r.projectId ?? r.id ?? r.key}
    />
  );
}
