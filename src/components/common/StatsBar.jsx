"use client";
import { useState, useEffect, useCallback } from "react";
import "swiper/css";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Card } from "antd";
import Link from "next/link";
import axiosInstance from "@/utils/axios";

export default function StatsBar({ isMobile, isLaptop, isDekstop, staffId }) {
  const [loadingDash, setLoadingDash] = useState(false);

  const defaultOverviewData = [
    {
      title: "Due Today",
      category: "due_date",
      value: 0,
      cardBorder: "!border-l-4 border-[#00939F]",
    },
    {
      title: "Overdue Task",
      category: "overdue",
      value: 0,
      cardBorder: "!border-l-4 border-[#EC221F]",
    },
    {
      title: "Critical Deadlines",
      category: "critical",
      value: 0,
      cardBorder: "!border-l-4 border-[#E8B931]",
    },
    {
      title: "Due This Week",
      category: "due_this_week",
      value: 0,
      cardBorder: "!border-l-4 border-[#00939F]",
    },
    {
      title: "New task assigned",
      category: "new_task_assigned",
      value: 0,
      cardBorder: "!border-l-4 border-[#E8B931]",
    },
    {
      title: "Total Task",
      category: "total_task",
      value: 0,
      cardBorder: "!border-l-4 border-[#00939F]",
    },
    {
      title: "Need Review",
      category: "need_review",
      value: 0,
      cardBorder: "!border-l-4 border-[#00939F]",
    },
  ];

  const [overviewData, setOverviewData] = useState(defaultOverviewData);

  const fetchStats = useCallback(async () => {
    setLoadingDash(true);
    try {
      const res = await axiosInstance.get("/task/stats", {
        params: { staffId: staffId || undefined },
      });

      if (res.status === 200 || res.status === 201) {
        const list = Array.isArray(res.data?.overview) ? res.data.overview : null;
        if (list) setOverviewData(list);
      }
    } catch (err) {
      console.log(err);
      // fallback: keep existing overviewData (no style/structure change)
    } finally {
      setLoadingDash(false);
    }
  }, [staffId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const slidesPerView = isMobile ? 1 : isLaptop ? 1 : isDekstop ? 1 : 7;
  const width = isMobile ? 150 : isLaptop ? 160 : isDekstop ? 180 : null;

  return (
    <section className="mb-7">
      <Swiper spaceBetween={15} slidesPerView={slidesPerView} width={width}>
        {overviewData.map((item, index) => (
          <SwiperSlide key={index}>
            <Link
              href={
                staffId
                  ? `/task?category=${item.category}&staffId=${encodeURIComponent(staffId)}`
                  : `/task?category=${item.category}`
              }
            >
              <Card
                variant="borderless"
                className={`card-box card-widget !border-l-4 ${item.cardBorder}`}
                classNames={{ body: "px-3" }}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <h5 className="text-xs sm:text-base text-[#797B82]">{item.title}</h5>
                  <h3 className="text-4xl text-[#383F50]">{item.value}</h3>
                </div>
              </Card>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
