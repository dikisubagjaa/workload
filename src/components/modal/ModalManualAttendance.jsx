"use client";

import { useEffect, useState } from "react";
import { Button, DatePicker, Form, Modal, Select, message } from "antd";
import axiosInstance from "@/utils/axios";
import { fetchUsers as fetchUsersList, buildUserOptions } from "@/utils/userHelpers";

const ModalManualAttendance = ({
  modalManualAttendance,
  setModalManualAttendance,
  onSuccess, // optional, buat refresh table dari parent
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [staffOptions, setStaffOptions] = useState([]);
  const [reasonOptions, setReasonOptions] = useState([]);

  const handleClose = () => {
    setModalManualAttendance(false);
    form.resetFields();
  };

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);

      const [users, reasonRes] = await Promise.all([
        fetchUsersList({ status: "active", limit: 1000 }),
        axiosInstance.get("/master/leave-reason", {
          params: {
            status: "active",
            limit: 1000,
          },
        }),
      ]);

      const leaveConfigs = reasonRes?.data?.data || [];

      const staffOpts = buildUserOptions(users).sort((a, b) =>
        a.label.localeCompare(b.label)
      );

      const reasonOpts = leaveConfigs
        .map((cfg) => ({
          value: cfg.title,
          label: cfg.title,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      setStaffOptions(staffOpts);
      setReasonOptions(reasonOpts);
    } catch (error) {
      console.error("Failed to load manual attendance options:", error);
      message.error("Failed to load staff / reasons");
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (modalManualAttendance) {
      fetchOptions();
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalManualAttendance]);

  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      const payload = {
        staffId: values.staffId,
        date: values.date ? values.date.format("YYYY-MM-DD") : undefined,
        reason: values.reason,
        // status sengaja tidak dikirim → backend default "present"
      };

      await axiosInstance.post("/attendance/manual", payload);

      message.success("Manual attendance saved successfully");

      if (typeof onSuccess === "function") {
        onSuccess(payload);
      }

      handleClose();
    } catch (error) {
      console.error("Manual attendance error:", error);
      const msg =
        error?.response?.data?.msg || "Failed to save manual attendance";
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      closable={{ "aria-label": "Custom Close Button" }}
      open={modalManualAttendance}
      onCancel={handleClose}
      footer={null}
    >
      <h3 className="text-lg font-semibold fc-blue">Attendance Manual</h3>
      <hr className="my-3" />

      <Form form={form} onFinish={onFinish} layout="vertical">
        {/* Staff */}
        <Form.Item
          name="staffId"
          label="Staff"
          rules={[{ required: true, message: "Please select staff" }]}
        >
          <Select
            showSearch
            placeholder="Select staff"
            size="large"
            options={staffOptions}
            loading={loadingOptions}
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        {/* Reason (LeaveConfig) */}
        <Form.Item
          name="reason"
          label="Reason"
          rules={[{ required: true, message: "Please select reason" }]}
        >
          <Select
            showSearch
            placeholder="Select reason"
            size="large"
            options={reasonOptions}
            loading={loadingOptions}
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        {/* Date */}
        <Form.Item
          name="date"
          label="Presence Date"
          rules={[{ required: true, message: "Please select date" }]}
        >
          <DatePicker className="w-full" size="large" />
        </Form.Item>

        <div className="flex gap-3 justify-end mt-5">
          <Button onClick={handleClose} disabled={submitting}>
            Close
          </Button>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ModalManualAttendance;
