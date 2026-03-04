"use client";

import { useEffect, useState, useCallback } from "react";
import { message } from "antd";
import axiosInstance from "@/utils/axios";

import ProjectStats from "./ProjectStats";
import ProjectChart from "./ProjectChart";
import ProjectTracker from "./ProjectTracker";

/**
 * Menarik data nyata:
 * - GET /project/stats  -> { stats, chartData }
 * - GET /tracker        -> { data: [...] }
 * Render:
 * 1) Swiper stat cards (ProjectStats) dgn object stats
 * 2) Grid (2/3 vs 1/3) donut charts (ProjectChart) + Tracker (ProjectTracker)
 */
export default function ProjectOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);          // object
  const [chartData, setChartData] = useState([]);    // array
  const [tracker, setTracker] = useState([]);        // array

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [st, tr] = await Promise.all([
        axiosInstance.get("/project/stats"),
        axiosInstance.get("/tracker"),
      ]);

      setStats(st?.data?.stats || null);
      setChartData(st?.data?.chartData || []);
      setTracker(tr?.data?.data || []);
    } catch (e) {
      console.error(e);
      message.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Umpan balik ke ProjectChart bila filter diubah (opsional)
  const handleChartFilter = (v) => {
    // Kalau nanti ada kebutuhan filter server-side, panggil API di sini
    // Sekarang cukup log aja.
    console.log("chart filter:", v);
  };

  // ProjectChart butuh bentuk: [{ title, data: [{type,value}...] }]
  const charts = chartData.map((p) => ({
    title: p.title ?? `Project #${p.project_id}`,
    data: [
      { type: "Completed", value: Number(p.completed_task_count) || 0 },
      { type: "overdue",   value: Number(p.overdue_task_count) || 0 },
      { type: "Remaining", value: Number(p.remaining_task_count) || 0 },
    ],
  }));

  // ProjectTracker butuh props `items`, kita passing raw dari API projects terbaru
  return (
    <>
      <section className="mb-7">
        <ProjectStats stats={stats} loading={loading} />
      </section>

      <section className="mb-7">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
          <div className="col-span-1 lg:col-span-2">
            <ProjectChart charts={charts} onFilterChange={handleChartFilter} />
          </div>
          <div className="col-span-1">
            <ProjectTracker items={tracker} />
          </div>
        </div>
      </section>
    </>
  );
}
