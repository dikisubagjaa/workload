"use client";
import { SaveOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Select, Upload, message } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import QuillEditor from "@/components/utils/QuillEditor";

const { TextArea } = Input;

export default function FormProject({ initialValues, isEdit = false, onSubmit }) {
    const [form] = Form.useForm();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [contentEditor, setContentEditor] = useState("");
    const [coverUrl, setCoverUrl] = useState("");
    const router = useRouter();

    // Set form values & editor saat edit
    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                title: initialValues.title,
                category: initialValues.category || [],
                year: initialValues.year ? dayjs(initialValues.year, "YYYY") : null,
                description: initialValues.description,
                metaTitle: initialValues.meta_title,
                metaDescription: initialValues.meta_description,
                metaKeyword: initialValues.meta_keyword,
            });
            setCoverUrl(initialValues.cover_url || "");
            setContentEditor(initialValues.description || "");
        }

        async function fetchServices() {
            setLoading(true);
            try {
                const res = await fetch("/api/website/service");
                const data = await res.json();
                setServices(data);
            } catch (err) {
                console.error("❌ Failed to fetch services:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchServices();
    }, [initialValues, form]);

    const onFinish = async (values) => {
        try {
            const payload = {
                title: values.title,
                category: values.category,
                year: values.year.format("YYYY"),
                description: contentEditor,
                cover_url: coverUrl,
                meta_title: values.meta_title,
                meta_description: values.meta_description,
                meta_keyword: values.meta_keyword,
                updated: Date.now(),
            };

            if (!isEdit) {
                payload.created = Date.now();
                // Create (POST)
                const res = await fetch("/api/website/project", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Gagal menyimpan project");
                message.success("Project berhasil disimpan");
                form.resetFields();
                setCoverUrl("");
                router.push('/website/project')
            } else {
                // Update (PUT)
                if (onSubmit) {
                    router.push('/website/project')
                    await onSubmit(payload); // panggil handler update dari page.js
                }
            }
        } catch (error) {
            console.error(error);
            message.error("Terjadi kesalahan saat mengirim data");
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };

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
            name="basic"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
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
                >
                    {services.map((item) => (
                        <Select.Option key={item.item_id} value={item.title}>
                            {item.title}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                label="Year"
                name="year"
                rules={[{ required: true, message: "Please input your year!" }]}
            >
                <DatePicker picker="year" className="w-full" />
            </Form.Item>

            <Form.Item label="Description" name="description">
                <QuillEditor value={contentEditor} onChange={setContentEditor} />
            </Form.Item>

            <Form.Item label="Cover" name="cover_url">
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
                {coverUrl && (
                    <div className="mt-2">
                        <Image width={300} height={300} src={coverUrl} alt="Cover Preview" className="w-32 rounded shadow" />
                    </div>
                )}
            </Form.Item>

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
                    rules={[{ required: true, message: "Please input your Meta Description!" }]}
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

            <Form.Item label={null} className="flex justify-end mt-7">
                <Button variant="solid" color="green" htmlType="submit" icon={<SaveOutlined />}>
                    {isEdit ? "Update" : "Save"}
                </Button>
            </Form.Item>
        </Form>
    );
}
