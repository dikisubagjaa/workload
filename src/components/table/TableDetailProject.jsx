// src/components/table/TableDetailProject.jsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Avatar, Progress, Table, Tooltip } from "antd";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { setTaskFocusItem } from "@/utils/focusItemStore";

const colorMap = {
    low: "#EC221F",
    medium: "#E8B931",
    high: "#14AE5C",
};

const renderColorProgress = (progress) => {
    const range = progress < 31 ? "low" : progress < 70 ? "medium" : "high";
    return colorMap[range];
};

const clampProgress = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return 0;
    return Math.max(0, Math.min(100, Math.round(num)));
};

// format deadline dengan end_date unix time, tanpa 1970
const formatDeadline = ({ endDate, deadline }) => {
    if (endDate !== null && endDate !== undefined && endDate !== "") {
        const ts = Number(endDate);
        if (!Number.isNaN(ts) && ts > 0) {
            const d = dayjs.unix(ts);
            if (d.isValid() && d.year() !== 1970) {
                return d.format("DD MMM YYYY");
            }
        }
    }

    if (deadline) {
        const d = dayjs(deadline);
        if (d.isValid() && d.year() !== 1970) {
            return d.format("DD MMM YYYY");
        }
    }

    return "-";
};

const getTaskPriority = (priorityRaw) => {
    return priorityRaw || "Low";
};

// kolom desktop
const colomnProjectDetail = (onOpenTaskDetail) => [
    {
        title: "Task",
        dataIndex: "taskName",
        key: "taskName",
        render: (value, record, index) => {
            return (
                <div className="flex items-center gap-4">
                    <h3 className="text-sm font-medium fc-base">{index + 1}</h3>
                    <button className="text-left" onClick={() => onOpenTaskDetail(record)}>
                        <h4 className="text-sm font-medium fc-base">
                            {record.taskName}
                        </h4>
                    </button>
                </div>
            );
        },
    },
    {
        title: "Progress",
        dataIndex: "progress",
        key: "progress",
        width: "10%",
        render: (value, record) => {
            const pct = Number(record?.progress) || 0;
            return (
                <Progress
                    strokeColor={renderColorProgress(pct)}
                    percent={pct}
                    showInfo={false}
                    size={["100%", 10]}
                />
            );
        },
    },
    {
        title: "Team Members",
        dataIndex: "members",
        key: "members",
        width: "15%",
        render: (value, record) => {
            const list = Array.isArray(record?.members) ? record.members : [];
            return list.length ? (
                <Avatar.Group max={{ count: 3 }}>
                    {list.map((member, idx) => {
                        const name =
                            member?.fullname || member?.name || `Member ${idx + 1}`;
                        const avatar = member?.profile_pic || member?.avatar || "";
                        return (
                            <Tooltip
                                title={name}
                                placement="bottom"
                                key={member?.user_id ?? idx}
                            >
                                <Avatar
                                    size="default"
                                    src={avatar || undefined}
                                    alt={name}
                                >
                                    {!avatar ? name.slice(0, 1).toUpperCase() : null}
                                </Avatar>
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
        title: "Dead Line",
        dataIndex: "deadLine",
        key: "deadLine",
        render: (value, record) => {
            return (
                <div className="flex items-center gap-1">
                    <Image
                        src="/static/images/icon/clock-alarm.png"
                        width={50}
                        height={50}
                        alt=""
                        className="w-5"
                    />
                    <h3 className="text-sm fc-base">{record.deadLine ?? "-"}</h3>
                </div>
            );
        },
    },
    {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
        render: (value, record) => {
            return (
                <span className="text-sm fc-base">
                    {record.priority ?? "-"}
                </span>
            );
        },
    },
];

// kolom mobile
const mobileColomnProjectDetail = (onOpenTaskDetail) => [
    {
        title: "Task",
        dataIndex: "taskName",
        key: "taskName",
        render: (value, record, index) => {
            return (
                <div className="flex items-center gap-4">
                    <h3 className="text-sm font-medium fc-base">{index + 1}</h3>
                    <button className="text-left" onClick={() => onOpenTaskDetail(record)}>
                        <h4 className="text-sm font-medium fc-base">
                            {record.taskName}
                        </h4>
                    </button>
                </div>
            );
        },
    },
];

// Expand mobile
const ExpandTable = ({ record }) => {
    const pct = Number(record?.progress) || 0;
    const members = Array.isArray(record?.members) ? record.members : [];
    return (
        <ul className="flex flex-col gap-4">
            <li>
                <Progress
                    strokeColor={renderColorProgress(pct)}
                    percent={pct}
                    showInfo={false}
                    size={["100%", 10]}
                />
            </li>

            <li>
                {members.length ? (
                    <Avatar.Group max={{ count: 3 }}>
                        {members.map((member, idx) => {
                            const name =
                                member?.fullname || member?.name || `Member ${idx + 1}`;
                            const avatar = member?.profile_pic || member?.avatar || "";
                            return (
                                <Tooltip
                                    title={name}
                                    placement="bottom"
                                    key={member?.user_id ?? idx}
                                >
                                    <Avatar
                                        size="default"
                                        src={avatar || undefined}
                                        alt={name}
                                    >
                                        {!avatar ? name.slice(0, 1).toUpperCase() : null}
                                    </Avatar>
                                </Tooltip>
                            );
                        })}
                    </Avatar.Group>
                ) : (
                    <span className="text-xs text-[#98A2B3]">-</span>
                )}
            </li>

            <li>
                <div className="flex items-center gap-1">
                    <Image
                        src="/static/images/icon/clock-alarm.png"
                        width={50}
                        height={50}
                        alt=""
                        className="w-5"
                    />
                    <h3 className="text-sm fc-base">{record.deadLine ?? "-"}</h3>
                </div>
            </li>

            <li>
                <span className="text-sm fc-base">
                    Priority: {record.priority ?? "-"}
                </span>
            </li>
        </ul>
    );
};

export default function TableDetailProject({ statusGroup }) {
    const isMobile = useMobileQuery();
    const { projectId } = useParams() || {};
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);

    const handleOpenTaskDetail = (record) => {
        const directTaskId = Number(record?.taskId || 0);
        const parentId = Number(record?.parentId || 0);
        const childTaskId = directTaskId || Number(record?.rawTask?.task_id || record?.rawTask?.taskId || 0);
        if (!childTaskId) return;

        let targetTaskId = childTaskId;
        if (parentId > 0) {
            setTaskFocusItem(parentId, childTaskId);
            targetTaskId = parentId;
        }

        const currentQs = searchParams?.toString() || "";
        const returnTo = `${pathname}${currentQs ? `?${currentQs}` : ""}`;
        router.push(
            `/task/create?task=${encodeURIComponent(String(targetTaskId))}&returnTo=${encodeURIComponent(returnTo)}`
        );
    };

    useEffect(() => {
        let aborted = false;

        async function load() {
            if (!projectId) return;

            setLoading(true);
            try {
                let dataTask = [];

                const res = await fetch(
                    `/api/project/${projectId}/task`,
                    { cache: "no-store" }
                );
                const json = await res.json().catch(() => ({}));
                if (res.ok) {
                    // 🔹 singular: `task`
                    dataTask = json?.task || [];
                }

                if (!Array.isArray(dataTask)) dataTask = [];

                // Filter ongoing / completed
                let filtered = dataTask;

                if (statusGroup === "completed") {
                    filtered = dataTask.filter((t) => {
                        const total = Number(t.totalSubtask || 0);
                        const completed = Number(t.completedSubtask || 0);
                        return total > 0 && total === completed;
                    });
                } else if (statusGroup === "ongoing") {
                    filtered = dataTask.filter((t) => {
                        const total = Number(t.totalSubtask || 0);
                        const completed = Number(t.completedSubtask || 0);
                        if (total === 0) return true; // belum punya item → ongoing
                        return total > completed;
                    });
                }

                const mapped = (filtered || []).map((t, idx) => {
                    const progress = clampProgress(t.progress);
                    const members = Array.isArray(t.members) ? t.members : [];

                    const deadLine = formatDeadline({
                        endDate: t.endDate,
                        deadline: t.deadline,
                    });
                    const priority = getTaskPriority(t.priority);
                    const taskId = Number(t.task_id ?? t.taskId ?? 0) || null;
                    const parentId = Number(t.parent_id ?? t.parentId ?? 0) || null;

                    return {
                        key: String(t.task_id ?? t.taskId ?? idx),
                        taskId,
                        parentId,
                        taskName: t.title ?? "-",
                        progress,
                        members,
                        deadLine,
                        priority,
                        rawTask: t,
                    };
                });

                if (!aborted) setRows(mapped);
            } catch {
                if (!aborted) setRows([]);
            } finally {
                if (!aborted) setLoading(false);
            }
        }

        load();
        return () => {
            aborted = true;
        };
    }, [projectId, statusGroup]);

    return (
        <>
            <Table
                dataSource={rows}
                columns={
                    isMobile
                        ? mobileColomnProjectDetail(handleOpenTaskDetail)
                        : colomnProjectDetail(handleOpenTaskDetail)
                }
                scroll={isMobile ? null : { x: "max-content" }}
                pagination={false}
                showHeader={false}
                loading={loading}
                expandable={
                    isMobile
                        ? {
                            expandedRowRender: (record) => (
                                <ExpandTable record={record} />
                            ),
                        }
                        : null
                }
            />
        </>
    );
}
