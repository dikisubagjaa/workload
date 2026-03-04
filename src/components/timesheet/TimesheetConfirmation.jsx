// /src/components/timesheet/TimesheetConfirmation.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Button, message, Spin } from "antd";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";
import { TableTimesheetArchived } from "@/components/table/TableTimesheet";

import { useRouter } from "next/navigation";

export default function TimesheetConfirmation({
    dateToConfirm,
    lockedDate,
    onConfirm,
    forceMode = false,
}) {
    const router = useRouter();

    const targetDate = useMemo(() => {
        return (
            dateToConfirm ||
            lockedDate ||
            dayjs().subtract(1, "day").format("YYYY-MM-DD")
        );
    }, [dateToConfirm, lockedDate]);

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        if (!targetDate) return;
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get("/timesheet");
                const all = res?.data?.data || [];
                const filtered = all.filter((item) => item.date === targetDate);
                setRows(filtered);
            } catch (e) {
                message.error("Failed to load yesterday's timesheet.");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [targetDate]);

    const handleConfirm = async () => {
        if (!targetDate) return;
        setConfirming(true);
        try {
            const res = await axiosInstance.post("/timesheet/confirm", {
                date: targetDate,
            });
            message.success(res?.data?.msg || "Timesheet confirmed.");

            router.push("/dashboard");
        } catch (e) {
            console.error("Timesheet confirm error:", e);

            message.error(
                e?.response?.data?.msg || "Failed to confirm yesterday's timesheet."
            );
        } finally {
            setConfirming(false);
        }
    };

    const formattedDate = dayjs(targetDate).format("dddd, D MMMM YYYY");

    return (
        <Card
            className="shadow-xl mt-8 mb-5"
            title={
                forceMode
                    ? "Confirm this timesheet"
                    : "Confirm Yesterday's Timesheet"
            }
            classNames={{ header: "bg-[#0FA3B1] text-white text-center" }}
        >
            <div className="flex flex-col gap-5">
                <p className="text-sm sm:text-base text-center fc-base">
                    Please review and confirm your timesheet from{" "}
                    <b>{formattedDate}</b>
                </p>

                <Spin spinning={loading}>
                    {rows.length > 0 ? (
                        <TableTimesheetArchived dataSource={rows} />
                    ) : (
                        <p className="text-center text-gray-400 text-sm py-4">
                            Tidak ada detail timesheet pada tanggal ini.
                        </p>
                    )}
                </Spin>

                <div className="flex justify-center">
                    <Button
                        size="large"
                        className="btn-success px-5"
                        onClick={handleConfirm}
                        loading={confirming}
                        disabled={rows.length === 0}
                    >
                        Confirm Timesheet
                    </Button>
                </div>
            </div>
        </Card>
    );
}
