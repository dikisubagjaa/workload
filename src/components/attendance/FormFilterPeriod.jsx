"use client";
import { useState } from "react";
import { DatePicker, Button, Select, Form, message } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(tz);

const ZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Jakarta";

/**
 * Props:
 * - defaultPeriod: 'today' | 'period' (default: 'today')
 * - defaultFrom: 'YYYY-MM-DD' | null
 * - defaultTo: 'YYYY-MM-DD' | null
 * - onChange: ({ period, from, to }) => void
 * - className?: string
 */
export default function FormFilterPeriod({
    defaultPeriod = "today",
    defaultFrom = null,
    defaultTo = null,
    onChange,
    className = "",
}) {
    const [form] = Form.useForm();

    const [period, setPeriod] = useState(defaultPeriod);
    const [startDate, setStartDate] = useState(
        defaultFrom ? dayjs.tz(defaultFrom, ZONE) : null
    );
    const [endDate, setEndDate] = useState(
        defaultTo ? dayjs.tz(defaultTo, ZONE) : null
    );

    const emit = (next = {}) => {
        const payload = {
            period,
            from: period === "period" && startDate ? startDate.format("YYYY-MM-DD") : null,
            to: period === "period" && endDate ? endDate.format("YYYY-MM-DD") : null,
            ...next,
        };
        if (typeof onChange === "function") onChange(payload);
    };

    const onChangeFilter = (value) => {
        setPeriod(value);
        if (value !== "period") {
            setStartDate(null);
            setEndDate(null);
            emit({ period: value, from: null, to: null });
        }
    };

    const onSubmit = () => {
        if (period === "period") {
            if (!startDate || !endDate) return message.warning("Pilih Start & End Date.");
            if (endDate.isBefore(startDate, "day")) return message.error("End Date < Start Date.");
        }
        emit();
    };

    const onReset = () => {
        setPeriod("today");
        setStartDate(null);
        setEndDate(null);
        form.resetFields();
        emit({ period: "today", from: null, to: null });
    };

    return (
        <Form
            form={form}
            layout="inline"
            className={`flex flex-wrap items-end gap-3 ${className}`}
            onFinish={onSubmit}
        >
            <Form.Item name="period" className="mb-0" initialValue={period}>
                <Select
                    size="middle"
                    className="min-w-[120px] shrink-0"
                    onChange={onChangeFilter}
                    value={period}
                    options={[
                        { value: "today", label: "Today" },
                        { value: "period", label: "Period" },
                    ]}
                />
            </Form.Item>

            {period === "period" && (
                <>
                    <Form.Item name="start_date" className="mb-0">
                        <DatePicker
                            placeholder="Start"
                            size="middle"
                            className="w-[160px] shrink-0"
                            value={startDate}
                            onChange={setStartDate}
                            allowClear
                        />
                    </Form.Item>

                    <Form.Item name="end_date" className="mb-0">
                        <DatePicker
                            placeholder="End"
                            size="middle"
                            className="w-[160px] shrink-0"
                            value={endDate}
                            onChange={setEndDate}
                            allowClear
                        />
                    </Form.Item>

                    <Button htmlType="submit" size="middle" className="shrink-0 btn-outline-success">
                        Submit
                    </Button>
                    <Button onClick={onReset} size="middle" className="shrink-0">
                        Reset
                    </Button>
                </>
            )}

            {period === "today" && (
                <Button onClick={onReset} size="middle" className="shrink-0">
                    Reset
                </Button>
            )}
        </Form>
    );
}
