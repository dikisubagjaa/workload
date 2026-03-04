// src/components/modal/ModalClient.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, Select, message, Spin, DatePicker, Button } from 'antd';
import axiosInstance from '@/utils/axios';
import dayjs from 'dayjs'; 
import { buildUserOptions, fetchUsers, isAeUser } from "@/utils/userHelpers";

const { Option } = Select;
const { TextArea } = Input;

const normalizeStringList = (raw) => {
    let list = raw;
    if (typeof list === "string") {
        const trimmed = list.trim();
        if (!trimmed) return [];
        try {
            const parsed = JSON.parse(trimmed);
            list = parsed;
        } catch {
            list = trimmed.includes(",")
                ? trimmed.split(",").map((x) => x.trim()).filter(Boolean)
                : [trimmed];
        }
    }
    if (!Array.isArray(list)) list = list ? [list] : [];
    const cleaned = list
        .map((x) => {
            if (x == null) return "";
            if (typeof x === "string" || typeof x === "number") return String(x).trim();
            if (typeof x === "object") {
                return String(
                    x.title ||
                    x.label ||
                    x.name ||
                    x.brand_title ||
                    x.brand_name ||
                    x.value ||
                    ""
                ).trim();
            }
            return "";
        })
        .filter(Boolean);
    return cleaned.filter((v, i) => cleaned.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i);
};

const normalizeSingleText = (raw) => {
    const first = normalizeStringList(raw)[0] || "";
    return String(first).trim();
};

export default function ModalClient({
    isModalVisible,
    setIsModalVisible,
    editingClient,
    setEditingClient,
    fetchClients,
    forcedClientType = null,
}) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false); 
    const [leadSourceOptions, setLeadSourceOptions] = useState([]);
    const [loadingLeadSources, setLoadingLeadSources] = useState(false);
    const [userOptions, setUserOptions] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [companyOptions, setCompanyOptions] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [newCompanyTitle, setNewCompanyTitle] = useState("");
    const [newCompanyAddress, setNewCompanyAddress] = useState("");
    const [newCompanyLegalType, setNewCompanyLegalType] = useState("PT");
    const [addingCompany, setAddingCompany] = useState(false);
    const [clientTypeValue, setClientTypeValue] = useState(forcedClientType || editingClient?.client_type || "customer");
    const isLeadsContext =
        String(forcedClientType || clientTypeValue || editingClient?.client_type || "").toLowerCase() === "leads";
    const isCustomerContext =
        String(forcedClientType || clientTypeValue || editingClient?.client_type || "").toLowerCase() === "customer";

    const fetchAssignableUsers = useCallback(async () => {
        setLoadingUsers(true);
        try {
            const users = await fetchUsers({ limit: 500, status: "active" });
            const aeUsers = users.filter(isAeUser);
            setUserOptions(buildUserOptions(aeUsers));
        } catch (error) {
            console.error("Error fetching users:", error?.response || error?.message);
            message.error("Failed to load users.");
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    const fetchLeadSourceOptions = useCallback(async () => {
        setLoadingLeadSources(true);
        try {
            const response = await axiosInstance.get("/leadsource");
            const rows = Array.isArray(response?.data?.leadsources) ? response.data.leadsources : [];
            setLeadSourceOptions(
                rows.map((x) => ({
                    value: x.leadsource_id,
                    label: x.title,
                }))
            );
        } catch (error) {
            console.error("Error fetching lead source options:", error.response || error.message);
            message.error("Failed to load lead source options.");
        } finally {
            setLoadingLeadSources(false);
        }
    }, []);

    const fetchCompanyOptions = useCallback(async () => {
        setLoadingCompanies(true);
        try {
            const response = await axiosInstance.get("/company");
            const rows = Array.isArray(response?.data?.companies) ? response.data.companies : [];
            setCompanyOptions(
                rows.map((x) => ({
                    value: x.company_id,
                    label: `${x.title} (${x.legal_type})`,
                    title: x.title,
                    legal_type: x.legal_type,
                    address: x.address || "",
                }))
            );
        } catch (error) {
            console.error("Error fetching company options:", error?.response || error?.message);
            message.error("Failed to load company options.");
        } finally {
            setLoadingCompanies(false);
        }
    }, []);

    const addCompanyOption = useCallback(async () => {
        const title = String(newCompanyTitle || "").trim();
        const legalType = String(newCompanyLegalType || "").trim().toUpperCase();
        const address = String(newCompanyAddress || "").trim();
        if (!title) return message.warning("Please input company name first.");
        if (!legalType) return message.warning("Please select client type first.");

        setAddingCompany(true);
        try {
            const response = await axiosInstance.post("/company", {
                title,
                legal_type: legalType,
                address: address || null,
            });
            const company = response?.data?.company;
            if (!company?.company_id) throw new Error("Failed to read created company.");

            await fetchCompanyOptions();
            form.setFieldsValue({ company_id: company.company_id });
            setNewCompanyTitle("");
            setNewCompanyAddress("");
            message.success(response?.data?.msg || "Company saved.");
        } catch (error) {
            console.error("Error adding company:", error?.response || error?.message);
            message.error(`Failed to add company: ${error?.response?.data?.msg || error.message}`);
        } finally {
            setAddingCompany(false);
        }
    }, [newCompanyTitle, newCompanyAddress, newCompanyLegalType, form, fetchCompanyOptions]);

    useEffect(() => {
        if (isModalVisible) {
            fetchLeadSourceOptions();
            fetchCompanyOptions();
            setNewCompanyLegalType("PT");
            if (editingClient) {
                const assigned = editingClient?.AssignTo || null;
                if (assigned?.user_id) {
                    setUserOptions((prev) => {
                        const exists = prev.some((x) => Number(x.value) === Number(assigned.user_id));
                        if (exists) return prev;
                        return [
                            ...prev,
                            {
                                value: assigned.user_id,
                                label: assigned.fullname || assigned.email || `User #${assigned.user_id}`,
                            },
                        ];
                    });
                }
                form.setFieldsValue({
                    client_type: editingClient.client_type || "customer",
                    lead_status: editingClient.lead_status || null,
                    follow_up: (editingClient.follow_up || editingClient.follow_up_at)
                      ? dayjs.unix(editingClient.follow_up || editingClient.follow_up_at)
                      : null,
                    leadsource_id: editingClient.leadsource_id ?? editingClient?.Leadsource?.leadsource_id ?? null,
                    company_id: editingClient.company_id ?? editingClient?.Company?.company_id ?? null,
                    brand: normalizeSingleText(editingClient.brand),
                    assign_to: editingClient?.assign_to ?? editingClient?.AssignTo?.user_id ?? null,
                    division: editingClient.division,
                    pic_name: editingClient.pic_name,
                    pic_phone: editingClient.pic_phone,
                    pic_email: editingClient.pic_email,
                    finance_name: editingClient.finance_name,
                    finance_phone: editingClient.finance_phone,
                    finance_email: editingClient.finance_email,
                });
                setClientTypeValue(editingClient.client_type || forcedClientType || "customer");
            } else {
                form.resetFields(); 
                const nextType = forcedClientType || "customer";
                form.setFieldsValue({ client_type: nextType, company_id: null });
                setClientTypeValue(nextType);
            }
        }
     }, [isModalVisible, editingClient, form, fetchLeadSourceOptions, fetchCompanyOptions, forcedClientType]);

   
    const handleOk = async () => {
       setLoading(true);
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                follow_up: values.follow_up ? dayjs(values.follow_up).format("YYYY-MM-DD HH:mm") : null,
                leadsource_id: values.leadsource_id || null,
                company_id: values.company_id || null,
                brand: normalizeSingleText(values.brand),
                ...(forcedClientType && !editingClient ? { client_type: forcedClientType } : {}),
            };
            if (isLeadsContext) {
                payload.finance_name = null;
                payload.finance_phone = null;
                payload.finance_email = null;
            }
        
            if (editingClient) {
                await axiosInstance.put(`/client/${editingClient.client_id}`, payload); 
                message.success("Client updated successfully!");
            } else {
                await axiosInstance.post('/client', payload); 
                message.success("Client added successfully!");
            }
            setIsModalVisible(false);
            setEditingClient(null);
            form.resetFields();
            fetchClients(); 
        } catch (error) {
           console.error("DEBUG ModalClient: Form validation failed or API error:", error);
            message.error(`Failed to save client: ${error.response?.data?.msg || error.message || 'Validation failed'}`);
        } finally {
           setLoading(false);
        }
    };

    const handleCancel = () => { 
        setIsModalVisible(false);
        setEditingClient(null);
        form.resetFields();
    };

    return (
        <Modal
            title={editingClient ? "Edit Client" : "Add New Client"}
            open={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onValuesChange={(changedValues) => {
                    if (Object.prototype.hasOwnProperty.call(changedValues, "client_type")) {
                        setClientTypeValue(changedValues.client_type || forcedClientType || "customer");
                    }
                }}
            >
                <Form.Item name="client_type" label="CRM Type" rules={[{ required: true, message: "Please select type!" }]}>
                    <Select placeholder="Select Leads / Customer" disabled={!editingClient && !!forcedClientType}>
                        <Option value="leads">Leads</Option>
                        <Option value="customer">Customer</Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="company_id"
                    label="Company"
                    rules={[{ required: true, message: "Please select company!" }]}
                >
                    <Select
                        allowClear
                        showSearch
                        placeholder="Select company"
                        options={companyOptions}
                        loading={loadingCompanies}
                        optionFilterProp="label"
                        onOpenChange={(open) => {
                            if (open) fetchCompanyOptions();
                        }}
                        notFoundContent={loadingCompanies ? <Spin size="small" /> : "No company"}
                        dropdownRender={(menu) => (
                            <div>
                                {menu}
                                <div className="border-t border-gray-200 p-2 grid grid-cols-12 gap-2">
                                    <div className="col-span-4">
                                        <Select
                                            value={newCompanyLegalType}
                                            onChange={(v) => setNewCompanyLegalType(String(v || "").toUpperCase())}
                                            options={[
                                                { value: "PT", label: "PT" },
                                                { value: "CV", label: "CV" },
                                                { value: "UNOFFICIAL", label: "UNOFFICIAL" },
                                            ]}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                    <Input
                                        placeholder="Company title"
                                        value={newCompanyTitle}
                                        onChange={(e) => setNewCompanyTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addCompanyOption();
                                            }
                                        }}
                                    />
                                    </div>
                                    <div className="col-span-2">
                                    <Button
                                        type="primary"
                                        loading={addingCompany}
                                        className="w-full"
                                        onClick={addCompanyOption}
                                    >
                                        Add
                                    </Button>
                                    </div>
                                    <div className="col-span-12">
                                        <TextArea
                                            rows={2}
                                            placeholder="Company address"
                                            value={newCompanyAddress}
                                            onChange={(e) => setNewCompanyAddress(e.target.value)}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                </Form.Item>
              
                <Form.Item name="lead_status" label="Lead Status">
                    <Select allowClear placeholder="Select lead status">
                        <Option value="new">New</Option>
                        <Option value="validate">Validate</Option>
                        <Option value="lost">Lost</Option>
                        <Option value="won">Won</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="follow_up" label="Follow Up Schedule (YYYY-MM-DD HH:mm)">
                    <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm"
                        className="w-full"
                        placeholder="Select follow up schedule"
                    />
                </Form.Item>
                <Form.Item
                    name="leadsource_id"
                    label="Lead Source"
                    rules={isLeadsContext ? [{ required: true, message: "Please select lead source!" }] : []}
                >
                    <Select
                        allowClear
                        showSearch
                        placeholder="Select lead source"
                        options={leadSourceOptions}
                        loading={loadingLeadSources}
                        optionFilterProp="label"
                        onOpenChange={(open) => {
                            if (open) fetchLeadSourceOptions();
                        }}
                        notFoundContent={loadingLeadSources ? <Spin size="small" /> : "No lead source"}
                    />
                </Form.Item>
                <Form.Item name="brand" label="Brand" rules={[{ required: true, message: "Please input brand!" }]}>
                    <Input placeholder="Input brand (contoh: Brand A, Brand B)" />
                </Form.Item>
                <Form.Item name="assign_to" label={isLeadsContext ? "Assign to" : "Agent In Charge"}>
                    <Select
                        allowClear
                        showSearch
                        placeholder="Select AE"
                        options={userOptions}
                        loading={loadingUsers}
                        optionFilterProp="label"
                        onOpenChange={(open) => {
                            if (open) fetchAssignableUsers();
                        }}
                        notFoundContent={loadingUsers ? <Spin size="small" /> : "No AE users"}
                    />
                </Form.Item>
                <Form.Item name="division" label="Division">
                    <Input />
                </Form.Item>
                <Form.Item name="pic_name" label="PIC Name" rules={[{ required: true, message: 'Please input PIC Name!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="pic_phone" label="PIC Phone" rules={[{ required: true, message: 'Please input PIC Phone!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="pic_email" label="PIC Email" rules={[{ required: true, message: 'Please input PIC Email!' }, { type: 'email', message: 'Please enter a valid email!' }]}>
                    <Input />
                </Form.Item>
                {isCustomerContext ? (
                    <>
                        <Form.Item
                            name="finance_name"
                            label="Finance Contact Name"
                            rules={[{ required: true, message: "Please input Finance Contact Name!" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="finance_phone"
                            label="Finance Contact Phone"
                            rules={[{ required: true, message: "Please input Finance Contact Phone!" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="finance_email"
                            label="Finance Contact Email"
                            rules={[
                                { required: true, message: "Please input Finance Contact Email!" },
                                { type: 'email', message: 'Please enter a valid email!' },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </>
                ) : null}
            </Form>
        </Modal>
    );
}
