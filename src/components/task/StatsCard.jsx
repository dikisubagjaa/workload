"use client";
import { Card, Skeleton } from "antd";

export default function StatsCards({ stats, loading }) {
  const items = [
    { key: "dueToday", title: "Due Today", color: "!border-l-4 border-[#0FA3B1]" },
    { key: "overdueTask", title: "Overdue Task", color: "!border-l-4 border-[#EC221F]" },
    { key: "criticalDeadlines", title: "Critical Deadlines", color: "!border-l-4 border-[#E8B931]" },
    { key: "dueThisWeek", title: "Due This Week", color: "!border-l-4 border-[#0FA3B1]" },
    { key: "needReview", title: "Need Review", color: "!border-l-4 border-[#E8B931]" },
    { key: "totalTask", title: "Total Task", color: "!border-l-4 border-[#0FA3B1]" },
  ];

  return (
    <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {items.map((it) => (
        <Card key={it.key} bordered={false} className={`card-box ${it.color}`} classNames={{ body: "px-3" }}>
          {loading ? (
            <div className="py-2">
              <Skeleton active paragraph={false} title={{ width: 60 }} />
              <Skeleton.Input active style={{ width: 80, height: 28, marginTop: 8 }} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <h5 className="text-sm sm:text-base text-[#797B82]">{it.title}</h5>
              <h3 className="text-4xl text-[#383F50]">{stats?.[it.key] ?? 0}</h3>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
