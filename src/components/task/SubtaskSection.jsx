// src/components/task/SubtaskSection.jsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import dayjs from "dayjs";
import { message } from "antd";
import { renderColorProgress } from "../modal/ModalTask";
import { getStorageUrl } from "@/utils/storageHelpers";

// PROGRESS
import NewSubtaskInput from "./subtask/progress/NewSubtaskInput";
import SubtaskHeader from "./subtask/progress/SubtaskHeader";
import SubtaskProgress from "./subtask/progress/SubtaskProgress";

// ASSIGNMENT
import ItemsList from "./subtask/assignment/ItemList";
import AddItemComposer from "./subtask/assignment/AddItemComposer";

// ATTACHMENT
import AttachmentsPanel from "./subtask/attachment/AttachmentsPanel";

export default function SubtaskSection({
    taskId,
    loadingUsers,
    listSubTask = [],
    listSubTaskItem = [],
    currentUserId = null,
    restrictToAssignedOnly = false,
    canManageAssignment = true,
    userOptions = [],
    fetchUsers,
    commentedItemIds,
    addSubTask,
    addSubTaskItem,
    updateTaskSubtaskItem,
    deleteTaskSubtaskItem,
    uploadSubtaskItemAttachment,
    onPromoteStar,
    deleteTaskAttachment,
    getFileDisplay, // tetap ada untuk kompatibilitas luar
    updateSubTask,
    deleteSubTask,
    focusItemId,
    onCommentAttachment,
    onCommentItem,
}) {
    // ========================
    // State kecil (header input + drafts add-item)
    // ========================
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
    const [itemAddSub, setItemAddSub] = useState([]);

    const handleAddSubTaskInput = async () => {
        const val = newSubtaskTitle.trim();
        if (!val) return message.warning("Please input the subtask title.");
        await addSubTask(val);
        setNewSubtaskTitle("");
    };

    const addDraft = () => setItemAddSub((prev) => [...prev, `Item ${prev.length + 1}`]);
    const removeDraft = (indexToRemove) =>
        setItemAddSub((prev) => prev.filter((_, i) => i !== indexToRemove));
    const submitDraft = async (tsId, title) => {
        if (!title) return message.warning("Please input the subtask item title.");
        await addSubTaskItem(tsId, title.trim());
    };

    // ========================
    // Expand/Collapse per-subtask (prune & auto-open yang baru)
    // ========================
    const [openSubtasks, setOpenSubtasks] = useState(() => new Set());
    const isOpen = (tsId) => openSubtasks.has(Number(tsId));
    const toggleSubtask = (tsId) => {
        setOpenSubtasks((prev) => {
            const next = new Set(prev);
            const key = Number(tsId);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const prevTsIdsRef = useRef(new Set());
    const hasInitRef = useRef(false);
    useEffect(() => {
        const currentIds = new Set((listSubTask || []).map((s) => Number(s.ts_id)));
        const wasInit = hasInitRef.current;
        const prevIds = prevTsIdsRef.current;

        const newIds = [];
        if (wasInit) {
            currentIds.forEach((id) => {
                if (!prevIds.has(id)) newIds.push(id);
            });
        }

        setOpenSubtasks((prev) => {
            const next = new Set();
            prev.forEach((id) => currentIds.has(id) && next.add(id));
            if (wasInit) newIds.forEach((id) => next.add(id));
            return next;
        });

        prevTsIdsRef.current = currentIds;
        hasInitRef.current = true;
    }, [listSubTask]);

    // ========================
    // Edit inline subtask title
    // ========================
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const startEdit = (tsId, currentTitle) => {
        setEditingId(String(tsId));
        setEditValue(currentTitle || "");
    };
    const cancelEdit = () => {
        setEditingId(null);
        setEditValue("");
    };
    const saveEdit = async (tsId) => {
        const val = (editValue || "").trim();
        if (!val) return message.warning("Title cannot be empty.");
        await updateSubTask(String(tsId), { title: val });
        setEditingId(null);
        setEditValue("");
    };

    // ========================
    // Grouping data
    // ========================
    const itemsByTsId = useMemo(() => {
        const map = new Map();
        (listSubTaskItem || []).forEach((it) => {
            const key = Number(it.ts_id);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(it);
        });
        return map;
    }, [listSubTaskItem]);

    const normalizedCurrentUserId = useMemo(() => {
        const n = Number(currentUserId);
        return Number.isFinite(n) && n > 0 ? n : null;
    }, [currentUserId]);

    const isAssignedToCurrentUser = useCallback(
        (item) => {
            if (!normalizedCurrentUserId) return false;

            const assignedUsers = Array.isArray(item?.AssignedUser) ? item.AssignedUser : [];
            if (assignedUsers.some((u) => Number(u?.user_id) === normalizedCurrentUserId)) {
                return true;
            }

            const assignTo = Array.isArray(item?.assign_to) ? item.assign_to : [];
            if (
                assignTo.some((u) => {
                    const uid = Number(u?.user_id ?? u?.id ?? u);
                    return Number.isFinite(uid) && uid === normalizedCurrentUserId;
                })
            ) {
                return true;
            }

            return false;
        },
        [normalizedCurrentUserId]
    );

    const assignedItemsByTsId = useMemo(() => {
        if (!restrictToAssignedOnly || !normalizedCurrentUserId) return itemsByTsId;
        const map = new Map();
        itemsByTsId.forEach((items, key) => {
            map.set(
                key,
                (items || []).filter((it) => isAssignedToCurrentUser(it))
            );
        });
        return map;
    }, [itemsByTsId, restrictToAssignedOnly, normalizedCurrentUserId, isAssignedToCurrentUser]);

    const visibleSubtasks = useMemo(() => {
        if (!restrictToAssignedOnly || !normalizedCurrentUserId) return listSubTask;
        return (listSubTask || []).filter((subtask) => {
            const tsIdNum = Number(subtask.ts_id);
            const items = assignedItemsByTsId.get(tsIdNum) || [];
            return items.length > 0;
        });
    }, [listSubTask, restrictToAssignedOnly, normalizedCurrentUserId, assignedItemsByTsId]);

    const visibleItemsByTsId = useMemo(() => {
        if (!restrictToAssignedOnly || !normalizedCurrentUserId) return itemsByTsId;
        const visibleSubtaskIds = new Set(visibleSubtasks.map((s) => Number(s.ts_id)));
        const map = new Map();
        itemsByTsId.forEach((items, key) => {
            if (visibleSubtaskIds.has(Number(key))) {
                map.set(key, items || []);
            } else {
                map.set(key, []);
            }
        });
        return map;
    }, [itemsByTsId, restrictToAssignedOnly, normalizedCurrentUserId, visibleSubtasks]);

    const attachmentsByTsId = useMemo(() => {
        const map = new Map();
        visibleItemsByTsId.forEach((items, key) => {
            map.set(key, items.flatMap((sti) => sti.Attachments || []));
        });
        return map;
    }, [visibleItemsByTsId]);

    // ========================
    // Attachment resolver (pakai getStorageUrl)
    // ========================
    const IMG_EXTS = useMemo(
        () => new Set(["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg", "tif", "tiff"]),
        []
    );
    const RASTER_RESIZEABLE = useMemo(() => new Set(["png", "jpg", "jpeg", "webp"]), []);
    const getExt = (name = "") => {
        const m = String(name).toLowerCase().match(/\.([a-z0-9]+)$/i);
        return m ? m[1] : "";
    };
    const getDisplayName = (att) => att?.real_filename || att?.filename || "file";

    const resolveAttachment = useCallback(
        (att = {}) => {
            const realName = String(att?.real_filename || "").trim();
            const storedName = String(att?.filename || "").trim();
            const baseForDetect = realName || storedName;

            const extLower = getExt(baseForDetect);
            const ext = (extLower || "file").toUpperCase();
            const isImage = baseForDetect ? IMG_EXTS.has(extLower) : false;

            let hrefOriginal = null;
            let hrefView = null;

            if (storedName) {
                hrefOriginal = getStorageUrl("task", storedName);
                if (isImage) {
                    hrefView = RASTER_RESIZEABLE.has(extLower)
                        ? getStorageUrl("task", storedName, { resized: true })
                        : hrefOriginal;
                } else {
                    hrefView = hrefOriginal;
                }
            }

            return {
                hrefView,
                hrefOriginal,
                isImage,
                extension: ext,
                displayName: getDisplayName(att),
            };
        },
        [IMG_EXTS, RASTER_RESIZEABLE]
    );

    // ========================
    // Fancybox Gallery (imperatif)
    // ========================
    const fbOptions = useMemo(
        () => ({
            Carousel: { infinite: false },
            autoFocus: false,
            trapFocus: false,
            placeFocusBack: false,
            dragToClose: false,
        }),
        []
    );

    const galleryItemsByTsId = useMemo(() => {
        const map = new Map();
        attachmentsByTsId.forEach((files, tsId) => {
            const items = [];
            (files || []).forEach((f) => {
                const r = resolveAttachment(f);
                if (r.isImage && r.hrefView) items.push({ src: r.hrefView, type: "image" });
                (f.revisionFiles || []).forEach((rev) => {
                    const rr = resolveAttachment(rev);
                    if (rr.isImage && rr.hrefView) items.push({ src: rr.hrefView, type: "image" });
                });
            });
            map.set(Number(tsId), items);
        });
        return map;
    }, [attachmentsByTsId, resolveAttachment]);

    const openGalleryAt = useCallback(
        async (tsId, startIndex) => {
            const items = galleryItemsByTsId.get(Number(tsId)) || [];
            if (!items.length || startIndex == null || startIndex < 0 || startIndex >= items.length) return;
            const mod = await import("@fancyapps/ui");
            mod.Fancybox.show(items, { ...fbOptions, startIndex });
        },
        [galleryItemsByTsId, fbOptions]
    );

    // ========================
    // Fokus & highlight item dari focusItemId
    // ========================
    const itemRefs = useRef(new Map()); // task_item_id -> element
    const [highlightedId, setHighlightedId] = useState(null);
    const registerRowRef = (taskItemId, el) => {
        if (el) itemRefs.current.set(String(taskItemId), el);
        else itemRefs.current.delete(String(taskItemId));
    };

    useEffect(() => {
        if (!focusItemId) return;
        const target = (listSubTaskItem || []).find((i) => String(i.task_id) === String(focusItemId));
        if (!target) return;

        // Saat deep-link dari daftar task: buka hanya subtask target, tutup yang lain.
        setOpenSubtasks(new Set([Number(target.ts_id)]));

        // highlight + scroll
        const doScroll = () => {
            const node = itemRefs.current.get(String(target.task_id));
            if (node && typeof node.scrollIntoView === "function") {
                node.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        };
        setHighlightedId(String(target.task_id));
        const t1 = setTimeout(() => setHighlightedId(null), 3500);
        const t2 = setTimeout(doScroll, 50);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [focusItemId, listSubTaskItem]);

    // ========================
    // Handlers untuk ItemsList (assignment)
    // ========================
    const handleChangeDueDate = (taskItemId, value) =>
        updateTaskSubtaskItem("end_date", value, taskItemId);

    const handleChangeAssignees = (taskItemId, ids) =>
        updateTaskSubtaskItem("assign_to", ids, taskItemId);

    const handleUploadItemAttachment = (taskItemId, fileInfo) =>
        uploadSubtaskItemAttachment(fileInfo, taskItemId, null);

    const handleDeleteItem = async (taskItemId) => {
        if (!taskItemId) return;
        if (typeof deleteTaskSubtaskItem !== "function") {
            message.error("Delete subtask item handler is unavailable.");
            return;
        }
        await deleteTaskSubtaskItem(taskItemId);
    };

    // ========================
    // Render
    // ========================
    return (
        <>
            {/* Header: tambah subtask */}
            {!restrictToAssignedOnly && (
                <NewSubtaskInput
                    value={newSubtaskTitle}
                    onChange={setNewSubtaskTitle}
                    onSubmit={handleAddSubTaskInput}
                />
            )}

            {/* List subtask */}
            {visibleSubtasks.map((subtask) => {
                const tsIdNum = Number(subtask.ts_id);
                const itemsForThisSubtask = visibleItemsByTsId.get(tsIdNum) || [];
                const attachmentsForThisSubtask = attachmentsByTsId.get(tsIdNum) || [];
                const isEditing = editingId === String(subtask.ts_id);

                return (
                    <div key={subtask.ts_id} className="mb-5">
                        {/* PROGRESS: header & progress bar */}
                        <SubtaskHeader
                            title={subtask.title}
                            isOpen={isOpen(subtask.ts_id)}
                            onToggle={() => toggleSubtask(subtask.ts_id)}
                            isEditing={isEditing}
                            editValue={editValue}
                            onEditChange={setEditValue}
                            onEditSave={() => saveEdit(subtask.ts_id)}
                            onEditCancel={cancelEdit}
                            onStartEdit={() => startEdit(subtask.ts_id, subtask.title)}
                            onDelete={() => deleteSubTask(subtask.ts_id)}
                        />

                        {isOpen(subtask.ts_id) && (
                            <div className="sm:ps-6">
                                <SubtaskProgress percent={0} colorResolver={renderColorProgress} />

                                {/* ASSIGNMENT: items list */}
                                <ItemsList
                                    tsId={tsIdNum}
                                    items={itemsForThisSubtask}
                                    highlightedId={highlightedId}
                                    onRowRef={registerRowRef}
                                    userOptions={userOptions}
                                    loadingUsers={loadingUsers}
                                    commentedItemIds={commentedItemIds}
                                    onFetchUsers={fetchUsers}
                                    onChangeDueDate={handleChangeDueDate}
                                    onChangeAssignees={handleChangeAssignees}
                                    canManageAssignment={canManageAssignment}
                                    onUploadAttachment={handleUploadItemAttachment}
                                    onCommentItem={onCommentItem}
                                    onDeleteItem={handleDeleteItem}
                                />

                                {/* Composer add item */}
                                {!restrictToAssignedOnly && (
                                    <AddItemComposer
                                        drafts={itemAddSub}
                                        onAddDraft={addDraft}
                                        onRemoveDraft={removeDraft}
                                        onSubmitDraft={(title) => submitDraft(subtask.ts_id, title)}
                                    />
                                )}

                                {/* ATTACHMENT: panel files */}
                                <AttachmentsPanel
                                    tsId={tsIdNum}
                                    attachments={attachmentsForThisSubtask}
                                    items={itemsForThisSubtask}
                                    resolver={resolveAttachment}
                                    gallery={{ itemsByTsId: galleryItemsByTsId, openAt: openGalleryAt }}
                                    onPromoteStar={onPromoteStar}
                                    onUploadRevision={(taskId, parentAttachmentId, fileInfo) =>
                                        uploadSubtaskItemAttachment(fileInfo, taskId, parentAttachmentId)
                                    }
                                    onCommentAttachment={onCommentAttachment}
                                    onDeleteAttachment={deleteTaskAttachment}
                                />
                            </div>
                        )}
                    </div>
                );
            })}

            {restrictToAssignedOnly && visibleSubtasks.length === 0 && (
                <div className="rounded-lg border border-dashed border-[#c7d9df] bg-[#f8fbfc] px-4 py-3 text-sm text-[#5d6b80]">
                    No task items are assigned to you in this task yet.
                </div>
            )}
        </>
    );
}
