// src/components/dashboard/TeamPerformanceSection.jsx
"use client";
import { useEffect, useState } from "react";
import { Card, Avatar, Skeleton } from "antd";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import axiosInstance from "@/utils/axios";

function initialsOf(fullName) {
  const s = String(fullName || "").trim();
  if (!s) return "?";
  const parts = s.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] || "";
  return (first + last).toUpperCase();
}

function hasPhoto(url) {
  return typeof url === "string" && url.trim() !== "";
}

export default function TeamPerformanceSection({ isMobile, isLaptop, date, staffId }) {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    let alive = true;

    const fetchTeam = async () => {
      setLoading(true);
      setTeam([]);

      try {
        const qs = staffId ? `?staffId=${encodeURIComponent(staffId)}` : "";
        const res = await axiosInstance.get(`/dashboard/team-performance${qs}`);
        if (!alive) return;
        setTeam(Array.isArray(res?.data?.team) ? res.data.team : []);
      } catch (e) {
        if (!alive) return;
        setTeam([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchTeam();

    return () => {
      alive = false;
    };
  }, [staffId]);

  const slidesPerView = isMobile ? 1 : isLaptop ? 1 : 4;
  const width = isMobile ? 300 : isLaptop ? 300 : undefined;

  if (loading) {
    return (
      <section className="mb-7">
        <div className="flex justify-between mb-4">
          <p className="fc-base text-lg">Team Performance</p>
          <span className="text-[#00939F] opacity-50">Loading…</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} variant="borderless" className="card-box min-h-[240px]">
              <Skeleton active avatar paragraph={{ rows: 3 }} />
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (!team.length) return null;

  return (
    <section className="mb-7">
      <div className="flex justify-between mb-4">
        <p className="fc-base text-lg">Team Performance</p>

        {/* NOTE: link ini tetap /team seperti sebelumnya (minim perubahan).
            Kalau mau ikut staffId juga, nanti kita ubah bareng page /team */}
        <Link href="/team" className="text-[#00939F]">
          View All
        </Link>
      </div>

      <Swiper spaceBetween={20} slidesPerView={slidesPerView} width={width}>
        {team.map((m) => (
          <SwiperSlide key={m.user_id}>
            <Card variant="borderless" className="card-box min-h-[260px]">
              {/* Header */}
              <div className="flex justify-start gap-4">
                <div className="avatar-count">
                  <Avatar
                    size={50}
                    src={hasPhoto(m.profile_pic) ? m.profile_pic : undefined}
                    alt={m.name}
                    onError={() => true}
                    style={
                      !hasPhoto(m.profile_pic)
                        ? { backgroundColor: "#00939F", color: "#fff", fontWeight: 600 }
                        : undefined
                    }
                  >
                    {!hasPhoto(m.profile_pic) ? initialsOf(m.name) : null}
                  </Avatar>
                </div>

                <div className="flex flex-col">
                  <p className="text-sm text-[#797B82] m-0 leading-5">{m.title || "—"}</p>
                  <h3 className="font-semibold text-lg text-[#383F50] leading-5">{m.name}</h3>
                </div>
              </div>

              {/* Metrics (jam & total task) */}
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2 text-[#383F50]">
                  <ClockCircleOutlined style={{ color: "#00939F" }} />
                  <span className="font-medium">{m.timesheet_label}</span>
                </div>
                <div className="flex items-center gap-2 text-[#383F50]">
                  <CalendarOutlined style={{ color: "#00939F" }} />
                  <span className="font-medium">{m.tasks?.total ?? 0}</span>
                </div>
              </div>

              {/* Task Overview (breakdown) */}
              <div className="mt-4">
                <h4 className="text-[#383F50] font-semibold mb-2">Task Overview</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-gray-200 p-3 text-center">
                    <div className="text-xs text-[#797B82] mb-1">Ongoing</div>
                    <div className="text-xl font-semibold text-[#383F50]">
                      {m.tasks?.in_progress ?? 0}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-3 text-center">
                    <div className="text-xs text-[#797B82] mb-1">Pending</div>
                    <div className="text-xl font-semibold text-[#383F50]">
                      {m.tasks?.pending ?? 0}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-3 text-center">
                    <div className="text-xs text-[#797B82] mb-1">Goal</div>
                    <div className="text-xl font-semibold text-[#383F50]">{m.tasks?.done ?? 0}</div>
                  </div>
                </div>
              </div>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
