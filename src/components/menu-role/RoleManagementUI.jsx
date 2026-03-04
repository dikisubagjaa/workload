// src/components/menu-role/RoleManagementUI.jsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  Checkbox,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tooltip,
  Table,
  Popover,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreAddOutlined,
  SearchOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";
import { useRouter } from "next/navigation";

const { TextArea } = Input;

export default function RoleManagementUI() {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form] = Form.useForm();

  const [q, setQ] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionFor, setOpenActionFor] = useState(null); // role_id | null

  const isMobile = useMobileQuery();
  const router = useRouter();

  // ===== FETCHERS =====
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/role");
      setRoles(res.data?.roles || res.data?.data?.rows || res.data?.data || []);
    } catch (e) {
      console.error(e);
      message.error("Failed to load roles.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllMenus = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/menu");
      setMenus(res.data?.menus || []);
    } catch (e) {
      console.error(e);
      message.error("Failed to load menu options.");
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchAllMenus();
  }, [fetchRoles, fetchAllMenus]);

  // ===== HELPERS =====
  const menuMap = useMemo(
    () => Object.fromEntries(menus.map((m) => [m.menu_id, m.title])),
    [menus]
  );
  const menuPathMap = useMemo(
    () => Object.fromEntries(menus.map((m) => [m.path, m.title])),
    [menus]
  );

  const toMenuIds = (menu_access) => {
    if (!Array.isArray(menu_access)) return [];
    if (menu_access.length && typeof menu_access[0] === "object") {
      return menu_access.map((m) => m.menu_id);
    }
    return menu_access;
  };

  const resolveMenuLabel = (entry) => {
    if (entry == null) return "";
    if (typeof entry === "object") {
      return entry.title || entry.label || menuMap[entry.menu_id] || menuPathMap[entry.path] || String(entry.menu_id || entry.path || "");
    }
    const byId = menuMap[entry];
    if (byId) return byId;
    const byPath = menuPathMap[entry];
    if (byPath) return byPath;
    return String(entry);
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return roles;
    return roles.filter((r) => {
      const menuTitles = toMenuIds(r.menu_access)
        .map((id) => menuMap[id] || "")
        .join(",");
      return [r.title, r.slug, r.description, menuTitles].some((v) =>
        String(v || "").toLowerCase().includes(s)
      );
    });
  }, [roles, q, menuMap]);

  // ===== MODAL ADD/EDIT ROLE =====
  const showAddModal = () => {
    setEditingRole(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (role) => {
    setEditingRole(role);
    setIsModalVisible(true);
  };

  const fillFormFromEditing = () => {
    if (!editingRole) return;
    form.setFieldsValue({
      title: editingRole.title ?? "",
      slug: editingRole.slug ?? "",
      description: editingRole.description ?? "",
      menu_access: toMenuIds(editingRole.menu_access),
      is_superadmin: editingRole.is_superadmin === "true",
      is_hod: editingRole.is_hod === "true",
      is_operational_director: editingRole.is_operational_director === "true",
      is_hrd: editingRole.is_hrd === "true",
      is_ae: editingRole.is_ae === "true",
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title.trim(),
        slug: values.slug.trim(),
        description: values.description ?? "",
        menu_access: values.menu_access || [],
        is_superadmin: values.is_superadmin ? "true" : "false",
        is_hod: values.is_hod ? "true" : "false",
        is_operational_director: values.is_operational_director ? "true" : "false",
        is_hrd: values.is_hrd ? "true" : "false",
        is_ae: values.is_ae ? "true" : "false",
      };

      if (editingRole) {
        await axiosInstance.put(`/role/${editingRole.role_id}`, payload);
        message.success("Role updated successfully!");
      } else {
        await axiosInstance.post("/roles", payload);
        message.success("Role added successfully!");
      }

      setIsModalVisible(false);
      setEditingRole(null);
      form.resetFields();
      fetchRoles();
    } catch (error) {
      console.error(error);
      message.error(
        `Failed to save role: ${error?.response?.data?.msg || error.message
        }`
      );
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRole(null);
    form.resetFields();
  };

  const handleDelete = async (roleId) => {
    try {
      await axiosInstance.delete(`/role/${roleId}`);
      message.success("Role deleted successfully!");
      fetchRoles();
    } catch (error) {
      console.error(error);
      message.error(
        `Failed to delete role: ${error?.response?.data?.msg || error.message
        }`
      );
    }
  };

  // ===== MENU PICKER (QUICK ASSIGN) =====
  const openPickerFor = (role) => {
    setPickerRole(role);
    setPickerOpen(true);
  };

  const applyPicker = async (ids) => {
    try {
      if (!pickerRole) return;
      await axiosInstance.put(`/role/${pickerRole.role_id}`, {
        menu_access: ids,
      });
      message.success("Menu access updated.");
      setPickerOpen(false);
      setPickerRole(null);
      fetchRoles();
    } catch (e) {
      console.error(e);
      message.error(
        `Failed to update menu access: ${e?.response?.data?.msg || e.message
        }`
      );
    }
  };

  // ===== ACTION POPOVER CONTENT =====
  const buildActionContent = (record) => (
    <div className="p-1">
      <div className="text-xs font-semibold opacity-70 px-1 pb-2">
        Quick actions
      </div>
      <div className="flex flex-col gap-2 px-1 pb-1">
        <Button
          size="small"
          type="default"
          icon={<AppstoreAddOutlined />}
          className="flex justify-start px-3"
          onClick={() => {
            setOpenActionFor(null);
            router.push(`/role/${record.role_id}/menu`);
          }}
        >
          Edit Access
        </Button>
        <Button
          size="small"
          type="default"
          icon={<EditOutlined />}
          className="flex justify-start px-3"
          onClick={() => {
            setOpenActionFor(null);
            showEditModal(record);
          }}
        >
          Edit
        </Button>
        <Popconfirm
          title="Are you sure to delete this role?"
          onConfirm={() => {
            setOpenActionFor(null);
            handleDelete(record.role_id);
          }}
          okText="Yes"
          cancelText="No"
        >
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            className="flex justify-start px-3"
            onClick={(e) => e.stopPropagation()}
          >
            Delete
          </Button>
        </Popconfirm>
      </div>
    </div>
  );

  // ===== DESKTOP COLUMNS =====
  const columns = useMemo(
    () => [
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        sorter: true,
        render: (text, r) => (
          <div className="text-nowrap mb-2 sm:mb-0">
            <h3 className="text-sm font-medium">{text}</h3>
            <h3 className="text-xs text-gray-500 break-all">
              {r.slug || "-"}
            </h3>
          </div>
        ),
      },
      {
        title: "Flags",
        key: "flags",
        width: 220,
        render: (_v, r) => {
          const labels = [];
          if (r.is_superadmin === "true") labels.push("Superadmin");
          if (r.is_hrd === "true") labels.push("HRD");
          if (r.is_hod === "true") labels.push("HOD");
          if (r.is_operational_director === "true") labels.push("Director");
          if (r.is_ae === "true") labels.push("AE");
          return labels.length ? labels.join(", ") : "-";
        },
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        sorter: true,
        render: (text) => text || "-",
      },
      {
        title: "Menu Access",
        dataIndex: "menu_access",
        key: "menu_access",
        width: 400,
        sorter: true,
        render: (_v, r) => {
          const titles = Array.isArray(r.menu_access_titles) && r.menu_access_titles.length
            ? r.menu_access_titles
            : (Array.isArray(r.menu_access) ? r.menu_access.map((m) => resolveMenuLabel(m)).filter(Boolean) : []);
          const label = titles.join(", ");
          if (!label) return "-";
          return (
            <Tooltip title={label} placement="bottom">
              <span
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "normal",
                  maxWidth: "400px",
                  lineHeight: "1.4em",
                  cursor: "pointer"
                }}
              >
                {label}
              </span>
            </Tooltip>
          );
        },
      },
      {
        title: "Created At",
        dataIndex: "created",
        key: "created",
        sorter: true,
        width: 180,
        render: (v) =>
          v ? dayjs.unix(v).format("DD MMM YYYY HH:mm") : "-",
      },
      {
        title: "",
        key: "actions",
        width: 60,
        fixed: "right",
        render: (_v, r) => {
          const content = buildActionContent(r);
          return (
            <Popover
              trigger="click"
              placement="left"
              open={openActionFor === r.role_id}
              onOpenChange={(v) => setOpenActionFor(v ? r.role_id : null)}
              content={content}
            >
              <Button size="small" type="text" icon={<MoreOutlined />} />
            </Popover>
          );
        },
      },
    ],
    [openActionFor, router]
  );

  // ===== MOBILE EXPAND (DETAIL) =====
  const ExpandTable = ({ record }) => {
    const labels = [];
    if (record.is_superadmin === "true") labels.push("Superadmin");
    if (record.is_hrd === "true") labels.push("HRD");
    if (record.is_hod === "true") labels.push("HOD");
    if (record.is_operational_director === "true") labels.push("Director");
    if (record.is_ae === "true") labels.push("AE");

    return (
      <ul className="flex flex-col gap-3">
        <li>
          <h4 className="text-sm font-semibold">Slug :</h4>
          <h3 className="text-sm break-all">{record.slug || "-"}</h3>
        </li>
        <li>
          <h4 className="text-sm font-semibold">Description :</h4>
          <h3 className="text-sm break-all">
            {record.description || "-"}
          </h3>
        </li>
        <li>
          <h4 className="text-sm font-semibold">Flags :</h4>
          <h3 className="text-sm break-all">{labels.length ? labels.join(", ") : "-"}</h3>
        </li>
        <li>
          <h4 className="text-sm font-semibold">Created At :</h4>
          <h3 className="text-sm">
            {record.created
              ? dayjs.unix(record.created).format("DD MMM YYYY HH:mm")
              : "-"}
          </h3>
        </li>
      </ul>
    );
  };

  // ===== MOBILE COLUMN (SATU KOLOM + TITIK TIGA) =====
  const mobileColumns = useMemo(
    () => [
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        render: (_v, r) => {
          const content = buildActionContent(r);
          return (
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <small className="text-xs font-bold block mb-1">
                  Title :
                </small>
                <div className="text-sm font-medium">{r.title}</div>
                <div className="text-xs text-gray-500 break-all">
                  {r.slug || "-"}
                </div>
              </div>
              <div className="pt-1 pl-2">
                <Popover
                  trigger="click"
                  placement="left"
                  open={openActionFor === r.role_id}
                  onOpenChange={(v) =>
                    setOpenActionFor(v ? r.role_id : null)
                  }
                  content={content}
                >
                  <Button
                    size="small"
                    type="text"
                    icon={<MoreOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popover>
              </div>
            </div>
          );
        },
      },
    ],
    [openActionFor, router]
  );

  // ===== HEADER BAR =====
  const HeaderBar = (
    <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search roles..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-80"
          allowClear
          suffix={<SearchOutlined className="text-base text-gray" />}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-start lg:justify-end items-end">
        <Button
          type="primary"
          className="w-full sm:w-auto"
          icon={<PlusOutlined />}
          onClick={showAddModal}
        >
          Add New Role
        </Button>
      </div>
    </div>
  );

  return (
    <div className="role-management-ui flex flex-col gap-4">
      {HeaderBar}

      <Table
        rowKey="role_id"
        size="middle"
        loading={loading}
        dataSource={filtered}
        columns={isMobile ? mobileColumns : columns}
        scroll={isMobile ? null : { x: "max-content" }}
        showHeader={!isMobile}
        expandable={
          isMobile
            ? {
              expandedRowRender: (record) => (
                <ExpandTable record={record} />
              ),
            }
            : undefined
        }
        pagination={{
          current: currentPage,
          pageSize: perPage,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50, 100],
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPerPage(pageSize || 10);
          },
        }}
      />

      {/* Modal Add / Edit Role */}
      <Modal
        title={editingRole ? "Edit Role" : "Add New Role"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        destroyOnClose
        forceRender
        afterOpenChange={(open) => {
          if (open) fillFormFromEditing();
        }}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Please input role Title!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            rules={[
              { required: true, message: "Please input role slug!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <Form.Item name="is_superadmin" valuePropName="checked" className="mb-0">
              <Checkbox>Superadmin</Checkbox>
            </Form.Item>
            <Form.Item name="is_hrd" valuePropName="checked" className="mb-0">
              <Checkbox>HRD</Checkbox>
            </Form.Item>
            <Form.Item name="is_hod" valuePropName="checked" className="mb-0">
              <Checkbox>HOD</Checkbox>
            </Form.Item>
            <Form.Item name="is_operational_director" valuePropName="checked" className="mb-0">
              <Checkbox>Operational Director</Checkbox>
            </Form.Item>
            <Form.Item name="is_ae" valuePropName="checked" className="mb-0">
              <Checkbox>Account Executive</Checkbox>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
