"use client";

import "swiper/css";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Card, Select } from "antd";
import { Pie } from "@ant-design/charts";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";

// urutan data yang DATANG dari API kamu: Completed, overdue, Remaining
// maka range harus ikut urutan ini
const donutChartOptions = ({ dataSource }) => ({
  data: dataSource,
  angleField: "value",
  colorField: "type",
  height: 220,
  radius: 1,
  innerRadius: 0.4,
  scale: {
    color: {
      range: ["#46B8C5", "#FF928A", "#FFE8A3"],
    },
  },
  label: {
    text: (data) => {
      // kalau 0 biarin kosong, biar gak keliatan “hilang”
      if (!data.value) return "";
      return `${data.type}\n${data.value}`;
    },
    style: {
      fontWeight: "bold",
      fontSize: 10,
      fill: "#303030",
    },
  },
  legend: false,
  annotations: [
    {
      type: "text",
      style: {
        text: `${dataSource.reduce(
          (acc, curr) => acc + (curr.value || 0),
          0
        )}`,
        x: "50%",
        y: "50%",
        textAlign: "center",
        fill: "#1270B0",
        fontSize: 20,
        fontStyle: "bold",
      },
    },
  ],
  interactions: [
    { type: "element-selected" },
    { type: "element-active" },
  ],
  tooltip: {
    title: "type",
    items: [{ name: "total", channel: "y" }],
  },
});

export default function ProjectChart({ charts = [], onFilterChange }) {
  const isMobile = useMobileQuery();

  return (
    <div>
      <div className="flex justify-between mb-5">
        <p className="fc-base text-lg">Projects Charts</p>
        <Select
          className="w-40"
          variant="filled"
          defaultValue="overdue"
          size="middle"
          onChange={(v) => onFilterChange?.(v)}
          options={[
            { value: "overdue", label: "Overdue" },
            { value: "completed", label: "Completed" },
            { value: "remaining", label: "Remaining" },
          ]}
        />
      </div>

      <Card variant="borderless" className="card-box h-[375px]">
        {/* legend pakai urutan yang sama */}
        <div className="flex justify-center sm:justify-end gap-5 mb-10">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#46B8C5]" />
            <h1 className="text-[#1E1E1E] text-xs sm:text-sm">Completed</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF928A]" />
            <h1 className="text-[#1E1E1E] text-xs sm:text-sm">Overdue</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FFE8A3]" />
            <h1 className="text-[#1E1E1E] text-xs sm:text-sm">Remaining</h1>
          </div>
        </div>

        <Swiper
          spaceBetween={isMobile ? 10 : 40}
          slidesPerView={isMobile ? 1.5 : 3.5}
        >
          {(charts.length ? charts : []).map((it, idx) => (
            <SwiperSlide className="max-h-[380px]" key={idx}>
              <div className="flex flex-col items-center justify-center gap-3">
                <h1 className="text-[#303030] text-base">{it.title}</h1>
                <span className="w-5 h-1 rounded bg-[#46B8C5]" />
              </div>
              <div className="max-w-full">
                <Pie
                  {...donutChartOptions({
                    dataSource: Array.isArray(it.data)
                      ? it.data
                      : [
                        { type: "Completed", value: 0 },
                        { type: "overdue", value: 0 },
                        { type: "Remaining", value: 0 },
                      ],
                  })}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </Card>
    </div>
  );
}
