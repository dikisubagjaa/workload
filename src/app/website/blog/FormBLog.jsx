"use client";

import { SaveOutlined, UploadOutlined, RobotOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Upload, message, Card } from "antd";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import QuillEditor from "@/components/utils/QuillEditor";

const { TextArea } = Input;

export default function FormBlog({ initialValues, isEdit = false, onSubmit }) {
    const [form] = Form.useForm();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [coverUrl, setCoverUrl] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState("");
    const router = useRouter();

    // Fetch data & set default values saat edit
    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                title: initialValues.title,
                category: initialValues.category || [],
                description: initialValues.description || "",
                meta_title: initialValues.meta_title,
                meta_description: initialValues.meta_description,
                meta_keyword: initialValues.meta_keyword,
            });
            setCoverUrl(initialValues.cover_url || "");
        }

        async function fetchServices() {
            setLoading(true);
            try {
                const res = await fetch("/api/website/service");
                const data = await res.json();
                setServices(Array.isArray(data) ? data : data.data || []);
            } catch (err) {
                console.error("❌ Failed to fetch services:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchServices();
    }, [initialValues, form]);

    // --- analisa ai
    const getAISuggestions = async () => {
        const content = form.getFieldValue("description");
        if (!content || !content.trim()) {
            return message.warning("Please write some content before requesting AI suggestions!");
        }

        setAiLoading(true);
        setAiResult("");

        try {
            const res = await fetch("/api/openai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Failed to fetch AI suggestions");

            setAiResult(data.result || "No suggestions returned from AI");
        } catch (err) {
            console.error(err);
            setAiResult("❌ An error occurred while fetching AI suggestions");
        } finally {
            setAiLoading(false);
        }
    };

    // --- Simpan blog ---
    const onFinish = async (values) => {
        try {
            const payload = {
                title: values.title,
                category: values.category,
                description: values.description,
                cover_url: coverUrl,
                meta_title: values.meta_title,
                meta_description: values.meta_description,
                meta_keyword: values.meta_keyword,
                updated: Date.now(),
            };

            if (!isEdit) {
                payload.created = Date.now();
                const res = await fetch("/api/website/blog", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Gagal menyimpan blog");

                message.success("Blog berhasil disimpan");
                form.resetFields();
                setCoverUrl("");
                setAiResult("");
                router.push("/website/blog");
            } else {
                if (onSubmit) {
                    await onSubmit(payload);
                    message.success("Blog berhasil diperbarui");
                    router.push("/website/blog");
                }
            }
        } catch (error) {
            console.error(error);
            message.error("Terjadi kesalahan saat mengirim data");
        }
    };

    // ---  Upload cover ---
    const uploadProps = {
        name: "file",
        action: "/api/website/upload",
        onChange(info) {
            if (info.file.status === "done") {
                const url = info.file.response?.url;
                setCoverUrl(url);
                message.success(`${info.file.name} berhasil diupload`);
            }
        },
    };

    return (
        <Form
            form={form}
            name="form-blog"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
        >
            <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: "Please input your title!" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: "Please select your category!" }]}
            >
                <Select
                    showSearch
                    placeholder="Select category"
                    optionFilterProp="label"
                    loading={loading}
                >
                    {services?.map((item) => (
                        <Select.Option key={item.item_id} value={item.title}>
                            {item.title}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            {/* Editor + tombol AI */}
            <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: "Please input your content!" }]}
            >
                <>
                    <div className="mb-3">
                        <QuillEditor
                            value={form.getFieldValue("description")}
                            onChange={(val) => form.setFieldsValue({ description: val })}
                            placeholder={"Write your content here..."}
                        />
                    </div>

                    <Button
                        icon={<RobotOutlined />}
                        loading={aiLoading}
                        onClick={getAISuggestions}
                        color="default"
                        variant="solid"
                    >
                        {aiLoading ? "Analyzing..." : "Get AI Suggestions"}
                    </Button>

                    {aiResult && (
                        <Card
                            title="💡 AI Analysis Result"
                            size="small"
                            className="mt-4 bg-gray-50"
                        >
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: aiResult.replace(/\n/g, "<br/>"),
                                }}
                            />
                        </Card>
                    )}
                </>
            </Form.Item>

            {/*  Upload Cover */}
            <Form.Item label="Cover" name="cover_url">
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
                {coverUrl && (
                    <div className="mt-2">
                        <Image
                            width={300}
                            height={300}
                            src={coverUrl}
                            alt="Cover Preview"
                            className="w-32 rounded shadow"
                        />
                    </div>
                )}
            </Form.Item>

            {/* SEO Meta Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                <Form.Item
                    label="Meta Title"
                    name="meta_title"
                    rules={[{ required: true, message: "Please input your Meta Title!" }]}
                >
                    <TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
                </Form.Item>

                <Form.Item
                    label="Meta Description"
                    name="meta_description"
                    rules={[
                        { required: true, message: "Please input your Meta Description!" },
                    ]}
                >
                    <TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
                </Form.Item>
            </div>

            <Form.Item
                label="Meta Keyword"
                name="meta_keyword"
                rules={[{ required: true, message: "Please input your Meta Keyword!" }]}
            >
                <TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
            </Form.Item>

            <Form.Item className="flex justify-end mt-7">
                <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                >
                    {isEdit ? "Update" : "Save"}
                </Button>
            </Form.Item>
        </Form>
    );
}
