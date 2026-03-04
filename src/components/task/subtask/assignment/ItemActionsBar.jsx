// src/components/task/subtask/assignment/ItemActionsBar.jsx
"use client";

import Image from "next/image";
import { Upload, Dropdown, Popconfirm, Tooltip, Button } from "antd";
import { asset } from "@/utils/url";

export default function ItemActionsBar({
    item,
    hasComment = false,
    dropdownOpen = false,
    onDropdownOpenChange,
    onUpload, // (fileInfo)
    onComment, // () => void
    onDelete, // () => void
}) {
    return (
        <>
            {/* Upload attachment (item-level) */}
            <Tooltip title="Attachment" placement="bottom" className="overlay-sub">
                <Upload
                    className="ms-auto"
                    showUploadList={false}
                    onChange={(fileInfo) => onUpload?.(fileInfo)}
                >
                    <button type="button" className="hover">
                        <Image
                            src={asset("static/images/icon/circle-attachment.png")}
                            width={100}
                            height={100}
                            className="w-7"
                            alt="attachment"
                        />
                    </button>
                </Upload>
            </Tooltip>

            {/* Toolbar item: Comment & Delete */}
            <Dropdown
                menu={{
                    items: [
                        {
                            key: "comment-item",
                            label: (
                                <button type="button" className="text-left w-full px-2 py-1" onClick={onComment}>
                                    Comment
                                    {hasComment ? <span className="ml-2 text-[10px] text-[#0FA3B1]">(commented)</span> : null}
                                </button>
                            ),
                        },
                        {
                            key: "delete",
                            label: (
                                <Popconfirm
                                    title="Delete the task item"
                                    description="Are you sure to delete this task item?"
                                    okText="Yes"
                                    cancelText="No"
                                    onConfirm={onDelete}
                                >
                                    <button type="button" className="text-red-500 text-left w-full px-2 py-1">
                                        Delete
                                    </button>
                                </Popconfirm>
                            ),
                        },
                    ],
                }}
                trigger={["click"]}
                placement="bottomRight"
                open={dropdownOpen}
                onOpenChange={(open) => onDropdownOpenChange?.(open)}
            >
                <button type="button" className="hover relative">
                    <Image
                        src={asset("static/images/icon/dot-3.png")}
                        width={100}
                        height={100}
                        className="w-6"
                        alt="more actions"
                    />
                    {hasComment ? (
                        <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-[#0FA3B1]" />
                    ) : null}
                </button>
            </Dropdown>
        </>
    );
}
