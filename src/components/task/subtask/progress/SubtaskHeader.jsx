// src/components/task/subtask/progress/SubtaskHeader.jsx
"use client";

import Image from "next/image";
import { Input, Dropdown, Popconfirm, Button } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { asset } from "@/utils/url";

export default function SubtaskHeader({
    title,
    isOpen,
    onToggle,
    // editing flow dikendalikan container
    isEditing = false,
    editValue = "",
    onEditChange,
    onEditSave,
    onEditCancel,
    onStartEdit,
    onDelete,
}) {
    return (
        <div className="flex items-center gap-2 mb-5">
            {!isEditing ? (
                <button
                    type="button"
                    onClick={onToggle}
                    className="w-full gap-2 flex items-center rounded fc-blue hover:bg-gray-100"
                    aria-label={isOpen ? "Collapse" : "Expand"}
                >
                    {isOpen ? (
                        <FontAwesomeIcon icon={faChevronDown} />
                    ) : (
                        <FontAwesomeIcon icon={faChevronRight} />
                    )}
                    <Image
                        src={asset("static/images/icon/event_list.png")}
                        width={50}
                        height={50}
                        alt="Subtask Icon"
                        className="w-5 h-5"
                    />
                    <h3 className="text-base fc-blue">{title}</h3>
                </button>
            ) : (
                <div className="flex items-center gap-2">
                    <Input
                        size="small"
                        value={editValue}
                        onChange={(e) => onEditChange?.(e.target.value)}
                        onPressEnter={onEditSave}
                        style={{ width: 260 }}
                    />
                    <Button type="text" icon={<CheckOutlined />} onClick={onEditSave} />
                    <Button type="text" icon={<CloseOutlined />} onClick={onEditCancel} />
                </div>
            )}

            <div className="ms-auto">
                <Dropdown
                    trigger={["click"]}
                    placement="bottomRight"
                    menu={{
                        items: [
                            {
                                key: "edit",
                                label: (
                                    <button type="button" className="text-left w-full" onClick={onStartEdit}>
                                        Edit title
                                    </button>
                                ),
                            },
                            {
                                key: "delete",
                                label: (
                                    <Popconfirm
                                        title="Delete the subtask"
                                        description="Are you sure to delete this subtask and all its items?"
                                        okText="Yes"
                                        cancelText="No"
                                        onConfirm={onDelete}
                                    >
                                        <button type="button" className="text-left w-full text-red-600">
                                            Delete subtask
                                        </button>
                                    </Popconfirm>
                                ),
                            },
                        ],
                    }}
                >
                    <button type="button" className="hover">
                        <Image
                            src={asset("static/images/icon/dot-3.png")}
                            width={100}
                            height={100}
                            className="w-6"
                            alt="more actions"
                        />
                    </button>
                </Dropdown>
            </div>
        </div>
    );
}
