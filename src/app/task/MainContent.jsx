"use client";

import "swiper/css";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Tabs, message, Skeleton } from "antd";
import axiosInstance from "@/utils/axios";
import { useMobileQuery, useLaptopQuery, useDekstopQuery } from "@/components/libs/UseMediaQuery";
import TableTask from "@/components/table/TableTask";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import ModalProject from "@/components/modal/ModalProject";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useRouter, useSearchParams } from "next/navigation";
import StatsBar from "@/components/common/StatsBar";

dayjs.extend(utc);

/** ====================== Child: Overview ====================== */
const Overview = ({
  overviewData,
  isMobile,
  isLaptop,
  isDekstop,
  loading,
  tasks,
  onChangeStatus,
}) => {
  const slidesPerView = isMobile ? 1 : isLaptop ? 1 : 6;
  const width = isMobile ? 150 : isLaptop ? 160 : undefined;

  return (
    <section className="mb-7">
      <StatsBar 
        isMobile={isMobile} 
        isLaptop={isLaptop} 
        isDekstop={isDekstop}
      />
      <h3 className="fc-base text-lg mb-4">Task List</h3>
      <TableTask
        dataTask={tasks}
        loading={loading}
        onChangeStatus={onChangeStatus}
      />
    </section>
  );
};

/** ====================== Child: Archived ====================== */
const Archived = ({ tasks, loading, onChangeStatus }) => {
  return (
    <section className="mb-7">
      <h3 className="fc-base text-lg mb-4">Archived Task</h3>
      <TableTask
        dataTask={tasks.filter((t) => (t.status || t.todo) === "completed")}
        loading={loading}
        onChangeStatus={onChangeStatus}
      />
    </section>
  );
};

/** ====================== Parent: MainContent ====================== */
export default function MainContent() {
  const [modalProject, setModalProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const router = useRouter();

  const isMobile = useMobileQuery();
  const isLaptop = useLaptopQuery();
  const isDekstop = useDekstopQuery();
  const searchParams = useSearchParams();
  const category = searchParams.get("category"); // <-- dari /task?category=overdue
  const staffId = searchParams.get("staffId");

  // Fetch all assigned tasks (default: user login)
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (staffId) {
        // Jika datang dari StatsBar superadmin (bawa staffId), ambil assignment milik staff tsb.
        params.set("scope", "all");
        params.set("assignees", String(staffId));
      } else {
        params.set("scope", "me");
      }
      if (category) {
        params.set("category", category);
      }
      console.log("[task/page] fetchTasks params", Object.fromEntries(params.entries()));
      const res = await axiosInstance.get(`/task/list-assign?${params.toString()}`);
      const data = res.data?.tasks || res.data?.Task || [];
      console.log("[task/page] fetchTasks response", {
        count: Array.isArray(data) ? data.length : 0,
        sample: Array.isArray(data) && data.length > 0 ? data[0] : null,
      });
      const normalized = (Array.isArray(data) ? data : []).map((t) => ({
        ...t,
        projectClient:
          t?.projectClient ||
          t?.project_title ||
          t?.project_name ||
          t?.Project?.title ||
          "-",
      }));
      setTasks(normalized);
    } catch (err) {
      console.error(err);
      message.error("Failed to load task data");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [staffId, category]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Re-fetch setelah modal ditutup
  useEffect(() => {
    if (!modalProject) {
      const t = setTimeout(() => fetchTasks(), 250);
      return () => clearTimeout(t);
    }
  }, [modalProject, fetchTasks]);

  // --- helper kecil soal tanggal & status
  const now = dayjs.utc();
  const startOfToday = now.startOf("day");
  const endOfToday = now.endOf("day");
  const startOfWeek = now.startOf("week");
  const endOfWeek = now.endOf("week");

  const isCompleted = useCallback((t) =>
    (t?.todo && String(t.todo).toLowerCase() === "completed") ||
    (t?.status && String(t.status).toLowerCase() === "completed") ||
    (t?.status && String(t.status).toLowerCase() === "complete"), []);

  const toUnix = useCallback((v) => (typeof v === "number" ? v : Number(v)), []);
  const hasDue = useCallback((t) => Number.isFinite(toUnix(t?.end_date)), [toUnix]);

  // Hitung metrik overview di FE (tetap seperti aslinya)
  const overviewData = useMemo(() => {
    const dueToday = tasks.filter(
      (t) =>
        hasDue(t) &&
        !isCompleted(t) &&
        dayjs.unix(toUnix(t.end_date)).isAfter(startOfToday) &&
        dayjs.unix(toUnix(t.end_date)).isBefore(endOfToday)
    ).length;

    const overdueTask = tasks.filter(
      (t) => hasDue(t) && !isCompleted(t) && dayjs.unix(toUnix(t.end_date)).isBefore(now)
    ).length;

    const criticalDeadlines = tasks.filter((t) => {
      if (!hasDue(t) || isCompleted(t)) return false;
      const due = dayjs.unix(toUnix(t.end_date));
      const in48h = now.add(48, "hour");
      return due.isAfter(now) && due.isBefore(in48h);
    }).length;

    const dueThisWeek = tasks.filter((t) => {
      if (!hasDue(t) || isCompleted(t)) return false;
      const due = dayjs.unix(toUnix(t.end_date));
      return due.isAfter(startOfWeek) && due.isBefore(endOfWeek);
    }).length;

    const needReview = tasks.filter(
      (t) =>
        (t?.todo && String(t.todo).toLowerCase() === "review") ||
        t?.client_review === 1
    ).length;

    const totalTask = tasks.length;

    return [
      { title: "Due Today", value: dueToday, cardBorder: "!border-l-4 border-[#0FA3B1]" },
      { title: "Overdue Task", value: overdueTask, cardBorder: "!border-l-4 border-[#EC221F]" },
      { title: "Critical Deadlines", value: criticalDeadlines, cardBorder: "!border-l-4 border-[#E8B931]" },
      { title: "Due This Week", value: dueThisWeek, cardBorder: "!border-l-4 border-[#0FA3B1]" },
      { title: "Need Review", value: needReview, cardBorder: "!border-l-4 border-[#E8B931]" },
      { title: "Total Task", value: totalTask, cardBorder: "!border-l-4 border-[#0FA3B1]" },
    ];
  }, [tasks, now, startOfToday, endOfToday, startOfWeek, endOfWeek, hasDue, isCompleted, toUnix]);

  // List task mengikuti hasil query backend (termasuk filter category dari URL).
  const filteredTasks = useMemo(() => tasks, [tasks]);

  const handleStatusUpdate = useCallback(async (record, newStatus) => {
    try {
      await axiosInstance.put(`/task/${record.task_id}`, {
        type: "todo",
        value: newStatus,
      });

      setTasks((prev) =>
        prev.map((t) =>
          t.task_id === record.task_id
            ? { ...t, todo: newStatus, status: newStatus }
            : t
        )
      );

      message.success(`Status "${record.name || record.title}" diperbarui`);
    } catch (err) {
      console.error(err);
      message.error("Failed to update status");
    }
  }, []);

  const itemsTabs = [
    {
      key: "1",
      label: "Overview",
      children: (
        <Overview
          overviewData={overviewData}
          isMobile={isMobile}
          isLaptop={isLaptop}
          loading={loading}
          tasks={filteredTasks} // ← yang dikirim sudah terfilter
          onChangeStatus={handleStatusUpdate}
        />
      ),
    },
    {
      key: "2",
      label: "Archived",
      children: (
        <Archived
          tasks={tasks}
          loading={loading}
          onChangeStatus={handleStatusUpdate}
        />
      ),
    },
  ];

  return (
    <>
      <section className="container pt-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl">Tasks</h1>
          <div className="flex items-center gap-2">
            <Button className="btn-blue" onClick={() => router.push("/task/create")}>
              <FontAwesomeIcon icon={faPlus} /> New Task
            </Button>
          </div>
        </div>
        <Tabs defaultActiveKey="1" items={itemsTabs} />
      </section>

      {/* modal */}
      <ModalProject
        modalProject={modalProject}
        setModalProject={setModalProject}
      />
    </>
  );
}
