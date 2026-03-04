"use client";

import { LoadingOutlined } from "@ant-design/icons";
import { Button, Card, Form, Switch, Spin, message } from "antd";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";

const FIELDS = [
  "taskAssignment",
  "taskOverdue",
  "lateToWork",
  "approval",
  "reschedule",
  "reimbursement",
  "reminderToFollowUp",
  "clientHaveOverdueInvoice",
  "collection",
  "overbudget",
  "overtimeLimit",
  "newInvoice",
  "Sales",
  "TaskCompletion",
  "memberOverdue",
  "revenue",
];

const DEFAULTS = FIELDS.reduce((acc, k) => {
  acc[k] = true; // default ON
  return acc;
}, {});

function normalizeItems(items) {
  const merged = { ...DEFAULTS, ...(items || {}) };
  FIELDS.forEach((k) => (merged[k] = !!merged[k]));
  return merged;
}

export default function MainContent() {
  const [form] = Form.useForm();
  const [loadingInit, setLoadingInit] = useState(true);
  // saving per-switch agar yang lain tetap bisa diubah
  const [savingMap, setSavingMap] = useState({});

  const loadSettings = async () => {
    try {
      const { data } = await axiosInstance.get("/setting/notification", {
        headers: { "Cache-Control": "no-store" },
      });
      if (data?.success) {
        form.setFieldsValue(normalizeItems(data.items));
      } else {
        form.setFieldsValue(DEFAULTS);
      }
    } catch (e) {
      form.setFieldsValue(DEFAULTS); // fallback default ON kalau GET error
      message.error("Gagal memuat pengaturan notifikasi, pakai default.");
    } finally {
      setLoadingInit(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadSettings();
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setSaving = (name, v) =>
    setSavingMap((prev) => ({ ...prev, [name]: v }));

  const handleToggle = async (name, checked) => {
    // Optimistic UI: set value dulu
    const prev = form.getFieldValue(name);
    form.setFieldsValue({ [name]: checked });
    setSaving(name, true);

    try {
      await axiosInstance.put(
        "/setting/notification",
        { [name]: checked },
        { headers: { "Cache-Control": "no-store" } }
      );
      // Sukses → biarkan nilai terbaru
      message.success(`${name} ${checked ? "ON" : "OFF"}`);
    } catch (e) {
      form.setFieldsValue({ [name]: prev });
      message.error(`Gagal menyimpan ${name}, dikembalikan ke nilai sebelumnya`);
    } finally {
      setSaving(name, false);
    }
  };

  if (loadingInit) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
      </div>
    );
  }

  const disabledAll = loadingInit; // hanya disable total saat init

  // Helper render satu item supaya tidak duplikasi
  const Item = ({ name, title, desc }) => (
    <Form.Item name={name} className="mb-5">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="fc-base text-base">{title}</h3>
          {desc ? <h4 className="fc-base text-[10px]">{desc}</h4> : null}
        </div>
        <Switch
          checked={!!form.getFieldValue(name)} // controlled
          onChange={(val) => handleToggle(name, val)}
          loading={!!savingMap[name]}
          disabled={disabledAll}
        />
      </div>
    </Form.Item>
  );

  return (
    <section className="container pt-10">
      <h1 className="text-3xl mb-4">Notifications</h1>

      {/* Form hanya dipakai sebagai state holder & layout */}
      <Form form={form} layout="vertical" className="w-full lg:w-1/2">
        <Card className="card-box">
          <h3 className="fc-base text-lg font-medium mb-6">In-App Notifications</h3>

          <Item name="taskAssignment" title="Task Assignment" desc="Notifikasi ketika task ditugaskan ke kamu." />
          <Item name="taskOverdue" title="Task Overdue" desc="Peringatan ketika task melewati due date." />
          <Item name="lateToWork" title="Late to Work" desc="Peringatan keterlambatan absen." />
          <Item name="approval" title="Approval" desc="Pengajuan membutuhkan persetujuan." />
          <Item name="reschedule" title="Reschedule" desc="Jadwal diubah atau dipindahkan." />
          <Item name="reimbursement" title="Reimbursement" desc="Update status klaim reimburse." />
          <Item name="reminderToFollowUp" title="Reminder to Follow Up" desc="Pengingat follow up klien/lead." />
          <Item name="clientHaveOverdueInvoice" title="Client has Overdue Invoice" desc="Klien memiliki invoice jatuh tempo." />
          <Item name="collection" title="Collection" desc="Aktivitas penagihan pembayaran." />
          <Item name="overbudget" title="Over Budget" desc="Anggaran melampaui batas." />
          <Item name="overtimeLimit" title="Overtime Limit" desc="Batas lembur terlampaui." />
          <Item name="newInvoice" title="New Invoice" desc="Invoice baru dibuat." />
          <Item name="Sales" title="Sales" desc="Notifikasi terkait penjualan." />
          <Item name="TaskCompletion" title="Task Completion" desc="Task selesai dikerjakan." />
          <Item name="memberOverdue" title="Member Overdue" desc="Aktivitas member melewati tenggat." />
          <Item name="revenue" title="Revenue" desc="Perubahan/target revenue." />
        </Card>
      </Form>
    </section>
  );
}
