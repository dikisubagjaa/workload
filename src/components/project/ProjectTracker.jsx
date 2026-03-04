"use client";

import { Card, Button, Tag } from "antd";
import Link from "next/link";
import { CalendarOutlined } from "@ant-design/icons";

/**
 * items berasal dari GET /api/tracker (Project + Client)
 * Tampilkan persis gaya template (pill filter dummy + list)
 */
export default function ProjectTracker({ items = [] }) {
  const listDataTracker = items.map((p) => ({
    type: "Project",
    client: p?.Client?.client_name || "-",
    description: p?.title || "-",
    status: p?.status === "overdue" ? "Overdue" : (p?.status === "completed" ? "Submitted" : "Pending"),
    project_id: p?.project_id,
  }));

  return (
    <div>
      <div className="flex justify-between mb-5">
        <p className="fc-base text-lg">Tracker</p>
        <Link href="" className="text-base text-[#00939F]">
          Quick View
        </Link>
      </div>

      <Card variant="borderless" className="card-box h-[375px]">
        {/* Filter Pills */}
        <div className="flex-col gap-3">
          <div className="flex items-center gap-3">
            <Button type="primary" size="small" shape="round" className="px-3 bg-[#E6E6E6] text-[#1E1E1E]">
              All
            </Button>
            <Button type="primary" size="small" shape="round" className="px-3 bg-[#E6E6E6]" disabled>
              Invoice
            </Button>
            <Button type="primary" size="small" shape="round" className="px-3 bg-[#E6E6E6]" disabled>
              Proposal
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="mt-5">
          <div className="space-y-4 overflow-auto h-72 no-scrollbar">
            {listDataTracker.map((item, idx) => (
              <div className="flex items-center py-2 px-3 gap-3 border-b-2" key={idx}>
                <div className="flex-1 overflow-hidden">
                  <div className="flex gap-2">
                    <CalendarOutlined className="text-[#02542D]" />
                    <p className="text-sm fc-base">{item.type}</p>
                  </div>
                  <h3 className="text-sm text-[#383F50] truncate">
                    {item.client} - {item.description}
                  </h3>
                </div>

                <div>
                  {item.status === "Submitted" && (
                    <Tag color="success" bordered={false} className="rounded-xl m-0 px-2">
                      {item.status}
                    </Tag>
                  )}
                  {item.status === "Pending" && (
                    <Tag color="warning" bordered={false} className="rounded-xl m-0 px-2">
                      {item.status}
                    </Tag>
                  )}
                  {item.status === "Overdue" && (
                    <Tag color="error" bordered={false} className="rounded-xl m-0 px-2">
                      {item.status}
                    </Tag>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
