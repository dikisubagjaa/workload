"use client"
import { Table, Button, Popconfirm, Input, message, Spin, Popover } from "antd";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";
import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DataTable() {
    const isMobile = useMobileQuery();
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openActionFor, setOpenActionFor] = useState(null);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const truncateText = (text, maxLength = 50) => {
        if (!text) return "";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    // Fetch data from API
    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/website/page", { cache: 'no-store' });
            const result = await res.json();

            // Pastikan array
            const arrayData = Array.isArray(result) ? result : result.data || [];
            setData(arrayData);
        } catch (err) {
            message.error("Failed to fetch data.");
            console.error(err);
            setData([]); // fallback empty array
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/website/page/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                message.success("Deleted successfully.");
                fetchData(); // Refresh data
            } else {
                throw new Error("Failed to delete.");
            }
        } catch (error) {
            message.error("Delete failed.");
        }
    };

    // ===== ACTION POPOVER CONTENT =====
    const buildActionContent = (record) => (
        <div className="p-1">
            <div className="text-xs font-semibold opacity-70 px-1 pb-2">
                Quick actions
            </div>
            <div className="flex flex-col gap-2 px-1 pb-1">
                <Link href={`/website/page/edit/${record.page_id}`} className="inline-grid">
                    <Button
                        size="small"
                        type="default"
                        className="flex justify-start px-3"
                        icon={<EditOutlined />}
                    >
                        Edit
                    </Button>
                </Link>
                <Popconfirm
                    title="Delete the page"
                    description="Are you sure to delete this page?"
                    onConfirm={() => handleDelete(record.page_id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button
                        size="small"
                        danger
                        className="flex justify-start px-3"
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                    >
                        Delete
                    </Button>
                </Popconfirm>
            </div>
        </div>
    );

    // tampilan table di dekstop
    const colomnDetail = () => [
        {
            title: 'Page Name',
            dataIndex: 'pageName',
            key: 'pageName',
            sorter: (a, b) => a.page_name.localeCompare(b.page_name),
            render: (_, record) => (
                <div className="flex gap-3">
                    <h3 className="font-semibold text-sm">{truncateText(record.page_name, 50)}</h3>
                </div>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => a.description.localeCompare(b.description),
            render: (_, record) => <p className="text-sm">{truncateText(record.description, 80)}</p>,
        },
        {
            title: 'Created',
            dataIndex: 'created',
            key: 'created',
            sorter: (a, b) => a.created.localeCompare(b.created),
            render: (_, record) => <h4 className="text-sm">{record.created}</h4>,
        },
        {
            key: "actions",
            width: 60,
            fixed: "right",
            render: (_v, r) => {
                const content = buildActionContent(r);
                return (
                    <Popover
                        trigger="click"
                        placement="left"
                        open={openActionFor === r.page_id}
                        onOpenChange={(v) => setOpenActionFor(v ? r.page_id : null)}
                        content={content}
                    >
                        <Button size="small" type="text" icon={<MoreOutlined />} />
                    </Popover>
                );
            },
        },
    ];

    const mobileColomnDetail = () => [
        {
            title: 'title',
            dataIndex: 'title',
            key: 'title',
            render: (_v, r) => {
                const content = buildActionContent(r);
                return (
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{r.page_name}</h3>
                        <div className="ms-auto">
                            <Popover
                                trigger="click"
                                placement="left"
                                open={openActionFor === r.page_id}
                                onOpenChange={(v) => setOpenActionFor(v ? r.page_id : null)}
                                content={content}
                            >
                                <Button size="small" type="text" icon={<MoreOutlined />} />
                            </Popover>
                        </div>
                    </div>
                );
            },
        },
    ];

    // expand table ketika di mobile
    const ExpandTable = ({ record }) => {
        return (
            <ul className="flex flex-col gap-3">
                <li>
                    <h4 className="text-sm font-semibold">Dexcription:</h4>
                    <p className="text-sm">{record.description}</p>
                </li>

                <li>
                    <h4 className="text-sm font-semibold">Created:</h4>
                    <h4 className="text-sm">{record.created}</h4>
                </li>
            </ul>
        )
    };

    const filteredData = data.filter(item =>
        item.page_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="flex justify-between flex-wrap gap-3 mb-6">
                <div className="w-full sm:w-96">
                    <Input
                        placeholder="Search..."
                        allowClear
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full text-sm"
                        suffix={<SearchOutlined className="text-base text-gray" />}
                    />
                </div>

                <Link href="/website/page/create" className="w-full sm:w-auto">
                    <Button type="primary" className="font-semibold w-full sm:w-auto"><PlusOutlined /> Add Data</Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    dataSource={filteredData.map(item => ({ ...item, key: item.page_id }))}
                    columns={isMobile ? mobileColomnDetail() : colomnDetail()}
                    showHeader={isMobile ? false : true}
                    expandable={isMobile ? {
                        expandedRowRender: (record) => (
                            <ExpandTable record={record} />
                        ),
                    } : null}
                    pagination={{
                        current: currentPage,
                        pageSize: perPage,
                        showSizeChanger: true,
                        pageSizeOptions: [5, 10, 20, 50, 100],
                        onChange: (page, pageSize) => {
                            setCurrentPage(page);
                            setPerPage(pageSize || 10);
                        },
                    }}
                />
            )}
        </>
    );
}
