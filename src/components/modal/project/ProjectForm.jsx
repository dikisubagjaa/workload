"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    Button,
    Form,
    Input,
    InputNumber,
    Select,
    DatePicker,
    Checkbox,
    Card,
    Tabs,
    Upload,
    message,
    List,
    Popover,
    Popconfirm,
    Tag,
} from "antd";
import {
    PlusOutlined,
    UploadOutlined,
    PaperClipOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import axiosInstance from "@/utils/axios";
import {
    resolveProjectDocumentUrl,
    downloadUrlAsFile,
    getFileExtension,
} from "@/utils/fileDownloadHelpers";

const { TabPane } = Tabs;

/** ========== PO Upload (tetap kecil & tidak mengganggu form utama) ========== */
const PoUploadForm = ({ qtId, projectId, onUploadSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handlePoUpload = async (values) => {
        setLoading(true);
        const formData = new FormData();
        if (values.po_file && values.po_file.length > 0) {
            formData.append("po_file", values.po_file[0].originFileObj);
        }
        formData.append("po_number", values.po_number);

        try {
            const res = await axiosInstance.post(
                `/project/${projectId}/quotation/${qtId}/po`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            if (res.status === 201) {
                message.success("PO document uploaded successfully!");
                form.resetFields();
                onUploadSuccess?.();
            }
        } catch (error) {
            message.error(error?.response?.data?.msg || "Failed to upload PO document.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitClick = async () => {
        try {
            const values = await form.validateFields();
            await handlePoUpload(values);
        } catch (err) {
            // validation errors are shown by antd
        }
    };

    return (
        <Form form={form} layout="inline">
            <Form.Item
                name="po_number"
                rules={[{ required: true, message: "PO number is required" }]}
            >
                <Input placeholder="PO Number" />
            </Form.Item>
            <Form.Item
                name="po_file"
                valuePropName="fileList"
                getValueFromEvent={(e) => e.fileList}
                rules={[{ required: true, message: "PO file is required" }]}
            >
                <Upload maxCount={1} beforeUpload={() => false}>
                    <Button icon={<UploadOutlined />}>Select PO File</Button>
                </Upload>
            </Form.Item>
            <Form.Item>
                <Button type="primary" onClick={handleSubmitClick} loading={loading}>
                    Add PO
                </Button>
            </Form.Item>
        </Form>
    );
};

/** ========== Quotation uploader (popover) ========== */
const NewQuotationForm = ({ projectId, onSuccess }) => {
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const onFinish = async (values) => {
        setUploading(true);
        const fd = new FormData();
        if (values.file && values.file.length > 0) {
            fd.append("file", values.file[0].originFileObj);
        }
        fd.append("quotation_number", values.quotation_number);

        try {
            const res = await axiosInstance.post(`/project/${projectId}/quotation`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.status === 201) {
                message.success("Quotation uploaded successfully!");
                form.resetFields();
                setOpen(false);
                onSuccess?.();
            }
        } catch (e) {
            message.error(e?.response?.data?.msg || "Failed to upload quotation.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            trigger="click"
            placement="bottomRight"
            title="Add New Quotation"
            content={
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item
                        name="quotation_number"
                        label="Quotation Number"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="Enter quotation number" />
                    </Form.Item>
                    <Form.Item
                        name="file"
                        label="Quotation File"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => e.fileList}
                        rules={[{ required: true }]}
                    >
                        <Upload maxCount={1} beforeUpload={() => false}>
                            <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={uploading}>
                        Upload
                    </Button>
                </Form>
            }
        >
            <Button icon={<PlusOutlined />}>Add Quotation</Button>
        </Popover>
    );
};

export default function ProjectForm({
    loading,
    isEditing,
    projectId,
    projectType,
    clientOptions,
    onClientChange = () => {},
    itemsQuotation,
    extraTabs,
    onCancel,
    addProjectType,
    onProjectTypeChange,
    handleAddProjectType,
    handleTabChange,
}) {
    const [quotations, setQuotations] = useState([]);
    const [loadingQuotation, setLoadingQuotation] = useState(false);

    const fetchQuotations = useCallback(async () => {
        if (!projectId) return;
        setLoadingQuotation(true);
        try {
            const res = await axiosInstance.get(`/project/${projectId}/quotation`);
            setQuotations(res?.data?.data || []);
        } catch (e) {
            message.error("Failed to fetch quotations.");
        } finally {
            setLoadingQuotation(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchQuotations();
    }, [fetchQuotations]);

    /** Delete QUOTATION */
    const handleDeleteQuotation = async (pqId) => {
        try {
            await axiosInstance.delete(`/project/${projectId}/quotation/${pqId}`);
            message.success("Quotation deleted");
            fetchQuotations();
        } catch (e) {
            message.error(e?.response?.data?.msg || "Failed to delete quotation");
        }
    };

    /** Delete PO */
    const handleDeletePO = async (pqId, poId) => {
        try {
            await axiosInstance.delete(
                `/project/${projectId}/quotation/${pqId}/po/${poId}`
            );
            message.success("PO deleted");
            fetchQuotations();
        } catch (e) {
            message.error(e?.response?.data?.msg || "Failed to delete PO");
        }
    };

    return (
        <div>
            {/* ===== Client Info ===== */}
            <h3 className="text-base fc-blue mb-3">Client Information</h3>

            <Form.Item name="client_id" label="Client" rules={[{ required: true, message: "Please select client" }]}>
                <Select
                    size="large"
                    showSearch
                    placeholder="Select client"
                    options={clientOptions}
                    optionFilterProp="searchText"
                    optionRender={(option) => {
                        const data = option?.data || {};
                        return (
                            <div className="py-1">
                                <div className="flex items-center gap-2">
                                    <Tag color="blue" className="m-0">{data.legalType || "-"}</Tag>
                                    <span className="font-medium text-slate-700">{data.title || "-"}</span>
                                </div>
                                <div className="text-xs text-slate-500 mt-1 truncate" title={data.brandText || "-"}>
                                    Brand:{" "}
                                    <span className="font-semibold text-cyan-700 bg-cyan-50 border border-cyan-100 rounded px-1.5 py-0.5">
                                        {data.brandText || "-"}
                                    </span>
                                </div>
                            </div>
                        );
                    }}
                    onChange={onClientChange}
                />
            </Form.Item>

            <h3 className="text-base fc-blue mb-3 mt-4">Project Details</h3>

            <div className="flex gap-3">
                <Form.Item name="start_date" label="Start Date" rules={[{ required: true }]} className="flex-1">
                    <DatePicker className="w-full" size="large" />
                </Form.Item>
                <Form.Item name="due_date" label="Due Date" rules={[{ required: true }]} className="flex-1">
                    <DatePicker className="w-full" size="large" />
                </Form.Item>
            </div>

            <Form.Item name="max_hours" label="Max Hours" rules={[{ required: true }]}>
                <Input type="number" size="large" placeholder="Set Hours" addonAfter="Hours" />
            </Form.Item>

            <Form.Item name="project_type" label="Project Type" rules={[{ required: true }]}>
                <Select
                    mode="multiple"
                    size="large"
                    placeholder="Select Project Type"
                    dropdownRender={(menu) => (
                        <>
                            {menu}
                            <div className="flex gap-3 p-3 border-t">
                                <Input
                                    placeholder="Add new type..."
                                    value={addProjectType}
                                    onChange={onProjectTypeChange}
                                />
                                <Button className="btn-blue" icon={<PlusOutlined />} onClick={handleAddProjectType}>
                                    Add Type
                                </Button>
                            </div>
                        </>
                    )}
                    options={(projectType || []).map((item) => ({
                        label: item.title,
                        value: item.pt_id,
                    }))}
                />
            </Form.Item>

            <Form.Item
                name="maintenance"
                getValueFromEvent={(e) => String(e.target.checked)}
                getValueProps={(value) => ({ checked: value === "true" })}
                initialValue="false"
            >
                <Checkbox>Maintenance</Checkbox>
            </Form.Item>

            <div className="flex gap-3">
                <Form.Item
                    name="currency"
                    label="Currency"
                    initialValue="IDR"
                    className="w-44"
                    rules={[{ required: true }]}
                >
                    <Select size="large" options={[{ value: "IDR", label: "IDR" }, { value: "USD", label: "USD" }]} />
                </Form.Item>
                <Form.Item name="currency_value" label="Value" className="flex-1" rules={[{ required: true }]}>
                    <Input type="number" size="large" placeholder="Fill in value here.." />
                </Form.Item>
            </div>

            <div className="flex gap-3">
                <Form.Item
                    name="duration"
                    label="Project Duration (Month)"
                    rules={[{ required: true, message: "Project duration is required" }]}
                    >
                    <InputNumber
                        size="large"
                        className="w-full"
                        min={1}
                        max={12}
                        placeholder="e.g. 3"
                    />
                    </Form.Item>

                    <Form.Item
                    name="terms_of_payment"
                    label="Terms of Payment (Day)"
                    rules={[{ required: true, message: "Terms of payment is required" }]}
                    >
                    <InputNumber
                        size="large"
                        className="w-full"
                        min={1}
                        max={365}
                        placeholder="e.g. 30"
                    />
                    </Form.Item>

            </div>

            {!!projectId && (
                <>
                    <h3 className="text-base font-semibold fc-blue my-3">Quotation & PO Details</h3>
                    <Card classNames={{ body: "p-4" }} className="border-[#0FA3B1]">
                        <Tabs
                            tabBarExtraContent={
                                <NewQuotationForm projectId={projectId} onSuccess={fetchQuotations} />
                            }
                        >
                            {quotations.length > 0 ? (
                                quotations.map((q) => {
                                    const poList =
                                        q?.PurchaseOrderByQuotation ||
                                        q?.PurchaseOrders || // fallback kalau model lama
                                        [];
                                    const quotationDoc = q?.file_url || q?.quotation_doc || null;

                                    const quotationHref = resolveProjectDocumentUrl(quotationDoc, "quotation");
                                    const qtExt = getFileExtension(quotationDoc) || getFileExtension(quotationHref) || "pdf";
                                    const qtFilename = q?.quotation_number
                                        ? `QT-${q.quotation_number}.${qtExt}`
                                        : `QT-${q?.pq_id}.${qtExt}`;

                                    return (
                                        <TabPane
                                            tab={q?.quotation_number ? `QT-${q.quotation_number}` : `QT-${q?.pq_id}`}
                                            key={q.pq_id}
                                        >
                                            <div className="flex items-center justify-between">
                                                <p>
                                                    <strong>Quotation Document:</strong>{" "}
                                                    {quotationHref ? (
                                                        <span className="inline-flex items-center gap-2">
                                                            <a href={quotationHref} target="_blank" rel="noopener noreferrer">
                                                                View Document
                                                            </a>
                                                            <Button
                                                                type="link"
                                                                className="p-0 h-auto"
                                                                onClick={async () => {
                                                                    const ok = await downloadUrlAsFile(quotationHref, qtFilename);
                                                                    if (!ok) message.error("Failed to download quotation document.");
                                                                }}
                                                            >
                                                                Download
                                                            </Button>
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">No document</span>
                                                    )}
                                                </p>
                                                <Popconfirm
                                                    title="Delete this quotation?"
                                                    onConfirm={() => handleDeleteQuotation(q.pq_id)}
                                                >
                                                    <Button danger size="small" icon={<DeleteOutlined />}>
                                                        Delete Quotation
                                                    </Button>
                                                </Popconfirm>
                                            </div>

                                            <h4 className="mt-4 mb-2 font-semibold">Purchase Orders:</h4>
                                            <List
                                                size="small"
                                                bordered
                                                dataSource={poList}
                                                locale={{ emptyText: "No PO documents uploaded yet." }}
                                                renderItem={(po) => {
                                                    const link = po?.file_url || po?.po_doc || null;
                                                    const label = po?.po_number || `PO-${po?.po_id}`;

                                                    const poHref = resolveProjectDocumentUrl(link, "po");
                                                    const poExt = getFileExtension(link) || getFileExtension(poHref) || "pdf";
                                                    const poFilename = po?.po_number
                                                        ? `PO-${po.po_number}.${poExt}`
                                                        : `PO-${po?.po_id}.${poExt}`;

                                                    return (
                                                        <List.Item
                                                            actions={[
                                                                <Popconfirm
                                                                    key="del"
                                                                    title="Delete this PO?"
                                                                    onConfirm={() => handleDeletePO(q.pq_id, po.po_id)}
                                                                >
                                                                    <Button type="link" danger icon={<DeleteOutlined />}>
                                                                        Delete
                                                                    </Button>
                                                                </Popconfirm>,
                                                            ]}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <PaperClipOutlined />
                                                                {poHref ? (
                                                                    <span className="ml-2 inline-flex items-center gap-2">
                                                                        <a href={poHref} target="_blank" rel="noopener noreferrer">
                                                                            {label}
                                                                        </a>
                                                                        <Button
                                                                            type="link"
                                                                            className="p-0 h-auto"
                                                                            onClick={async () => {
                                                                                const ok = await downloadUrlAsFile(poHref, poFilename);
                                                                                if (!ok) message.error("Failed to download PO document.");
                                                                            }}
                                                                        >
                                                                            Download
                                                                        </Button>
                                                                    </span>
                                                                ) : (
                                                                    <span className="ml-2">{label}</span>
                                                                )}
                                                            </div>
                                                        </List.Item>
                                                    );
                                                }}
                                            />

                                            <div className="mt-4 pt-4 border-t">
                                                <PoUploadForm
                                                    qtId={q.pq_id}
                                                    projectId={projectId}
                                                    onUploadSuccess={fetchQuotations}
                                                />
                                            </div>
                                        </TabPane>
                                    );
                                })
                            ) : (
                                <TabPane tab="No Quotations" key="no-data" disabled>
                                    <div className="text-center p-4">
                                        No quotations have been added for this project yet.
                                    </div>
                                </TabPane>
                            )}
                        </Tabs>
                    </Card>
                </>
            )}

            <Form.Item className="mt-10 mb-0">
                <div className="flex justify-end gap-3">
                    <Button size="large" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button size="large" htmlType="submit" className="btn-blue px-5" loading={loading}>
                        Submit
                    </Button>
                </div>
            </Form.Item>
        </div>
    );
}
