// src/app/attendance/maps/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Table, Tag, Button, Spin, Alert, DatePicker, Input } from "antd";
import dayjs from "dayjs";

import axiosInstance from "@/utils/axios";
import { RiResetLeftLine } from "react-icons/ri";
import { LeftOutlined } from "@ant-design/icons";

const STATUS_COLOR = {
  present: "green",
  late: "orange",
  absent: "red",
  leave: "blue",
  holiday: "cyan",
  sick: "volcano",
  permission: "geekblue",
};

export default function AttendanceMapsPage() {
  const router = useRouter();

  const [rows, setRows] = useState([]);
  const [serverDate, setServerDate] = useState("");
  const [targetDate, setTargetDate] = useState(dayjs());
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async (options = {}) => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      const d = options.date ?? targetDate;

      if (d) {
        params.date = d.format("YYYY-MM-DD");
      }
      if (options.status !== undefined ? options.status : status) {
        params.status = options.status ?? status;
      }
      if (options.q !== undefined ? options.q : q) {
        params.q = options.q ?? q;
      }

      const res = await axiosInstance.get("/attendance/map", { params });
      const payload = res?.data || {};

      setServerDate(payload.date || params.date || "");
      setRows(payload.data || []);
    } catch (err) {
      console.error("Failed to fetch attendance map:", err);
      setError(
        err?.response?.data?.msg || err?.message || "Failed to load data"
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleDateChange = (d) => {
    const dateVal = d || dayjs();
    setTargetDate(dateVal);
    fetchData({ date: dateVal });
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    fetchData({ status: value });
  };

  const handleSearch = (value) => {
    const val = value || "";
    setQ(val);
    fetchData({ q: val });
  };

  const columns = [
    {
      title: "Staff",
      dataIndex: "fullname",
      key: "fullname",
      render: (_text, record) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-sm">
            {record.fullname || "-"}
          </div>
          <div className="text-xs text-gray-500">{record.email || "-"}</div>
          <div className="text-xs text-gray-500">{record.phone || "-"}</div>
        </div>
      ),
    },
    {
      title: "Job Position",
      dataIndex: "jobPosition",
      key: "jobPosition",
      render: (v) => <span className="text-sm">{v || "-"}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v) => {
        const key = String(v || "").toLowerCase();
        return (
          <Tag color={STATUS_COLOR[key] || "default"} className="text-xs">
            {v || "-"}
          </Tag>
        );
      },
    },
    {
      title: "Time",
      key: "time",
      render: (_val, record) => (
        <div className="text-xs">
          <div>In: {record.clockIn || "-"}</div>
          <div>Out: {record.clockOut || "-"}</div>
        </div>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (_val, record) => {
        const { latitude, longitude } = record;

        if (latitude == null || longitude == null) {
          return (
            <span className="text-xs text-gray-400">
              No location
            </span>
          );
        }

        const lat = Number(latitude).toFixed(6);
        const lng = Number(longitude).toFixed(6);
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

        return (
          <div className="space-y-1">
            <div className="text-xs">
              {lat}, {lng}
            </div>
            <Button
              size="small"
              type="primary"
              className="btn-blue-filled"
              onClick={() => window.open(mapsUrl, "_blank", "noopener")}
            >
              Open Maps
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <section className="container pt-10">
      <Card
        className="card-box mb-5"
        title={
          <div className="flex flex-col lg:flex-row justify-between gap-3 lg:items-center py-4">
            <div>
              <button className="btn-back" onClick={() => router.back()}>
                <h3 className="text-lg"><LeftOutlined /> Attendance Maps</h3>
              </button>
              <p className="text-xs text-gray-500 whitespace-normal">
                Monitoring lokasi absensi berdasarkan titik koordinat saat
                clock-in.
              </p>
              {serverDate && (
                <p className="text-xs text-gray-400 mt-1">
                  Date: {serverDate}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <DatePicker
                size="middle"
                value={targetDate}
                onChange={handleDateChange}
                className="w-full lg:w-64"
              />
              <Input.Search
                placeholder="Search name / email / phone"
                allowClear
                size="middle"
                onSearch={handleSearch}
              />
              <Button
                onClick={handleRefresh}
                disabled={loading}
              >
                <RiResetLeftLine /> Refresh
              </Button>
            </div>
          </div>
        }
      >
        {error && (
          <div className="mb-3">
            <Alert type="error" message={error} showIcon />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            rowKey={(row) => row.attendanceId || `${row.userId}-${row.date}`}
            dataSource={rows}
            columns={columns}
            pagination={false}
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: "No attendance data with location for this date",
            }}
          />
        )}
      </Card>
    </section>
  );
}
