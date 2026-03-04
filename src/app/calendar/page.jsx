"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Badge, Calendar, Card, message } from "antd";
import ModalEvent from "@/components/modal/ModalEvent";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
const ZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Jakarta";

export default function App() {
    const [modalEvent, setModalEvent] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null); // 'YYYY-MM-DD'
    const [viewDate, setViewDate] = useState(dayjs().tz(ZONE));
    const [mapByDay, setMapByDay] = useState({}); // { 'YYYY-MM-DD': [events] }

    const fetchEvents = useCallback(async (monthDate) => {
        const start = monthDate.startOf("month").format("YYYY-MM-DD");
        const end = monthDate.endOf("month").format("YYYY-MM-DD");
        try {
            const { data } = await axiosInstance.get("/calendar/events", {
                params: { from: start, to: end, limit: 500, sortBy: "start_at", sortDir: "asc" },
            });
            if (!data?.success) throw new Error(data?.msg || "Failed to fetch events");

            const byDay = {};
            for (const ev of data.data || []) {
                const d = dayjs.unix(ev.start_at).tz(ZONE).format("YYYY-MM-DD");
                (byDay[d] ||= []).push(ev);
            }
            setMapByDay(byDay);
        } catch (e) {
            console.error(e);
            message.error(e?.message || "Failed to load events");
        }
    }, []);

    useEffect(() => {
        fetchEvents(viewDate);
    }, [viewDate, fetchEvents]);

    const cellRender = (current, info) => {
        if (info.type === "date") {
            const key = current.tz(ZONE).format("YYYY-MM-DD");
            const list = mapByDay[key] || [];
            if (!list.length) return null;
            const top = list.slice(0, 3);
            return (
                <ul className="events">
                    {top.map((ev) => (
                        <li key={`${ev.event_id}_${ev.start_at}`} className="truncate">
                            <Badge color={ev.color || "#1677ff"} text={ev.title} />
                        </li>
                    ))}
                    {list.length > 3 && (
                        <li className="text-xs text-gray-500">+{list.length - 3} more</li>
                    )}
                </ul>
            );
        }
        return info.originNode;
    };

    const handleSelect = (date) => {
        setSelectedDate(date.tz(ZONE).format("YYYY-MM-DD"));
        setModalEvent(true);
    };

    return (
        <section className="container py-10">
            <Card className="card-box calendar mb-5" title={<h3 className="text-lg">Calendar</h3>}>
                <Calendar
                    cellRender={cellRender}
                    onSelect={handleSelect}
                    onPanelChange={(val) => setViewDate(dayjs(val).tz(ZONE))}
                    onChange={(val) => setViewDate(dayjs(val).tz(ZONE))}
                />
            </Card>

            <ModalEvent
                modalEvent={modalEvent}
                setModalEvent={setModalEvent}
                selectedDate={selectedDate}
                onSaved={() => fetchEvents(viewDate)}
            />
        </section>
    );
}
