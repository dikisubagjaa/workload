// src/app/dashboard/MainContent.jsx
"use client";

import "swiper/css";
import "swiper/css/navigation";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { HomeOutlined } from "@ant-design/icons";
import { message, Spin, Select } from "antd";
import { useSession } from "next-auth/react";
import axiosInstance from "@/utils/axios";
import { fetchUsers as fetchUsersList, getUserLabel } from "@/utils/userHelpers";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { closeEntityModal } from "@/utils/url";

import {
  useMobileQuery,
  useLaptopQuery,
  useLargeDekstopQuery,
} from "@/components/libs/UseMediaQuery";

import DateTime from "@components/utils/DateTime";
import ClockButton from "@/components/attendance/ClockButton";

import ModalProject from "@/components/modal/ModalProject";
import ModalPitching from "@/components/modal/ModalPitching";
import ModalInfoAttendance from "@/components/modal/ModalInfoAttendance";
import DrawerTracker from "@/components/utils/DrawerTracker";

import DashboardOverview from "@/components/dashboard/OverviewSection";
import DashboardTaskStats from "@/components/common/StatsBar";
import DashboardPerformanceWeeklyAttendance from "@/components/dashboard/PerformanceWeeklyAttendance";
import DashboardOngoingProjects from "@/components/dashboard/OngoingProject";
import DashboardTaskListSection from "@/components/dashboard/TaskListSection";
import DashboardTaskListHodSection from "@/components/dashboard/TaskListHodSection";
import DashboardClientReviewSection from "@/components/dashboard/ClientReviewSection";
import DashboardTeamPerformanceSection from "@/components/dashboard/TeamPerformanceSection";

export default function MainContent() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [liveMenu, setLiveMenu] = useState(null);

  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(false);

  const isMobile = useMobileQuery();
  const isLaptop = useLaptopQuery();
  const isDekstop = useLargeDekstopQuery();

  // ✅ FIX: aman untuk string / boolean
  const isSuperadmin = String(session?.user?.is_superadmin) === "true";
  const isHod = String(session?.user?.is_hod) === "true";
  const isAccount = String(session?.user?.is_ae) === "true";

  useEffect(() => {
    let cancelled = false;
    async function loadLiveMenu() {
      if (sessionStatus !== "authenticated") return;
      try {
        const res = await fetch("/api/auth/menu", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!cancelled && res.ok) setLiveMenu(data?.menu || null);
      } catch {
        if (!cancelled) setLiveMenu(null);
      }
    }
    loadLiveMenu();
    return () => {
      cancelled = true;
    };
  }, [sessionStatus, pathname]);

  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [staffOptions, setStaffOptions] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const staffSearchTimer = useRef(null);

  const isGlobalView = isSuperadmin && !selectedStaffId;
  const staffIdForApi = isGlobalView ? undefined : selectedStaffId;

  const [taskList, setTaskList] = useState([]);
  const [taskListHod, setTaskListHod] = useState([]);
  const [taskReviewList, setTaskReviewList] = useState([]);
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);

  const [modalProjectOpen, setModalProjectOpen] = useState(false);
  const [modalPitchingOpen, setModalPitchingOpen] = useState(false);

  const normalizeTaskRows = useCallback((rows = []) => {
    return (Array.isArray(rows) ? rows : []).map((t) => ({
      ...t,
      projectClient:
        t?.projectClient ||
        t?.project_title ||
        t?.Project?.title ||
        t?.project?.title ||
        "-",
    }));
  }, []);

  const fetchStaffOptions = useCallback(
    async (keyword = "") => {
      if (!isSuperadmin) return;
      setStaffLoading(true);
      try {
        const users = await fetchUsersList({ q: keyword || undefined, limit: 20 });
        const options = users
          .map((u) => {
            const id = u?.user_id || u?.id;
            if (!id) return null;
            const name = getUserLabel(u);
            return { value: String(id), label: name };
          })
          .filter(Boolean);

        setStaffOptions(options);
      } catch (err) {
        console.error("fetchStaffOptions error", err);
      } finally {
        setStaffLoading(false);
      }
    },
    [isSuperadmin]
  );

  useEffect(() => {
    if (isSuperadmin) fetchStaffOptions();
  }, [isSuperadmin, fetchStaffOptions]);

  const fetchDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const res = await axiosInstance.get("/dashboard", {
        params: { staffId: staffIdForApi },
      });

      setTaskList(normalizeTaskRows(res.data?.task || []));
      setTaskListHod(normalizeTaskRows(res.data?.taskHod || []));
      setTaskReviewList(normalizeTaskRows(res.data?.taskDataReview || []));
      setOngoingProjects(res.data?.project || []);
    } catch (err) {
      console.error("fetchDashboard error", err);
      message.error("Gagal memuat dashboard");
    } finally {
      setLoadingDashboard(false);
    }
  }, [staffIdForApi, normalizeTaskRows]);

  const fetchWeeklyAttendance = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/attendance/weekly", {
        params: { staffId: staffIdForApi },
      });
      setWeeklyAttendance(res.data?.weekly || []);
    } catch (err) {
      console.error("fetchWeeklyAttendance error", err);
    }
  }, [staffIdForApi]);

  useEffect(() => {
    fetchDashboard();
    fetchWeeklyAttendance();
  }, [fetchDashboard, fetchWeeklyAttendance]);

  const handleStatusUpdate = async (task, newStatus) => {
    if (!task?.task_id) return;
    setUpdatingTask(true);
    try {
      await axiosInstance.put(`/task/${task.task_id}`, { type: "todo", value: newStatus });
      await fetchDashboard();
      message.success("Status task diperbarui");
    } catch (err) {
      message.error("Gagal update task");
    } finally {
      setUpdatingTask(false);
    }
  };

  const allowedKeys = useMemo(() => {
    const dashboardKeys = liveMenu?.dashboardKeys || session?.user?.menu?.dashboardKeys || [];
    return new Set(
      dashboardKeys.map((k) =>
        String(k).replace("/", "").replace("-", "_").toLowerCase()
      )
    );
  }, [session, liveMenu]);

  // Fallback untuk role lama/staff yang dashboardKeys-nya belum terisi:
  // tampilkan widget utama agar dashboard tidak kosong.
  const useDashboardFallback = allowedKeys.size === 0;

  const canOverview = useDashboardFallback || allowedKeys.has("overview");
  const canWeeklyAttendance = useDashboardFallback || allowedKeys.has("weekly_attendance");
  const canOngoingProject = useDashboardFallback || allowedKeys.has("ongoing_project");
  const canTaskList = useDashboardFallback || allowedKeys.has("task_list");
  const canClientReview = allowedKeys.has("client_review");
  const canTeamPerformance = allowedKeys.has("team_performance");

  const showStaffSelect = isSuperadmin; // ✅ biar gak receh
  const showTaskWidgets = !isGlobalView && canTaskList;
  const showClientReview = !isGlobalView && canClientReview;
  const showTeamPerformance = canTeamPerformance && (isHod || !isGlobalView);

  const handleAddProject = useCallback(() => {
    setModalProjectOpen(true);
  }, []);

  const handleAddTask = useCallback(() => {
    closeEntityModal(router, pathname, searchParams);
    router.push("/task/create");
  }, [router, pathname, searchParams]);

  const handleAddPitch = useCallback(() => {
    setModalPitchingOpen(true);
  }, []);

  return (
    <>
      <Spin spinning={loadingDashboard || updatingTask}>
        <div className="container pt-5 mb-5">
          <div className="flex justify-center border-b pb-3 sm:hidden mb-3">
            <DateTime />
          </div>

          {/* Mobile: Staff Filter */}
          {isSuperadmin && (
            <div className="sm:hidden mb-3">
              {showStaffSelect && (
                <Select
                  allowClear
                  showSearch
                  placeholder="Select staff"
                  loading={staffLoading}
                  options={staffOptions}
                  value={selectedStaffId}
                  onChange={(v) => setSelectedStaffId(v || null)}
                  onSearch={(v) => {
                    clearTimeout(staffSearchTimer.current);
                    staffSearchTimer.current = setTimeout(() => fetchStaffOptions(v), 300);
                  }}
                  filterOption={false}
                  className="min-w-64 w-full select-staff"
                />
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 mb-2">
            <h1 className="text-lg sm:text-2xl nunito-reg text-[#383F50]">
              <HomeOutlined /> Dashboard
            </h1>

            {/* Desktop: DateTime + Staff Filter */}
            <div className="hidden sm:flex flex-col items-end gap-3">
              <DateTime />
              {showStaffSelect && (
                <div className="mb-2">
                  <Select
                    allowClear
                    showSearch
                    placeholder="Select staff"
                    loading={staffLoading}
                    options={staffOptions}
                    value={selectedStaffId}
                    onChange={(v) => setSelectedStaffId(v || null)}
                    onSearch={(v) => {
                      clearTimeout(staffSearchTimer.current);
                      staffSearchTimer.current = setTimeout(() => fetchStaffOptions(v), 300);
                    }}
                    filterOption={false}
                    className="min-w-64 w-full select-staff"
                  />
                </div>
              )}
            </div>

            {/* Mobile: clock button tetap */}
            <div className="sm:hidden">
              <ClockButton fetchWeeklyAttendance={fetchWeeklyAttendance} />
            </div>
          </div>

          {canOverview && (
            <DashboardOverview
              onAddPitch={handleAddPitch}
              onAddProject={handleAddProject}
              onAddTask={handleAddTask}
              session={session}
              menuButtons={liveMenu?.buttons}
            />
          )}

          {canOverview && (
            <DashboardTaskStats
              staffId={staffIdForApi}
              isMobile={isMobile}
              isLaptop={isLaptop}
              isDekstop={isDekstop}
            />
          )}

          {canWeeklyAttendance && (
            <DashboardPerformanceWeeklyAttendance
              listAttendanceTimesheet={weeklyAttendance}
              staffId={staffIdForApi}
            />
          )}

          {isAccount && canOngoingProject && (
            <DashboardOngoingProjects projectOnGoing={ongoingProjects} />
          )}

          {showTaskWidgets && (
            <>
              <DashboardTaskListSection dataTask={taskList} onChangeStatus={handleStatusUpdate} />
              <DashboardTaskListHodSection dataTask={taskListHod} onChangeStatus={handleStatusUpdate} />
            </>
          )}

          {showClientReview && (
            <DashboardClientReviewSection dataTaskReview={taskReviewList} fetchDashboard={fetchDashboard} />
          )}

          {showTeamPerformance && <DashboardTeamPerformanceSection staffId={staffIdForApi} />}
        </div>
      </Spin>

      <ModalProject modalProject={modalProjectOpen} onCancel={() => setModalProjectOpen(false)} />
      <ModalPitching modalPitching={modalPitchingOpen} onCancel={() => setModalPitchingOpen(false)} />
      <ModalInfoAttendance />
      <DrawerTracker />
    </>
  );
}
