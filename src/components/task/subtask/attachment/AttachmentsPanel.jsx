// src/components/task/subtask/attachment/AttachmentsPanel.jsx
"use client";

import { useMemo } from "react";
import AttachmentRow from "./AttachmentRow";

export default function AttachmentsPanel({
    tsId,
    attachments = [],
    items = [],
    resolver, // (att) => { hrefView, hrefOriginal, isImage, extension, displayName }
    gallery,  // { itemsByTsId: Map<number, {src}[]>, openAt: (tsId:number, index:number) => void }
    onPromoteStar, // (task_id, attachment_id)
    onUploadRevision, // (task_id, parent_attachment_id, fileInfo)
    onCommentAttachment, // (payload)
    onDeleteAttachment, // (task_id, attachment_id)
}) {
    const itemsByTaskId = useMemo(() => {
        const map = new Map();
        (items || []).forEach((it) => map.set(it.task_id, it));
        return map;
    }, [items]);

    const parentTitle = (task_id) => itemsByTaskId.get(task_id)?.title || "N/A";

    const openImageByHref = (href) => {
        const imgs = gallery?.itemsByTsId?.get(Number(tsId)) || [];
        const idx = imgs.findIndex((gi) => gi.src === href);
        if (idx >= 0) gallery?.openAt?.(Number(tsId), idx);
    };

    return (
        <div className="mb-8">
            <h3 className="text-base fc-blue mb-5">Attachments</h3>
            <h3 className="text-sm fc-base mb-4">Files</h3>

            <ul className="flex flex-col gap-5">
                {(attachments || []).map((file, i) => {
                    const resolved = resolver?.(file) || {};
                    return (
                        <AttachmentRow
                            key={file.attachment_id || i}
                            file={file}
                            parentItemTitle={parentTitle(file.task_id)}
                            resolved={resolved}
                            // actions
                            onOpenImage={() => resolved.isImage && resolved.hrefView && openImageByHref(resolved.hrefView)}
                            onComment={() =>
                                onCommentAttachment?.({
                                    attachment_id: file.attachment_id,
                                    task_id: file.task_id,
                                    real_filename: file.real_filename,
                                    filename: file.filename,
                                    filepath: resolved.hrefView || resolved.hrefOriginal || null,
                                    filetype: resolved.isImage ? "image/*" : "",
                                    _source: "subtask_attachment",
                                })
                            }
                            onUploadRevision={(fileInfo) => onUploadRevision?.(file.task_id, file.attachment_id, fileInfo)}
                            onDownloadHref={resolved.hrefOriginal}
                            onDelete={() => onDeleteAttachment?.(file.task_id, file.attachment_id)}
                            // revisions
                            revisions={file.revisionFiles || []}
                            onPromoteStar={onPromoteStar}
                            resolver={resolver}
                            onOpenRevisionHref={openImageByHref}
                        />
                    );
                })}
                {(!attachments || attachments.length === 0) && (
                    <li className="text-sm text-gray-500">No attachments found.</li>
                )}
            </ul>
        </div>
    );
}
