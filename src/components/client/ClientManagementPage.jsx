"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, message, Spin, Popconfirm, Card, Input, Popover, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, LoadingOutlined, SearchOutlined, MoreOutlined } from "@ant-design/icons";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import ModalClient from "@/components/modal/ModalClient";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";

export default function ClientManagementPage({
  clientTypeFilter = null, // "leads" | "customer" | null
  pageTitle = "Client Management",
}) {
  const router = useRouter();
  const isMobile = useMobileQuery();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [openActionFor, setOpenActionFor] = useState(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/client");
      const rows = Array.isArray(response.data?.clients) ? response.data.clients : [];
      setClients(rows);
    } catch (error) {
      console.error("Error fetching clients:", error.response || error.message);
      message.error("Failed to load clients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const showAddModal = () => {
    setEditingClient(null);
    setIsModalVisible(true);
  };

  const showEditModal = (client) => {
    setEditingClient(client);
    setIsModalVisible(true);
  };

  const handleDelete = async (clientId) => {
    try {
      await axiosInstance.delete(`/client/${clientId}`);
      message.success("Client soft-deleted successfully!");
      fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error.response || error.message);
      message.error(`Failed to delete client: ${error.response?.data?.msg || error.message}`);
    }
  };

  const buildActionContent = (record) => (
    <div className="p-1">
      <div className="text-xs font-semibold opacity-70 px-1 pb-2">Quick actions</div>
      <div className="flex flex-col gap-2 px-1 pb-1">
        <Button
          size="small"
          type="default"
          className="flex justify-start px-3"
          onClick={() =>
            router.push(`/client/${record.client_id}${clientTypeFilter ? `?from=${clientTypeFilter}` : ""}`)
          }
        >
          Detail
        </Button>
        <Button
          size="small"
          type="default"
          className="flex justify-start px-3"
          icon={<EditOutlined />}
          onClick={() => showEditModal(record)}
        >
          Edit
        </Button>
        <Popconfirm
          title="Are you sure to delete this client?"
          onConfirm={() => handleDelete(record.client_id)}
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

  const formatBrand = (rawBrand) => {
    const arr = Array.isArray(rawBrand) ? rawBrand : rawBrand ? [rawBrand] : [];
    const labels = arr
      .map((item) => {
        if (item == null) return null;
        if (typeof item === "string" || typeof item === "number") return String(item);
        if (typeof item === "object") {
          return (
            item.title ||
            item.label ||
            item.name ||
            item.brand_title ||
            item.brand_name ||
            (item.brand_id != null ? `#${item.brand_id}` : null) ||
            (item.id != null ? `#${item.id}` : null) ||
            (item.value != null ? `#${item.value}` : null)
          );
        }
        return null;
      })
      .filter(Boolean);
    return labels.length > 0 ? labels.join(", ") : "-";
  };

  const extractBrandLabels = useCallback((rawBrand) => {
    if (typeof rawBrand === "string") {
      try {
        const parsed = JSON.parse(rawBrand);
        return extractBrandLabels(parsed);
      } catch {
        return rawBrand
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
      }
    }
    const arr = Array.isArray(rawBrand) ? rawBrand : rawBrand ? [rawBrand] : [];
    return arr
      .map((item) => {
        if (item == null) return "";
        if (typeof item === "string" || typeof item === "number") return String(item).trim();
        if (typeof item === "object") return String(item.title || item.label || item.name || "").trim();
        return "";
      })
      .filter(Boolean);
  }, []);

  const formatCompany = (row) => {
    const title = row?.Company?.title || row?.client_name || "-";
    const legal = row?.Company?.legal_type || null;
    return legal ? `${title} (${legal})` : title;
  };

  const columns = () => [
    { title: "ID", dataIndex: "client_id", sorter: true, key: "client_id", width: 60 },
    { title: "CRM Type", dataIndex: "client_type", sorter: true, key: "client_type" },
    { title: "Lead Status", dataIndex: "lead_status", sorter: true, key: "lead_status", render: (v) => v || "-" },
    {
      title: "Lead Source",
      dataIndex: "Leadsource",
      sorter: true,
      key: "leadsource",
      render: (v, r) => v?.title || r?.leadsource_title || "-",
    },
    {
      title: "Company",
      dataIndex: "Company",
      sorter: true,
      key: "company",
      render: (_v, r) => formatCompany(r),
    },
    {
      title: "Brand",
      dataIndex: "brand",
      sorter: true,
      key: "brand",
      render: (brands) => formatBrand(brands),
    },
    { title: "Division", dataIndex: "division", sorter: true, key: "division" },
    { title: "PIC Name", dataIndex: "pic_name", sorter: true, key: "pic_name" },
    { title: "PIC Phone", dataIndex: "pic_phone", sorter: true, key: "pic_phone" },
    { title: "PIC Email", dataIndex: "pic_email", sorter: true, key: "pic_email" },
    {
      title: "Created At",
      dataIndex: "created",
      sorter: true,
      key: "created",
      render: (text) => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-"),
    },
    {
      key: "actions",
      fixed: "right",
      width: 50,
      render: (_v, r) => {
        const content = buildActionContent(r);
        return (
          <Popover
            trigger="click"
            placement="left"
            open={openActionFor === r.client_id}
            onOpenChange={(v) => setOpenActionFor(v ? r.client_id : null)}
            content={content}
          >
            <Button size="small" type="text" icon={<MoreOutlined />} />
          </Popover>
        );
      },
    },
  ];

  const statusTagColor = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "won") return "green";
    if (s === "lost") return "red";
    if (s === "validate") return "blue";
    return "gold";
  };

  const crmTypeTagColor = (type) => {
    const t = String(type || "").toLowerCase();
    return t === "leads" ? "geekblue" : "purple";
  };

  const compactClientColumns = () => [
    {
      title: clientTypeFilter === "customer" ? "Client Profile" : "Lead Profile",
      key: "lead_profile",
      render: (_v, r) => {
        const brand = formatBrand(r.brand);
        const leadSource = r?.Leadsource?.title || "-";
        const detailHref = `/client/${r.client_id}${clientTypeFilter ? `?from=${clientTypeFilter}` : ""}`;
        return (
          <div className="min-w-[260px]">
            <button
              type="button"
              className="font-semibold text-sm text-left text-blue-600 hover:text-blue-700 hover:underline"
              onClick={() => router.push(detailHref)}
            >
              {formatCompany(r)}
            </button>
            <div className="text-xs text-gray-500 mt-1">Brand: {brand}</div>
            <div className="text-xs text-gray-500">Division: {r.division || "-"}</div>
            <div className="text-xs text-gray-500">Lead Source: {leadSource}</div>
          </div>
        );
      },
    },
    {
      title: "PIC",
      key: "pic",
      render: (_v, r) => (
        <div className="min-w-[220px]">
          <div className="text-sm font-medium">{r.pic_name || "-"}</div>
          <div className="text-xs text-gray-500 mt-1">{r.pic_phone || "-"}</div>
          <div className="text-xs text-gray-500 break-all">{r.pic_email || "-"}</div>
        </div>
      ),
    },
    {
      title: "Pipeline",
      key: "pipeline",
      render: (_v, r) => {
        const assignedName =
          r?.AssignTo?.fullname || r?.AssignTo?.email || (r?.assign_to ? `User #${r.assign_to}` : "-");
        return (
          <div className="min-w-[220px] space-y-1">
            <div>
              <Tag color={crmTypeTagColor(r.client_type)}>{String(r.client_type || "-").toUpperCase()}</Tag>
            </div>
            <div>
              <Tag color={statusTagColor(r.lead_status)}>{String(r.lead_status || "new").toUpperCase()}</Tag>
            </div>
            <div className="text-xs text-gray-600">
              <span className="font-semibold">Assign:</span>{" "}
              <Tag color="cyan" className="m-0">{assignedName}</Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: "Timeline",
      key: "timeline",
      render: (_v, r) => {
        const createdLabel = r.created ? dayjs(r.created).format("YYYY-MM-DD HH:mm") : "-";
        const followUpUnix = r.follow_up || r.follow_up_at;
        const followUp = followUpUnix ? dayjs.unix(Number(followUpUnix)) : null;
        const followUpLabel = followUp?.isValid() ? followUp.format("YYYY-MM-DD HH:mm") : "-";
        const overdue = followUp?.isValid() ? followUp.isBefore(dayjs()) : false;
        return (
          <div className="min-w-[190px] text-xs space-y-1">
            <div>
              <span className="font-semibold">Created:</span> {createdLabel}
            </div>
            <div>
              <span className="font-semibold">Follow Up:</span>{" "}
              <Tag color={overdue ? "volcano" : "blue"} className="m-0">
                {followUpLabel}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      fixed: "right",
      width: 50,
      render: (_v, r) => {
        const content = buildActionContent(r);
        return (
          <Popover
            trigger="click"
            placement="left"
            open={openActionFor === r.client_id}
            onOpenChange={(v) => setOpenActionFor(v ? r.client_id : null)}
            content={content}
          >
            <Button size="small" type="text" icon={<MoreOutlined />} />
          </Popover>
        );
      },
    },
  ];

  const mobileColumns = () => [
    {
      title: "Client Name",
      dataIndex: "client_name",
      key: "client_name",
      render: (_v, r) => {
        const content = buildActionContent(r);
        return (
          <div className="flex">
            <div>
              <h4 className="text-base font-semibold">Company:</h4>
              <h3 className="text-sm">{formatCompany(r)}</h3>
            </div>
            <div className="ms-auto flex gap-2">
              <Popover
                trigger="click"
                placement="left"
                open={openActionFor === r.client_id}
                onOpenChange={(v) => setOpenActionFor(v ? r.client_id : null)}
                content={content}
              >
                <Button size="small" type="text" icon={<MoreOutlined />} />
              </Popover>
            </div>
          </div>
        );
      },
    },
  ];

  const filteredData = useMemo(() => {
    const byType = clientTypeFilter
      ? clients.filter((item) => String(item?.client_type || "").toLowerCase() === clientTypeFilter)
      : clients;
    const q = searchTerm.toLowerCase();
    return byType.filter(
      (item) =>
        item.client_name?.toLowerCase().includes(q) ||
        item?.Company?.title?.toLowerCase().includes(q) ||
        item?.Leadsource?.title?.toLowerCase().includes(q) ||
        extractBrandLabels(item.brand).some((label) => label.toLowerCase().includes(q))
    );
  }, [clients, clientTypeFilter, searchTerm, extractBrandLabels]);

  return (
    <section className="container py-10">
      <Card className="card-table shadow-md" title={<h3 className="fc-base text-xl">{pageTitle}</h3>}>
        <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
          <div className="flex flex-wrap gap-3 justify-between mb-6">
            <div className="w-full sm:w-96">
              <Input
                placeholder="Search..."
                allowClear
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm"
                suffix={<SearchOutlined className="text-base text-gray" />}
              />
            </div>

            <Button type="primary" className="font-semibold w-full sm:w-auto" onClick={showAddModal}>
              <PlusOutlined /> Add New
            </Button>
          </div>

          <Table
            dataSource={filteredData.map((item) => ({ ...item, key: item.client_id }))}
            columns={
              isMobile
                ? mobileColumns()
                : clientTypeFilter === "leads" || clientTypeFilter === "customer"
                  ? compactClientColumns()
                  : columns()
            }
            pagination={{ pageSize: 5, position: ["bottomCenter"] }}
            showHeader={!isMobile}
            scroll={
              isMobile
                ? null
                : clientTypeFilter === "leads" || clientTypeFilter === "customer"
                  ? { x: 980 }
                  : { x: "max-content" }
            }
          />
        </Spin>
      </Card>

      <ModalClient
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        editingClient={editingClient}
        setEditingClient={setEditingClient}
        fetchClients={fetchClients}
        forcedClientType={!editingClient ? clientTypeFilter : null}
      />
    </section>
  );
}
