// src/components/modal/ModalRevise.jsx
"use client";

import Image from "next/image";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Upload,
  DatePicker,
  Tooltip,
  Popconfirm,
  Spin,
  message,
} from "antd";
import Fancybox from "../libs/Fancybox";
import {
  LoadingOutlined,
  ZoomInOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import axiosInstance from "@/utils/axios";
import { getStorageUrl } from "@/utils/storageHelpers"; // <— gunakan gateway /api/file

const { TextArea } = Input;

// ==== helpers tipe & nama file (tanpa bergantung filetype dari server) ====
function isImage(att) {
  const name = (att?.real_filename || att?.filename || "").toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg|tif|tiff)$/.test(name);
}
function fileExt(att) {
  const name = att?.real_filename || att?.filename || "";
  const m = name.match(/\.([a-z0-9]+)$/i);
  return (m?.[1] || "").toUpperCase();
}
const toBasename = (name = "") =>
  String(name).replace(/\\/g, "/").split("/").pop();
const stripExt = (name = "") => toBasename(name).replace(/\.[^.]+$/, "");

/**
 * Resolve URL aman:
 * - Image → pakai resized webp: storage/task/resized/<basename(filename)>.webp
 * - Non-image → storage/task/<filename>
 * Semua melalui getStorageUrl (/api/file)
 */
function resolveHref(att) {
  const storedName = String(att?.filename || "").trim();
  if (!storedName) return null;
  if (isImage(att)) {
    const base = stripExt(storedName);
    return getStorageUrl(`storage/task/resized/${base}.webp`);
  }
  return getStorageUrl(`storage/task/${storedName}`);
}

export default function ModalRevise({
  modalRevise,
  setModalRevise,
  revisionTarget,
  onSubmitted,
  fetchDashboard
}) {
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingTask, setLoadingTask] = useState(false);
  const [taskDetail, setTaskDetail] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  // --- fetch detail task saat modal dibuka ---
  useEffect(() => {
    const loadDetail = async () => {
      if (!modalRevise || !revisionTarget?.task_id) {
        setTaskDetail(null);
        setAttachments([]);
        return;
      }
      setLoadingTask(true);
      try {
        const res = await axiosInstance.get(
          `/task/${revisionTarget.task_id}/subtaskitem`
        );
        setTaskDetail(res.data?.detailTask || null);

        const rawAtt = Array.isArray(res.data?.taskAttachment)
          ? res.data.taskAttachment
          : [];
        setAttachments(rawAtt.filter((a) => a?.revision_id == null));
      } catch (e) {
        console.error(e);
        message.error(
          e?.response?.data?.msg || "Failed to load task detail."
        );
        setTaskDetail(null);
        setAttachments([]);
      } finally {
        setLoadingTask(false);
      }
    };
    loadDetail();
  }, [modalRevise, revisionTarget?.task_id]);

  // reset form tiap buka + set default request_by berdasar konteks todo
  useEffect(() => {
    if (modalRevise) {
      form.resetFields();
      const isAeRevision = revisionTarget?.todo === "need_review_ae";
      form.setFieldsValue({
        request_by: isAeRevision ? "client" : "internal",
        dueDate: null,
        reason: "",
      });
    }
  }, [modalRevise, form, revisionTarget]);

  // --- derive header fields ---
  const { taskName, projectName, brandName, createdDate, createdBy } =
    useMemo(() => {
      const t = taskDetail || {};
      const _taskName = t?.title || t?.name || "Task";
      const _projectName = t?.Project?.title || "-";
      const _brandName = t?.Project?.Client?.brand?.[0]?.title || "-";
      const _createdUnix = t?.created ?? t?.created_at ?? null;
      const _createdDate = _createdUnix
        ? dayjs.unix(Number(_createdUnix)).format("DD MMM YYYY")
        : "—";
      const _createdBy = t?.creator?.fullname || t?.created_by_name || "—";
      return {
        taskName: _taskName,
        projectName: _projectName,
        brandName: _brandName,
        createdDate: _createdDate,
        createdBy: _createdBy,
      };
    }, [taskDetail]);

  // --- submit revisi ---
  const onFinish = async (values) => {
    if (!revisionTarget?.task_id) {
      message.error("Task tidak ditemukan.");
      return;
    }

    const isAeContext = revisionTarget?.todo === "need_review_ae";

    const payload = {
      reason: values?.reason || "",
      request_by: values?.request_by, // "internal" | "client"
      due_date: values?.dueDate ? dayjs(values.dueDate).unix() : null,
      from_todo: revisionTarget?.todo ?? null,
      target_todo: isAeContext ? "revise_account" : null,
    };

    try {
      setLoadingForm(true);
      await axiosInstance.post(
        `/task/${revisionTarget.task_id}/revisions`,
        payload
      );
      message.success("Revision requested.");

      fetchDashboard && fetchDashboard();

      setModalRevise(false);

      if (onSubmitted) {
        onSubmitted({
          taskId: revisionTarget?.task_id,
          fromTodo: revisionTarget?.todo ?? null,
          toTodo: isAeContext ? "revise_account" : null,
        });
      }
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.msg || "Failed to submit revision.");
    } finally {
      setLoadingForm(false);
    }
  };

  // --- helpers attachment ---
  const refreshAttachments = async () => {
    try {
      const res = await axiosInstance.get(
        `/task/${revisionTarget.task_id}/subtaskitem`
      );
      const rawAtt = Array.isArray(res.data?.taskAttachment)
        ? res.data.taskAttachment
        : [];
      setAttachments(rawAtt.filter((a) => a?.revision_id == null));
    } catch (e) {
      console.error(e);
    }
  };

  // Upload → axios + FormData
  const handleUpload = async ({
    file,
    onSuccess,
    onError,
    onProgress,
    filename,
  }) => {
    try {
      if (!revisionTarget?.task_id) throw new Error("Task not found");
      setUploading(true);

      const blob = file?.originFileObj || file; // file dari antd Upload
      const name = filename || blob?.name || "upload.bin";

      const fd = new FormData();
      fd.append("file", blob, name); // backend ambil field "file"

      const res = await axiosInstance.post(
        `/task/${revisionTarget.task_id}/upload-attachment`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          onUploadProgress: (e) => {
            if (e.total) {
              const percent = Math.round((e.loaded / e.total) * 100);
              onProgress?.({ percent });
            }
          },
        }
      );

      // langsung update list tanpa nunggu refetch
      const newAtt = res?.data?.taskAttachment;
      if (
        newAtt &&
        (newAtt.revision_id == null ||
          newAtt.revision_id === 0 ||
          newAtt.revision_id === "0")
      ) {
        setAttachments((prev = []) => {
          const exists = prev.some(
            (a) => a.attachment_id === newAtt.attachment_id
          );
          return exists ? prev : [newAtt, ...prev];
        });
      } else {
        await refreshAttachments(); // fallback kalau payload tidak ada / dedup
      }

      onSuccess?.("ok");
      message.success(res?.data?.msg || "File uploaded.");
    } catch (e) {
      console.error(e);
      message.error(
        e?.response?.data?.msg || e?.message || "Upload failed."
      );
      onError?.(e);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!revisionTarget?.task_id || !attachmentId) return;
    try {
      await axiosInstance.delete(
        `/task/${revisionTarget.task_id}/upload-attachment`,
        { data: { attachmentId } }
      );
      message.success("Attachment deleted.");
      await refreshAttachments();
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.msg || "Delete failed.");
    }
  };

  return (
    <Modal
      open={modalRevise}
      onCancel={() => setModalRevise(false)}
      width={800}
      footer={null}
    >
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        className="mb-10"
      >
        {/* header */}
        <div className="flex items-start flex-wrap gap-3 border-b pb-3 fc-base mb-6">
          <div className="order-1 hidden sm:block">
            <Image
              src={"/static/images/icon/app_registration.png"}
              width={50}
              height={50}
              className="w-6"
              alt=""
            />
          </div>

          <div className="order-3 sm:order-2 flex-1 sm:flex-none">
            <div className="flex items-center gap-3">
              <Image
                src={"/static/images/icon/app_registration.png"}
                width={50}
                height={50}
                className="w-6 sm:hidden"
                alt=""
              />
              <h3 className="text-base font-semibold mb-2">
                {loadingTask ? <Spin size="small" /> : taskName}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {/* Project: info only */}
              <div className="flex items-center gap-2">
                <span className="text-sm me-3">in</span>
                <div className="sm:w-44 mb-0">
                  <div className="w-full px-3 py-1.5 rounded border border-gray-200 bg-gray-50 text-sm truncate">
                    {loadingTask ? <Spin size="small" /> : projectName}
                  </div>
                </div>
              </div>

              {/* Brand: info only */}
              <div className="flex items-center gap-2">
                <span className="text-sm me-3">for</span>
                <div className="sm:w-44 mb-0">
                  <div className="w-full px-3 py-1.5 rounded border border-gray-200 bg-gray-50 text-sm truncate">
                    {loadingTask ? <Spin size="small" /> : brandName}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sm:ms-auto mt-auto order-2 sm:order-3">
            <div className="mb-5 sm:mb-0 sm:text-end">
              <h4 className="text-sm mb-2 text-gray-400">
                {loadingTask ? <Spin size="small" /> : createdDate}
              </h4>
              <h3 className="text-sm text-gray-400">
                Created by:{" "}
                <span className="font-semibold fc-base">
                  {loadingTask ? <Spin size="small" /> : createdBy}
                </span>
              </h3>
            </div>
          </div>
        </div>

        {/* content */}
        <div className="flex items-center flex-wrap justify-between gap-4 mb-6">
          {/* Request by */}
          <div className="w-full sm:w-auto">
            <div className="select2-header flex items-center gap-2">
              <span className="text-sm me-3">Request by</span>
              <Form.Item
                name="request_by"
                className="mb-0"
                rules={[
                  {
                    required: true,
                    message: "Please select requester",
                  },
                ]}
              >
                <Select
                  placeholder="Select"
                  className="w-40"
                  options={[
                    { value: "internal", label: "Internal" },
                    { value: "client", label: "Client" },
                  ]}
                />
              </Form.Item>
            </div>
          </div>

          {/* Due date (datetime) */}
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Image
                src="/static/images/icon/calendar_clock.png"
                width={50}
                height={50}
                alt=""
                className="w-6"
              />
              <Form.Item name="dueDate" className="mb-0">
                <DatePicker
                  placeholder="New Due Date"
                  suffixIcon={false}
                  showTime
                  className="input-header"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="flex items-center gap-2 mb-3">
          <Image
            src={"/static/images/icon/article.png"}
            width={50}
            height={50}
            alt=""
            className="w-5 h-5"
          />
          <h3 className="text-base fc-blue">Reason</h3>
        </div>

        <div className="ps-6 mb-6">
          <Form.Item
            name="reason"
            rules={[
              { required: true, message: "Please input revision reason" },
            ]}
          >
            <TextArea
              placeholder="Write reason here"
              autoSize={{ minRows: 5 }}
            />
          </Form.Item>
        </div>

        {/* Attachments */}
        <div className="flex items-center gap-2 mb-3">
          <Image
            src={"/static/images/icon/article.png"}
            width={50}
            height={50}
            alt=""
            className="w-5 h-5"
          />
          <h3 className="text-base fc-blue">Attachments</h3>

          {/* Upload */}
          <Upload
            name="attachment"
            className="ms-auto"
            showUploadList={false}
            multiple={false}
            customRequest={handleUpload}
          >
            <Button className="btn-blue-filled" disabled={uploading}>
              {uploading ? "Uploading..." : "Add"}
            </Button>
          </Upload>
        </div>

        <div className="ps-6">
          {attachments.length === 0 ? (
            <p className="text-sm text-gray-400">No attachments.</p>
          ) : (
            <>
              <h3 className="text-sm fc-base mb-4">Files</h3>
              <Fancybox options={{ Carousel: { infinite: false } }}>
                <ul className="flex flex-col gap-5">
                  {attachments.map((att) => {
                    const href = resolveHref(att); // <— URL aman via /api/file
                    const isImg = isImage(att);
                    const ext = fileExt(att) || (isImg ? "IMG" : "FILE");
                    const addedAt = att.created
                      ? dayjs
                        .unix(Number(att.created))
                        .format("DD MMM YYYY HH:mm")
                      : "";
                    const displayName = att.real_filename || att.filename;

                    return (
                      <li
                        key={att.attachment_id}
                        className="flex gap-4 border-b sm:border-0 pb-3 sm:pb-0"
                      >
                        <div className="flex-none hidden sm:block">
                          {isImg ? (
                            <a
                              data-fancybox="attachment"
                              href={href || undefined}
                            >
                              <div className="bg-[#F5F5F5] w-14 h-10 rounded-sm overflow-hidden flex items-center justify-center">
                                {/* gunakan preview resized */}
                                {href ? (
                                  <Image
                                    width={600}
                                    height={600}
                                    src={href}
                                    alt={displayName}
                                    className="max-w-full max-h-full"
                                  />
                                ) : null}
                              </div>
                            </a>
                          ) : (
                            <a
                              href={href || undefined}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <div className="bg-[#F5F5F5] w-14 h-10 rounded-sm flex items-center justify-center">
                                <h6 className="fc-base">{ext}</h6>
                              </div>
                            </a>
                          )}
                        </div>

                        <div className="flex-1 me-auto">
                          {isImg ? (
                            <a
                              data-fancybox="attachment"
                              href={href || undefined}
                            >
                              <h3 className="text-sm font-semibold fc-base">
                                {displayName}
                              </h3>
                            </a>
                          ) : (
                            <a
                              href={href || undefined}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <h3 className="text-sm font-semibold fc-base">
                                {displayName}
                              </h3>
                            </a>
                          )}
                          <h4 className="text-xs text-gray-400">
                            {addedAt ? `Added ${addedAt}` : null}
                          </h4>
                        </div>

                        <div className="flex-none">
                          <div className="flex mb-auto gap-3">
                            {isImg ? (
                              <Tooltip title="View" placement="bottom">
                                <a
                                  data-fancybox="attachment"
                                  href={href || undefined}
                                >
                                  <ZoomInOutlined />
                                </a>
                              </Tooltip>
                            ) : null}

                            <Tooltip title="Download" placement="bottom">
                              <a href={href || undefined} download={displayName}>
                                <DownloadOutlined />
                              </a>
                            </Tooltip>

                            <Popconfirm
                              title="Delete this file?"
                              okText="Yes"
                              cancelText="No"
                              onConfirm={() =>
                                handleDelete(att.attachment_id)
                              }
                            >
                              <button type="button">
                                <DeleteOutlined />
                              </button>
                            </Popconfirm>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Fancybox>
            </>
          )}
        </div>

        <Form.Item className="mt-7">
          <div className="flex justify-end gap-3">
            <Button
              size="large"
              color="danger"
              variant="filled"
              className="px-5"
              onClick={() => setModalRevise(false)}
            >
              Cancel
            </Button>
            <Button
              size="large"
              htmlType="submit"
              className="btn-blue px-5"
              disabled={loadingForm}
            >
              Save
              {loadingForm ? (
                <Spin
                  indicator={
                    <LoadingOutlined spin className="text-white" />
                  }
                  size="small"
                />
              ) : null}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
