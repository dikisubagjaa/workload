"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Table,
  message,
  Input,
  Button,
  Popconfirm,
  Popover,
  Modal,
  Form,
} from "antd";
import { MoreOutlined, SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { RiResetLeftLine } from "react-icons/ri";
import axiosInstance from "@/utils/axios";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";

const DEFAULT_LIMIT = 10;
const { TextArea } = Input;

function safeStr(v) {
  return (v ?? "").toString();
}

export default function TableDepartment() {
  const isMobile = useMobileQuery();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortDir, setSortDir] = useState("asc");

  // popover action: cuma satu yang kebuka (ngikut /user)
  const [openActionFor, setOpenActionFor] = useState(null); // departmentId | null

  // modal add/edit
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null); // row | null
  const [form] = Form.useForm();

  // ===== hydrate URL (sekali) =====
  useEffect(() => {
    const sp = new URLSearchParams(searchParams?.toString() || "");
    if (sp.size === 0) return;

    setPage(Number(sp.get("page") || 1));
    setLimit(Number(sp.get("limit") || DEFAULT_LIMIT));
    setQ(sp.get("q") || "");
    setSortBy(sp.get("sortBy") || "title");
    setSortDir(sp.get("sortDir") || "asc");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== sync state -> URL =====
  useEffect(() => {
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("limit", String(limit));
    if (q) sp.set("q", q);
    sp.set("sortBy", sortBy);
    sp.set("sortDir", sortDir);
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }, [page, limit, q, sortBy, sortDir, pathname, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, sortBy, sortDir };
      if (q) params.q = q;

      const { data } = await axiosInstance.get("/department/list", { params });

      // fleksibel: dukung beberapa bentuk response
      const list = data?.data ?? data?.departments ?? data?.rows ?? data?.result ?? [];
      const metaTotal =
        Number(data?.meta?.total) ||
        Number(data?.pagination?.total) ||
        Number(data?.total) ||
        Number(data?.count) ||
        list.length;

      const mapped = (list || []).map((d) => {
        const id = d.department_id ?? d.departmentId ?? d.id;
        return {
          key: id,
          departmentId: id,
          title: d.title ?? d.name ?? "-",
          description: d.description ?? "-",
          created: d.created ?? null,
          updated: d.updated ?? null,
        };
      });

      setRows(mapped);
      setTotal(metaTotal);
    } catch (err) {
      console.error("Fetch department error:", err);
      message.error(err?.response?.data?.msg || err?.message || "Gagal memuat data department");
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, sortBy, sortDir]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReset = () => {
    setQ("");
    setPage(1);
    setLimit(DEFAULT_LIMIT);
    setSortBy("title");
    setSortDir("asc");
  };

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setOpenModal(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      title: record.title === "-" ? "" : record.title,
      description: record.description === "-" ? "" : record.description,
    });
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setEditing(null);
    form.resetFields();
  };

  const submitModal = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: safeStr(values.title).trim(),
        description: safeStr(values.description).trim(),
      };

      if (!payload.title) return message.error("Title is required.");

      if (editing?.departmentId) {
        await axiosInstance.put(`/department/${editing.departmentId}`, payload);
        message.success("Department updated.");
      } else {
        await axiosInstance.post(`/department`, payload);
        message.success("Department created.");
      }

      closeModal();
      fetchData();
    } catch (err) {
      if (err?.errorFields) return; // validation antd
      console.error(err);
      message.error(err?.response?.data?.msg || err?.message || "Failed to save department");
    }
  };

  const handleDelete = async (record) => {
    try {
      await axiosInstance.delete(`/department/${record.departmentId}`);
      message.success("Department deleted.");
      setOpenActionFor(null);

      // kalau halaman jadi kosong setelah delete, mundurin page
      if (rows.length === 1 && page > 1) setPage(page - 1);
      else fetchData();
    } catch (err) {
      console.error(err);
      message.error(err?.response?.data?.msg || err?.message || "Failed to delete department");
    }
  };

  const ExpandTable = ({ record }) => (
    <ul className="flex flex-col gap-4">
      <li>
        <h4 className="text-sm font-semibold">Title :</h4>
        <h3 className="text-sm">{record.title}</h3>
      </li>
      <li>
        <h4 className="text-sm font-semibold">Description :</h4>
        <h3 className="text-sm">{record.description}</h3>
      </li>
    </ul>
  );

  const buildActionContent = (r) => (
    <div className="min-w-[260px] max-w-[300px] p-1">
      <div className="text-xs font-semibold opacity-70 px-1 pb-2">Quick actions</div>

      <div className="flex items-center justify-between gap-2 px-1 pt-1">
        <Button
          size="small"
          type="default"
          className="w-24"
          onClick={(e) => {
            e.stopPropagation();
            setOpenActionFor(null);
            openEdit(r);
          }}
        >
          Edit
        </Button>

        <Popconfirm
          title="Delete this department?"
          okText="Yes"
          cancelText="No"
          onConfirm={() => handleDelete(r)}
        >
          <Button size="small" danger className="w-24" onClick={(e) => e.stopPropagation()}>
            Delete
          </Button>
        </Popconfirm>
      </div>
    </div>
  );

  const columns = useMemo(
    () => [
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        sorter: true,
        render: (v) => (
          <div className="text-nowrap mb-2 sm:mb-0">
            <small className="text-xs font-bold block">Title :</small>
            <h3 className="text-sm">{v}</h3>
          </div>
        ),
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        sorter: true,
        render: (v) => <h3 className="text-sm">{v}</h3>,
      },
      {
        title: "",
        key: "action",
        fixed: "right",
        width: 60,
        render: (_v, r) => (
          <Popover
            trigger="click"
            placement="bottomRight"
            open={openActionFor === r.departmentId}
            onOpenChange={(v) => setOpenActionFor(v ? r.departmentId : null)}
            content={buildActionContent(r)}
          >
            <Button size="small" type="text" icon={<MoreOutlined />} />
          </Popover>
        ),
      },
    ],
    [openActionFor]
  );

  const mobileColumns = useMemo(
    () => [
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        sorter: true,
        render: (_v, r) => (
          <div className="flex items-center">
            <div className="text-nowrap mb-2 sm:mb-0">
              <small className="text-xs font-bold block">Title :</small>
              <h3 className="text-sm">{r.title}</h3>
            </div>

            <Popover
              trigger="click"
              placement="bottomRight"
              open={openActionFor === r.departmentId}
              onOpenChange={(v) => setOpenActionFor(v ? r.departmentId : null)}
              content={buildActionContent(r)}
              className="ms-auto"
            >
              <Button
                size="small"
                type="text"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Popover>
          </div>
        ),
      },
    ],
    [openActionFor]
  );

  const handleTableChange = (pagination, _filters, sorter) => {
    if (pagination?.current) setPage(pagination.current);
    if (pagination?.pageSize) setLimit(pagination.pageSize);

    if (sorter && sorter.field) {
      let nextSortBy = "title";
      if (sorter.field === "title") nextSortBy = "title";
      else if (sorter.field === "description") nextSortBy = "description";
      setSortBy(nextSortBy);
      setSortDir(sorter.order === "ascend" ? "asc" : "desc");
    }
  };

  return (
    <>
      {/* Header filter (mirip /user & /attendance): grid-cols-1 sm:grid-cols-4 lg:grid-cols-8 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
        <Input
          className="sm:col-span-4 lg:col-span-5"
          placeholder="Search"
          allowClear
          size="middle"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          suffix={<SearchOutlined />}
        />

        <Button size="middle" type="default" onClick={handleReset}>
          <RiResetLeftLine /> Reset
        </Button>

        <Button size="middle" type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          Add Department
        </Button>
      </div>

      <Table
        rowKey="key"
        loading={loading}
        dataSource={rows}
        columns={isMobile ? mobileColumns : columns}
        scroll={isMobile ? null : { x: "max-content" }}
        pagination={{ current: page, pageSize: limit, total, showSizeChanger: true }}
        sortDirections={["descend", "ascend"]}
        showHeader={!isMobile}
        onChange={handleTableChange}
        expandable={isMobile ? { expandedRowRender: (record) => <ExpandTable record={record} /> } : null}
        locale={{ emptyText: loading ? "Loading…" : "No data" }}
      />

      <Modal
        title={editing ? "Edit Department" : "Add Department"}
        open={openModal}
        onOk={submitModal}
        onCancel={closeModal}
        okText={editing ? "Save" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Title"
            name="title"
            rules={[
              { required: true, message: "Title is required." },
              { max: 100, message: "Max 100 characters." },
            ]}
          >
            <Input placeholder="e.g. Human Resources" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ max: 255, message: "Max 255 characters." }]}
          >
            <TextArea rows={3} maxLength={255} showCount placeholder="Optional description" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
