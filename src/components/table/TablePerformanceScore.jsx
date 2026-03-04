"use client";

import Image from "next/image";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Table, TimePicker, message } from "antd";
import { useMobileQuery } from "../libs/UseMediaQuery";
import dayjs from "dayjs";
import axiosInstance from "@/utils/axios";
import { useEffect, useMemo, useRef, useState } from "react";

const format = "HH:mm";

// === columns (sesuai template, tapi tambahkan subtext tanggal di kolom Task Name) ===
const colomnsTsArchived = [
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
    className: "text-[#797B82] font-normal bg-white",
    render: (value, record, index) => {
      return (
        <div className="flex items-center gap-4">
          <h4 className="text-sm fc-base">{index + 1}</h4>
          <h4 className="text-sm fc-base">{record.title}</h4>
        </div>
      );
    },
  },
  {
    title: "Task Name",
    dataIndex: "taskName",
    key: "taskName",
    className: "text-[#797B82] font-normal bg-white",
    render: (value, record) => {
      return (
        <div className="flex flex-col">
          <h4 className="text-sm fc-base">{record.taskName || "-"}</h4>
          {record.meta && (
            <span className="text-xs text-gray-400 mt-0.5">{record.meta}</span>
          )}
        </div>
      );
    },
  },
  {
    title: "Score",
    dataIndex: "score",
    key: "score",
    className: "text-[#797B82] font-normal bg-white",
    render: (value, record) => {
      return <h5 className="text-sm fc-base">{record.score}</h5>;
    },
  },
];

const mobileColomnsTsArchived = [
  {
    title: "Task Name",
    dataIndex: "taskName",
    key: "taskName",
    className: "text-[#797B82] font-normal",
    render: (value, record, index) => {
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-4">
            <h4 className="text-sm fc-base">{index + 1}</h4>
            <h4 className="text-sm fc-base">{record.title}</h4>
          </div>
          {record.taskName ? (
            <span className="text-xs fc-base">{record.taskName}</span>
          ) : null}
          {record.meta && (
            <span className="text-xs text-gray-400">{record.meta}</span>
          )}
        </div>
      );
    },
  },
];

// === Expand row (tetap, tambahkan meta bila ada) ===
const ExpandArchived = ({ record }) => {
  return (
    <ul className="flex flex-col gap-4">
      <li>
        <h3 className="text-sm font-semibold mb-2">Task Name</h3>
        <h4 className="text-sm fc-base">{record.taskName || "-"}</h4>
      </li>

      {record.meta ? (
        <li>
          <h3 className="text-sm font-semibold mb-2">Date</h3>
          <h5 className="text-sm text-gray-500">{record.meta}</h5>
        </li>
      ) : null}

      <li>
        <h3 className="text-sm font-semibold mb-2">Score</h3>
        <h5 className="text-sm fc-base">{record.score}</h5>
      </li>
    </ul>
  );
};

// mapping helper
const TYPE_META = {
  late_to_work: { label: "Late to Work" },
  not_filling_timesheet: { label: "Not filling timesheet" },
  complete_task: { label: "Complete Task (On Time)" },
  complete_task_h1: { label: "Complete Task H-1" },
  complete_task_h3: { label: "Complete Task H-3" },
  complete_task_h7: { label: "Complete Task H-7" },
  complete_overdue_task: { label: "Complete Overdue Task" },
  miss_deadline: { label: "Miss Deadline H+1..3" },
  miss_deadline_h3: { label: "Miss Deadline H+4..7" },
  miss_deadline_h7: { label: "Miss Deadline > H+7" },
};

const EVENT_TYPES = [
  "late_to_work",
  "not_filling_timesheet",
  "complete_task_h7",
  "complete_task_h3",
  "complete_task_h1",
  "complete_task",
  "complete_overdue_task",
  "miss_deadline",
  "miss_deadline_h3",
  "miss_deadline_h7",
];

function fmtScore(n) {
  if (typeof n !== "number") return String(n ?? "");
  if (n > 0) return `+${n}`;
  return String(n);
}

// buat deskripsi tanggal per item sesuai tipe event
function buildMetaLine(t, it) {
  if (t === "not_filling_timesheet") {
    return it?.date ? `Date: ${it.date}` : null;
  }
  if (t === "late_to_work") {
    const bits = [];
    if (it?.date) bits.push(`Date: ${it.date}`);
    if (it?.clock_in) bits.push(`In: ${it.clock_in}`);
    if (it?.clock_out) bits.push(`Out: ${it.clock_out}`);
    return bits.length ? bits.join(" | ") : null;
  }
  if (
    t === "complete_task" ||
    t === "complete_task_h1" ||
    t === "complete_task_h3" ||
    t === "complete_task_h7" ||
    t === "complete_overdue_task"
  ) {
    const parts = [];
    if (it?.completed_at) parts.push(`Completed: ${it.completed_at}`);
    if (it?.due_date) parts.push(`Due: ${it.due_date}`);
    if (typeof it?.delta_days === "number") parts.push(`(Δ ${it.delta_days}d)`);
    return parts.length ? parts.join(" • ") : null;
  }
  // miss_deadline*
  const suffix =
    typeof it?.days_overdue === "number" ? ` (H+${it.days_overdue})` : "";
  return it?.due_date ? `Due: ${it.due_date}${suffix}` : null;
}

export function TablePerformanceScore({ from, to, userId, onLoaded }) {
  const isMobile = useMobileQuery();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastSentTotalRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        // 1) Summary
        const qs = new URLSearchParams();
        if (from) qs.set("from", from);
        if (to) qs.set("to", to);
        if (userId) qs.set("userId", String(userId));

        const sumRes = await axiosInstance.get(`/performance-score?${qs.toString()}`);
        const breakdown = sumRes?.data?.breakdown || {};
        const totalScore = sumRes?.data?.totalScore ?? null;

        if (onLoaded && lastSentTotalRef.current !== totalScore) {
          lastSentTotalRef.current = totalScore;
          onLoaded(totalScore);
        }

        // 2) Ambil events yang ada count > 0
        const needTypes = EVENT_TYPES.filter((t) => (breakdown[t]?.count || 0) > 0);

        if (needTypes.length === 0) {
          if (!cancelled) setRows([]);
          return;
        }

        // 3) Fetch detail paralel
        const reqs = needTypes.map((t) => {
          const p = new URLSearchParams();
          p.set("type", t);
          if (from) p.set("from", from);
          if (to) p.set("to", to);
          if (userId) p.set("userId", String(userId));
          p.set("page", "1");
          p.set("limit", "200");
          return axiosInstance
            .get(`/performance-score/events?${p.toString()}`)
            .then((r) => ({ t, data: r?.data }))
            .catch(() => ({ t, data: { total: 0, items: [] } }));
        });

        const all = await Promise.all(reqs);

        // 4) Gabungkan ke baris tabel (tambah metaLine)
        const merged = [];
        for (const { t, data } of all) {
          const label = TYPE_META[t]?.label || t;
          for (const it of data?.items || []) {
            const taskName = it?.title || ""; // untuk attendance/timesheet bisa kosong
            const ts =
              it?.completed_at
                ? dayjs(it.completed_at)
                : it?.due_date
                ? dayjs(it.due_date)
                : it?.date
                ? dayjs(it.date)
                : null;

            const meta = buildMetaLine(t, it);

            merged.push({
              key: `${t}-${taskName}-${it?.date || it?.due_date || it?.completed_at || Math.random()}`,
              title: label,
              taskName,
              meta,
              score: fmtScore(it?.points ?? 0),
              _ts: ts ? ts.valueOf() : 0,
            });
          }
        }

        merged.sort((a, b) => b._ts - a._ts);
        if (!cancelled) setRows(merged);
      } catch (e) {
        message.error(e?.response?.data?.msg || e?.message || "Failed to load performance logs.");
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [from, to, userId]); // onLoaded bukan dependency

  return (
    <Table
      dataSource={rows}
      columns={isMobile ? mobileColomnsTsArchived : colomnsTsArchived}
      scroll={isMobile ? null : { x: "max-content" }}
      showHeader={false}
      loading={loading}
      pagination={false}
      expandable={
        isMobile
          ? { expandedRowRender: (record) => <ExpandArchived record={record} /> }
          : null
      }
    />
  );
}
