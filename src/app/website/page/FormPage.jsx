"use client";
import { SaveOutlined } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuillEditor from "@/components/utils/QuillEditor";

const { TextArea } = Input;

export default function FormPage({ initialValues, isEdit = false, onSubmit }) {
    const [form] = Form.useForm();
    const router = useRouter();
    const [contentEditor, setContentEditor] = useState(""); 

    // Set form values & editor saat edit
    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                page_name: initialValues.page_name,
                description: initialValues.description,
                meta_title: initialValues.meta_title,
                meta_description: initialValues.meta_description,
                meta_keyword: initialValues.meta_keyword,
            });
            setContentEditor(initialValues.description || "");
        }
    }, [initialValues, form]);

    const onFinish = async (values) => {
        try {
            const payload = {
                page_name: values.page_name,
                description: contentEditor,
                meta_title: values.meta_title,
                meta_description: values.meta_description,
                meta_keyword: values.meta_keyword,
                updated: Date.now(),
            };

            if (!isEdit) {
                payload.created = Date.now();

                const res = await fetch("/api/website/page", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (res.status < 200 || res.status >= 300) {
                    const errMsg = await res.text();
                    throw new Error(errMsg || "Gagal menyimpan page");
                }

                message.success("Page berhasil disimpan");
                form.resetFields();

                // ✅ Redirect ke page list
                router.push("/website/page");
            } else {
                if (onSubmit) {
                    await onSubmit(payload);
                    message.success("Page berhasil diperbarui");
                    router.push("/website/page");
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
                label="Page Name"
                name="page_name"
                rules={[{ required: true, message: "Please input your title!" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Description"
                name="description"
            >
                <QuillEditor value={contentEditor} onChange={setContentEditor} />
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
