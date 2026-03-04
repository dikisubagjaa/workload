"use client";
import { TablePerformanceScore } from "@/components/table/TablePerformanceScore";
import { Card, Collapse, Select } from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

export default function MainContent() {
  const thisYear = dayjs().year();
  const [year, setYear] = useState(thisYear);
  const [order, setOrder] = useState("desc"); // "asc" | "desc"

  const yearOptions = useMemo(() => {
    return [thisYear, thisYear - 1, thisYear - 2].map((y) => ({
      value: y,
      label: String(y),
    }));
  }, [thisYear]);

  const months = useMemo(() => {
    const arr = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const start = dayjs(`${year}-${String(m).padStart(2, "0")}-01`).startOf("month");
      const end = start.endOf("month");
      return {
        key: `${year}-${String(m).padStart(2, "0")}`,
        labelBase: start.format("MMMM"),
        from: start.format("YYYY-MM-DD"),
        to: end.format("YYYY-MM-DD"),
      };
    });
    return order === "asc" ? arr : arr.reverse();
  }, [year, order]);

  const defaultActiveKey = useMemo(() => {
    const thisKey = dayjs().format("YYYY-MM");
    const match = months.find((m) => m.key === thisKey);
    return [match?.key || months[0]?.key || "1"];
  }, [months]);

  const [totals, setTotals] = useState({});
  const setMonthTotal = (key, val) =>
    setTotals((prev) => (prev[key] === val ? prev : { ...prev, [key]: val }));

  const itemsCollapse = useMemo(() => {
    return months.map((m) => ({
      key: m.key,
      label: `${m.labelBase} : ${totals[m.key] ?? "…"}`,
      classNames: { body: "p-0" },
      children: (
        <TablePerformanceScore
          from={m.from}
          to={m.to}
          onLoaded={(sum) => setMonthTotal(m.key, sum)}
        />
      ),
    }));
  }, [months, totals]);

  return (
    <section className="container py-10">
      <h1 className="sm:text-xl lg:text-3xl mb-5">Performance Score Logs</h1>
      <Card className="card-box">
        <div className="flex flex-col sm:flex-row sm:items-center mb-5">
          <h3 className="text-lg fc-base mb-4 sm:mb-0">{year}</h3>
          <div className="flex items-center gap-4 sm:ms-auto">
            <h4 className="fc-base text-sm hidden sm:block">Filter by</h4>

            {/* Tahun */}
            <Select
              placeholder="Status"
              className="w-full sm:w-36"
              options={yearOptions}
              value={year}
              onChange={setYear}
            />

            {/* Urutan bulan */}
            <Select
              placeholder="Ascending"
              className="w-full sm:w-36"
              options={[
                { value: "asc", label: "Ascending" },
                { value: "desc", label: "Descending" },
              ]}
              value={order}
              onChange={setOrder}
            />
          </div>
        </div>

        <Collapse
          defaultActiveKey={defaultActiveKey}
          items={itemsCollapse}
          expandIconPosition="end"
        />
      </Card>
    </section>
  );
}
