"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Select, Table, Tag, Input } from "antd";
import Link from "next/link";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";
import axiosInstance from "@/utils/axios";

const { Search } = Input;

// Map category ke label UI
const catLabel = (c) =>
    c === "proposal" ? "Proposal" : c === "po" ? "Invoice" : c === "project" ? "Project" : c || "-";

// Warna status; saat ini API return null → tampil "-", warna default
const STATUS_COLOR = {
    submitted: "success",
    pending: "orange",
    overdue: "volcano",
    "-": "default",
};

export default function TableTracker() {
    const isMobile = useMobileQuery();

    // state table
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);

    // filter/sort
    const [q, setQ] = useState("");
    const [category, setCategory] = useState(""); // '' = all | 'proposal' | 'po' | 'project'
    const [sortBy, setSortBy] = useState("date"); // date|title|client|category
    const [sortDir, setSortDir] = useState("desc"); // asc|desc

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit, sortBy, sortDir };
            if (q) params.q = q;
            if (category) params.category = category; // otherwise backend default 'all'

            const { data } = await axiosInstance.get("/tracker/list", { params });
            if (!data?.success) throw new Error(data?.msg || "Failed to fetch tracker");

            setTotal(Number(data.meta?.total || 0));
            const mapped = (data.data || []).map((it) => ({
                key: `${it.category}_${it.id}`,
                title: it.title || "-",
                category: it.category || "",
                status: it.status ?? "-", // API kirim null → tampil '-'
            }));
            setRows(mapped);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [page, limit, q, category, sortBy, sortDir]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // kolom desktop
    const columns = useMemo(
        () => [
            {
                title: "Title",
                dataIndex: "title",
                key: "title",
                sorter: true,
                render: (v) => (
                    <h3 className="text-sm text-[#383F50] truncate">
                        <Link href="#">{v}</Link>
                    </h3>
                ),
            },
            {
                title: "Category",
                dataIndex: "category",
                key: "category",
                sorter: true,
                render: (v) => <h3 className="text-sm">{catLabel(v)}</h3>,
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                sorter: true,
                render: (v) => (
                    <Tag
                        color={STATUS_COLOR[String(v)?.toLowerCase()] || "default"}
                        bordered={false}
                        className="rounded-xl m-0 px-2"
                    >
                        {v}
                    </Tag>
                ),
            },
        ],
        []
    );

    // kolom mobile
    const mobileColumns = useMemo(
        () => [
            {
                title: "Title",
                dataIndex: "title",
                key: "title",
                sorter: true,
                render: (v) => (
                    <h3 className="text-sm text-[#383F50] truncate">
                        <Link href="#">{v}</Link>
                    </h3>
                ),
            },
        ],
        []
    );

    // baris expand di mobile
    const ExpandTable = ({ record }) => (
        <ul className="flex flex-col gap-4">
            <li>
                <h4 className="text-sm font-semibold">Category :</h4>
                <h3 className="text-sm">{catLabel(record.category)}</h3>
            </li>
            <li>
                <h4 className="text-sm font-semibold">Status :</h4>
                <Tag
                    color={STATUS_COLOR[String(record.status)?.toLowerCase()] || "default"}
                    bordered={false}
                    className="rounded-xl m-0 px-2"
                >
                    {record.status}
                </Tag>
            </li>
        </ul>
    );

    // handler table (pagination & sorting)
    const handleTableChange = (pagination, _filters, sorter) => {
        if (pagination?.current) setPage(pagination.current);
        if (pagination?.pageSize) setLimit(pagination.pageSize);

        if (sorter && sorter.field) {
            let nextSortBy = "date";
            if (sorter.field === "title") nextSortBy = "title";
            else if (sorter.field === "category") nextSortBy = "category";
            else if (sorter.field === "status") nextSortBy = "status"; // backend tidak pakai → fallback ke date
            setSortBy(nextSortBy);
            setSortDir(sorter.order === "ascend" ? "asc" : "desc");
        }
    };

    return (
        <>
            {/* header filter */}
            <div className="flex gap-3 justify-between mb-5">
                <Search
                    placeholder="Search"
                    allowClear
                    onSearch={(val) => {
                        setQ(val || "");
                        setPage(1);
                    }}
                    className="w-56"
                />
                <Select
                    className="w-40"
                    placeholder="Filter"
                    value={category || ""}
                    onChange={(v) => {
                        setCategory(v || "");
                        setPage(1);
                    }}
                    options={[
                        { value: "", label: "All" }, // all
                        { value: "proposal", label: "Proposal" },
                        { value: "po", label: "Invoice" }, // PO
                        // kalau perlu tampilkan project juga:
                        // { value: "project", label: "Project" },
                    ]}
                />
            </div>

            <Table
                loading={loading}
                dataSource={rows}
                columns={isMobile ? mobileColumns : columns}
                scroll={isMobile ? null : { x: "max-content" }}
                pagination={{
                    current: page,
                    pageSize: limit,
                    total,
                    showSizeChanger: true,
                }}
                showHeader={!isMobile}
                onChange={handleTableChange}
                expandable={
                    isMobile
                        ? {
                            expandedRowRender: (record) => <ExpandTable record={record} />,
                        }
                        : null
                }
                locale={{ emptyText: loading ? "Loading…" : "No data" }}
            />
        </>
    );
}
