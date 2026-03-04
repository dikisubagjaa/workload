"use client";
import { SaveOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, Upload, message } from "antd";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const { TextArea } = Input;

export default function FormClient({ initialValues, isEdit = false, onSubmit }) {
    const [form] = Form.useForm();
    const editorRef = useRef(null);
    const [coverUrl, setCoverUrl] = useState("");
    const router = useRouter();

    // Set form values saat edit
    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                client_name: initialValues.client_name,
                meta_keyword: initialValues.meta_keyword,
            });
            setCoverUrl(initialValues.cover_url || "");
        }
    }, [initialValues, form]);

    const onFinish = async (values) => {
        try {
            const payload = {
                client_name: values.client_name,
                cover_url: coverUrl,
                meta_keyword: values.meta_keyword,
                updated: Date.now(),
            };

            if (!isEdit) {
                payload.created = Date.now();
                const res = await fetch("/api/website/client", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Gagal menyimpan client");
                message.success("Client berhasil disimpan");
                form.resetFields();
                setCoverUrl("");
                editorRef.current?.setContent("");
                router.push('/website/clients');
            } else {
                if (onSubmit) {
                    router.push('/website/clients');
                    await onSubmit(payload); // update handler
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
                label="Client Name"
                name="client_name"
                rules={[{ required: true, message: "Please input your title!" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Cover"
                name="cover_url"
            >
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
                {coverUrl && (
                    <div className="mt-2">
                        <Image width={300}  height={300} src={coverUrl} alt="Cover Preview" className="w-32 rounded shadow" />
                    </div>
                )}
            </Form.Item>

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
