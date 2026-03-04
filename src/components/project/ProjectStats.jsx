// src/components/project/ProjectStats.jsx
"use client";

import StatsBar from "@/components/common/StatsBar";
import { useEffect, useMemo, useState } from "react";
import { useMobileQuery, useLaptopQuery, useDekstopQuery } from "@/components/libs/UseMediaQuery";

/**
 * Bisa dipakai dua cara:
 * 1) <ProjectStats stats={...} />  // jika stats sudah disediakan parent
 * 2) <ProjectStats projectId="123" /> // auto fetch ke /api/project/[id]/stats
 */
export default function ProjectStats({ stats, projectId }) {
  const isMobile = useMobileQuery();
  const isLaptop = useLaptopQuery();
  const isDekstop = useDekstopQuery();

  const [loading, setLoading] = useState(!stats && !!projectId);
  const [data, setData] = useState(stats || null);

  useEffect(() => {
    let aborted = false;
    async function run() {
      if (stats || !projectId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/project/${projectId}/stats`, { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!aborted) setData(json?.data || {});
      } catch {
        if (!aborted) setData({});
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    run();
    return () => { aborted = true; };
  }, [projectId, stats]);

  const s = data || stats || {};
  const items = useMemo(() => ([
    { key: "dueToday", title: "Due Today", value: s?.dueToday ?? 0, border: "border-[#F59E0B]" },
    { key: "overdue", title: "Overdue", value: s?.overdue ?? 0, border: "border-[#EF4444]" },
    { key: "criticalDeadlines", title: "Critical Deadlines", value: s?.criticalDeadlines ?? 0, border: "border-[#DC2626]" },
    { key: "dueThisWeek", title: "Due This Week", value: s?.dueThisWeek ?? 0, border: "border-[#6366F1]" },
    { key: "newTaskAssigned", title: "New Task Assigned", value: s?.newTaskAssigned ?? 0, border: "border-[#22C55E]" },
    { key: "totalTask", title: "Total Task", value: s?.totalTask ?? 0, border: "border-[#0EA5E9]" },
    { key: "needsReview", title: "Needs Review", value: s?.needsReview ?? 0, border: "border-[#A855F7]" },
  ]), [s]);

  return (
    <StatsBar
      items={items}
      isMobile={isMobile}
      isLaptop={isLaptop}
      isDekstop={isDekstop}
      loading={loading}
    />
  );
}
