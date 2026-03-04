// /src/components/timesheet/TimesheetArchived.jsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, Spin, message, DatePicker, Empty, Collapse } from "antd";
import { TableTimesheetArchived } from "@/components/table/TableTimesheet";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";

export default function TimesheetArchived() {
    const [loading, setLoading] = useState(true);
    const [timesheetData, setTimesheetData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(dayjs());

    const fetchData = useCallback(
        async (month) => {
            setLoading(true);
            try {
                const monthString = month.format("YYYY-MM");
                const response = await axiosInstance.get(
                    `/timesheet?month=${monthString}`
                );
                setTimesheetData(response.data.data || []);
            } catch (error) {
                message.error("Failed to load archived timesheet data");
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchData(selectedMonth);
    }, [selectedMonth, fetchData]);

    // 1. ambil yang approved aja
    const approvedData = useMemo(
        () => timesheetData.filter((i) => i.status === "approved"),
        [timesheetData]
    );

    // 2. group by tanggal
    const groupedByDate = useMemo(() => {
        const map = {};
        approvedData.forEach((item) => {
            const d = item.date; // asumsi API kirim YYYY-MM-DD
            if (!map[d]) map[d] = [];
            map[d].push(item);
        });

        // urutkan tanggal terbaru dulu
        return Object.entries(map).sort(([a], [b]) => {
            const da = dayjs(a);
            const db = dayjs(b);
            if (da.isBefore(db)) return 1;
            if (da.isAfter(db)) return -1;
            return 0;
        });
    }, [approvedData]);

    // 3. bikin item collapse
    const collapseItems =
        groupedByDate.length > 0
            ? groupedByDate.map(([date, items]) => ({
                key: date,
                label: dayjs(date).format("dddd, D MMM YYYY"),
                children: <TableTimesheetArchived dataSource={items} />,
            }))
            : [
                {
                    key: "empty",
                    label: "Archived timesheet",
                    children: (
                        <Empty description="No timesheet data found for the selected month." />
                    ),
                },
            ];

    return (
        <Spin spinning={loading}>
            <Card className="card-box">
                <div className="flex justify-end mb-5">
                    <DatePicker
                        onChange={(date) => setSelectedMonth(date || dayjs())}
                        picker="month"
                        defaultValue={selectedMonth}
                        allowClear={false}
                    />
                </div>

                <Collapse
                    items={collapseItems}
                    defaultActiveKey={
                        groupedByDate.length ? [groupedByDate[0][0]] : ["empty"]
                    }
                    expandIconPosition="end"
                />
            </Card>
        </Spin>
    );
}
