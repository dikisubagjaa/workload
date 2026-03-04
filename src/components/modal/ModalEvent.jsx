"use client";

import React, { useEffect } from "react";
import { Checkbox, ColorPicker, Input, Modal, message } from "antd";
import { Form, Button, DatePicker } from "antd";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
const ZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Jakarta";
const { TextArea } = Input;

export default function ModalEvent({ modalEvent, setModalEvent, selectedDate, onSaved }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (modalEvent) {
            const base = selectedDate
                ? dayjs.tz(selectedDate, "YYYY-MM-DD", ZONE)
                : dayjs().tz(ZONE);
            form.setFieldsValue({
                title: "",
                description: "",
                start_at: base.hour(9).minute(0).second(0),
                end_at: base.hour(10).minute(0).second(0),
                color: "#14AE5C",
                is_public: false,
            });
        }
    }, [modalEvent, selectedDate, form]);

    const handleCancel = () => setModalEvent(false);

    const onFinish = async (values) => {
        try {
            const start = values.start_at ? dayjs(values.start_at).tz(ZONE).unix() : null;
            const end = values.end_at ? dayjs(values.end_at).tz(ZONE).unix() : null;
            const colorHex = values.color
                ? typeof values.color === "string"
                    ? values.color
                    : values.color.toHexString()
                : null;

            const payload = {
                title: String(values.title || "").trim(),
                description: values.description ? String(values.description) : null,
                start_at: start,
                end_at: end,
                color: colorHex,
                is_public: !!values.is_public,
            };

            const { data } = await axiosInstance.post("/calendar/events", payload);
            if (!data?.success) throw new Error(data?.msg || "Failed to create event");

            message.success("Event saved");
            setModalEvent(false);
            form.resetFields();
            if (typeof onSaved === "function") onSaved();
        } catch (e) {
            console.error(e);
            message.error(e?.message || "Failed to save event");
        }
    };

    const onFinishFailed = (err) => {
        console.error(err);
    };

    return (
        <Modal
            open={modalEvent}
            onCancel={handleCancel}
            width={700}
            footer={null}
            destroyOnClose
        >
            <div className="pb-3 border-b mb-4">
                <h2 className="text-lg font-semibold fc-blue">Add New Event</h2>
            </div>

            <Form
                form={form}
                name="eventForm"
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Form.Item
                    label="Event title"
                    name="title"
                    rules={[{ required: true, message: "This field cannot be empty" }]}
                >
                    <Input size="large" />
                </Form.Item>

                <Form.Item label="Description" name="description">
                    <TextArea className="mb-3" autoSize={{ minRows: 3, maxRows: 5 }} />
                </Form.Item>

                <Form.Item
                    label="Start Date & Time"
                    name="start_at"
                    rules={[{ required: true, message: "This field cannot be empty" }]}
                >
                    <DatePicker size="large" className="w-full" showTime />
                </Form.Item>

                <Form.Item
                    label="End Date & Time"
                    name="end_at"
                    rules={[{ required: true, message: "This field cannot be empty" }]}
                >
                    <DatePicker size="large" className="w-full" showTime />
                </Form.Item>

                <div className="flex justify-between items-center gap-6">
                    <Form.Item label="Event Color" name="color">
                        <ColorPicker defaultValue="#14AE5C" showText allowClear />
                    </Form.Item>

                    <Form.Item name="is_public" valuePropName="checked">
                        <Checkbox>Public Only</Checkbox>
                    </Form.Item>
                </div>

                <Form.Item className="text-center">
                    <Button htmlType="submit" className="btn-blue" size="large">
                        Save
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}
