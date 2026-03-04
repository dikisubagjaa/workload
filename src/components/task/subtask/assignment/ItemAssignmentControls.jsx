// src/components/task/subtask/assignment/ItemAssignmentControls.jsx
"use client";

import Image from "next/image";
import dayjs from "dayjs";
import { Popover, Tooltip, DatePicker, Select, Avatar } from "antd";
import { asset } from "@/utils/url";
import { getInitials } from "@/utils/stringHelpers";

export default function ItemAssignmentControls({
    item,
    userOptions = [],
    loadingUsers = false,
    canManageAssignment = true,
    onFetchUsers, // () => void
    onChangeDueDate, // (dayjs)
    onChangeAssignees, // (userIds[])
}) {
    const assignedUsers = item?.AssignedUser || [];
    const assignedIds = item?.assign_to?.map((u) => u.user_id) || [];
    const toUserLabel = (u) => u?.fullname || u?.email || (u?.user_id ? `User #${u.user_id}` : "User");

    const dueDateText = item?.end_date ? dayjs.unix(item.end_date).format("ddd, D MMM YY") : "-";

    return (
        <>
            {/* Due date icon + text */}
            {canManageAssignment ? (
                <Tooltip title="Duedate" placement="bottom" className="overlay-sub">
                    <span className="inline-flex">
                        <Popover
                            content={
                                <DatePicker
                                    placeholder="Set Due Date"
                                    className="w-36"
                                    value={item?.end_date ? dayjs.unix(item.end_date) : null}
                                    onChange={(value) => onChangeDueDate?.(value)}
                                    showTime
                                />
                            }
                            trigger={"click"}
                            placement="bottom"
                        >
                            <button type="button" className="hover">
                                <Image
                                    src={asset("static/images/icon/circle-duedate.png")}
                                    width={100}
                                    height={100}
                                    className="w-7"
                                    alt="duedate"
                                />
                            </button>
                        </Popover>
                    </span>
                </Tooltip>
            ) : (
                <Tooltip title="Only HOD/creator can change timeline" placement="bottom" className="overlay-sub">
                    <span className="inline-flex opacity-60">
                        <Image
                            src={asset("static/images/icon/circle-duedate.png")}
                            width={100}
                            height={100}
                            className="w-7"
                            alt="duedate"
                        />
                    </span>
                </Tooltip>
            )}

            <div className="overlay-sub">
                <div className="flex items-center gap-2">
                    <span className="text-sm fc-base">{dueDateText}</span>
                </div>
            </div>

            {/* Assignees: kalau kosong → tombol pilih, kalau ada → Avatar.Group */}
            {!(assignedUsers && assignedUsers.length > 0) ? (
                <Tooltip title="Member" placement="bottom" className="overlay-sub">
                    {canManageAssignment ? (
                        <Popover
                            content={
                                <Select
                                    showSearch
                                    mode="multiple"
                                    placeholder="Assign Member"
                                    className="w-40"
                                    loading={loadingUsers}
                                    notFoundContent={loadingUsers ? null : "No Data"}
                                    optionFilterProp="label"
                                    filterOption={(input, option) =>
                                        String(option?.label || "")
                                            .toLowerCase()
                                            .includes(String(input || "").toLowerCase())
                                    }
                                    onDropdownVisibleChange={(open) => {
                                        if (open) onFetchUsers?.();
                                    }}
                                    onSearch={(keyword) => onFetchUsers?.(keyword)}
                                    value={assignedIds}
                                    onChange={(value) => onChangeAssignees?.(value)}
                                    options={userOptions.map((user) => ({
                                        label: toUserLabel(user),
                                        value: user.user_id,
                                    }))}
                                />
                            }
                            trigger={"click"}
                            placement="bottom"
                        >
                            <button type="button" className="hover">
                                <Image
                                    src={asset("static/images/icon/circle-member.png")}
                                    width={100}
                                    height={100}
                                    className="w-7"
                                    alt="member"
                                />
                            </button>
                        </Popover>
                    ) : (
                        <span className="inline-flex opacity-60" title="Only HOD/creator can change assignee">
                            <Image
                                src={asset("static/images/icon/circle-member.png")}
                                width={100}
                                height={100}
                                className="w-7"
                                alt="member"
                            />
                        </span>
                    )}
                </Tooltip>
            ) : (
                <Tooltip placement="bottom" title={assignedUsers.map((u) => u.fullname).join(", ")}>
                    <span className="inline-flex items-center">
                        <Avatar.Group max={{ count: 2 }}>
                            {assignedUsers.map((user) => (
                                <Avatar key={user.user_id} className="bg-blue text-xs" size={28}>
                                    {getInitials(user.fullname)}
                                </Avatar>
                            ))}
                        </Avatar.Group>
                    </span>
                </Tooltip>
            )}
        </>
    );
}
