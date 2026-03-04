// src/components/task/subtask/attachment/AttachmentActionsBar.jsx
"use client";

import Image from "next/image";
import { Dropdown, Popconfirm, Tooltip, Upload, Button } from "antd";
import { asset } from "@/utils/url";

export default function AttachmentActionsBar({
    isImage,
    hrefView,
    hrefOriginal,
    onOpenImage,       // () => void
    onHistory,         // () => void (placeholder, kalau nanti ada drawer/history view)
    onComment,         // () => void
    onUploadRevision,  // (fileInfo) => void
    onDelete,          // () => void
}) {
    const canView = !!(isImage ? hrefView : hrefOriginal);

    return (
        <>
            {/* View */}
            {canView ? (
                isImage ? (
                    <button type="button" onClick={onOpenImage} aria-label="View">
                        <Image
                            src="/static/images/icon/pan_zoom.png"
                            width={50}
                            height={50}
                            alt="View"
                            className="w-5"
                        />
                    </button>
                ) : (
                    <a href={hrefOriginal} target="_self" rel="noopener noreferrer">
                        <Image
                            src="/static/images/icon/pan_zoom.png"
                            width={50}
                            height={50}
                            alt="View"
                            className="w-5"
                        />
                    </a>
                )
            ) : (
                <span className="opacity-50 cursor-not-allowed">
                    <Image
                        src="/static/images/icon/pan_zoom.png"
                        width={50}
                        height={50}
                        alt="View"
                        className="w-5"
                    />
                </span>
            )}

            {/* History (ikon saja, aksi opsional) */}
            <Tooltip title="History" placement="bottom">
                <button type="button" className="hover" onClick={onHistory}>
                    <Image
                        src={asset("static/images/icon/history.png")}
                        width={50}
                        height={50}
                        alt=""
                        className="w-5"
                    />
                </button>
            </Tooltip>

            {/* Menu lain: Comment / Upload Revision / Download / Delete */}
            <Dropdown
                menu={{
                    items: [
                        {
                            key: "comment-file",
                            label: (
                                <button type="button" className="text-left w-full px-2 py-1" onClick={onComment}>
                                    Comment
                                </button>
                            ),
                        },
                        {
                            key: "upload-revision",
                            label: (
                                <Upload
                                    className="text-left w-full block"
                                    showUploadList={false}
                                    onChange={(fileInfo) => onUploadRevision?.(fileInfo)}
                                >
                                    <Button type="text" className="w-full text-left px-2 py-1">
                                        Upload
                                    </Button>
                                </Upload>
                            ),
                        },
                        {
                            key: "download",
                            label: hrefOriginal ? (
                                <a
                                    href={hrefOriginal}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-left w-full block px-2 py-1"
                                >
                                    Download
                                </a>
                            ) : (
                                <span className="text-gray-400 cursor-not-allowed block px-2 py-1">
                                    Download
                                </span>
                            ),
                        },
                        {
                            key: "delete",
                            label: (
                                <Popconfirm
                                    title="Delete attachment"
                                    description="Are you sure to delete this attachment?"
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
            >
                <button type="button" className="hover">
                    <Image
                        src="/static/images/icon/dot-3.png"
                        width={50}
                        height={50}
                        alt=""
                        className="w-6"
                    />
                </button>
            </Dropdown>
        </>
    );
}
