// src/components/task/subtask/assignment/ItemsList.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import ItemRow from "./ItemRow";
import ItemAssignmentControls from "./ItemAssignmentControls";
import ItemActionsBar from "./ItemActionsBar";

export default function ItemsList({
    tsId,
    items = [],
    highlightedId,
    onRowRef, // (task_item_id, el) => void
    // data & handlers untuk assignment
    userOptions = [],
    loadingUsers = false,
    commentedItemIds,
    onFetchUsers,
    onChangeDueDate, // (task_item_id, dayjs)
    onChangeAssignees, // (task_item_id, userIds[])
    canManageAssignment = true,
    // handlers untuk actions bar
    onUploadAttachment, // (task_item_id, fileInfo)
    onCommentItem, // ({ task_item_id, ts_id, title })
    onDeleteItem, // (task_item_id)
}) {
    const itemsForThisSubtask = useMemo(() => items || [], [items]);
    const [openActionItemId, setOpenActionItemId] = useState(null);

    useEffect(() => {
        if (!highlightedId) return;
        const exists = itemsForThisSubtask.some(
            (it) => String(it?.task_id) === String(highlightedId)
        );
        if (exists) {
            setOpenActionItemId(String(highlightedId));
        }
    }, [highlightedId, itemsForThisSubtask]);

    return (
        <ul className="list-subtask mb-4">
            {/* Dummy row (dipertahankan sebagai contoh visual) */}
            {/* Kalau kamu nggak perlu dummy, hapus saja blok ini di container saat render */}
            {/* <ItemRow ... /> */}

            {itemsForThisSubtask.map((item) => {
                const highlighted = String(item.task_id) === String(highlightedId);
                const hasComment = commentedItemIds instanceof Set
                    ? commentedItemIds.has(Number(item.task_id))
                    : false;
                const isActionOpen = String(openActionItemId) === String(item.task_id);

                return (
                    <ItemRow
                        key={item.task_id}
                        item={item}
                        highlighted={highlighted}
                        rowRef={(el) => onRowRef?.(String(item.task_id), el)}
                        // Kanan: meta (due date & assignees) + actions
                        rightSlot={
                            <>
                                <ItemAssignmentControls
                                    item={item}
                                    userOptions={userOptions}
                                    loadingUsers={loadingUsers}
                                    canManageAssignment={canManageAssignment}
                                    onFetchUsers={onFetchUsers}
                                    onChangeDueDate={(d) => onChangeDueDate?.(item.task_id, d)}
                                    onChangeAssignees={(ids) => onChangeAssignees?.(item.task_id, ids)}
                                />
                                <ItemActionsBar
                                    item={item}
                                    hasComment={hasComment}
                                    dropdownOpen={isActionOpen}
                                    onDropdownOpenChange={(open) =>
                                        setOpenActionItemId(open ? String(item.task_id) : null)
                                    }
                                    onUpload={(f) => onUploadAttachment?.(item.task_id, f)}
                                    onComment={() =>
                                        onCommentItem?.({
                                            task_item_id: item.task_id,
                                            ts_id: item.ts_id,
                                            title: item.title,
                                        })
                                    }
                                    onDelete={() => onDeleteItem?.(item.task_id)}
                                />
                            </>
                        }
                    />
                );
            })}
        </ul>
    );
}
