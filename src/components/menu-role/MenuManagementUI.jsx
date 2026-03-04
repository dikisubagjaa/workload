// src/components/menu-role/MenuManagementUI.jsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Radio,
  message,
  Popconfirm,
  Table,
  Popover,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";
import { getMenuIconComponent } from "@/components/menu/menuIcons";

const { TextArea } = Input;

export default function MenuManagementUI() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [parentMenus, setParentMenus] = useState([]);
  const [query, setQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionFor, setOpenActionFor] = useState(null); // menu_id | null

  const isMobile = useMobileQuery();
  const [form] = Form.useForm();

  // ===== FETCH DATA =====
  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/menu");
      const fetchedMenus = response.data?.menus || [];
      setMenus(fetchedMenus);
      setParentMenus(fetchedMenus.filter((m) => !m.parent_id));
    } catch (error) {
      console.error("Error fetching menus:", error?.response || error?.message);
      message.error("Failed to load menus.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // ===== HELPERS =====
  // iconKey: string yang disimpan di kolom menu.icon (misal: "MdOutlineHome")
  const renderMenuIcon = (iconKey) => {
    if (!iconKey) return "-";
    const iconElement = getMenuIconComponent(iconKey);
    return iconElement || "-";
  };

  const parentMap = useMemo(
    () => Object.fromEntries(menus.map((m) => [m.menu_id, m.title])),
    [menus]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return menus;
    return menus.filter((m) => {
      const parts = [
        m.title,
        m.path,
        m.icon,
        m.is_active,
        parentMap[m.parent_id] || "",
      ];
      return parts.some((v) => String(v ?? "").toLowerCase().includes(q));
    });
  }, [menus, query, parentMap]);

  // ===== MODAL ADD / EDIT =====
  const showAddModal = () => {
    setEditingMenu(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (menu) => {
    setEditingMenu(menu);
    setIsModalVisible(true);
  };

  const fillFormFromEditing = () => {
    if (!editingMenu) return;
    form.setFieldsValue({
      title: editingMenu.title ?? "",
      path: editingMenu.path ?? "",
      icon: editingMenu.icon ?? "",
      ordered:
        editingMenu.ordered !== undefined && editingMenu.ordered !== null
          ? Number(editingMenu.ordered)
          : 0,
      is_active: String(editingMenu.is_active ?? "true"),
      parent_id: editingMenu.parent_id ?? null,
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const orderedRaw = values.ordered;
      const ordered = Number.isFinite(+orderedRaw) ? +orderedRaw : 0;

      const payload = {
        title: values.title,
        path: values.path || null,
        // icon sekarang adalah key string untuk React Icons
        icon: values.icon || null,
        ordered,
        is_active: values.is_active ?? "true",
        parent_id: values.parent_id || null,
      };

      if (editingMenu) {
        await axiosInstance.put(`/menu/${editingMenu.menu_id}`, payload);
        message.success("Menu updated successfully!");
      } else {
        await axiosInstance.post("/menu", payload);
        message.success("Menu added successfully!");
      }
      setIsModalVisible(false);
      setEditingMenu(null);
      form.resetFields();
      fetchMenus();
    } catch (error) {
      console.error("Error saving menu:", error?.response || error?.message);
      message.error(
        `Failed to save menu: ${error?.response?.data?.msg || error.message}`
      );
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingMenu(null);
    form.resetFields();
  };

  const handleDelete = async (menuId) => {
    try {
      await axiosInstance.delete(`/menu/${menuId}`);
      message.success("Menu deleted successfully!");
      fetchMenus();
    } catch (error) {
      console.error("Error deleting menu:", error?.response || error?.message);
      message.error(
        `Failed to delete menu: ${error?.response?.data?.msg || error.message}`
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
          className="flex justify-start px-3"
          icon={<EditOutlined />}
          onClick={() => {
            setOpenActionFor(null);
            showEditModal(record);
          }}
        >
          Edit
        </Button>
        <Popconfirm
          title="Are you sure to delete this menu?"
          onConfirm={() => {
            setOpenActionFor(null);
            handleDelete(record.menu_id);
          }}
          okText="Yes"
          cancelText="No"
        >
          <Button
            size="small"
            danger
            className="flex justify-start px-3"
            icon={<DeleteOutlined />}
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
              {r.path || "-"}
            </h3>
          </div>
        ),
      },
      {
        title: "Icon",
        dataIndex: "icon",
        key: "icon",
        width: 120,
        sorter: true,
        render: (iconKey, row) => (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              {renderMenuIcon(iconKey, row.title)}
            </div>
            <span className="text-xs text-gray-500 break-all">
              {iconKey || "-"}
            </span>
          </div>
        ),
      },
      {
        title: "Order",
        dataIndex: "ordered",
        key: "ordered",
        width: 80,
        align: "right",
        sorter: true,
        render: (v) =>
          v === null || v === undefined ? "-" : Number(v),
      },
      {
        title: "Active",
        dataIndex: "is_active",
        key: "is_active",
        width: 90,
        align: "center",
        sorter: true,
        render: (v) => {
          const valTrue = v === true || v === "true" || v === 1 || v === "1";
          return valTrue ? "Yes" : "No";
        },
      },
      {
        title: "Parent",
        dataIndex: "parent_id",
        key: "parent_id",
        sorter: true,
        render: (id) => (id ? parentMap[id] || "-" : "-"),
      },
      {
        title: "Created At",
        dataIndex: "created",
        key: "created",
        width: 180,
        sorter: true,
        render: (v) =>
          v ? dayjs.unix(v).format("DD MMM YYYY HH:mm") : "-",
      },
      {
        key: "actions",
        width: 60,
        fixed: "right",
        render: (_v, r) => {
          const content = buildActionContent(r);
          return (
            <Popover
              trigger="click"
              placement="left"
              open={openActionFor === r.menu_id}
              onOpenChange={(v) => setOpenActionFor(v ? r.menu_id : null)}
              content={content}
            >
              <Button size="small" type="text" icon={<MoreOutlined />} />
            </Popover>
          );
        },
      },
    ],
    [parentMap, openActionFor]
  );

  // ===== MOBILE EXPAND CONTENT (DETAIL) =====
  const ExpandTable = ({ record }) => (
    <ul className="flex flex-col gap-3">
      <li>
        <h4 className="text-sm font-semibold">Path :</h4>
        <h3 className="text-sm break-all">{record.path || "-"}</h3>
      </li>
      <li>
        <h4 className="text-sm font-semibold">Icon :</h4>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 flex items-center justify-center">
            {renderMenuIcon(record.icon, record.title)}
          </div>
          <span className="text-xs text-gray-500 break-all">
            {record.icon || "-"}
          </span>
        </div>
      </li>
      <li>
        <h4 className="text-sm font-semibold">Order :</h4>
        <h3 className="text-sm">
          {record.ordered === null || record.ordered === undefined
            ? "-"
            : Number(record.ordered)}
        </h3>
      </li>
      <li>
        <h4 className="text-sm font-semibold">Active :</h4>
        <h3 className="text-sm">
          {record.is_active === true ||
          record.is_active === "true" ||
          record.is_active === 1 ||
          record.is_active === "1"
            ? "Yes"
            : "No"}
        </h3>
      </li>
      <li>
        <h4 className="text-sm font-semibold">Parent :</h4>
        <h3 className="text-sm">
          {record.parent_id ? parentMap[record.parent_id] || "-" : "-"}
        </h3>
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
                  {r.path || "-"}
                </div>
              </div>
              <div className="pt-1 pl-2">
                <Popover
                  trigger="click"
                  placement="left"
                  open={openActionFor === r.menu_id}
                  onOpenChange={(v) => setOpenActionFor(v ? r.menu_id : null)}
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
    [openActionFor]
  );

  // ===== HEADER BAR (SEARCH + ADD) =====
  const HeaderBar = (
    <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search menu..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
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
          Add New Menu
        </Button>
      </div>
    </div>
  );

  return (
    <div className="menu-management-ui flex flex-col gap-4">
      {HeaderBar}

      <Table
        rowKey="menu_id"
        size="middle"
        loading={loading}
        dataSource={filtered}
        columns={isMobile ? mobileColumns : columns}
        scroll={isMobile ? null : { x: "max-content" }}
        showHeader={!isMobile}
        expandable={
          isMobile
            ? {
                expandedRowRender: (record) => <ExpandTable record={record} />,
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

      <Modal
        title={editingMenu ? "Edit Menu" : "Add New Menu"}
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
            rules={[{ required: true, message: "Please input menu title!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="path" label="Path">
            <Input placeholder="/dashboard/my-feature" />
          </Form.Item>
          <Form.Item
            name="icon"
            label="Icon Key (React Icons)"
            tooltip="Isi dengan key icon, misal: MdOutlineHome. Lihat referensi di halaman /menu-icon"
          >
            <Input placeholder="MdOutlineHome" />
          </Form.Item>
          <Form.Item name="ordered" label="Order Number">
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="is_active"
            label="Is Active"
            rules={[{ required: true }]}
          >
            <Radio.Group optionType="button" buttonStyle="solid">
              <Radio.Button value="true">true</Radio.Button>
              <Radio.Button value="false">false</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="parent_id" label="Parent Menu">
            <Select
              placeholder="Select a parent menu (optional)"
              allowClear
              options={parentMenus.map((menu) => ({
                value: menu.menu_id,
                label: menu.title,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
