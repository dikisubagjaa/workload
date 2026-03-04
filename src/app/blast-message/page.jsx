"use client";

import React, { useEffect, useState, useCallback } from "react";
import { SendOutlined } from "@ant-design/icons";
import { Button, Card, Form, Radio, Select, message, Space } from "antd";
import QuillEditor from "@/components/utils/QuillEditor";

export default function BlastMessagePage() {
    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
                <Card className="shadow-lg">
                    <h2 className="text-2xl font-semibold mb-2 text-gray-700">
                        Blast Message
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Send messages to all users or select specific users.
                    </p>
                    <BlastForm />
                </Card>
            </div>
        </main>
    );
}

function BlastForm() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [sendType, setSendType] = useState("select");
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // === GET USERS ===
    const getUsers = useCallback(async () => {
        try {
            setLoadingUsers(true);
            const res = await fetch("/api/user", { method: "GET" });
            if (!res.ok) throw new Error("Gagal mengambil user");

            const data = await res.json();
            const payload = Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data)
                    ? data
                    : [];

            setUsers(
                payload.map((u) => ({
                    value: u.user_id ?? u.id ?? u._id,
                    label: `${u.fullname ?? u.name ?? "Unknown"}${u.email ? ` — ${u.email}` : ""
                        }`,
                }))
            );
        } catch (err) {
            console.error("GET /user:", err);
            message.error("Gagal mengambil data pengguna");
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    // === SUBMIT FORM ===
    const onFinish = async (values) => {
        setLoading(true);
        try {
            const payload = {
                type: sendType,
                users: sendType === "select" ? values.users : [],
                message: values.message,
            };

            const res = await fetch("/api/blast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();
            console.log(payload, 'payload')
            console.log(res, 'respone')
            console.log(result, 'result')

            if (res.status === 201) {
                message.success("Blast message sent successfully!");
                form.resetFields();
                setSendType("select");
            } else {
                message.error(result?.message || "Failed to send message");
            }
        } catch (err) {
            console.error("POST /blast:", err);
            message.error("Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            name="blast-form"
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ type: "select" }}
            autoComplete="off"
        >
            {/* === TYPE === */}
            <Form.Item name="type">
                <Radio.Group
                    onChange={(e) => setSendType(e.target.value)}
                    value={sendType}
                >
                    <Radio value="select">Select User</Radio>
                    <Radio value="all">Send All</Radio>
                </Radio.Group>
            </Form.Item>

            {/* === USERS SELECT === */}
            {sendType === "select" && (
                <Form.Item
                    label="Select Users"
                    name="users"
                    rules={[
                        { required: true, message: "Please select at least one user!" },
                    ]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Select users by name or email"
                        loading={loadingUsers}
                        allowClear
                        showSearch
                        options={users}
                        optionFilterProp="label"
                    />
                </Form.Item>
            )}

            {/* === ALL USERS NOTICE === */}
            {sendType === "all" && (
                <div className="p-3 bg-green-50 text-green-600 rounded-md mb-4">
                    You will send this message to <b>all users</b>.
                </div>
            )}

            {/* === MESSAGE === */}
            <Form.Item
                label="Message"
                name="message"
                rules={[{ required: true, message: "Please input your message!" }]}
            >
                <QuillEditor
                    value={form.getFieldValue("message")}
                    onChange={(val) => form.setFieldsValue({ message: val })}
                    placeholder={"Write your message here..."}
                />
            </Form.Item>

            {/* === ACTIONS === */}
            <Form.Item className="flex justify-end mt-7">
                <Space>
                    <Button onClick={() => form.resetFields()}>Reset</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SendOutlined />}
                        loading={loading}
                    >
                        Blast
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
}
