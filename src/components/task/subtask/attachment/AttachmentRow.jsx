// src/components/task/subtask/attachment/AttachmentRow.jsx
"use client";

import { useEffect, useState } from "react";
import AttachmentThumb from "./AttachmentThumb";
import AttachmentHistoryList from "./AttachmentHistoryList";
import AttachmentActionsBar from "./AttachmentActionsBar";

export default function AttachmentRow({
    file,
    parentItemTitle,
    resolved,
    onOpenImage,
    onComment,
    onUploadRevision,
    onDownloadHref,
    onDelete,
    revisions = [],
    onPromoteStar,
    resolver,
    onOpenRevisionHref,
}) {
    const [showHistory, setShowHistory] = useState(false);
    const hasRevisions = revisions.length > 0;

    useEffect(() => {
        if (!hasRevisions && showHistory) setShowHistory(false);
    }, [hasRevisions, showHistory]);

    return (
        <li className="flex gap-4 border-b sm:border-0 pb-3 sm:pb-0">
            {/* Left: thumbnail */}
            <div className="flex-none hidden sm:block">
                <AttachmentThumb
                    isImage={resolved.isImage}
                    hrefView={resolved.hrefView}
                    hrefOriginal={resolved.hrefOriginal}
                    extension={resolved.extension}
                    displayName={resolved.displayName}
                    onOpenImage={onOpenImage}
                />
            </div>

            {/* Middle: info + history */}
            <div className="flex-1 me-auto">
                <h3 className="text-sm font-semibold fc-base">{resolved.displayName || `File`}</h3>
                <h4 className="text-xs text-gray-400">
                    Added just now by {file.user_payload?.fullname || "-"} for {parentItemTitle}
                </h4>

                {showHistory ? (
                    <AttachmentHistoryList
                        revisions={revisions}
                        resolver={resolver}
                        onPromoteStar={onPromoteStar}
                        onOpenRevisionHref={onOpenRevisionHref}
                    />
                ) : null}
            </div>

            {/* Right: actions */}
            <div className="flex-none">
                <div className="flex mb-auto gap-3">
                    <AttachmentActionsBar
                        isImage={resolved.isImage}
                        hrefView={resolved.hrefView}
                        hrefOriginal={resolved.hrefOriginal}
                        onOpenImage={onOpenImage}
                        onHistory={() => {
                            if (hasRevisions) setShowHistory((prev) => !prev);
                        }}
                        onComment={onComment}
                        onUploadRevision={onUploadRevision}
                        onDelete={onDelete}
                    // download handled via hrefOriginal anchor in menu
                    />
                </div>
            </div>
        </li>
    );
}
