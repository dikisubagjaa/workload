"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Tabs, message } from "antd";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axiosInstance from "@/utils/axios";

import ProjectOverview from "@/components/project/ProjectOverview";
import ProjectList from "@/components/project/ProjectList";

// === Tambahan untuk StatsBar di tab Ongoing ===
import StatsBar from "@/components/common/StatsBar";
import {
  useMobileQuery,
  useLaptopQuery,
  useDekstopQuery,
} from "@/components/libs/UseMediaQuery";

export default function ProjectPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [chartDataIndex, setChartDataIndex] = useState({});

  // Stats agregat untuk tab "Ongoing"
  const [statsSummary, setStatsSummary] = useState(null);

  const isMobile = useMobileQuery();
  const isLaptop = useLaptopQuery();
  const isDekstop = useDekstopQuery();

  const router = useRouter();
  const pathname = usePathname();

  const setModalProject = useCallback(
    (open, projectId) => {
      if (typeof window === "undefined") return;
      const q = new URLSearchParams(window.location.search);
      if (open) {
        q.set("modul", "project");
        q.set("openmodal", "true");
        if (projectId) q.set("project", String(projectId));
      } else {
        q.delete("modul");
        q.delete("openmodal");
        q.delete("project");
      }
      const qs = q.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname]
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Ambil list project
      const pr = await axiosInstance.get("/project");
      const rows = pr?.data?.data || pr?.data?.projects || [];

      // Ambil stats utk chart per project (completed/remaining/overdue) + ringkasan agregat
      const st = await axiosInstance.get("/project/stats");
      const chartData = st?.data?.chartData || [];

      // Coba ambil ringkasan agregat dari beberapa kemungkinan field respons
      const summary =
        st?.data?.stats ??
        st?.data?.data?.stats ??
        st?.data?.overview ??
        null;
      setStatsSummary(summary);

      // Build index progress per project_id
      const idx = {};
      for (const it of chartData) {
        const pid = it.project_id ?? it.id;
        idx[pid] = {
          completed: Number(it.completed_task_count) || 0,
          remaining: Number(it.remaining_task_count) || 0,
          overdue: Number(it.overdue_task_count) || 0,
        };
      }

      // Gabungkan ke projects agar TableProjectList bisa hitung progress
      const merged = rows.map((p) => {
        const plus = idx[p.project_id] || { completed: 0, remaining: 0, overdue: 0 };
        return {
          ...p,
          completed_task_count: plus.completed,
          remaining_task_count: plus.remaining,
          overdue_task_count: plus.overdue,
        };
      });

      setProjects(merged);
      setChartDataIndex(idx);
    } catch (e) {
      console.error(e);
      message.error("Failed to fetch projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteProject = useCallback(async (projectId) => {
    if (!projectId) return;
    try {
      const res = await axiosInstance.delete(`/project/${projectId}`);
      if (!res || (res.status !== 200 && res.status !== 201)) {
        throw new Error("Failed to delete project");
      }
      message.success("Project deleted.");
      setProjects((prev) => prev.filter((p) => Number(p?.project_id) !== Number(projectId)));
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.msg || e?.message || "Failed to delete project.");
    }
  }, []);

  const searchParams = useSearchParams();
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const ongoingProjects = useMemo(
    () => projects.filter((p) => p.status !== "completed"),
    [projects]
  );
  const archivedProjects = useMemo(
    () => projects.filter((p) => p.status === "completed"),
    [projects]
  );

  const itemsTabs = [
    {
      key: "1",
      label: "Overview",
      children: (
        <>
          <ProjectOverview />
        </>
      ),
    },
    {
      key: "2",
      label: "Ongoing",
      children: (
        <>
          {/* ===== StatsBar untuk tab Ongoing ===== */}
          <div className="mb-4">

            <StatsBar
              isMobile={isMobile}
              isLaptop={isLaptop}
              isDekstop={isDekstop}
            />
          </div>

          <ProjectList
            title="Ongoing Projects"
            projects={ongoingProjects}
            loading={loading}
            onDeleteClick={handleDeleteProject}
          />
        </>
      ),
    },
    {
      key: "3",
      label: "Archived",
      children: (
        <ProjectList
          title="Archived"
          projects={archivedProjects}
          loading={loading}
          onDeleteClick={handleDeleteProject}
        />
      ),
    },
  ];

  return (
    <>
      <section className="container pt-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl">Projects</h1>
          <Button
            className="btn-blue-filled"
            onClick={() => {
              const q = new URLSearchParams(window.location.search);
              q.set("modul", "project");
              q.set("openmodal", "true");
              q.delete("project");
              router.push(`${pathname}?${q.toString()}`);
            }}
          >
            <FontAwesomeIcon icon={faPlus} /> Register Project
          </Button>
        </div>

        <Tabs defaultActiveKey="1" items={itemsTabs} />
      </section>
    </>
  );
}
