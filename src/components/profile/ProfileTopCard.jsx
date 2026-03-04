// src/components/profile/ProfileTopCard.jsx
"use client";

import React from "react";
import Image from "next/image";
import axiosInstance from "@/utils/axios";
import { getAvatar } from "@/utils/avatarHelpers";
import { getStorageUrl, getProfileImageUrl } from "@/utils/storageHelpers";
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Spin,
  Upload,
  message
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import AvatarImg from "../common/AvatarImg";

const { TextArea } = Input;

const validateImage = (file) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const isOkType = allowed.includes(file.type);
  if (!isOkType) {
    message.error("Only JPG/PNG/WebP/AVIF files are allowed.");
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
    return false;
  }
  return true;
};

const ReadonlyField = ({ label, value }) => (
  <li className="min-w-[220px]">
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="h-10 flex items-center text-black">{value ?? "-"}</div>
  </li>
);

export default function ProfileTopCard({
  form,
  profileData,
  cardTop,
  setCardTop,
  loadingForm,
  setLoadingForm,
  handleUpload,
  loadingAvatarUpload,
  onUpdated,
  canUpdate,
}) {
  const handleStartEdit = () => {
    form.setFieldsValue({
      jobPosition: profileData?.job_position ?? "",
      email: profileData?.email ?? "",
      phone: profileData?.phone ?? "",
    });
    setCardTop(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setCardTop(false);
  };

  return (
    <Form
      form={form}
      onFinish={async (values) => {
        setLoadingForm(true);
        try {
          const payload = {};
          if (values.jobPosition !== undefined) payload.job_position = values.jobPosition;
          if (values.email !== undefined) payload.email = values.email;
          if (values.phone !== undefined) payload.phone = values.phone;

          const response = await axiosInstance.put(`/profile/${profileData.user_id}`, payload);
          if (response.status === 200 || response.status === 201) {
            message.success("General Information Updated!");
            onUpdated?.();
            setCardTop(false);
          } else {
            message.error(`Failed to update General Information: Status ${response.status}`);
          }
        } catch (error) {
          console.error("Failed to update general info:", error);
          message.error(`Failed to update General Information: ${error.response?.data?.msg || error.message}`);
        } finally {
          setLoadingForm(false);
        }
      }}
      layout="vertical"
    >
      <Card className={`card-box card-form mb-5 ${cardTop === false ? "disabled" : ""}`}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="flex">
            <div className="relative">
              <Upload
                name="avatar"
                listType="picture-circle"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={(file) => {
                  if (!validateImage(file)) return false;
                  handleUpload({ file: { originFileObj: file } });
                  return false;
                }}
                disabled={loadingAvatarUpload || !canUpdate}
                accept="image/jpeg,image/png,image/webp,image/avif"
                maxCount={1}
              >
                {(loadingForm || loadingAvatarUpload) ? (
                  <LoadingOutlined />
                ) : (
                  <>
                    <AvatarImg
                      src={profileData.profile_pic}
                      name={profileData.fullname}
                      size={100}
                      alt={profileData.fullname || "avatar"}
                    />
                    {canUpdate && (
                      <Image
                        src={"/static/images/icon/photos.png"}
                        width={50}
                        height={50}
                        alt=""
                        className="w-8 absolute bottom-0 right-0"
                      />
                    )}
                  </>
                )}
              </Upload>
            </div>

            {/* tombol Edit (mobile) */}
            <div className="ms-auto block lg:hidden">
              {canUpdate && (
                <Button
                  color="default"
                  variant="outlined"
                  onClick={handleStartEdit}
                  className={`${cardTop === true && "hidden"}`}
                >
                  <Image src={"/static/images/icon/pencil.png"} width={50} height={50} alt="" className="w-4" />
                  Edit
                </Button>
              )}

              <div className={`${cardTop === false && "hidden"} flex items-center gap-2`}>
                <Button
                  onClick={handleCancel}
                  disabled={loadingForm}
                  color="default"
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button htmlType="submit" className="btn-blue px-4">
                  Save
                  {loadingForm ? (
                    <Spin indicator={<LoadingOutlined spin className="text-white" />} size="small" />
                  ) : null}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-medium mb-2">{profileData?.fullname ?? "-"}</h3>

            {!cardTop ? (
              <ul className="flex flex-col lg:flex-row lg:gap-6 fc-base text-sm">
                <ReadonlyField label="Position" value={profileData?.job_position ?? "-"} />
                <ReadonlyField label="Email" value={profileData?.email ?? "-"} />
                <ReadonlyField label="Phone" value={profileData?.phone ?? "-"} />
              </ul>
            ) : (
              <ul className="flex flex-col lg:flex-row lg:gap-6 fc-base text-sm">
                <li>
                  <Form.Item name="jobPosition" label="Position" rules={[{ required: true }]}>
                    <Input placeholder="Position" size="large" className="lg:w-auto" />
                  </Form.Item>
                </li>
                <li>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Email harus diisi" },
                      {
                        pattern: /^[a-zA-Z0-9._%+-]+@vp-digital\.com$/,
                        message: "Email harus menggunakan domain @vp-digital.com",
                      },
                    ]}
                  >
                    <Input placeholder="Email" size="large" className="lg:w-auto" />
                  </Form.Item>
                </li>
                <li>
                  <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                    <Input type="number" size="large" placeholder="Phone" className="lg:w-auto" />
                  </Form.Item>
                </li>
              </ul>
            )}
          </div>

          {/* tombol Edit / Aksi (desktop) */}
          <div className="ms-auto hidden lg:block">
            {canUpdate && (
              <Button
                color="default"
                variant="outlined"
                onClick={handleStartEdit}
                className={`${cardTop === true && "hidden"}`}
              >
                <Image src={"/static/images/icon/pencil.png"} width={50} height={50} alt="" className="w-4" />
                Edit
              </Button>
            )}
            <div className={`${cardTop === false && "hidden"} flex items-center gap-2`}>
              <Button
                onClick={handleCancel}
                disabled={loadingForm}
                color="default"
                variant="outlined"
              >
                Cancel
              </Button>
              <Button htmlType="submit" className="btn-blue px-4">
                Save
                {loadingForm ? (
                  <Spin indicator={<LoadingOutlined spin className="text-white" />} size="small" />
                ) : null}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Form>
  );
}
