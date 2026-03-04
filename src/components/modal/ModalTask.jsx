// src/components/modal/ModalTask.jsx
"use client";

import Image from 'next/image';
import { Form, Input, Modal, Button, Spin, Select, message } from 'antd';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { LoadingOutlined } from '@ant-design/icons';

import TaskDetailForm from '../task/TaskDetailForm';
import TaskDescription from '../task/TaskDescription';
import TaskAttachments from '../task/TaskAttachments';
import SubtaskSection from '../task/SubtaskSection';
import TaskSidebar from '../task/TaskSidebar';
import TaskActivity from '../task/TaskActivity';

import { useSession } from "next-auth/react";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

import axiosInstance from "@/utils/axios";
import { convertCamelToSnake } from "@/utils/stringHelpers";
import { getStorageUrl } from "@/utils/storageHelpers";
import { fetchUsers as fetchUsersList } from "@/utils/userHelpers";
import { buildModalSearch, closeEntityModal } from "@/utils/url";

// Tahap 2: util fokus item (sessionStorage)
import { consumeTaskFocusItem } from '@/utils/focusItemStore';
import { asset } from '@/utils/url';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

const colorMap = { low: '#EC221F', medium: '#E8B931', high: '#0FA3B1' };
const IMG_EXTS = new Set(["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg", "tif", "tiff"]);
const isTrueFlag = (value) => value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true";

const toUnixSec = (value) => {
    if (value == null || value === '') return null;
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value > 1e12 ? Math.floor(value / 1000) : Math.floor(value);
    }
    const str = String(value).trim();
    if (!str) return null;
    const num = Number(str);
    if (Number.isFinite(num)) return num > 1e12 ? Math.floor(num / 1000) : Math.floor(num);
    const parsed = dayjs(str);
    return parsed.isValid() ? parsed.unix() : null;
};

export const renderColorProgress = (progress) => {
    const range = progress < 31 ? 'low' : (progress < 60 ? 'medium' : 'high');
    return colorMap[range];
};

export default function ModalTask({ modalTask, onCancel, initialProjectId = null, mode = "modal" }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const modul = searchParams.get('modul');
    const openmodal = searchParams.get('openmodal');
    const taskId = searchParams.get('task'); // string saat edit, null saat create
    const projectIdFromQuery = searchParams.get('project');
    const legacyFocusItem = searchParams.get('item'); // legacy param (akan dibersihkan)

    const { data: session } = useSession();
    const currentUserFrontend = session?.user;

    const activityRef = useRef(null);
    const [form] = Form.useForm();

    const [taskData, setTaskData] = useState(null);
    const [projectOptions, setProjectOptions] = useState([]);
    const [quotationOptions, setQuotationOptions] = useState([]);
    const [poOptions, setPoOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [listTaskAttachment, setListTaskAttachment] = useState([]);
    const [listSubTask, setListSubTask] = useState([]);
    const [listSubTaskItem, setListSubTaskItem] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingQuotations, setLoadingQuotations] = useState(false);
    const [loadingPOs, setLoadingPOs] = useState(false);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [activityLog, setActivityLog] = useState([]);
    const [loadingActivity, setLoadingActivity] = useState(false);

    const handleApiError = useCallback((error, action) => {
        console.error(`Error ${action}:`, error.response || error.request || error.message);
        message.error(`${action} failed: ${error.response?.data?.msg || error.message || 'Unknown error'}`);
    }, []);

    const fetchData = useCallback(async (apiCall, setter, errorMessage, setLoadingState = null) => {
        if (setLoadingState) setLoadingState(true);
        try {
            const response = await apiCall();
            if (response.status === 200 || response.status === 201) {
                if (response.data) {
                    setter(response.data);
                }
                return response.data;
            }
            console.error(`Failed with status: ${response.status}`, response.data);
            message.error(`${errorMessage} Failed with status: ${response.status}`);
        } catch (error) {
            handleApiError(error, errorMessage);
        } finally {
            if (setLoadingState) setLoadingState(false);
        }
        return null;
    }, [handleApiError]);

    const fetchDetailTask = useCallback(async () => {
        if (!taskId) return;
        setLoadingData(true);
        try {
            const response = await axiosInstance.get(`/task/${taskId}`);
            if (response.status === 200 || response.status === 201) {
                const task = response.data?.detailTask;
                setTaskData(task);
                setProjectOptions(response.data?.project || []);
                setQuotationOptions(response.data?.quotation || []);
                setPoOptions(response.data?.po || []);
                setListSubTask(task?.SubTasks || []);
                setListSubTaskItem(task?.SubtaskItems || []);
                setListTaskAttachment(response.data?.taskAttachment || []);

                form.setFieldsValue({
                    title: task?.title,
                    description: task?.description,
                    projectId: task?.project_id,
                    pq_id: task?.pq_id,
                    po_id: task?.po_id,
                    startDate: task?.start_date ? dayjs.unix(task.start_date) : null,
                    endDate: task?.end_date ? dayjs.unix(task.end_date) : null,
                    allottedTime: task?.allotted_time ? dayjs(task.allotted_time, 'HH:mm:ss') : null,
                });
            } else {
                console.error("Failed to fetch task detail with status:", response.status);
                message.error("Failed to load task details.");
            }
        } catch (error) {
            handleApiError(error, "fetching task detail");
        } finally {
            setLoadingData(false);
        }
    }, [taskId, handleApiError, form]);

    const fetchActivityLog = useCallback(async () => {
        if (!taskId) return;
        setLoadingActivity(true);
        try {
            const commentsResponse = await axiosInstance.get(`/task/${taskId}/comment`);
            const comments = commentsResponse.data?.comments.map(c => ({
                comment_id: c.comment_id,
                type: c.type || 'comment',
                creator: c.creator,
                mentioned: c.mentioned,
                content: c.comment,
                created: toUnixSec(c.created ?? c.created_at ?? c.createdAt),
                comment_for: c.comment_for,
                mentioned_user_ids: c.mentioned_user_ids,
                filename: c.filename,
                task_title: taskData?.title,
            })) || [];

            const uploadsAsActivities = listTaskAttachment.map(att => ({
                id: `upload-${att.attachment_id}`,
                type: 'upload',
                user: att.created_by,
                real_filename: att.real_filename,
                created: toUnixSec(att.created ?? att.created_at ?? att.createdAt),
                task_title: taskData?.title,
            }));

            const allActivities = [...comments, ...uploadsAsActivities].sort((a, b) => (b.created || 0) - (a.created || 0));
            setActivityLog(allActivities || []);
        } catch (error) {
            setLoadingActivity(false);
            handleApiError(error, "Failed to fetch activity log.");
        } finally {
            setLoadingActivity(false);
        }
    }, [taskId, handleApiError, taskData?.title, listTaskAttachment]);

    const getExt = (name = "") => {
        const m = String(name).toLowerCase().match(/\.([a-z0-9]+)$/i);
        return m ? m[1] : "";
    };
    const stripExt = (name = "") => String(name).replace(/\.[^.]+$/, "");

    const getFileDisplay = useCallback((arg1, arg2) => {
        let att;
        if (arg1 && typeof arg1 === "object" && !arg2) {
            att = arg1;
        } else {
            att = { filepath: arg1, filetype: arg2 };
        }

        const realName = String(att?.real_filename || "").trim();
        const storedName = String(att?.filename || "").trim();
        const baseNameForDetect = realName || storedName;
        const ext = (getExt(baseNameForDetect) || (att?.filetype?.split("/")?.pop?.() || "file")).toUpperCase();

        const isImage = baseNameForDetect
            ? IMG_EXTS.has(getExt(baseNameForDetect).toLowerCase())
            : (att?.filetype ? String(att.filetype).startsWith("image/") : false);

        let href = null;
        if (storedName) {
            if (isImage) {
                const base = stripExt(storedName);
                href = getStorageUrl(`storage/task/resized/${base}.webp`);
            } else {
                href = getStorageUrl(`storage/task/${storedName}`);
            }
        } else if (att?.filepath) {
            href = getStorageUrl(att.filepath);
        }

        return {
            isImage,
            extension: ext,
            filepath: href,
        };
    }, []);

    const fetchDepartment = useCallback(async () => {
        await fetchData(
            () => axiosInstance.get(`/department`),
            (data) => {
                const options = (data.departments || []).map(d => ({
                    value: d.department_id,
                    label: d.title,
                }));
                setDepartmentOptions(options);
            },
            "Failed to fetch departments.",
            setLoadingDepartments
        );
    }, [fetchData]);

    const fetchUsers = useCallback(async (keyword = "") => {
        setLoadingUsers(true);
        try {
            const list = await fetchUsersList({ q: keyword || undefined, limit: 200 });
            setUserOptions(list || []);
        } catch (e) {
            setUserOptions([]);
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    const fetchQuotation = useCallback(async (projectId) => {
        if (!projectId) { setQuotationOptions([]); setPoOptions([]); return; }
        await fetchData(
            () => axiosInstance.get(`/project/${projectId}/quotation`),
            (data) => {
                setQuotationOptions(data.data || []);
            },
            "Failed to fetch quotations.",
            setLoadingQuotations
        );
    }, [fetchData]);

    const fetchPo = useCallback(async (qtId) => {
        if (!qtId) { setPoOptions([]); return; }
        await fetchData(
            () => axiosInstance.get(`/project/${form.getFieldValue('projectId')}/quotation/${qtId}/po`),
            (data) => {
                setPoOptions(data.poDoc || []);
            },
            "Failed to fetch PO numbers.",
            setLoadingPOs,
        );
    }, [fetchData, form]);

    const fetchProject = useCallback(async () => {
        await fetchData(
            () => axiosInstance.get(`/project`),
            (data) => {
                setProjectOptions(data.data || []);
            },
            "Failed to fetch projects.",
            setLoadingProjects,
        );
    }, [fetchData]);

    useEffect(() => {
        if (taskId) {
            fetchDetailTask();
            fetchActivityLog();
        }
        // Intentionally only runs when taskId changes to avoid refetch loops
        // caused by fetchActivityLog dependencies updating state.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskId]);

    const getDepartmentLabel = useCallback((id) => {
        const num = Number(id);
        const opts = Array.isArray(departmentOptions) ? departmentOptions : [];
        const found = opts.find(
            o => Number(o?.value) === num || Number(o?.department_id) === num
        );
        return found?.label || found?.title || String(num);
    }, [departmentOptions]);

    const [loadingMutation, setLoadingMutation] = useState(false);
    const activeUploads = useRef(new Set());

    const handleMutationError = useCallback((error, action) => {
        console.error(`Error ${action}:`, error.response || error.request || error.message);
        message.error(`${action} failed: ${error.response?.data?.msg || error.message || 'Unknown error'}`);
    }, []);

    const updateSubTask = useCallback(async (tsId, updates) => {
        setLoadingMutation(true);
        try {
            const body = { title: updates?.title };
            const response = await axiosInstance.put(`/task/${taskId}/subtask/${tsId}`, body);

            if (response.status === 200) {
                const updated = response.data?.subTask;
                if (setListSubTask && updated) {
                    setListSubTask(prev => prev.map(s => Number(s.ts_id) === Number(tsId) ? { ...s, ...updated } : s));
                }
                message.success("Subtask updated successfully!");
            } else {
                message.error("Failed to update subtask with status: " + response.status);
            }
        } catch (error) {
            handleMutationError(error, "Update subtask");
        } finally {
            setLoadingMutation(false);
        }
    }, [taskId, handleMutationError, setListSubTask]);

    const deleteSubTask = useCallback(async (tsId) => {
        setLoadingMutation(true);
        try {
            const response = await axiosInstance.delete(`/task/${taskId}/subtask/${tsId}`);
            if (response.status === 200) {
                if (setListSubTask) {
                    setListSubTask(prev => prev.filter(s => Number(s.ts_id) !== Number(tsId)));
                }
                if (setListSubTaskItem) {
                    setListSubTaskItem(prev => prev.filter(i => Number(i.ts_id) !== Number(tsId)));
                }
                message.success("Subtask deleted.");
            } else {
                message.error("Failed to delete subtask with status: " + response.status);
            }
        } catch (error) {
            handleMutationError(error, "Delete subtask");
        } finally {
            setLoadingMutation(false);
        }
    }, [taskId, handleMutationError, setListSubTask, setListSubTaskItem]);

    const saveTask = useCallback(async (values) => {
        setLoadingMutation(true);
        try {
            const payload = convertCamelToSnake(values);

            if (payload.start_date) {
                const startDateDayjs = dayjs(payload.start_date);
                payload.start_date = startDateDayjs.isValid() ? startDateDayjs.unix() : null;
            } else {
                payload.start_date = null;
            }
            if (payload.end_date) {
                const endDateDayjs = dayjs(payload.end_date);
                payload.end_date = endDateDayjs.isValid() ? endDateDayjs.unix() : null;
            } else {
                payload.end_date = null;
            }

            let formattedAllottedTime = '00:00:00';
            if (payload.allotted_time) {
                const allottedTimeDayjs = dayjs(payload.allotted_time);
                if (allottedTimeDayjs.isValid()) {
                    formattedAllottedTime = allottedTimeDayjs.format('HH:mm:ss');
                } else {
                    console.warn("Invalid allotted_time detected during save, defaulting to '00:00:00'. Raw value:", payload.allotted_time);
                }
            } else {
                console.warn("allotted_time was falsy during save, defaulting to '00:00:00' due to being required.");
            }
            payload.allotted_time = formattedAllottedTime;

            const response = await axiosInstance.post(`/task`, payload);

            if (response.status === 200 || response.status === 201) {
                message.success("Task saved successfully!");
                return response.data;
            }
            message.error("Failed to save task with status: " + response.status);
        } catch (error) {
            handleMutationError(error, "Save task");
        } finally {
            setLoadingMutation(false);
        }
        return null;
    }, [handleMutationError]);

    const updateTask = useCallback(async (type, value) => {
        setLoadingMutation(true);
        try {
            const body = { type: type, value: value };

            if (type === "start_date" || type === "end_date") {
                if (value) {
                    const dateDayjs = dayjs(value);
                    body.value = dateDayjs.isValid() ? dateDayjs.unix() : null;
                } else {
                    body.value = null;
                }
            } else if (type === "allotted_time") {
                if (value) {
                    const timeDayjs = dayjs(value);
                    if (timeDayjs.isValid()) {
                        body.value = timeDayjs.format('HH:mm:ss');
                    } else {
                        body.value = '00:00:00';
                    }
                } else {
                    body.value = '00:00:00';
                }
            } else if (type === "department" && Array.isArray(value)) {
                body.value = value;
            }

            if (type === "department" && Number.isInteger(Number(body.value))) {
                const depId = Number(body.value);

                setTaskData(prev => {
                    const current = Array.isArray(prev?.department) ? [...prev.department] : [];
                    const idx = current.findIndex(d => Number(d.department_id) === depId);
                    const next = idx >= 0
                        ? current.filter(d => Number(d.department_id) !== depId)
                        : [...current, { department_id: depId, title: getDepartmentLabel(depId) }];
                    return { ...prev, department: next };
                });
            }
            const response = await axiosInstance.put(`/task/${taskId}`, body);

            if (response.status === 200 || response.status === 201) {
                message.success(`Task ${type.replace('_', ' ')} updated successfully!`);
                if (setTaskData) {
                    const serverTask = response.data?.task;
                    if (serverTask && setTaskData) {
                        setTaskData(serverTask);
                    }
                }
            } else {
                message.error(`Failed to update task ${type.replace('_', ' ')} with status: ` + response.status);
            }
        } catch (error) {
            handleMutationError(error, `Update task ${type}`);
        } finally {
            setLoadingMutation(false);
        }
    }, [taskId, handleMutationError, setTaskData, getDepartmentLabel]);

    const addSubTask = useCallback(async (title) => {
        setLoadingMutation(true);
        try {
            const body = { title };
            const response = await axiosInstance.post(`/task/${taskId}/subtask`, body);

            if (response.status === 200 || response.status === 201) {
                const newSubTask = response.data.subTask;
                setListSubTask(prev => [newSubTask, ...prev]);
                message.success("Subtask added successfully!");
            } else {
                message.error("Failed to add subtask with status: " + response.status);
            }
        } catch (error) {
            handleMutationError(error, "Add subtask");
        } finally {
            setLoadingMutation(false);
        }
    }, [taskId, handleMutationError, setListSubTask]);

    const addSubTaskItem = useCallback(async (tsId, title) => {
        setLoadingMutation(true);
        try {
            const body = { title, ts_id: tsId };
            const response = await axiosInstance.post(`/task/${taskId}/subtaskitem`, body);

            if (response.status === 200 || response.status === 201) {
                const newItem = response.data.taskSubtaskItem;
                setListSubTaskItem(prev => [newItem, ...prev]);
                message.success("Subtask item added successfully!");
            } else {
                message.error("Failed to add subtask item with status: " + response.status);
            }
        } catch (error) {
            handleMutationError(error, "Add subtask item");
        } finally {
            setLoadingMutation(false);
        }
    }, [taskId, handleMutationError, setListSubTaskItem]);

    const updateTaskSubtaskItem = useCallback(async (type, value, taskItemId) => {
        setLoadingMutation(true);
        try {
            const body = { type: type, value: value };
            if (type === "end_date" && value) {
                body.value = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
            } else if (type === "assign_to" && Array.isArray(value)) {
                body.value = value;
            }

            const response = await axiosInstance.put(`/task/${taskId}/subtaskitem/${taskItemId}`, body);

            if (response.status === 200 || response.status === 201) {
                const updatedItem = response.data?.subTaskItem;
                setListSubTaskItem(prev =>
                    prev.map(item => item.task_id === updatedItem.task_id ? updatedItem : item)
                );
                message.success(`Subtask item ${type.replace('_', ' ')} updated successfully!`);
            } else {
                message.error(`Failed to update subtask item ${type.replace('_', ' ')} with status: ` + response.status);
            }
        } catch (error) {
            handleMutationError(error, `Update subtask item ${type}`);
        } finally {
            setLoadingMutation(false);
        }
    }, [taskId, handleMutationError, setListSubTaskItem]);

    const deleteTaskSubtaskItem = useCallback(async (taskItemId) => {
        if (!taskId || !taskItemId) return;
        setLoadingMutation(true);
        try {
            const response = await axiosInstance.delete(`/task/${taskId}/subtaskitem/${taskItemId}`);
            if (response.status === 200 || response.status === 204) {
                setListSubTaskItem(prev =>
                    (Array.isArray(prev) ? prev.filter(item => Number(item.task_id) !== Number(taskItemId)) : prev)
                );
                message.success("Subtask item deleted.");
            } else {
                message.error("Failed to delete subtask item with status: " + response.status);
            }
        } catch (error) {
            handleMutationError(error, "Delete subtask item");
        } finally {
            setLoadingMutation(false);
        }
    }, [taskId, handleMutationError, setListSubTaskItem]);

    const handleUploadTask = useCallback(async (fileData) => {
        const file = fileData.file;
        console.log(
            "handleUploadTask dipanggil. Status:", file.status,
            "Nama File:", file.name, "UID:", file.uid
        );

        if (file.status === "uploading" && file.originFileObj) {
            if (activeUploads.current.has(file.uid)) return;
            activeUploads.current.add(file.uid);

            const formData = new FormData();
            formData.append("file", file.originFileObj);

            try {
                message.loading(`Uploading ${file.name}...`, 0);

                const response = await axiosInstance.post(
                    `/task/${taskId}/upload-attachment`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                message.destroy();

                if (response.status === 200 || response.status === 201) {
                    const att = response.data?.taskAttachment;
                    if (att) {
                        setListTaskAttachment(prev => {
                            const arr = Array.isArray(prev) ? prev : [];
                            const exists = arr.some(
                                a =>
                                    (a.attachment_id && att.attachment_id && a.attachment_id === att.attachment_id) ||
                                    (a.real_filename === att.real_filename && String(a.task_id) === String(att.task_id))
                            );
                            return exists ? arr : [...arr, att];
                        });
                        message.success(`${att.real_filename || "File"} uploaded successfully.`);
                    } else {
                        console.error("2xx response but payload does not contain taskAttachment:", response.data);
                        message.error("Upload succeeded but response is incomplete.");
                    }
                } else {
                    console.error("Upload gagal:", response.status, response.data);
                    message.error(`File upload failed: Status ${response.status}`);
                }
            } catch (err) {
                message.destroy();
                handleMutationError(err, "Upload file");
                throw err;
            } finally {
                activeUploads.current.delete(file.uid);
            }
        } else if (file.status === "done" && activeUploads.current.has(file.uid)) {
            activeUploads.current.delete(file.uid);
        }
    }, [taskId, handleMutationError, setListTaskAttachment]);

    const deleteTaskAttachment = useCallback(async (taskId, attachmentId) => {
        setLoadingMutation(true);
        try {
            const res = await axiosInstance.delete(`/task/${taskId}/upload-attachment/${attachmentId}`);

            if (res.status === 200 || res.status === 204) {
                if (setListTaskAttachment) {
                    setListTaskAttachment(prev => {
                        if (!Array.isArray(prev)) return prev;
                        const targetId = Number(attachmentId);
                        return prev.filter(att => Number(att.attachment_id ?? att.id ?? att.ta_id) !== targetId);
                    });
                }

                if (fetchActivityLog) {
                    await fetchActivityLog();
                }

                message.success("Attachment deleted.");
            } else {
                message.error("Failed to delete attachment with status: " + res.status);
            }
        } catch (error) {
            handleMutationError(error, "Delete attachment");
        } finally {
            setLoadingMutation(false);
        }
    }, [setListTaskAttachment, handleMutationError, fetchActivityLog]);

    const addComment = useCallback(
        async (
            commentContent,
            commentFor = null,
            mentionedUserIds = null,
            mentionedAttachmentIds = null,
            filenameJson = null,
            type = 'comment'
        ) => {
            setLoadingMutation(true);
            try {
                const body = {
                    content: commentContent,
                    comment_for: commentFor,
                    mentioned_user_ids: mentionedUserIds,
                    filename: filenameJson,
                    type: type,
                };

                if (Array.isArray(mentionedAttachmentIds) && mentionedAttachmentIds.length > 0) {
                    body.mentioned_attachment_ids = mentionedAttachmentIds;
                } else if (mentionedAttachmentIds !== null && mentionedAttachmentIds !== undefined) {
                    body.mentioned_attachment_ids = [mentionedAttachmentIds];
                }

                const response = await axiosInstance.post(`/task/${taskId}/comment`, body);

                if (response.status === 200 || response.status === 201) {
                    if (fetchActivityLog) {
                        await fetchActivityLog();
                    }
                    message.success("Comment added successfully!");
                } else {
                    message.error("Failed to add comment: " + response.status);
                }
            } catch (error) {
                handleMutationError(error, "Add comment");
            } finally {
                setLoadingMutation(false);
            }
        },
        [taskId, handleMutationError, fetchActivityLog]
    );

    const uploadSubtaskItemAttachment = useCallback(async (fileData, subtaskItemId, attachment_id) => {
        const file = fileData.file;

        if (file.status === "uploading" && file.originFileObj) {
            if (activeUploads.current.has(file.uid)) return;
            activeUploads.current.add(file.uid);

            const formData = new FormData();
            formData.append("file", file.originFileObj);
            if (attachment_id != null) formData.append("attachment_id", attachment_id);

            try {
                message.loading(`Uploading ${file.name}...`, 0);

                const response = await axiosInstance.post(
                    `/task/${taskId}/subtaskitem/${subtaskItemId}/upload-attachment`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                message.destroy();

                if (response.status === 200 || response.status === 201) {
                    const updated = response.data?.taskSubtaskItem;
                    if (updated) {
                        setListSubTaskItem(prev =>
                            prev.map(item => item.task_id === updated.task_id ? updated : item)
                        );
                    }
                    const att = response.data?.taskAttachment;
                    message.success(`${(att && att.real_filename) || file.name} uploaded to subtask item.`);
                    if (fetchActivityLog) await fetchActivityLog();
                } else {
                    console.error("Upload gagal:", response.status, response.data);
                    message.error(`File upload failed: Status ${response.status}`);
                }
            } catch (err) {
                message.destroy();
                handleMutationError(err, "Upload file to subtask item");
                throw err;
            } finally {
                activeUploads.current.delete(file.uid);
            }
        } else if (file.status === "done" && activeUploads.current.has(file.uid)) {
            activeUploads.current.delete(file.uid);
        }
    }, [taskId, handleMutationError, setListSubTaskItem, fetchActivityLog]);

    const onPromoteStar = useCallback(async (subtaskItemId, attachmentId) => {
        setLoadingMutation(true);
        try {
            const body = { attachmentId };
            const response = await axiosInstance.post(`/task/${taskId}/subtaskitem/${subtaskItemId}/upload-attachment/${attachmentId}/star`, body);
            if (response.status === 200 || response.status === 201) {
                const updatedSubtaskItem = response.data?.taskSubtaskItem;
                if (setListSubTaskItem && updatedSubtaskItem) {
                    setListSubTaskItem(prev =>
                        prev.map(item => item.task_id === updatedSubtaskItem.task_id ? updatedSubtaskItem : item)
                    );
                }
                message.success("Promote Star added successfully!");
            } else {
                message.error("Failed to add Promote Star with status: " + response.status);
            }
        } catch (error) {
            handleMutationError(error, "Promote Star");
        } finally {
            setLoadingMutation(false);
        }
    }, [taskId, handleMutationError, setListSubTaskItem]);

    const isPageMode = mode === "page";
    const isVisible = isPageMode ? true : modalTask;
    const isStaffOnly = !!currentUserFrontend &&
        !isTrueFlag(currentUserFrontend?.is_hod) &&
        !isTrueFlag(currentUserFrontend?.is_ae) &&
        !isTrueFlag(currentUserFrontend?.is_superadmin);
    const currentUserId = Number(currentUserFrontend?.user_id) || null;
    const canManageItemAssignment = isTrueFlag(currentUserFrontend?.is_hod) ||
        isTrueFlag(currentUserFrontend?.is_superadmin) ||
        Number(taskData?.created_by) === currentUserId;
    const isEditMode = isPageMode
        ? !!taskId
        : (modul === 'task' && openmodal === 'true' && !!taskId);
    const canEdit = isEditMode && taskData?.created_by === currentUserFrontend?.user_id;

    const sideBarDisabled = !isEditMode;
    const [isDisabled, setIsDisabled] = useState(isEditMode);
    const [labelSubmit, setLabelSubmit] = useState("Save");
    const [attachmentToComment, setAttachmentToComment] = useState(null);

    // ✅ NEW: target comment untuk subTaskItem
    const [itemToComment, setItemToComment] = useState(null);

    const commentedItemIds = useMemo(() => {
        const out = new Set();
        const extractItemId = (raw) => {
            if (raw == null) return null;
            if (typeof raw === "number" || /^\d+$/.test(String(raw))) return Number(raw);

            let parsed = raw;
            if (typeof parsed === "string") {
                try {
                    parsed = JSON.parse(parsed);
                } catch {
                    return null;
                }
            }

            if (parsed && typeof parsed === "object") {
                if (parsed.type && String(parsed.type).toLowerCase() !== "task_item") return null;
                const id = parsed.id ?? parsed.task_item_id ?? null;
                if (id != null && Number.isFinite(Number(id))) return Number(id);
            }
            return null;
        };

        (activityLog || []).forEach((a) => {
            if (String(a?.type || "").toLowerCase() !== "comment") return;
            const itemId = extractItemId(a?.comment_for);
            if (itemId) out.add(itemId);
        });

        return out;
    }, [activityLog]);

    // Tahap 2: fokus item dipegang sebagai state lokal (bukan query)
    const [focusItemId, setFocusItemId] = useState(null);
    const preselectedProjectId = useMemo(() => {
        const raw = projectIdFromQuery ?? initialProjectId;
        const parsed = Number(raw);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }, [projectIdFromQuery, initialProjectId]);
    const subtaskItemTitleMap = useMemo(() => {
        const m = {};
        (listSubTaskItem || []).forEach((it) => {
            const id = Number(it?.task_id);
            if (Number.isFinite(id) && id > 0) {
                m[id] = String(it?.title || "").trim();
            }
        });
        return m;
    }, [listSubTaskItem]);

    useEffect(() => {
        setIsDisabled(isEditMode);
    }, [isEditMode]);

    const setEditFunc = (value) => {
        form.setFieldsValue({ task_id: Number(taskId) || taskId || null });
        setIsDisabled(value);
        setLabelSubmit("Update");
    };

    const resetModalState = useCallback(() => {
        form.resetFields();
        setTaskData(null);
        setListTaskAttachment([]);
        setListSubTask([]);
        setListSubTaskItem([]);
        setActivityLog([]);
        setFocusItemId(null);
        setItemToComment(null);
        setAttachmentToComment(null);
        setIsDisabled(false);
        setLabelSubmit("Save");
    }, [
        form,
        setTaskData, setListTaskAttachment, setListSubTask, setListSubTaskItem, setActivityLog
    ]);

    const handleCloseTaskForm = useCallback(() => {
        onCancel?.();
        if (!isPageMode) {
            closeEntityModal(router, pathname, searchParams);
        }
    }, [onCancel, isPageMode, router, pathname, searchParams]);

   
    const handleSaveTask = async (values) => {
        const result = await saveTask(values);
        const newId = result?.task?.task_id;
        const ok = result?.success === true || !!newId;
        if (ok) {
            setIsDisabled(true);
            if (newId) {
                if (isPageMode) {
                    const params = new URLSearchParams(Array.from(searchParams.entries()));
                    params.set("task", String(newId));
                    router.replace(`${pathname}?${params.toString()}`);
                } else {
                    const search = buildModalSearch({ module: "task", id: newId });
                    router.push(`${pathname}${search}`);
                }
            }
        }
    };

    useEffect(() => {
        if (!taskId) return;

        if (legacyFocusItem) {
            setFocusItemId(legacyFocusItem);
            const params = new URLSearchParams(Array.from(searchParams.entries()));
            params.delete("item");
            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname);
            return;
        }

        const v = consumeTaskFocusItem(taskId);
        if (v) setFocusItemId(v);
    }, [taskId, legacyFocusItem, router, pathname, searchParams]);

    useEffect(() => {
        if (!isVisible || taskId) return;

        fetchProject();
        if (!preselectedProjectId) return;

        form.setFieldsValue({
            projectId: preselectedProjectId,
            pq_id: undefined,
            po_id: undefined,
        });
        fetchQuotation(preselectedProjectId);
        setPoOptions([]);
    }, [isVisible, taskId, preselectedProjectId, fetchProject, fetchQuotation, form]);

    const formBody = (
        <Spin
            spinning={loadingData || loadingMutation || loadingActivity}
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            tip="Loading..."
        >
            <Form form={form} onFinish={handleSaveTask} layout="vertical" className='mb-10'>
                {/* Header */}
                <div className="flex items-start flex-col sm:flex-row gap-x-5">
                    <div className='order-last sm:order-first w-full mb-5 sm:mb-0'>
                        <div className="flex items-start gap-3 mb-3">
                            <Form.Item name="task_id" hidden>
                                <Input type="hidden" />
                            </Form.Item>
                            <Image src={asset('static/images/icon/app_registration.png')} width={50} height={50} className='w-6 mt-2 hidden sm:block' alt="Task Icon" />
                            <div className="flex flex-col w-full">
                                <div className="w-full">
                                    <Form.Item
                                        name="title"
                                        rules={[{ required: true, message: 'Please input Task Name!' }]}
                                    >
                                        <Input placeholder="Task Name Here" className='text-lg' variant="underlined" disabled={isDisabled} />
                                    </Form.Item>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="select2-header flex items-center gap-2">
                                        <span className="text-sm me-3">in</span>
                                        <Form.Item
                                            name="projectId"
                                            className='sm:w-44 mb-0'
                                            rules={[{ required: true, message: 'Please select a Project!' }]}
                                        >
                                            {isDisabled == false ? (
                                                <Select
                                                    showSearch
                                                    placeholder="Select Project"
                                                    className='w-full'
                                                    loading={loadingProjects}
                                                    notFoundContent={loadingProjects ? null : 'No Data'}
                                                    onDropdownVisibleChange={(open) => {
                                                        if (open) fetchProject();
                                                    }}
                                                    onChange={(projectId) => {
                                                        fetchQuotation(projectId);
                                                        form.setFieldsValue({ pq_id: undefined, po_id: undefined });
                                                        setPoOptions([]);
                                                    }}
                                                    options={projectOptions.map((item) => ({
                                                        label: item.title,
                                                        value: item.project_id,
                                                    }))}
                                                />
                                            ) : (
                                                <Select
                                                    showSearch
                                                    className='w-full'
                                                    disabled={isDisabled}
                                                    options={projectOptions.map((item) => ({
                                                        label: item.title,
                                                        value: item.project_id,
                                                    }))}
                                                />
                                            )}
                                        </Form.Item>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='order-first sm:order-last sm:pt-5 mb-3 sm:mb-0 w-auto'>
                        <div className='sm:mb-0 sm:text-end'>
                            <h4 className="text-sm mb-1 text-gray-400 whitespace-nowrap">
                                {taskData?.created ? dayjs.unix(taskData.created).format('DD MMMM YYYY HH:mm:ss') : '-'}
                            </h4>
                            <h3 className="text-sm text-gray-400 whitespace-nowrap">
                                Created by: <span className="font-semibold fc-base">
                                    {taskData?.creator?.fullname
                                        ? `${taskData?.creator?.fullname ?? ""}`.trim()
                                        : "-"}
                                </span>
                            </h3>
                        </div>
                    </div>
                </div>

                {isPageMode ? (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-4">
                                <div className="rounded-xl border border-[#dce8ec] bg-[#f7fbfc] p-4 lg:sticky lg:top-6">
                                    <h3 className="text-base font-semibold text-[#2b3a4d] mb-1">Task General / Info</h3>
                                    <p className="text-xs text-[#5d6b80] mb-4">
                                        Keep key task updates in this panel so context stays visible.
                                    </p>
                                    <TaskSidebar
                                        taskId={taskId}
                                        priority={taskData?.priority || 'Medium'}
                                        priorityOptions={['low', 'medium', 'high', 'urgent']}
                                        updateTask={updateTask}
                                        departmentOptions={departmentOptions}
                                        listDepartment={Array.isArray(taskData?.department) ? taskData.department : []}
                                        loadingDepartments={loadingDepartments}
                                        fetchDepartment={fetchDepartment}
                                        sideBarDisabled={sideBarDisabled}
                                        handleUploadTask={handleUploadTask}
                                        onEditClick={() => {
                                            if (canEdit) {
                                                setEditFunc(false);
                                            } else {
                                                Modal.warning({
                                                    title: "Not Allowed",
                                                    content: "Only the task creator can edit.",
                                                });
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-8">
                                <div className='mb-6 rounded-xl border border-[#e3edf1] p-4 sm:p-5'>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Image src={asset('static/images/icon/article.png')} width={50} height={50} alt='' className='w-5 h-5' />
                                        <h3 className="text-base fc-blue">Details</h3>
                                    </div>
                                    <TaskDetailForm
                                        isDisabled={isDisabled}
                                        quotationOptions={quotationOptions}
                                        poOptions={poOptions}
                                        loadingQuotations={loadingQuotations}
                                        loadingPOs={loadingPOs}
                                        fetchQuotation={fetchQuotation}
                                        fetchPo={fetchPo}
                                        form={form}
                                    />
                                </div>

                                <div className="mb-6 rounded-xl border border-[#e3edf1] p-4 sm:p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Image src={asset('static/images/icon/segment.png')} width={50} height={50} alt='' className='w-5 h-5' />
                                        <h3 className="text-base fc-blue">Description</h3>
                                    </div>
                                    <TaskDescription
                                        isDisabled={isDisabled}
                                        userOptions={userOptions}
                                        fetchUsers={fetchUsers}
                                    />
                                    {!isDisabled && !isPageMode && (
                                        <Form.Item className="mt-5 mb-0">
                                            <div className="flex justify-end gap-3">
                                                <Button size='large' onClick={handleCloseTaskForm} className='px-5'>
                                                    {isPageMode ? "Back" : "Cancel"}
                                                </Button>
                                                <Button size='large' htmlType="submit" className="btn-blue px-5" loading={loadingMutation}>
                                                    {labelSubmit}
                                                </Button>
                                            </div>
                                        </Form.Item>
                                    )}
                                </div>

                                <div className="mb-6 rounded-xl border border-[#e3edf1] p-4 sm:p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Image src={asset('static/images/icon/article.png')} width={50} height={50} alt='' className='w-5 h-5' />
                                        <h3 className="text-base fc-blue">Supporting Attachments</h3>
                                    </div>
                                    {taskId ? (
                                        <TaskAttachments
                                            onCommentAttachment={(item) => setAttachmentToComment({ ...item })}
                                            taskId={taskId}
                                            listTaskAttachment={listTaskAttachment}
                                            handleUploadTask={handleUploadTask}
                                            sideBarDisabled={sideBarDisabled}
                                            taskTitle={taskData?.title || 'Unknown Task'}
                                            setListTaskAttachment={setListTaskAttachment}
                                            deleteTaskAttachment={deleteTaskAttachment}
                                        />
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-[#c7d9df] bg-[#f8fbfc] px-4 py-3 text-sm text-[#5d6b80]">
                                            Save the task first to enable attachments and collaboration.
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-xl border border-[#e3edf1] p-4 sm:p-5">
                                    <h3 className="text-base fc-blue mb-3">Subtask & Work Items</h3>
                                    {taskId ? (
                                        <SubtaskSection
                                            taskId={taskId}
                                            listSubTask={listSubTask}
                                            listSubTaskItem={listSubTaskItem}
                                            currentUserId={currentUserId}
                                            restrictToAssignedOnly={isStaffOnly}
                                            canManageAssignment={canManageItemAssignment}
                                            userOptions={userOptions}
                                            loadingUsers={loadingUsers}
                                            commentedItemIds={commentedItemIds}
                                            fetchUsers={fetchUsers}
                                            addSubTask={addSubTask}
                                            addSubTaskItem={addSubTaskItem}
                                            updateTaskSubtaskItem={updateTaskSubtaskItem}
                                            deleteTaskSubtaskItem={deleteTaskSubtaskItem}
                                            uploadSubtaskItemAttachment={uploadSubtaskItemAttachment}
                                            onPromoteStar={onPromoteStar}
                                            getFileDisplay={getFileDisplay}
                                            updateSubTask={updateSubTask}
                                            deleteSubTask={deleteSubTask}
                                            deleteTaskAttachment={deleteTaskAttachment}
                                            focusItemId={focusItemId}
                                            onCommentAttachment={(item) => setAttachmentToComment({ ...item })}
                                            onCommentItem={(it) => {
                                                setItemToComment(it);
                                                setAttachmentToComment(null);
                                            }}
                                        />
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-[#c7d9df] bg-[#f8fbfc] px-4 py-3 text-sm text-[#5d6b80]">
                                            Subtasks will be available after the task is saved.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-xl border border-[#e3edf1] p-4 sm:p-5">
                            <h3 className="text-base fc-blue mb-3">Discussion</h3>
                            {taskId ? (
                                <TaskActivity
                                    attachmentToComment={attachmentToComment}
                                    itemToComment={itemToComment}
                                    taskId={taskId}
                                    taskTitle={taskData?.title || 'Unknown Task'}
                                    activityLog={activityLog}
                                    subtaskItemTitleMap={subtaskItemTitleMap}
                                    currentUser={currentUserFrontend}
                                    addComment={addComment}
                                    loadingComments={loadingActivity}
                                    fetchActivityLog={fetchActivityLog}
                                    userOptions={userOptions}
                                    loadingUsers={loadingUsers}
                                    fetchUsers={fetchUsers}
                                />
                            ) : (
                                <div className="rounded-lg border border-dashed border-[#c7d9df] bg-[#f8fbfc] px-4 py-3 text-sm text-[#5d6b80]">
                                    Komentar tersedia setelah task disimpan.
                                </div>
                            )}
                        </div>

                        {!isDisabled && (
                            <Form.Item className="mb-0 mt-6">
                                <div className="sticky bottom-0 z-20 rounded-xl border border-[#d7e5ea] bg-white/95 px-4 py-3 shadow-[0_-6px_18px_rgba(30,63,84,0.08)] backdrop-blur">
                                    <div className="flex items-center justify-end gap-3">
                                        <Button size='large' onClick={handleCloseTaskForm} className='px-5'>
                                            Back
                                        </Button>
                                        <Button size='large' htmlType="submit" className="btn-blue px-5" loading={loadingMutation}>
                                            {labelSubmit}
                                        </Button>
                                    </div>
                                </div>
                            </Form.Item>
                        )}
                    </>
                ) : (
                    <>
                        {/* Main Content */}
                        <div className="flex flex-wrap gap-6">
                            <div className="flex-1 order-last sm:order-first">
                                {/* Details */}
                                <div className='mb-10'>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Image src={asset('static/images/icon/article.png')} width={50} height={50} alt='' className='w-5 h-5' />
                                        <h3 className="text-base fc-blue">Details</h3>
                                    </div>
                                    <div className="sm:ps-6">
                                        <TaskDetailForm
                                            isDisabled={isDisabled}
                                            quotationOptions={quotationOptions}
                                            poOptions={poOptions}
                                            loadingQuotations={loadingQuotations}
                                            loadingPOs={loadingPOs}
                                            fetchQuotation={fetchQuotation}
                                            fetchPo={fetchPo}
                                            form={form}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Image src={asset('static/images/icon/segment.png')} width={50} height={50} alt='' className='w-5 h-5' />
                                        <h3 className="text-base fc-blue">Description</h3>
                                    </div>
                                    <div className="sm:ps-6 mb-7">
                                        <TaskDescription
                                            isDisabled={isDisabled}
                                            userOptions={userOptions}
                                            fetchUsers={fetchUsers}
                                        />
                                    </div>
                                    {!isDisabled && (
                                        <Form.Item>
                                            <div className="flex justify-end gap-3">
                                                <Button size='large' onClick={handleCloseTaskForm} className='px-5'>
                                                    {isPageMode ? "Back" : "Cancel"}
                                                </Button>
                                                <Button size='large' htmlType="submit" className="btn-blue px-5" loading={loadingMutation}>
                                                    {labelSubmit}
                                                </Button>
                                            </div>
                                        </Form.Item>
                                    )}
                                </div>

                                {/* Attachments */}
                                <div className="mb-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Image src={asset('static/images/icon/article.png')} width={50} height={50} alt='' className='w-5 h-5' />
                                        <h3 className="text-base fc-blue">Supporting Attachments</h3>
                                    </div>
                                    <div className="sm:ps-6">
                                        <TaskAttachments
                                            onCommentAttachment={(item) => setAttachmentToComment({ ...item })}
                                            taskId={taskId}
                                            listTaskAttachment={listTaskAttachment}
                                            handleUploadTask={handleUploadTask}
                                            sideBarDisabled={sideBarDisabled}
                                            taskTitle={taskData?.title || 'Unknown Task'}
                                            setListTaskAttachment={setListTaskAttachment}
                                            deleteTaskAttachment={deleteTaskAttachment}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full sm:w-52 mb-10">
                                <TaskSidebar
                                    taskId={taskId}
                                    priority={taskData?.priority || 'Medium'}
                                    priorityOptions={['low', 'medium', 'high', 'urgent']}
                                    updateTask={updateTask}
                                    departmentOptions={departmentOptions}
                                    listDepartment={Array.isArray(taskData?.department) ? taskData.department : []}
                                    loadingDepartments={loadingDepartments}
                                    fetchDepartment={fetchDepartment}
                                    sideBarDisabled={sideBarDisabled}
                                    handleUploadTask={handleUploadTask}
                                    onEditClick={() => {
                                        if (canEdit) {
                                            setEditFunc(false);
                                        } else {
                                            Modal.warning({
                                                title: "Not Allowed",
                                                content: "Only the task creator can edit.",
                                            });
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="pt-10 border-t border-[#0FA3B1]">
                            {/* Subtasks */}
                            <div className="mb-10">
                                <SubtaskSection
                                    taskId={taskId}
                                    listSubTask={listSubTask}
                                    listSubTaskItem={listSubTaskItem}
                                    currentUserId={currentUserId}
                                    restrictToAssignedOnly={isStaffOnly}
                                    canManageAssignment={canManageItemAssignment}
                                    userOptions={userOptions}
                                    loadingUsers={loadingUsers}
                                    commentedItemIds={commentedItemIds}
                                    fetchUsers={fetchUsers}
                                    addSubTask={addSubTask}
                                    addSubTaskItem={addSubTaskItem}
                                    updateTaskSubtaskItem={updateTaskSubtaskItem}
                                    deleteTaskSubtaskItem={deleteTaskSubtaskItem}
                                    uploadSubtaskItemAttachment={uploadSubtaskItemAttachment}
                                    onPromoteStar={onPromoteStar}
                                    getFileDisplay={getFileDisplay}
                                    updateSubTask={updateSubTask}
                                    deleteSubTask={deleteSubTask}
                                    deleteTaskAttachment={deleteTaskAttachment}
                                    focusItemId={focusItemId}
                                    onCommentAttachment={(item) => setAttachmentToComment({ ...item })}
                                    onCommentItem={(it) => {
                                        setItemToComment(it);
                                        setAttachmentToComment(null);
                                    }}
                                />
                            </div>

                            {/* Activity */}
                            <TaskActivity
                                attachmentToComment={attachmentToComment}
                                itemToComment={itemToComment}
                                taskId={taskId}
                                taskTitle={taskData?.title || 'Unknown Task'}
                                activityLog={activityLog}
                                subtaskItemTitleMap={subtaskItemTitleMap}
                                currentUser={currentUserFrontend}
                                addComment={addComment}
                                loadingComments={loadingActivity}
                                fetchActivityLog={fetchActivityLog}
                                userOptions={userOptions}
                                loadingUsers={loadingUsers}
                                fetchUsers={fetchUsers}
                            />
                        </div>
                    </>
                )}
            </Form>
        </Spin>
    );

    if (isPageMode) {
        return (
            <section className="container py-8 sm:py-10">
                <div className="mx-auto max-w-6xl">
                    <div className="rounded-2xl border border-[#e1eaee] bg-white px-4 py-5 sm:px-6">
                        {formBody}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <Modal
            open={modalTask}
            onCancel={handleCloseTaskForm}
            afterOpenChange={(open) => {
                if (!open) resetModalState();
            }}
            width={900}
            footer={null}
            maskClosable={false}
            className='custom-modaltask'
        >
            {formBody}
        </Modal>
    );
}
