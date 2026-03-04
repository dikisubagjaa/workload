// src/components/leave/FormLeave.jsx
"use client";
import { useEffect, useState } from "react";
import { Input, Form, Button, DatePicker, Select, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import axiosInstance from "@/utils/axios";
import { fetchUsers as fetchUsersList, buildUserOptions } from "@/utils/userHelpers";

const { TextArea } = Input;

const isAnnualReason = (val) =>
  String(val || "").toLowerCase().trim().startsWith("cuti tahunan");

export default function FormLeave({ onSuccess, onCancel }) {
  const [form] = Form.useForm();

  const [userOptions, setUserOptions] = useState([]);
  const [reasonOptions, setReasonOptions] = useState([]);

  const [selectedReason, setSelectedReason] = useState(null);
  const [annualQuotaInfo, setAnnualQuotaInfo] = useState(null);

  const fetchAnnualQuota = async (anchorYmd) => {
    try {
      const res = await axiosInstance.get("/leave/annual-quota", {
        params: anchorYmd ? { anchor: anchorYmd } : undefined,
      });
      if (res?.data?.success) setAnnualQuotaInfo(res.data);
    } catch {
      // quota info optional (silent)
    }
  };

  useEffect(() => {
    // Users for Assign + HOD
    (async () => {
      try {
        const users = await fetchUsersList({ limit: 200 });
        const list = buildUserOptions(users);
        if (list.length) setUserOptions(list);
      } catch {}
    })();

    // Leave reasons
    (async () => {
      try {
        const { data } = await axiosInstance.get("/master/leave-reason", {
          params: { status: "active", limit: 1000 },
        });

        if (data?.success) {
          const opts = (data.data || []).map((r) => ({
            value: r.title,
            label: r.title,
            lconfig_id: r.lconfig_id,
          }));
          if (opts.length) setReasonOptions(opts);
        }
      } catch {}
    })();
  }, []);

  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const onFinish = async (values) => {
    const start = values["Start Date"];
    const end = values["End Date"];
    const assignToVal = values["Assign Work To"];

    const payload = {
      startDate: start ? dayjs(start).format("YYYY-MM-DD") : null,
      endDate: end ? dayjs(end).format("YYYY-MM-DD") : null,
      reason: values["Reason"],
      mlreasonId: values.mlreasonId ? Number(values.mlreasonId) : null,
      assignNote: values["Job Note For Assign"] || null,
      detail: values["Why you apply for leave?"] || null,
      assignWorkTo: Array.isArray(assignToVal) ? assignToVal : assignToVal ? [assignToVal] : [],
      headOfDepartment: values["Head Of Department"] || null,
    };

    if (!payload.startDate || !payload.endDate) {
      message.error("Start Date & End Date wajib diisi");
      return;
    }
    if (dayjs(payload.endDate).isBefore(dayjs(payload.startDate), "day")) {
      message.error("End Date tidak boleh sebelum Start Date");
      return;
    }

    try {
      const { data } = await axiosInstance.post("/leave", payload);
      if (data?.success) {
        message.success("Leave berhasil diajukan");
        form.resetFields();
        setSelectedReason(null);
        setAnnualQuotaInfo(null);
        onSuccess && onSuccess(data.data);
      } else {
        message.error(data?.msg || "Gagal mengajukan leave");
      }
    } catch (err) {
      const apiErr = err?.response?.data;
      message.error(apiErr?.error || err?.message || "Gagal mengajukan leave");
    }
  };

  const onFinishFailed = () => message.error("Masih ada field yang kosong/invalid");

  const remainingText =
    annualQuotaInfo?.remaining != null ? String(annualQuotaInfo.remaining) : "-";

  return (
    <>
      {isAnnualReason(selectedReason) && (
        <h6 className="text-red-500 text-center mb-5">
          Current Annual Leave Remaining: {remainingText}
        </h6>
      )}

      <Form
        form={form}
        name="basic"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Start Date"
          name="Start Date"
          rules={[{ required: true, message: "This field cannot be empty" }]}
        >
          <DatePicker
            size="large"
            className="w-full"
            onChange={(val) => {
              if (!isAnnualReason(selectedReason)) return;
              const ymd = val ? dayjs(val).format("YYYY-MM-DD") : null;
              fetchAnnualQuota(ymd);
            }}
          />
        </Form.Item>

        <Form.Item
          label="End Date"
          name="End Date"
          rules={[{ required: true, message: "This field cannot be empty" }]}
        >
          <DatePicker size="large" className="w-full" />
        </Form.Item>

        <Form.Item
          label="Reason"
          name="Reason"
          rules={[{ required: true, message: "This field cannot be empty" }]}
        >
          <Select
            showSearch
            className="w-full mb-3"
            size="large"
            optionFilterProp="children"
            filterOption={filterOption}
            options={reasonOptions}
            onChange={(val, option) => {
              setSelectedReason(val);

              form.setFieldsValue({
                mlreasonId: option?.lconfig_id ?? null,
              });

              if (!isAnnualReason(val)) {
                setAnnualQuotaInfo(null);
              } else {
                const start = form.getFieldValue("Start Date");
                const anchorYmd = start ? dayjs(start).format("YYYY-MM-DD") : null;
                fetchAnnualQuota(anchorYmd);
              }
            }}
          />
        </Form.Item>

        <Form.Item name="mlreasonId" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          label="Job Note For Assign"
          name="Job Note For Assign"
          rules={[{ required: true, message: "This field cannot be empty" }]}
        >
          <TextArea className="mb-3" autoSize={{ minRows: 3, maxRows: 5 }} />
        </Form.Item>

        <Form.Item
          label="Why you apply for leave?"
          name="Why you apply for leave?"
          rules={[{ required: true, message: "This field cannot be empty" }]}
        >
          <TextArea className="mb-3" autoSize={{ minRows: 3, maxRows: 5 }} />
        </Form.Item>

        <Form.Item
          label="Assign Work To"
          name="Assign Work To"
          rules={[{ required: true, message: "This field cannot be empty" }]}
        >
          <Select
            showSearch
            className="w-full mb-3"
            size="large"
            optionFilterProp="children"
            filterOption={filterOption}
            options={userOptions}
          />
        </Form.Item>

        <Form.Item
          label="Head Of Department"
          name="Head Of Department"
          rules={[{ required: true, message: "This field cannot be empty" }]}
        >
          <Select
            showSearch
            className="w-full mb-3"
            size="large"
            optionFilterProp="children"
            filterOption={filterOption}
            options={userOptions}
          />
        </Form.Item>

        <div className="mb-5">
          <hr className="mb-4" />
          <h4 className="text-red-500">Read Note:</h4>
          <ul>
            <li>
              <p>
                <FontAwesomeIcon icon={faCheck} /> Khusus untuk pengajuan &#34;Cuti Tahunan&#34; sekurang-kurangnya 7 hari sebelum tanggal cuti.
              </p>
            </li>
            <li>
              <p>
                <FontAwesomeIcon icon={faCheck} /> Setiap izin yang dibuat, segera mintakan &#34;Accept&#34; untuk para pihak terkait.
              </p>
            </li>
            <p>
              <FontAwesomeIcon icon={faCheck} /> Jika izin tidak di &#34;Accept&#34; oleh para pihak &amp; pemohon tidak hadir bekerja, maka dianggap mangkir dari pekerjaan. Sanksi yang diberikan berupa Unpaid Leave &amp; SP (Sesuai peraturan).
            </p>
            <li>
              <p>
                <FontAwesomeIcon icon={faCheck} /> Perlu disadari bersama, dalam melakukan &#34;Accept&#34; mohon periksa workload atau jenis pekerjaan. Pastikan semua pekerjaan dapat ditangani dengan baik saat pemohon izin tidak hadir.
              </p>
            </li>
            <li>
              <p>
                <FontAwesomeIcon icon={faCheck} /> Hal-hal yang tidak disebutkan, sudah tercantum dalam peraturan perusahaan.
              </p>
            </li>
          </ul>
        </div>

        <Form.Item className="text-center">
          <Button htmlType="submit" variant="solid" className="btn-blue" size="large">
            Send
          </Button>
          {onCancel && (
            <Button className="ml-2" size="large" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </Form.Item>
      </Form>
    </>
  );
}
