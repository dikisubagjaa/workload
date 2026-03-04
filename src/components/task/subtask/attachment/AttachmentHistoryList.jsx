// src/components/task/subtask/attachment/AttachmentHistoryList.jsx
"use client";

import Image from "next/image";
import { Tooltip } from "antd";

export default function AttachmentHistoryList({
    revisions = [],
    resolver, // (att) => { hrefView, hrefOriginal, isImage, extension, displayName }
    onPromoteStar, // (task_id, attachment_id)
    onOpenRevisionHref, // (href) => void
}) {
    if (!revisions.length) return null;

    return (
        <ul className="ps-2 text-gray-400 mt-1">
            {revisions.map((rev) => {
                const r = resolver?.(rev) || {};

                const clickRev = () => {
                    if (r.isImage && r.hrefView) onOpenRevisionHref?.(r.hrefView);
                };

                return (
                    <li key={rev.attachment_id} className="text-xs flex items-center gap-2 mb-1">
                        <Tooltip
                            title={rev.is_star === "true" ? "Default file" : "Set as default"}
                            placement="bottom"
                        >
                            <button
                                type="button"
                                className={`hover ${rev.is_star === "true" ? "opacity-100" : "opacity-40"}`}
                                onClick={() => onPromoteStar?.(rev.task_id, rev.attachment_id)}
                            >
                                <Image
                                    src="/static/images/icon/kid_star.png"
                                    width={30}
                                    height={30}
                                    alt=""
                                    className="w-3"
                                />
                            </button>
                        </Tooltip>

                        {r.isImage ? (
                            <button
                                type="button"
                                onClick={clickRev}
                                title={r.displayName}
                                className="truncate text-left"
                            >
                                {r.displayName}
                            </button>
                        ) : (
                            <a
                                href={r.hrefOriginal || undefined}
                                target="_self"
                                rel="noreferrer"
                                title={r.displayName}
                                className="truncate"
                            >
                                {r.displayName}
                            </a>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
