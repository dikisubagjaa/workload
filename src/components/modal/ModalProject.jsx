"use client";

import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Form, Input, Modal, message } from "antd";
import { useState, useEffect, useCallback, useMemo } from "react";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";

import ProjectForm from "./project/ProjectForm";
import { asset } from "@/utils/url";

const normalizeStringList = (raw) => {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((x) => {
        if (x == null) return "";
        if (typeof x === "string" || typeof x === "number") return String(x).trim();
        if (typeof x === "object") {
          return String(x.title || x.label || x.name || x.brand_title || x.brand_name || "").trim();
        }
        return "";
      })
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return normalizeStringList(parsed);
      if (parsed && typeof parsed === "object") return normalizeStringList([parsed]);
    } catch {
      // fallback csv
    }
    return s.split(",").map((x) => x.trim()).filter(Boolean);
  }
  if (typeof raw === "object") return normalizeStringList([raw]);
  return [String(raw || "").trim()].filter(Boolean);
};

export default function ModalProject({
  modalProject,
  onCancel,
  onSuccess,
  editingRecord,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const projectIdFromQuery = useMemo(() => {
    const val = searchParams.get("project");
    return val ? Number(val) : null;
  }, [searchParams]);

  const [projectId, setProjectId] = useState(null);
  const isEditing = !!editingRecord || !!projectIdFromQuery;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [projectType, setProjectType] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [addProjectType, setAddProjectType] = useState("");

  const resetState = useCallback(() => {
    setProjectId(null);
    form.resetFields();
  }, [form]);

  const fetchProjectType = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/project-type");
      if (res.status === 200) setProjectType(res.data.projectType || []);
    } catch {
      message.error("Failed to load project types.");
    }
  }, []);

  const fetchClientOptions = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/client");
      const rows = Array.isArray(res?.data?.clients) ? res.data.clients : [];
      setClientOptions(
        rows.map((c) => ({
          value: c.client_id,
          label: `${c?.Company?.title || c.client_name || "-"} (${c?.Company?.legal_type || "-"})`,
          title: c?.Company?.title || c.client_name || "-",
          legalType: c?.Company?.legal_type || "-",
          brandText: normalizeStringList(c.brand).join(", "),
          searchText: `${c?.Company?.legal_type || ""} ${c?.Company?.title || c.client_name || ""} ${normalizeStringList(c.brand).join(" ")}`.toLowerCase(),
        }))
      );
    } catch {
      message.error("Failed to load client options.");
    }
  }, []);

  const prefillForEdit = useCallback(async (pid) => {
    try {
      setLoading(true);
      setProjectId(pid);

      const res = await axiosInstance.get(`/project/${pid}`);
      const p = res?.data?.data || res?.data?.project || res?.data;
      const client = p?.Client || p?.client || {};

      const ptList = p?.project_type || [];
      form.setFieldsValue({
        title: p?.title || p?.projectName || "",
        client_id: p?.client_id || client?.client_id || null,
        start_date: p?.start_date ? dayjs(p.start_date) : null,
        due_date: p?.due_date ? dayjs(p.due_date) : null,
        max_hours: p?.max_hours ?? null,
        project_type: Array.isArray(ptList)
          ? ptList
              .map((t) => {
                if (typeof t === "number" || typeof t === "string") return Number(t);
                const v = t?.pt_id ?? t?.id;
                return Number.isFinite(Number(v)) ? Number(v) : null;
              })
              .filter((v) => v !== null)
          : [],
        maintenance: String(p?.maintenance ?? "false"),
        currency: p?.currency || "IDR",
        currency_value: p?.currency_value ?? null,
        duration: String(p?.duration ?? "1"),
        terms_of_payment: String(p?.terms_of_payment ?? "1"),
      });
    } catch (err) {
      console.error("prefillForEdit error:", err);
      message.error(err?.response?.data?.msg || "Failed to load project detail.");
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    if (!modalProject) return;
    fetchProjectType();
    fetchClientOptions();

    const pid = projectIdFromQuery || editingRecord?.project_id || editingRecord?.id;
    if (pid) {
      prefillForEdit(Number(pid));
      return;
    }

    setProjectId(null);
    form.resetFields();
    form.setFieldsValue({
      maintenance: "false",
      currency: "IDR",
      duration: "1",
      terms_of_payment: "1",
    });
  }, [modalProject, fetchProjectType, fetchClientOptions, prefillForEdit, projectIdFromQuery, editingRecord, form]);

  const formProject = async (values) => {
    setLoading(true);
    try {
      const title = String(values?.title || "").trim();
      if (!title) {
        message.error("Project name is required");
        setLoading(false);
        return;
      }
      if (!values?.client_id) {
        message.error("Please select client first.");
        setLoading(false);
        return;
      }

      const projectPayload = {
        title,
        client_id: Number(values.client_id),
        start_date: values.start_date?.format("YYYY-MM-DD"),
        due_date: values.due_date?.format("YYYY-MM-DD"),
        max_hours: values.max_hours,
        project_type: values.project_type,
        maintenance: values.maintenance,
        currency: values.currency,
        currency_value: values.currency_value,
        duration: values.duration,
        terms_of_payment: values.terms_of_payment,
        published: "published",
        type: "project",
      };

      if (isEditing && projectId) {
        await axiosInstance.put(`/project/${projectId}`, projectPayload);
      } else {
        await axiosInstance.post("/project", projectPayload);
      }

      message.success(isEditing ? "Project updated successfully!" : "Project saved successfully!");
      onSuccess?.();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save project:", error?.response?.data || error?.message);
      message.error(error?.response?.data?.msg || "Failed to save project.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProjectType = async (e) => {
    e.preventDefault();
    if (!addProjectType.trim()) return message.warning("Project type name cannot be empty.");
    try {
      const res = await axiosInstance.post("/project-type", { title: addProjectType });
      if (res.status === 201) {
        const newType = res.data.projectType;
        setProjectType((prev) => [...prev, newType]);
        setAddProjectType("");
        message.success(`Project type \"${newType.title}\" added successfully!`);
      }
    } catch {
      message.error("Failed to add project type.");
    }
  };

  const handleCloseModal = useCallback(() => {
    onCancel?.();
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete("openmodal");
    params.delete("project");
    router.push(`${pathname}?${params.toString()}`);
  }, [onCancel, router, pathname, searchParams]);

  return (
    <Modal
      open={modalProject}
      onCancel={handleCloseModal}
      width={600}
      afterClose={resetState}
      destroyOnClose
      footer={null}
      maskClosable={false}
    >
      <Form form={form} onFinish={formProject} layout="vertical">
        <div className="flex gap-3 border-b pb-3 fc-base mb-6">
          <div className="flex items-center h-[38px]">
            <Image src={asset("static/images/icon/app_registration.png")} width={24} height={24} alt="icon" />
          </div>
          <div className="flex-1">
            <Form.Item name="title" className="mb-0" rules={[{ required: true, message: "Project name is required" }]}>
              <Input placeholder="Project Name Here.." className="text-lg" variant="borderless" size="large" />
            </Form.Item>
          </div>
        </div>

        <ProjectForm
          loading={loading}
          isEditing={isEditing}
          projectId={projectId}
          projectType={projectType}
          clientOptions={clientOptions}
          itemsQuotation={[]}
          extraTabs={null}
          handleTabChange={() => {}}
          onCancel={handleCloseModal}
          addProjectType={addProjectType}
          onProjectTypeChange={(e) => setAddProjectType(e.target.value)}
          handleAddProjectType={handleAddProjectType}
        />
      </Form>
    </Modal>
  );
}
