// src/components/task/subtask/progress/SubtaskProgress.jsx
"use client";

import { Progress } from "antd";
import { renderColorProgress as defaultRenderColorProgress } from "../../../modal/ModalTask";

export default function SubtaskProgress({
    percent = 0,
    colorResolver = defaultRenderColorProgress,
}) {
    const pct = typeof percent === "number" ? percent : 0;
    return (
        <div className="flex items-center gap-3 mb-4">
            <h3 className="text-sm fc-base">{pct}%</h3>
            <Progress
                strokeColor={colorResolver(pct)}
                percent={pct}
                showInfo={false}
                size={["100%", 12]}
            />
        </div>
    );
}
