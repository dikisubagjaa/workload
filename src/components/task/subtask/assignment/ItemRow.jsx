// src/components/task/subtask/assignment/ItemRow.jsx
"use client";

import Image from "next/image";
import dayjs from "dayjs";
import { Popover, Tooltip, Avatar } from "antd";
import { getInitials } from "@/utils/stringHelpers";
import { asset } from "@/utils/url";

export default function ItemRow({
    item,
    highlighted = false,
    rowRef, // forward ref dari container untuk scrollIntoView
    rightSlot, // ReactNode: meta + actions (assignment & actions bar)
}) {
    return (
        <li
            ref={rowRef}
            className="item gap-3"
            style={
                highlighted
                    ? {
                        background: "#E6F7FA",
                        boxShadow: "0 0 0 2px #0FA3B1 inset",
                        borderRadius: 8,
                        transition: "background .3s ease",
                    }
                    : undefined
            }
        >
            {/* Status bullet kiri (pakai item.todo di popover biar konsisten) */}
            <div className="flex-none">
                <Popover content={<h3 className="text-xs">{item?.todo}</h3>} placement="bottom">
                    <i className="i-ball white"></i>
                </Popover>
            </div>

            {/* Tengah: title; desktop plain, mobile pakai popover quick actions */}
            <div className="flex-1">
                {/* Desktop */}
                <div className="hidden sm:block ">
                    <p className="text-sm fc-base">{item?.title}</p>
                </div>

                {/* Mobile: quick menu (due date, assignees, upload) via Popover —
            biar ringan, kita tampilkan info ringkas di dalam */}
                <div className="block sm:hidden">
                    <Popover
                        content={
                            <ul className="flex flex-col gap-2 w-44">
                                <li className="text-xs text-gray-400">
                                    {item?.end_date ? dayjs.unix(item.end_date).format("ddd, D MMM YY") : "No due date"}
                                </li>
                                <li className="flex -space-x-2">
                                    {(item?.AssignedUser || []).slice(0, 3).map((u) => (
                                        <Avatar key={u.user_id} className="bg-blue text-xs" size={24}>
                                            {getInitials(u.fullname)}
                                        </Avatar>
                                    ))}
                                    {(item?.AssignedUser?.length || 0) > 3 && (
                                        <Avatar size={24}>+{item.AssignedUser.length - 3}</Avatar>
                                    )}
                                </li>
                            </ul>
                        }
                        trigger={"click"}
                        placement="bottomLeft"
                    >
                        <p className="text-sm fc-base">{item?.title}</p>
                    </Popover>
                </div>
            </div>

            {/* Kanan: meta + actions (di-injeksi dari parent) */}
            <div className="flex-none">
                <div className="ms-auto flex items-center gap-2">{rightSlot}</div>
            </div>
        </li>
    );
}
