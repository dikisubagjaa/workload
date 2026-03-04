"use client";

import { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Spin,
  message,
  DatePicker,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Image from "next/image";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";

const { TextArea } = Input;

const calcAge = (d) => (d ? dayjs().diff(d, "year") : null);
const maritalLabel = (val) => {
  const map = {
    single: "Single",
    married: "Married",
    widowed: "Widowed",
    divorced: "Divorced",
  };
  return map?.[val] ?? val ?? "-";
};

// Komponen view-mode: benar2 plain text (tanpa border)
const ReadonlyField = ({ label, value }) => (
  <div className="mb-4">
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="h-10 flex items-center text-black">{value ?? "-"}</div>
  </div>
);

const ReadonlyArea = ({ label, value }) => (
  <div className="mb-4">
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="text-black whitespace-pre-line">{value ?? "-"}</div>
  </div>
);

export default function ProfilePersonalInfoCard({
  form,
  profileData,
  cardPersonal,
  setCardPersonal,
  loadingForm,
  setLoadingForm,
  onUpdated,
  canUpdate,
}) {
  // Watch nilai form; kalau belum ada, fallback ke profileData
  const fullName = Form.useWatch("fullname", form); // <-- disamakan dgn field name
  const birthdateForm = Form.useWatch("birthdate", form);
  const ageField = Form.useWatch("age", form);
  const maritalStatusForm = Form.useWatch("maritalStatus", form);
  const nationalityForm = Form.useWatch("nationality", form);
  const addressForm = Form.useWatch("address", form);
  const addressBaseOnIdForm = Form.useWatch("addressBaseOnId", form);

  const [countryCodes, setCountryCodes] = useState([]);
  const [loadingCC, setLoadingCC] = useState(false);

  const bdObj =
    birthdateForm
      ? dayjs(birthdateForm)
      : profileData?.birthdate
        ? dayjs(profileData.birthdate)
        : null;

  const birthdateText = bdObj ? bdObj.format("YYYY-MM-DD") : "-";
  const ageText = ageField != null ? ageField : bdObj ? calcAge(bdObj) : "-";

  const getVal = (formVal, dataVal) =>
    formVal !== undefined && formVal !== null && formVal !== ""
      ? formVal
      : dataVal ?? "-";

  const handleStartEdit = () => {
    // Prefill form saat mulai edit
    const preBd = profileData?.birthdate ? dayjs(profileData.birthdate) : null;
    form.setFieldsValue({
      fullname: profileData?.fullname ?? "",
      birthdate: preBd,
      age: preBd ? calcAge(preBd) : null,
      maritalStatus: profileData?.marital_status ?? undefined,
      nationality: profileData?.nationality ?? undefined,
      address: profileData?.address ?? "",
      addressBaseOnId: profileData?.address_on_identity ?? "",
    });
    setCardPersonal(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setCardPersonal(false);
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

  return (
    <Form
      form={form}
      onFinish={async (values) => {
        setLoadingForm(true);
        try {
          const payload = {};
          if (values.fullname !== undefined) payload.fullname = values.fullname;
          if (values.birthdate !== undefined)
            payload.birthdate = values.birthdate
              ? dayjs(values.birthdate).format("YYYY-MM-DD")
              : null;
          // age tidak dikirim
          if (values.maritalStatus !== undefined)
            payload.marital_status = values.maritalStatus;
          if (values.nationality !== undefined)
            payload.nationality = values.nationality;
          if (values.address !== undefined) payload.address = values.address;
          if (values.addressBaseOnId !== undefined)
            payload.address_on_identity = values.addressBaseOnId;

          const response = await axiosInstance.put(
            `/profile/${profileData.user_id}`,
            payload
          );
          if (response.status === 200 || response.status === 201) {
            message.success("Personal Information Updated!");
            // Tutup mode edit dulu, supaya parent bisa repopulate setelah re-fetch
            setCardPersonal(false);
            await onUpdated?.(); // re-fetch di parent
          } else {
            message.error(
              `Failed to update Personal Information: Status ${response.status}`
            );
          }
        } catch (error) {
          console.error("Failed to update personal info:", error);
          message.error(
            `Failed to update Personal Information: ${error.response?.data?.msg || error.message
            }`
          );
        } finally {
          setLoadingForm(false);
        }
      }}
      layout="vertical"
    >
      <Card className={`card-box card-form mb-5 ${cardPersonal === false ? "disabled" : ""}`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-medium fc-base">Personal Information</h3>

          {cardPersonal ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCancel}
                className="px-4 border-gray-300"
                disabled={loadingForm}
              >
                Cancel
              </Button>
              <Button htmlType="submit" className="btn-blue px-4" disabled={loadingForm}>
                Save
                {loadingForm ? (
                  <Spin indicator={<LoadingOutlined spin className="text-white" />} size="small" />
                ) : null}
              </Button>
            </div>
          ) : (
            canUpdate && (
              <Button color="default" variant="outlined" onClick={handleStartEdit}>
                <Image
                  src={"/static/images/icon/pencil.png"}
                  width={50}
                  height={50}
                  alt=""
                  className="w-4"
                />
                Edit
              </Button>
            )
          )}
        </div>

        {/* CONTENT */}
        <div className="w-full lg:w-2/3">
          {/* VIEW MODE: plain text, no border */}
          {!cardPersonal ? (
            <div className="grid grid-cols-2 gap-x-4">
              <ReadonlyField
                label="Fullname"
                value={getVal(fullName, profileData?.fullname)}
              />
              <ReadonlyField label="Birthdate" value={birthdateText} />
              <ReadonlyField label="Age" value={ageText} />
              <ReadonlyField
                label="Marital Status"
                value={maritalLabel(getVal(maritalStatusForm, profileData?.marital_status))}
              />
              <ReadonlyField
                label="Nationality"
                value={getVal(nationalityForm, profileData?.nationality)}
              />
              <div className="col-span-2">
                <ReadonlyArea
                  label="Address"
                  value={getVal(addressForm, profileData?.address)}
                />
              </div>
              <div className="col-span-2">
                <ReadonlyArea
                  label="Address (based on ID)"
                  value={getVal(addressBaseOnIdForm, profileData?.address_on_identity)}
                />
              </div>
            </div>
          ) : (
            // EDIT MODE
            <>
              <div className="grid grid-cols-2 gap-x-4">
                <Form.Item
                  name="fullname"
                  label="Fullname"
                  rules={[{ required: true, message: "Fullname is required" }]}
                  className="col-span-2 sm:col-span-1"
                >
                  <Input size="large" placeholder="Fullname" />
                </Form.Item>

                <Form.Item
                  name="birthdate"
                  label="Birthdate"
                  className="col-span-2 sm:col-span-1"
                >
                  <DatePicker
                    className="w-full"
                    format="YYYY-MM-DD"
                    size="large"
                    onChange={(d) => form?.setFieldsValue?.({ age: calcAge(d) })}
                  />
                </Form.Item>

                <Form.Item name="age" label="Age">
                  <Input size="large" type="number" placeholder="Age" disabled />
                </Form.Item>

                <Form.Item
                  name="maritalStatus"
                  label="Marital Status"
                  rules={[{ required: true, message: "Marital Status is required" }]}
                >
                  <Select
                    showSearch
                    size="large"
                    options={[
                      { value: "single", label: "Single" },
                      { value: "married", label: "Married" },
                      { value: "widowed", label: "Widowed" },
                      { value: "divorced", label: "Divorced" },
                    ]}
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="nationality"
                label="Nationality"
                rules={[{ required: true, message: "Nationality is required" }]}
              >
                <Select
                  showSearch
                  size="large"
                  onDropdownVisibleChange={(open) => open && getCountryCode()} // fetch saat dibuka
                  loading={loadingCC}
                  options={(countryCodes || []).map((item) => ({
                    label: item.title,
                    value: item.title,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: "Address is required" }]}
              >
                <TextArea autoSize={{ minRows: 3, maxRows: 5 }} />
              </Form.Item>

              <Form.Item
                name="addressBaseOnId"
                label="Address (based on ID)"
                rules={[{ required: true, message: "Address (based on ID) is required" }]}
              >
                <TextArea autoSize={{ minRows: 3, maxRows: 5 }} />
              </Form.Item>
            </>
          )}
        </div>
      </Card>
    </Form>
  );
}
