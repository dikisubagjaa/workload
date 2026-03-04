// src/app/user/create/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  message,
  Row,
  Col,
  Switch,
  DatePicker,
} from "antd";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";
import { LeftOutlined } from "@ant-design/icons";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "waiting", label: "Waiting" },
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" },
];

const USER_TYPE_OPTIONS = [
  { value: "staff", label: "Staff" },
  { value: "probation", label: "Probation" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
];

const ATTENDANCE_TYPE_OPTIONS = [
  { value: "anywhere", label: "Anywhere" },
  { value: "office", label: "Office" },
];

const ABSENT_TYPE_OPTIONS = [
  { value: "timeable", label: "Timeable" },
  { value: "timeless", label: "Timeless" },
];

export default function CreateUserPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  const roleOptions = useMemo(() => {
    return (roles || []).map((r) => ({
      value: r.slug ?? r.role_id,
      label: r.title ?? r.name ?? r.slug,
    }));
  }, [roles]);

  const departmentOptions = useMemo(() => {
    return (departments || []).map((d) => ({
      value: String(d.department_id ?? d.id),
      label: d.title ?? d.name ?? String(d.department_id ?? d.id),
    }));
  }, [departments]);

  useEffect(() => {
    const load = async () => {
      try {
        const [roleRes, depRes] = await Promise.all([
          axiosInstance.get("/role"),
          axiosInstance.get("/department"),
        ]);
        setRoles(roleRes?.data?.roles || roleRes?.data?.data || []);
        setDepartments(depRes?.data?.departments || depRes?.data?.data || []);
      } catch (e) {
        console.error(e);
        // master gagal pun form masih bisa dipakai (role/department bisa dikosongin)
      }
    };
    load();
  }, []);

  const initialValues = useMemo(
    () => ({
      fullname: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",

      jobPosition: "",
      userRole: undefined,
      departmentId: undefined,

      userType: "staff",
      status: "new",

      attendanceType: "anywhere",
      absentType: "timeable",

      isTimesheet: false,
      isHod: false,

      joinDate: null, // DatePicker value
    }),
    []
  );

  const handleSubmit = async (vals) => {
    setSubmitting(true);
    try {
      const payload = {
        fullname: (vals.fullname || "").trim(),
        email: (vals.email || "").trim(),
        phone: (vals.phone || "").trim() || null,

        password: vals.password,

        jobPosition: (vals.jobPosition || "").trim() || null,
        userRole: vals.userRole || null,
        departmentId: vals.departmentId ? Number(vals.departmentId) : null,

        userType: vals.userType || "staff",
        status: vals.status || "new",

        attendanceType: vals.attendanceType || "anywhere",
        absentType: vals.absentType || "timeable",

        // model: ENUM('true','false') -> backend map aja dari boolean
        isTimesheet: !!vals.isTimesheet,
        isHod: !!vals.isHod,

        // model join_date: INTEGER unix seconds
        joinDate: vals.joinDate ? dayjs(vals.joinDate).unix() : null,
      };

      // wajib minimal (biar jelas errornya)
      if (!payload.fullname || !payload.email || !payload.password || !vals.jobPosition) {
        message.error("Please fill Fullname, Email, Position, and Password.");
        setSubmitting(false);
        return;
      }

      await axiosInstance.post("/user", payload);

      message.success("User created successfully!");
      router.push("/user");
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.msg || e?.message || "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container pt-10">
      <Card
        className="card-box mb-5"
        title={
          <button className="btn-back fc-base" onClick={() => router.back()}>
            <h3 className="text-lg"><LeftOutlined /> Create User</h3>
          </button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSubmit}
        >
          <Row gutter={[16, 8]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="fullname"
                label="Fullname"
                rules={[{ required: true, message: "Fullname is required" }]}
              >
                <Input size="large" placeholder="Fullname" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Invalid email format" },
                ]}
              >
                <Input size="large" placeholder="Email" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Phone">
                <Input size="large" placeholder="Phone (optional)" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="jobPosition"
                label="Position"
                rules={[{ required: true, message: "Position is required" }]}
              >
                <Input size="large" placeholder="Position" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Password is required" },
                  { min: 6, message: "Password minimum 6 characters" },
                ]}
              >
                <Input.Password size="large" placeholder="Password" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Confirm password is required" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const p = getFieldValue("password");
                      if (!value || value === p) return Promise.resolve();
                      return Promise.reject(new Error("Password confirmation does not match"));
                    },
                  }),
                ]}
              >
                <Input.Password size="large" placeholder="Confirm Password" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="userRole" label="Role">
                <Select
                  size="large"
                  placeholder="Select role (optional)"
                  options={roleOptions}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="departmentId" label="Department">
                <Select
                  size="large"
                  placeholder="Select department (optional)"
                  options={departmentOptions}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="joinDate" label="Join Date">
                <DatePicker size="large" className="w-full" />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                name="userType"
                label="User Type"
                rules={[{ required: true, message: "User type is required" }]}
              >
                <Select size="large" options={USER_TYPE_OPTIONS} />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Status is required" }]}
              >
                <Select size="large" options={STATUS_OPTIONS} />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item name="attendanceType" label="Attendance Type">
                <Select size="large" options={ATTENDANCE_TYPE_OPTIONS} />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item name="absentType" label="Absent Type">
                <Select size="large" options={ABSENT_TYPE_OPTIONS} />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item label="Timesheet Access" className="mb-0">
                <Form.Item name="isTimesheet" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item label="Head of Department" className="mb-0">
                <Form.Item name="isHod" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex items-center gap-2 mt-4">
            <Button type="default" onClick={() => router.push("/user")} disabled={submitting}>
              Cancel
            </Button>
            <Button htmlType="submit" type="primary" loading={submitting} disabled={submitting}>
              Create
            </Button>
          </div>
        </Form>
      </Card>
    </section>
  );
}
