"use client";

import Image from "next/image";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  message,
  Spin,
  DatePicker,
} from "antd";
import { useRef, useState } from "react";
import { CheckOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";

import dayjs from "dayjs";
import axiosInstance from "@/utils/axios";
import { fetchUsers as fetchUsersList } from "@/utils/userHelpers";
import { asset } from "@/utils/url";

const { TextArea } = Input;

export default function ModalPitching({ modalPitching, onCancel }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const inputRef = useRef(null);

  const [projectType, setProjectType] = useState([]);
  const [brand, setBrand] = useState([]);
  const [users, setUsers] = useState([]);
  const [countryCodes, setCountryCodes] = useState([]);

  const [addProjectType, setAddProjectType] = useState("");
  const [addBrand, setAddBrand] = useState("");

  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingBrand, setLoadingBrand] = useState(false);
  const [loadingPT, setLoadingPT] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCC, setLoadingCC] = useState(false);

  const [isClientDisabled, setClientDisabled] = useState(false);

  // ===== Helpers: fetch saat dropdown dibuka =====
  const getBrand = async () => {
    try {
      setLoadingBrand(true);
      const res = await axiosInstance.get("/brand");
      if (res.status === 200 || res.status === 201) {
        setBrand(Array.isArray(res.data?.brand) ? res.data.brand : []);
      }
    } catch (err) {
      console.error("GET /brand:", err?.response?.data || err?.message);
    } finally {
      setLoadingBrand(false);
    }
  };

  const getCountryCode = async () => {
    try {
      setLoadingCC(true);
      const res = await axiosInstance.get("/countrycode");
      if (res.status === 200 || res.status === 201) {
        setCountryCodes(Array.isArray(res.data?.countryCode) ? res.data.countryCode : []);
      }
    } catch (err) {
      console.error("GET /countrycode:", err?.response?.data || err?.message);
    } finally {
      setLoadingCC(false);
    }
  };

  const getUsers = async () => {
    try {
      setLoadingUsers(true);
      const list = await fetchUsersList({ limit: 200 });
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("GET /user:", err?.response?.data || err?.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const getProjectType = async () => {
    try {
      setLoadingPT(true);
      const res = await axiosInstance.get("/project-type");
      if (res.status === 200 || res.status === 201) {
        setProjectType(Array.isArray(res.data?.projectType) ? res.data.projectType : []);
      }
    } catch (err) {
      console.error("GET /project-type:", err?.response?.data || err?.message);
    } finally {
      setLoadingPT(false);
    }
  };

  // add Brand inline
  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!addBrand.trim()) {
      message.error("Nama brand tidak boleh kosong");
      return;
    }
    try {
      const res = await axiosInstance.post("/brand", { title: addBrand.trim() });
      if (res.status === 200 || res.status === 201) {
        const newBrand = res.data?.brand;
        if (newBrand) setBrand((prev) => [...prev, newBrand]);
        setAddBrand("");
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    } catch (err) {
      console.error("POST /brand:", err?.response?.data || err?.message);
    }
  };

  // add Project Type inline
  const handleAddProjectType = async (e) => {
    e.preventDefault();
    if (!addProjectType.trim()) {
      message.error("Nama Project Type tidak boleh kosong");
      return;
    }
    try {
      const res = await axiosInstance.post("/project-type", { title: addProjectType.trim() });
      if (res.status === 200 || res.status === 201) {
        const newPT = res.data?.projectType;
        if (newPT) setProjectType((prev) => [...prev, newPT]);
        setAddProjectType("");
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    } catch (err) {
      console.error("POST /project-type:", err?.response?.data || err?.message);
    }
  };

  // ===== Submit =====
  const formPitching = async (values) => {
    try {
      setLoadingForm(true);
      let finalClientId = values.client_id;

      if (!finalClientId) {
        const picPhoneCombined = values.pic ? `${values.pic.phoneCode}${values.pic.phone}` : null;
        const financePhoneCombined =
          values.finance && values.finance.phone ? `${values.finance.phoneCode}${values.finance.phone}` : null;

        const clientPayload = {
          client_name: values.client_name,
          type: values.type,
          brand: values.brand,
          address: values.address,
          pic_name: values.pic_name,
          pic_email: values.pic_email,
          pic_phone: picPhoneCombined,
          division: values.division,
          finance_name: values.finance_name,
          finance_email: values.finance_email,
          finance_phone: financePhoneCombined,
        };
        const clientRes = await axiosInstance.post("/client", clientPayload);
        finalClientId = clientRes.data.client.client_id;
      }

      const payload = {
        title: values.title?.trim(),
        client_id: finalClientId,
        project_type: Array.isArray(values.projectType) ? values.projectType : [],
        start_date: values.start_date?.format("YYYY-MM-DD"),
        due_date: values.dueDate ? dayjs(values.dueDate).format("YYYY-MM-DD") : null,
        teams: Array.isArray(values.teams) ? values.teams : [],
      };

      const res = await axiosInstance.post("/pitching", payload);

      if (res.status === 200 || res.status === 201) {
        messageApi.open({
          content: "Pitching has successfully added",
          className: "custom-message",
          icon: <CheckOutlined />,
          duration: 3,
        });
        form.resetFields();
        onCancel?.();
      } else {
        message.error(`Gagal (status ${res.status})`);
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.msg ||
        error?.message ||
        "Gagal menambahkan pitching";
      message.error(errMsg);
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal open={modalPitching} onCancel={onCancel} width={600} footer={null} destroyOnClose>
        <Form form={form} onFinish={formPitching} layout="vertical">
          {/* Header */}
          <div className="flex items-center gap-3 border-b pb-3 fc-base mb-6">
            <Image src={asset("static/images/icon/app_registration.png")} alt="" width={24} height={24} />
            <Form.Item
              name="title"
              className="mb-0"
              rules={[{ required: true, message: "Judul wajib diisi" }]}
            >
              <Input placeholder="Add New Pitching.." className="text-lg" variant="borderless" size="large" />
            </Form.Item>
          </div>

          <h3 className="text-base fc-blue mb-3">Client Information</h3>

          <div className="flex gap-3">
            <div className="w-32">
              <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                <Select
                  placeholder="Type"
                  disabled={isClientDisabled}
                  size="large"
                  options={[
                    { value: "PT", label: "PT" },
                    { value: "CV", label: "CV" },
                    { value: "UNOFFICIAL", label: "UNOFFICIAL" },
                  ]}
                />
              </Form.Item>
            </div>
            <div className="flex-1">
              <Form.Item name="client_name" label="Name" rules={[{ required: true }]}>
                <Input size="large" placeholder="Client Name" disabled={isClientDisabled} />
              </Form.Item>
            </div>
          </div>

          <Form.Item name="brand" label="Brand" rules={[{ required: true }]}>
            <Select
              size="large"
              mode="multiple"
              disabled={isClientDisabled}
              placeholder="Select brand"
              loading={loadingBrand}
              onDropdownVisibleChange={(open) => open && getBrand()}  // <-- fetch saat dibuka
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div className="flex gap-3 p-3 border-t">
                    <Input
                      placeholder="Add new brand"
                      ref={inputRef}
                      value={addBrand}
                      onChange={(e) => setAddBrand(e.target.value)}  // <-- diperbaiki
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    <Button className="btn-blue" icon={<PlusOutlined />} onClick={handleAddBrand}>
                      Add Brand
                    </Button>
                  </div>
                </>
              )}
              options={(brand || []).map((item) => ({
                label: item.title,
                value: item.brand_id,
              }))}
            />
          </Form.Item>

          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <TextArea
              placeholder="Write client address..."
              disabled={isClientDisabled}
              size="large"
              autoSize={{ minRows: 2 }}
            />
          </Form.Item>

          <h3 className="text-base fc-blue mb-3">Contact Details</h3>

          <Form.Item name="pic_name" label="PIC Name" rules={[{ required: true }]}>
            <Input size="large" placeholder="PIC Name" disabled={isClientDisabled} />
          </Form.Item>

          <Form.Item label="PIC Phone" required>
            <div className="flex gap-3">
              <div className="w-24">
                <Form.Item
                  name={["pic", "phoneCode"]}
                  noStyle
                  initialValue="+62"
                  rules={[{ required: true, message: " " }]}
                >
                  <Select
                    size="large"
                    disabled={isClientDisabled}
                    loading={loadingCC}
                    onDropdownVisibleChange={(open) => open && getCountryCode()}  // <-- fetch saat dibuka
                    options={(countryCodes || []).map((item) => ({
                      label: item.code,
                      value: item.code,
                    }))}
                  />
                </Form.Item>
              </div>
              <Form.Item
                name={["pic", "phone"]}
                noStyle
                rules={[{ required: true, message: "Phone number is required" }]}
              >
                <Input type="number" size="large" placeholder="8123456789" disabled={isClientDisabled} />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item
            name="pic_email"
            label="PIC Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input size="large" type="email" placeholder="pic@example.com" disabled={isClientDisabled} />
          </Form.Item>

          <Form.Item name="division" label="Division" rules={[{ required: true }]}>
            <Input size="large" type="text" placeholder="Division" disabled={isClientDisabled} />
          </Form.Item>

          <Form.Item name="finance_name" label="Finance Name">
            <Input size="large" placeholder="Finance Name" disabled={isClientDisabled} />
          </Form.Item>

          <Form.Item label="Finance Phone">
            <div className="flex gap-3">
              <div className="w-24">
                <Form.Item name={["finance", "phoneCode"]} noStyle initialValue="+62">
                  <Select
                    size="large"
                    className="w-24"
                    disabled={isClientDisabled}
                    loading={loadingCC}
                    onDropdownVisibleChange={(open) => open && getCountryCode()}  // <-- fetch saat dibuka
                    options={(countryCodes || []).map((item) => ({
                      label: item.code,
                      value: item.code,
                    }))}
                  />
                </Form.Item>
              </div>
              <Form.Item name={["finance", "phone"]} noStyle>
                <Input
                  type="number"
                  className="w-[calc(100%-96px)]"
                  placeholder="8123456789"
                  disabled={isClientDisabled}
                />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item
            name="finance_email"
            label="Finance Email"
            rules={[{ type: "email" }]}
          >
            <Input size="large" type="email" placeholder="finance@example.com" disabled={isClientDisabled} />
          </Form.Item>

          <h3 className="text-base fc-blue mb-3">Project Details</h3>

          <Form.Item
            name="projectType"
            label="Project Type"
            rules={[{ required: true, message: "Project type wajib dipilih" }]}
          >
            <Select
              showSearch
              mode="multiple"
              size="large"
              placeholder="Project Type"
              loading={loadingPT}
              onDropdownVisibleChange={(open) => open && getProjectType()}  // <-- fetch saat dibuka
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div className="flex gap-3 p-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Please enter item"
                        ref={inputRef}
                        value={addProjectType}
                        onChange={(e) => setAddProjectType(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="flex-none">
                      <Button className="btn-blue" icon={<PlusOutlined />} onClick={handleAddProjectType}>
                        Add Project Type
                      </Button>
                    </div>
                  </div>
                </>
              )}
              options={projectType.map((item) => ({
                label: item.title,
                value: item.pt_id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Project Due Date"
            rules={[{ required: true, message: "Due date wajib diisi" }]}
          >
            <DatePicker className="w-full" size="large" placeholder="Set Due Date" />
          </Form.Item>

          <h3 className="text-base fc-blue mb-3">Team Involved</h3>

          <Form.Item
            name="teams"
            rules={[{ required: true, message: "Minimal 1 anggota tim" }]}
          >
            <Select
              showSearch
              placeholder="Add Team Member"
              mode="multiple"
              size="large"
              loading={loadingUsers}
              onDropdownVisibleChange={(open) => open && getUsers()}  // <-- fetch saat dibuka
              options={users.map((u) => ({
                label: `${u.fullname || ""}`.trim(),
                value: u.user_id,
              }))}
            />
          </Form.Item>

          <Form.Item className="mt-10">
            <div className="flex justify-end gap-3">
              <Button size="large" color="danger" variant="filled" className="px-5" onClick={onCancel}>
                Cancel
              </Button>

              <Button size="large" htmlType="submit" className="btn-blue px-5">
                Submit
                {loadingForm ? (
                  <Spin indicator={<LoadingOutlined spin className="text-white" />} size="small" />
                ) : null}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
