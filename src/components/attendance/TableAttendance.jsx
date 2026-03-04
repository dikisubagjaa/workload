"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Table, Tag, message, Select, Input, Button, Form, DatePicker } from "antd";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { CiExport } from "react-icons/ci";
import { RiResetLeftLine } from "react-icons/ri";
import { SearchOutlined } from "@ant-design/icons";

dayjs.extend(utc);
dayjs.extend(tz);

const { Search } = Input;

const ZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Jakarta";
const DEFAULT_LIMIT = 10;

const STATUS_COLOR = {
    present: "green",
    late: "orange",
    absent: "red",
    leave: "blue",
    holiday: "cyan",
    sick: "volcano",
    permission: "geekblue",
};

const STATUS_OPTIONS = [
    { value: "", label: "All Status" },
    { value: "present", label: "Present" },
    { value: "late", label: "Late" },
    { value: "absent", label: "Absent" },
    { value: "leave", label: "Leave" },
    { value: "holiday", label: "Holiday" },
    { value: "sick", label: "Sick" },
    { value: "permission", label: "Permission" },
];

function fmtHHmmss(unix) {
    if (!unix && unix !== 0) return "-";
    try { return dayjs.unix(Number(unix)).tz(ZONE).format("HH:mm:ss"); } catch { return "-"; }
}
function fmtDate(ymd) {
    if (!ymd) return "-";
    try { return dayjs.tz(ymd, ZONE).format("DD/MM/YYYY"); } catch { return ymd; }
}
function fullname(u) {
    const f = (u?.fullname || "").trim();
    return f.trim() || "-";
}

export default function TableAttendance() {
    const isMobile = useMobileQuery();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_LIMIT);
    const [total, setTotal] = useState(0);

    const [period, setPeriod] = useState("today");
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("");

    const [sortBy, setSortBy] = useState("date");
    const [sortDir, setSortDir] = useState("desc");

    const [form] = Form.useForm();

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const handleSubmit = () => {
        if (!startDate || !endDate)
            return message.warning("Pilih Start & End Date.");

        if (endDate.isBefore(startDate, "day"))
            return message.error("End Date < Start Date.");

        setPeriod("period");
        setFrom(startDate.format("YYYY-MM-DD"));
        setTo(endDate.format("YYYY-MM-DD"));
        setPage(1);
    };

    const handleReset = () => {
        form.resetFields();
        setStartDate(null);
        setEndDate(null);
        setPeriod("today");
        setFrom(null);
        setTo(null);
        setPage(1);
    };

    // hydrate URL (sekali)
    useEffect(() => {
        const sp = new URLSearchParams(searchParams?.toString() || "");
        if (sp.size === 0) return;
        setPage(Number(sp.get("page") || 1));
        setLimit(Number(sp.get("limit") || DEFAULT_LIMIT));
        setPeriod(sp.get("period") || "today");
        setFrom(sp.get("from") || null);
        setTo(sp.get("to") || null);
        setQ(sp.get("q") || "");
        setStatus(sp.get("status") || "");
        setSortBy(sp.get("sortBy") || "date");
        setSortDir(sp.get("sortDir") || "desc");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // sync state -> URL
    useEffect(() => {
        const sp = new URLSearchParams();
        sp.set("page", String(page));
        sp.set("limit", String(limit));
        sp.set("period", period);
        if (period === "period") {
            if (from) sp.set("from", from);
            if (to) sp.set("to", to);
        }
        if (q) sp.set("q", q);
        if (status) sp.set("status", status);
        sp.set("sortBy", sortBy);
        sp.set("sortDir", sortDir);
        router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    }, [page, limit, period, from, to, q, status, sortBy, sortDir, pathname, router]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit, period, sortBy, sortDir };
            if (period === "period") {
                if (from) params.from = from;
                if (to) params.to = to;
            }
            if (q) params.q = q;
            if (status) params.status = status;

            const { data } = await axiosInstance.get("/attendance/list", { params });
            if (!data?.success) throw new Error(data?.msg || "Failed to fetch attendance");

            setTotal(Number(data.meta?.total || 0));
            const mapped = (data.data || []).map((r) => {
                const u = r.user || {};
                return {
                    key: r.attendance_id ?? `${r.user_id}_${r.date}`,
                    attendanceId: r.attendance_id,
                    userId: r.user_id,
                    fullname: fullname(u),
                    email: u.email || "-",
                    phone: u.phone || "-",
                    job: u.job_position || "-",
                    date: fmtDate(r.date),
                    open: fmtHHmmss(r.clock_in),
                    close: fmtHHmmss(r.clock_out),
                    reason: r.late_reason || r.notes || "-",
                    permit: r.status || "-",
                };
            });
            setRows(mapped);
        } catch (err) {
            console.error("Fetch attendance error:", err);
            message.error(err?.message || "Gagal memuat data attendance");
        } finally {
            setLoading(false);
        }
    }, [page, limit, period, from, to, q, status, sortBy, sortDir]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const columns = useMemo(() => [
        {
            title: "Fullname",
            dataIndex: "fullname",
            key: "fullname",
            render: (_val, record) => (
                <div className="text-nowrap mb-2 sm:mb-0">
                    <small className="text-xs font-bold block">Fullname :</small>
                    <Link href="#">{record.fullname}</Link>
                    <h3 className="text-sm">{record.email}</h3>
                    <h3 className="text-sm">{record.phone}</h3>
                </div>
            ),
            sorter: true,
        },
        { title: "Job Position", dataIndex: "job", key: "job", render: (v) => <h3 className="text-sm">{v}</h3> },
        { title: "Date", dataIndex: "date", key: "date", render: (v) => <h3 className="text-sm">{v}</h3>, sorter: true },
        { title: "Open", dataIndex: "open", key: "open", render: (v) => <h3 className="text-sm">{v}</h3>, sorter: true },
        { title: "Close", dataIndex: "close", key: "close", render: (v) => <h3 className="text-sm">{v}</h3>, sorter: true },
        { title: "Reason", dataIndex: "reason", key: "reason", render: (v) => <h3 className="text-sm">{v}</h3> },
        {
            title: "Permit", dataIndex: "permit", key: "permit",
            render: (v) => <Tag color={STATUS_COLOR[String(v)?.toLowerCase()] || "default"}>{v}</Tag>, sorter: true
        },
    ], []);

    const mobileColumns = useMemo(() => [
        {
            title: "Fullname",
            dataIndex: "fullname",
            key: "fullname",
            render: (_val, record) => (
                <div className="text-nowrap mb-2 sm:mb-0">
                    <small className="text-xs font-bold block">Fullname :</small>
                    <Link href="#">{record.fullname}</Link>
                    <h3 className="text-sm">{record.email}</h3>
                    <h3 className="text-sm">{record.phone}</h3>
                </div>
            ),
            sorter: true,
        },
    ], []);

    const ExpandTable = ({ record }) => (
        <ul className="flex flex-col gap-4">
            <li><h4 className="text-sm font-semibold">Job Position :</h4><h3 className="text-sm">{record.job}</h3></li>
            <li><h4 className="text-sm font-semibold">Date :</h4><h3 className="text-sm">{record.date}</h3></li>
            <li><h4 className="text-sm font-semibold">Open :</h4><h3 className="text-sm">{record.open}</h3></li>
            <li><h4 className="text-sm font-semibold">Close :</h4><h3 className="text-sm">{record.close}</h3></li>
            <li><h4 className="text-sm font-semibold">Reason :</h4><h3 className="text-sm">{record.reason}</h3></li>
            <li><h4 className="text-sm font-semibold">Permit :</h4><Tag color={STATUS_COLOR[String(record.permit)?.toLowerCase()] || "default"}>{record.permit}</Tag></li>
        </ul>
    );

    const handleTableChange = (pagination, _filters, sorter) => {
        if (pagination?.current) setPage(pagination.current);
        if (pagination?.pageSize) setLimit(pagination.pageSize);

        if (sorter && sorter.field) {
            let nextSortBy = "date";
            if (sorter.field === "fullname") nextSortBy = "fullname";
            else if (sorter.field === "open") nextSortBy = "clock_in";
            else if (sorter.field === "close") nextSortBy = "clock_out";
            else if (sorter.field === "permit") nextSortBy = "status";
            else if (sorter.field === "date") nextSortBy = "date";
            setSortBy(nextSortBy);
            setSortDir(sorter.order === "ascend" ? "asc" : "desc");
        }
    };

    const handleExport = () => {
        const sp = new URLSearchParams();
        sp.set("period", period);
        if (period === "period") {
            if (from) sp.set("from", from);
            if (to) sp.set("to", to);
        }
        if (q) sp.set("q", q);
        if (status) sp.set("status", status);
        sp.set("sortBy", sortBy);
        sp.set("sortDir", sortDir);
        window.open(`/api/attendance/export?${sp.toString()}`, "_blank");
    };

    return (
        <>
            {/* Header filter: kiri (periode), kanan (search + status + export) */}
            <Form
                form={form}
                layout="inline"
                className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-5"
            >
                <Select
                    size="middle"
                    options={STATUS_OPTIONS}
                    value={status}
                    onChange={(v) => { setStatus(v || ""); setPage(1); }}
                />

                <Form.Item name="start" className="w-full">
                    <DatePicker
                        value={startDate}
                        onChange={setStartDate}
                        placeholder="Start Date"
                        allowClear
                        className="w-full"
                    />
                </Form.Item>

                <Form.Item name="end" className="w-full">
                    <DatePicker
                        value={endDate}
                        onChange={setEndDate}
                        placeholder="End Date"
                        allowClear
                        className="w-full"
                    />
                </Form.Item>

                <Input
                    placeholder="Search"
                    allowClear
                    size="middle"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onSearch={(val) => { setQ(val || ""); setPage(1); }}
                    suffix={<SearchOutlined />}
                />

                <Button type="default" onClick={handleReset}><RiResetLeftLine /> Reset</Button>
                <Button type="primary" onClick={handleSubmit}>Submit</Button>
                
            </Form>

            <Table
                rowKey="key"
                loading={loading}
                dataSource={rows}
                columns={isMobile ? mobileColumns : columns}
                scroll={isMobile ? null : { x: "max-content" }}
                pagination={{ current: page, pageSize: limit, total, showSizeChanger: true }}
                sortDirections={["descend", "ascend"]}
                showHeader={!isMobile}
                onChange={handleTableChange}
                expandable={isMobile ? { expandedRowRender: (record) => <ExpandTable record={record} /> } : null}
                locale={{ emptyText: loading ? "Loading…" : "No data" }}
            />
        </>
    );
}
