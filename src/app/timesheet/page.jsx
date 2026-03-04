// /src/app/timesheet/page.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, Alert } from "antd";
import TimesheetToday from "@/components/timesheet/TimesheetToday";
import TimesheetArchived from "@/components/timesheet/TimesheetArchived";
import TimesheetForm from "@/components/timesheet/TimesheetForm";
import TimesheetConfirmation from "@/components/timesheet/TimesheetConfirmation";

export default function TimesheetPage() {
  const [loading, setLoading] = useState(true);
  const [enforce, setEnforce] = useState({
    required: false,
    date: null,
  });
  const [error, setError] = useState("");

  const fetchEnforcement = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/timesheet/enforcement", {
        method: "GET",
        cache: "no-store",
      });
      const data = await res.json();
      setEnforce({
        required: !!data?.required,
        date: data?.date || null,
      });
    } catch (err) {
      // kalau API error, jangan sampe nge-blok halaman selamanya
      setError("Gagal cek status timesheet. Coba refresh halaman.");
      setEnforce({ required: false, date: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnforcement();
  }, [fetchEnforcement]);

  // loading awal
  if (loading) {
    return (
      <section className="container py-10">
        <h1 className="sm:text-xl lg:text-3xl">Timesheet</h1>
        <p className="mt-4 text-gray-500">Memuat status timesheet…</p>
      </section>
    );
  }

  // ========== MODE PAKSA ==========
  if (enforce.required && enforce.date) {
    return (
      <section className="container py-10">
        <h1 className="sm:text-xl lg:text-3xl">Timesheet</h1>

        <div className="mt-4 mb-6">
          <Alert
            type="warning"
            showIcon
            message="Timesheet wajib diisi"
            description={
              <span>
                Kamu wajib mengisi timesheet tanggal <b>{enforce.date}</b> sebelum
                mengakses menu lain.
              </span>
            }
          />
        </div>

        {/* form isi hari yang dikunci */}
        <TimesheetForm
          forceMode
          lockedDate={enforce.date}
          // habis submit, cek lagi ke API, kalau masih required ya tampil lagi
          onSubmitted={() => {
            fetchEnforcement();
          }}
        />

        {/* tombol konfirmasi juga ikut mode paksa */}
        <div className="mt-6">
          <TimesheetConfirmation
            forceMode
            lockedDate={enforce.date}
            onConfirmed={() => {
              // habis konfirmasi, cek lagi
              fetchEnforcement();
            }}
          />
        </div>
      </section>
    );
  }

  // ========== MODE NORMAL (gak dipaksa) ==========
  const itemsTabs = [
    { key: "1", label: "Overview", children: <TimesheetToday /> },
    { key: "2", label: "Archived", children: <TimesheetArchived /> },
  ];

  return (
    <section className="container py-10">
      <h1 className="sm:text-xl lg:text-3xl">Timesheet</h1>

      {error ? (
        <div className="mt-4 mb-4">
          <Alert type="error" message={error} />
        </div>
      ) : null}

      <Tabs defaultActiveKey="1" items={itemsTabs} />
    </section>
  );
}
