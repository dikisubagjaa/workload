"use client";
import { SaveOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, Upload, message } from "antd";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import QuillEditor from "@/components/utils/QuillEditor";

const { TextArea } = Input;

export default function FormService({ initialValues, isEdit = false, onSubmit }) {
    const [form] = Form.useForm();
    const [coverUrl, setCoverUrl] = useState("");
    const [contentEditor, setContentEditor] = useState(""); 
    const router = useRouter();

    // Set form values & editor saat edit
    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                title: initialValues.title,
                subtitle: initialValues.subtitle,
                description: initialValues.description,
                text_list: Array.isArray(initialValues.text_list)
                    ? initialValues.text_list.join("\n")
                    : "",
            });
            setCoverUrl(initialValues.cover_url || "");
            setContentEditor(initialValues.description || "");
        }
    }, [initialValues, form]);

    const onFinish = async (values) => {
        try {
            const payload = {
                title: values.title,
                subtitle: values.subtitle,
                description: contentEditor,
                text_list: values.text_list
                    ? values.text_list.split("\n").map(item => item.trim()).filter(Boolean)
                    : [],
                cover_url: coverUrl,
                updated: Date.now(),
            };

            if (!isEdit) {
                payload.created = Date.now();
                // Create (POST)
                const res = await fetch("/api/website/service", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Gagal menyimpan service");
                message.success("Service berhasil disimpan");
                form.resetFields();
                setCoverUrl("");
                router.push("/website/services");
            } else {
                // Update (PUT)
                if (onSubmit) {
                    router.push("/website/services");
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
                label="Subtitle"
                name="subtitle"
                rules={[{ required: true, message: "Please input your subtitle!" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="List Point (Split by enter)"
                name="text_list"
                rules={[{ required: true, message: "Please input your subtitle!" }]}
            >
                <TextArea rows={2} autoSize />
            </Form.Item>

            <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: "Please input your description!" }]}
            >
                <QuillEditor value={contentEditor} onChange={setContentEditor} />
            </Form.Item>

            <Form.Item label="Cover" name="cover_url">
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
                {coverUrl && (
                    <div className="mt-2">
                        <Image width={300} height={300}  src={coverUrl} alt="Cover Preview" className="w-32 rounded shadow" />
                    </div>
                )}
            </Form.Item>

            <Form.Item label={null} className="flex justify-end mt-7">
                <Button variant="solid" color="green" htmlType="submit" icon={<SaveOutlined />}>
                    {isEdit ? "Update" : "Save"}
                </Button>
            </Form.Item>
        </Form>
    );
}
