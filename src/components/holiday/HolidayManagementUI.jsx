// src/components/holiday/HolidayManagementUI.jsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  Checkbox,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Popconfirm,
  Table,
  Popover,
  Select,
  Tag,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "@/utils/axios";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";
import { fetchUsers, buildUserOptions } from "@/utils/userHelpers";

const { TextArea } = Input;
const DATE_FORMAT = "YYYY-MM-DD";

const TYPE_OPTIONS = [
  { value: "holiday", label: "Tanggal Merah" },
  { value: "leave", label: "Cuti Bersama" },
];

const TYPE_COLOR = {
  holiday: "green",
  leave: "orange",
};

function getTypeLabel(type) {
  const v = String(type || "holiday").toLowerCase();
  const found = TYPE_OPTIONS.find((o) => o.value === v);
  return found?.label || v || "-";
}

export default function HolidayManagementUI() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);

  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState(""); // NEW

  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [openActionFor, setOpenActionFor] = useState(null); // holiday_id | null
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [officeExceptIds, setOfficeExceptIds] = useState([]);
  const [officeFilter, setOfficeFilter] = useState("");
  const [savingAttendanceType, setSavingAttendanceType] = useState(false);

  const isMobile = useMobileQuery();
  const [form] = Form.useForm();

  // ===== FETCH DATA =====
  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (yearFilter) params.year = yearFilter;
      if (typeFilter) params.type = typeFilter; // NEW

      const response = await axiosInstance.get("/holiday", {
        params: Object.keys(params).length ? params : undefined,
      });

      const fetched = response.data?.holidays || [];
      setHolidays(fetched);
    } catch (error) {
      console.error("Error fetching holidays:", error?.response || error?.message);
      message.error("Failed to load holidays.");
    } finally {
      setLoading(false);
    }
  }, [yearFilter, typeFilter]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const loadUsersIfNeeded = useCallback(async () => {
    if (loadingUsers) return;
    if (users.length) return;
    setLoadingUsers(true);
    try {
      const list = await fetchUsers({ limit: 500, status: "active" });
      setUsers(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error fetching users:", error?.response || error?.message);
      message.error("Failed to load users.");
    } finally {
      setLoadingUsers(false);
    }
  }, [loadingUsers, users.length]);

  // ===== HELPERS =====
  const formatDate = (val) => {
    if (!val) return "-";
    try {
      return dayjs(val).format("DD MMM YYYY");
    } catch {
      return String(val);
    }
  };

  const formatDateTimeFromUnix = (val) => {
    if (!val) return "-";
    try {
      return dayjs.unix(val).format("DD MMM YYYY HH:mm");
    } catch {
      return String(val);
    }
  };

  const yearOptions = useMemo(() => {
    const set = new Set();
    holidays.forEach((h) => {
      if (h.date) {
        const y = dayjs(h.date).year();
        if (!Number.isNaN(y)) set.add(y);
      }
    });
    const arr = Array.from(set).sort((a, b) => a - b);
    return arr.map((y) => ({ value: String(y), label: String(y) }));
  }, [holidays]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return holidays;

    return holidays.filter((h) => {
      const type = String(h.type || "").toLowerCase();
      const parts = [h.description, h.date, h.holiday_id, formatDate(h.date), type, getTypeLabel(type)];
      return parts.some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [holidays, query]);

  const resetModalState = () => {
    setIsModalVisible(false);
    setEditingHoliday(null);
    form.resetFields();
  };

  const showAddModal = () => {
    setEditingHoliday(null);
    setIsModalVisible(true);
    form.resetFields();
    form.setFieldsValue({ type: "holiday" }); // default
  };

  const showEditModal = (record) => {
    setEditingHoliday(record);
    setIsModalVisible(true);
  };

  const fillFormFromEditing = () => {
    if (!editingHoliday) {
      form.resetFields();
      form.setFieldsValue({ type: "holiday" });
      return;
    }

    form.setFieldsValue({
      date: editingHoliday.date ? dayjs(editingHoliday.date, DATE_FORMAT) : null,
      description: editingHoliday.description ?? "",
      type: String(editingHoliday.type || "holiday").toLowerCase(),
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        date: values.date ? values.date.format(DATE_FORMAT) : null,
        description: values.description?.trim() ?? "",
        type: String(values.type || "holiday").toLowerCase(), // NEW
      };

      if (!payload.date) {
        message.error("Date is required.");
        return;
      }

      if (!payload.description) {
        message.error("Description is required.");
        return;
      }

      if (payload.type !== "holiday" && payload.type !== "leave") {
        message.error("Invalid type.");
        return;
      }

      if (editingHoliday) {
        await axiosInstance.put(`/holiday/${editingHoliday.holiday_id}`, payload);
        message.success("Holiday updated successfully!");
      } else {
        await axiosInstance.post("/holiday", payload);
        message.success("Holiday added successfully!");
      }

      resetModalState();
      fetchHolidays();
    } catch (error) {
      if (error?.errorFields) return;
      console.error("Error saving holiday:", error?.response || error?.message);
      const apiMessage = error?.response?.data?.msg || "Failed to save holiday.";
      message.error(apiMessage);
    }
  };

  const handleCancel = () => resetModalState();

  const handleDelete = async (holidayId) => {
    try {
      await axiosInstance.delete(`/holiday/${holidayId}`);
      message.success("Holiday deleted successfully!");
      fetchHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error?.response || error?.message);
      const apiMessage = error?.response?.data?.msg || "Failed to delete holiday.";
      message.error(apiMessage);
    }
  };

  // ===== ACTION CONTENT (EDIT / DELETE) =====
  const buildActionContent = (record) => (
    <div className="p-1">
      <div className="text-xs font-semibold opacity-70 px-1 pb-2">Quick actions</div>
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
          title="Are you sure to delete this holiday?"
          onConfirm={() => {
            setOpenActionFor(null);
            handleDelete(record.holiday_id);
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
        title: "Date",
        dataIndex: "date",
        key: "date",
        sorter: (a, b) => {
          const da = a.date ? dayjs(a.date).valueOf() : 0;
          const db = b.date ? dayjs(b.date).valueOf() : 0;
          return da - db;
        },
        render: (value) => <div className="text-sm font-medium">{formatDate(value)}</div>,
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        width: 160,
        render: (val) => {
          const t = String(val || "holiday").toLowerCase();
          return <Tag color={TYPE_COLOR[t] || "default"}>{getTypeLabel(t)}</Tag>;
        },
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        render: (value) => <div className="text-sm break-all">{value || "-"}</div>,
      },
      {
        title: "Created At",
        dataIndex: "created",
        key: "created",
        width: 180,
        render: (val) => <span className="text-xs">{formatDateTimeFromUnix(val)}</span>,
      },
      {
        title: "Updated At",
        dataIndex: "updated",
        key: "updated",
        width: 180,
        render: (val) => <span className="text-xs">{formatDateTimeFromUnix(val)}</span>,
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
              open={openActionFor === r.holiday_id}
              onOpenChange={(v) => setOpenActionFor(v ? r.holiday_id : null)}
              content={content}
            >
              <Button size="small" type="text" icon={<MoreOutlined />} />
            </Popover>
          );
        },
      },
    ],
    [openActionFor]
  );

  // ===== MOBILE EXPAND CONTENT (DETAIL) =====
  const ExpandTable = ({ record }) => {
    const t = String(record.type || "holiday").toLowerCase();
    return (
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm py-2 px-1">
        <li>
          <h4 className="text-xs font-semibold">Date :</h4>
          <h3 className="text-sm">{formatDate(record.date)}</h3>
        </li>
        <li>
          <h4 className="text-xs font-semibold">Type :</h4>
          <h3 className="text-sm">{getTypeLabel(t)}</h3>
        </li>
        <li>
          <h4 className="text-xs font-semibold">Description :</h4>
          <h3 className="text-sm break-all">{record.description || "-"}</h3>
        </li>
        <li>
          <h4 className="text-xs font-semibold">Created At :</h4>
          <h3 className="text-xs">{formatDateTimeFromUnix(record.created)}</h3>
        </li>
        <li>
          <h4 className="text-xs font-semibold">Updated At :</h4>
          <h3 className="text-xs">{formatDateTimeFromUnix(record.updated)}</h3>
        </li>
      </ul>
    );
  };

  // ===== MOBILE COLUMN =====
  const mobileColumns = useMemo(
    () => [
      {
        title: "Holiday",
        dataIndex: "date",
        key: "date",
        render: (_v, r) => {
          const content = buildActionContent(r);
          const t = String(r.type || "holiday").toLowerCase();

          return (
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <small className="text-xs font-bold block mb-1">Date :</small>
                <div className="text-sm font-medium">{formatDate(r.date)}</div>

                <div className="mt-1">
                  <Tag color={TYPE_COLOR[t] || "default"}>{getTypeLabel(t)}</Tag>
                </div>

                <div className="text-xs text-gray-500 break-all">{r.description || "-"}</div>
              </div>

              <div className="pt-1 pl-2">
                <Popover
                  trigger="click"
                  placement="left"
                  open={openActionFor === r.holiday_id}
                  onOpenChange={(v) => setOpenActionFor(v ? r.holiday_id : null)}
                  content={content}
                >
                  <Button size="small" type="text" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                </Popover>
              </div>
            </div>
          );
        },
      },
    ],
    [openActionFor]
  );

  // ===== HEADER BAR =====
  const HeaderBar = (
    <div className="mb-5 grid grid-cols-1 lg:grid-cols-2 gap-3 items-end">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search holiday..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-80"
          allowClear
          suffix={<SearchOutlined className="text-base text-gray" />}
        />

        <Select
          allowClear
          className="w-full sm:w-40"
          placeholder="All Years"
          value={yearFilter || undefined}
          onChange={(val) => {
            setYearFilter(val || "");
            setCurrentPage(1);
          }}
          options={[{ value: "", label: "All Years" }, ...yearOptions]}
          suffixIcon={<CalendarOutlined />}
        />

        <Select
          allowClear
          className="w-full sm:w-52"
          placeholder="All Types"
          value={typeFilter || undefined}
          onChange={(val) => {
            setTypeFilter(val || "");
            setCurrentPage(1);
          }}
          options={[{ value: "", label: "All Types" }, ...TYPE_OPTIONS]}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-start lg:justify-end items-end">
        <Button
          className="w-full sm:w-auto"
          onClick={async () => {
            setSavingAttendanceType(true);
            try {
              await axiosInstance.post("/holiday/attendance-type", { mode: "wfh" });
              message.success("Attendance type set to WFH for all staff.");
            } catch (error) {
              console.error("Error setting WFH:", error?.response || error?.message);
              message.error(error?.response?.data?.msg || "Failed to set WFH.");
            } finally {
              setSavingAttendanceType(false);
            }
          }}
          loading={savingAttendanceType}
        >
          Set WFH (All)
        </Button>
        <Button
          className="w-full sm:w-auto"
          onClick={async () => {
            setIsOfficeModalOpen(true);
            await loadUsersIfNeeded();
          }}
        >
          Set OFFICE (Except)
        </Button>
        <Button className="w-full sm:w-auto" icon={<ReloadOutlined />} onClick={() => fetchHolidays()}>
          Refresh
        </Button>
        <Button type="primary" className="w-full sm:w-auto" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Holiday
        </Button>
      </div>
    </div>
  );

  return (
    <div className="holiday-management-ui flex flex-col gap-4">
      {HeaderBar}

      <Table
        rowKey="holiday_id"
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
        locale={{
          emptyText: loading ? "Loading…" : "No data",
        }}
      />

      <Modal
        title={editingHoliday ? "Edit Holiday" : "Add New Holiday"}
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
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select holiday date" }]}
          >
            <DatePicker className="w-full" format={DATE_FORMAT} placeholder="Select date" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            initialValue="holiday"
            rules={[{ required: true, message: "Please select type" }]}
          >
            <Select className="w-full" options={TYPE_OPTIONS} placeholder="Select type" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            className="mb-10"
            rules={[
              { required: true, message: "Please input holiday description" },
              { max: 120, message: "Description must not exceed 120 characters" },
            ]}
          >
            <TextArea rows={3} maxLength={120} placeholder="e.g. New Year's Day" showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Set OFFICE (Except Staff)"
        open={isOfficeModalOpen}
        onCancel={() => setIsOfficeModalOpen(false)}
        onOk={async () => {
          setSavingAttendanceType(true);
          try {
            await axiosInstance.post("/holiday/attendance-type", {
              mode: "office",
              exceptUserIds: officeExceptIds,
            });
            message.success("Attendance type set to OFFICE with exceptions.");
            setIsOfficeModalOpen(false);
            setOfficeExceptIds([]);
          } catch (error) {
            console.error("Error setting OFFICE:", error?.response || error?.message);
            message.error(error?.response?.data?.msg || "Failed to set OFFICE.");
          } finally {
            setSavingAttendanceType(false);
          }
        }}
        confirmLoading={savingAttendanceType}
        width={720}
        destroyOnClose
      >
        <div className="mb-2 text-sm text-gray-500">
          Select staff who should remain WFH (excluded from OFFICE).
        </div>
        <Input
          allowClear
          placeholder="Filter staff..."
          className="mb-3"
          value={officeFilter}
          onChange={(e) => setOfficeFilter(e.target.value)}
        />
        <div className="flex items-center gap-2 mb-2">
          <Button
            size="small"
            onClick={() =>
              setOfficeExceptIds(
                buildUserOptions(users)
                  .filter((opt) =>
                    String(opt.label || "")
                      .toLowerCase()
                      .includes(String(officeFilter || "").toLowerCase())
                  )
                  .map((opt) => opt.value)
              )
            }
          >
            Check All (Filtered)
          </Button>
          <Button size="small" onClick={() => setOfficeExceptIds([])}>
            Clear All
          </Button>
        </div>
        <div className="max-h-72 overflow-auto border rounded p-3">
          <Checkbox.Group
            className="flex flex-col gap-2 w-full"
            value={officeExceptIds}
            onChange={(vals) => setOfficeExceptIds(vals)}
            options={buildUserOptions(users).filter((opt) =>
              String(opt.label || "")
                .toLowerCase()
                .includes(String(officeFilter || "").toLowerCase())
            )}
          />
          {!loadingUsers && buildUserOptions(users).length === 0 && (
            <div className="text-sm text-gray-400">No users found.</div>
          )}
        </div>
      </Modal>
    </div>
  );
}
