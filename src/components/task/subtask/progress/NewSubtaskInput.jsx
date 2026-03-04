// src/components/task/subtask/progress/NewSubtaskInput.jsx
"use client";

import Image from "next/image";
import { Input } from "antd";
import { asset } from "@/utils/url";

export default function NewSubtaskInput({
    value,
    onChange,
    onSubmit,
    placeholder = "Input subtask name",
}) {
    return (
        <div className="flex items-center gap-2 mb-5">
            <Image
                src={asset("static/images/icon/event_list.png")}
                width={50}
                height={50}
                alt="Subtask Icon"
                className="w-5 h-5"
            />
            <Input
                placeholder={placeholder}
                variant="underlined"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onPressEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSubmit?.();
                }}
                allowClear
            />
        </div>
    );
}
