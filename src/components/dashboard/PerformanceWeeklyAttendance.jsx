"use client";
import { Badge, Button, Card, Progress, Tag } from "antd";
import Image from "next/image";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { asset } from "@/utils/url";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";

dayjs.extend(isoWeek);

export default function PerformanceWeeklyAttendance({
  conicColors,
  stepCount,
  setStepsCount,
  onInfoAttendance,
  listAttendanceTimesheet = [],
  staffId, 
}) {
  // Range minggu aktif (Senin–Minggu) (tanpa useMemo)
  const weekStart = dayjs().isoWeekday(1).startOf("day");
  const weekEnd = weekStart.add(6, "day").endOf("day");
  const fromDate = weekStart.format("YYYY-MM-DD");
  const toDate = weekEnd.format("YYYY-MM-DD");

  // State dinamis (hanya untuk Performance Score & Weekly Goals)
  const [totalScore, setTotalScore] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [doneThisWeek, setDoneThisWeek] = useState(0);
  const [ontimePct, setOntimePct] = useState(0);

  // Normalisasi score -> persen untuk ring bila stepCount tidak disuplai
  const scoreToPercent = (score) => {
    if (typeof score !== "number") return 50;
    if (score >= 15) return 100;
    if (score >= 10) return 90;
    if (score >= 5) return 80;
    if (score >= 0) return 70;
    if (score >= -5) return 60;
    if (score >= -10) return 50;
    if (score >= -20) return 35;
    return 20;
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        // Ambil ringkasan skor minggu ini
        const qs = new URLSearchParams();
        qs.set("from", fromDate);
        qs.set("to", toDate);
        if (staffId) qs.set("staffId", String(staffId)); // <-- NEW

        const res = await axiosInstance.get(`/performance-score?${qs.toString()}`);
        const breakdown = res?.data?.breakdown || {};
        const score = Number(res?.data?.totalScore || 0);

        // Hitung "Done This Week" dan "Ontime Completion"
        const completeOnTime =
          (breakdown.complete_task_h7?.count || 0) +
          (breakdown.complete_task_h3?.count || 0) +
          (breakdown.complete_task_h1?.count || 0) +
          (breakdown.complete_task?.count || 0);
        const completeOverdue = breakdown.complete_overdue_task?.count || 0;
        const done = completeOnTime + completeOverdue;

        // Badge = jumlah event negatif (tanpa utak-atik attendance list)
        const negativeEventsCount =
          (breakdown.late_to_work?.count || 0) +
          (breakdown.miss_deadline?.count || 0) +
          (breakdown.miss_deadline_h3?.count || 0) +
          (breakdown.miss_deadline_h7?.count || 0) +
          (breakdown.not_filling_timesheet?.count || 0);

        if (!cancelled) {
          setTotalScore(score);
          setBadgeCount(negativeEventsCount);
          setDoneThisWeek(done);
          setOntimePct(done > 0 ? Math.round((completeOnTime / done) * 100) : 0);
        }
      } catch {
        if (!cancelled) {
          setTotalScore(0);
          setBadgeCount(0);
          setDoneThisWeek(0);
          setOntimePct(0);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [fromDate, toDate, staffId]);

  // Persentase Progress: pakai stepCount bila ada; kalau tidak, dari skor
  const progressPercent = typeof stepCount === "number" ? stepCount : scoreToPercent(totalScore);

  return (
    <section className="mb-7">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Performance Score */}
        <div className="col-span-1">
          <h4 className="text-lg fc-base mb-2">Performance Score</h4>
          <Card className="card-box h-[340px]">
            <div className="flex flex-col items-center">
              <div className="w-full">
                <Badge count={badgeCount} color="#0FA3B1">
                  <h2 className="text-7xl font-bold">{totalScore}</h2>
                </Badge>
              </div>
              <Progress
                size={300}
                status="active"
                strokeColor={conicColors}
                type="dashboard"
                percent={progressPercent}
                gapDegree={147.5}
                strokeWidth={10}
                format={(percent) => (percent > 50 ? "Excelent" : "Bad")}
              />
            </div>
          </Card>
        </div>

        {/* Weekly Goals */}
        <div className="col-span-1">
          <h4 className="text-lg fc-base mb-2">Weekly Goals</h4>
          <Card className="card-box fc-base h-[340px]">
            <Button block className="btn-blue font-bold px-5 py-8 text-2xl mb-5">
              Keep it Up!
            </Button>
            <p className="text-base mb-5">
              You’re ahead of pace and should reach your goal faster than schedule.
            </p>
            <div className="grid grid-cols-2 gap-5">
              <div className="border text-center rounded-lg p-4">
                <h4 className="text-sm">Done This Week</h4>
                <h5 className="text-2xl font-bold">{doneThisWeek}</h5>
              </div>
              <div className="border text-center rounded-lg p-4">
                <h4 className="text-sm">Ontime Completion</h4>
                <h5 className="text-2xl font-bold">{ontimePct}%</h5>
              </div>
            </div>
          </Card>
        </div>

        {/* Attendance & Timesheet (tetap pakai props, tidak diubah) */}
        <div className="col-span-1">
          <div className="flex items-center justify-between">
            <h4 className="text-lg fc-base mb-2">Attendance & Timesheet</h4>
            <button onClick={onInfoAttendance}>
              <Image
                src={asset("static/images/icon/info.png")}
                width={20}
                height={20}
                alt=""
                className="w-4 h-4"
              />
            </button>
          </div>
          <Card className="card-box fc-base h-[340px]">
            <ul>
              {listAttendanceTimesheet.map((item, index) => {
                const isTimesheet = String(item?.timesheet ?? "").toLowerCase() === "true";

                return (
                  <li className="flex border-b py-2 gap-2" key={index}>
                    <div className="flex-1">
                      <Badge color={item.color} />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-sm">{item.day}</h3>
                    </div>

                    <div className="w-[60px] text-center">
                      <h3 className="text-sm">{item.startTime}</h3>
                    </div>

                    <div className="w-[10px] text-center">
                      <h3 className="text-sm">-</h3>
                    </div>

                    <div className="w-[60px] text-center">
                      <h3 className="text-sm">{item.endTime}</h3>
                    </div>

                    <div className="w-[140px] flex items-center justify-center">
                      {isTimesheet ? (
                        <Tag
                          color="success"
                          bordered={false}
                          className="px-2 m-0 rounded-xl flex items-center gap-1"
                        >
                          <CheckCircleFilled />
                          Timesheet
                        </Tag>
                      ) : (
                        <Tag
                          color="error"
                          bordered={false}
                          className="px-2 m-0 rounded-xl flex items-center gap-1"
                        >
                          <CloseCircleFilled />
                          No Timesheet
                        </Tag>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
