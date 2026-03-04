"use client";

import "swiper/css";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Tabs, message, Skeleton } from "antd";
import axiosInstance from "@/utils/axios"; // pastikan path ini benar di project kamu
import { useMobileQuery, useLaptopQuery } from "@/components/libs/UseMediaQuery";
import TableTask from "@/components/table/TableTask";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import ModalProject from "@/components/modal/ModalProject";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useRouter } from "next/navigation";

dayjs.extend(utc);

/** ====================== Child: Overview ====================== */
const Overview = ({ overviewData, isMobile, isLaptop, loading, tasks, onChangeStatus }) => {
  const slidesPerView = isMobile ? 1 : isLaptop ? 1 : 6;
  const width = isMobile ? 150 : isLaptop ? 160 : undefined;

  return (
    <section className="mb-7">
      <Swiper spaceBetween={15} slidesPerView={slidesPerView} width={width} className="mb-5">
        {overviewData.map((item, index) => (
          <SwiperSlide key={index}>
            <Card
              variant="borderless"
              className={`card-box ${item.cardBorder}`}
              classNames={{ body: "px-3" }}
            >
              {loading ? (
                <div className="py-2">
                  <Skeleton active paragraph={false} title={{ width: 60 }} />
                  <Skeleton.Input active style={{ width: 80, height: 28, marginTop: 8 }} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <h5 className="text-sm sm:text-base text-[#797B82]">{item.title}</h5>
                  <h3 className="text-4xl text-[#383F50]">{item.value}</h3>
                </div>
              )}
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>

      <h3 className="fc-base text-lg mb-4">Task List</h3>
      <TableTask dataTask={tasks} loading={loading} onChangeStatus={onChangeStatus} />
    </section>
  );
};

/** ====================== Child: Archived ====================== */
const Archived = ({ tasks, loading, onChangeStatus }) => {
  return (
    <section className="mb-7">
      <h3 className="fc-base text-lg mb-4">Archived Task</h3>
      {/* Sesuaikan kriteria archived sesuai skema kamu.
          Misal kalau soft-deleted tidak muncul karena defaultScope, 
          di sini aku contohkan filter status 'archived' jika ada. */}
      <TableTask
        dataTask={tasks.filter((t) => (t.status || t.todo) === "archived")}
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

  // Fetch all assigned tasks (default: user login)
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/task/list-assign?scope=me");
      const data = res.data?.tasks || res.data?.Task || [];
      setTasks(Array.isArray(data) ? data : []);
      // NOTE: Kalau API kamu juga kirim stats, bisa simpan res.data.stats ke state terpisah.
    } catch (err) {
      console.error(err);
      message.error("Gagal memuat data task");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Re-fetch setelah modal ditutup (agar angka & list ikut update)
  useEffect(() => {
    if (!modalProject) {
      const t = setTimeout(() => fetchTasks(), 250);
      return () => clearTimeout(t);
    }
  }, [modalProject, fetchTasks]);

  // Hitung metrik overview di FE
  const overviewData = useMemo(() => {
    const now = dayjs.utc();
    const startOfToday = now.startOf("day");
    const endOfToday = now.endOf("day");
    const startOfWeek = now.startOf("week");
    const endOfWeek = now.endOf("week");

    const isCompleted = (t) =>
      (t?.todo && String(t.todo).toLowerCase() === "completed") ||
      (t?.status && String(t.status).toLowerCase() === "completed") ||
      (t?.status && String(t.status).toLowerCase() === "complete");

    const toUnix = (v) => (typeof v === "number" ? v : Number(v));
    const hasDue = (t) => Number.isFinite(toUnix(t?.end_date));

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
      (t) => (t?.todo && String(t.todo).toLowerCase() === "review") || t?.client_review === 1
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
  }, [tasks]);

  const handleStatusUpdate = useCallback(async (record, newStatus) => {
    try {
      await axiosInstance.put(`/task/${record.task_id}`, { type: "todo", value: newStatus });

      setTasks((prev) =>
        prev.map((t) =>
          t.task_id === record.task_id ? { ...t, todo: newStatus, status: newStatus } : t
        )
      );

      message.success(`Status "${record.name || record.title}" diperbarui`);
    } catch (err) {
      console.error(err);
      message.error("Gagal update status");
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
          tasks={tasks}
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
            <Button className="btn-blue-filled" onClick={() => setModalProject(true)}>
              <FontAwesomeIcon icon={faPlus} /> Register Project
            </Button>
          </div>
        </div>
        <Tabs defaultActiveKey="1" items={itemsTabs} />
      </section> 

      {/* modal */}
      <ModalProject modalProject={modalProject} onCancel={() => setModalProject(false)}/>
    </>
  );
}
