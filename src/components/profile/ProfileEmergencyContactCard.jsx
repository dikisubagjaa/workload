// src/components/profile/ProfileEmergencyContactCard.jsx
"use client";

import React from "react";
import { Card, Form, Input, Button, Select, Spin, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Image from "next/image";
import axiosInstance from "@/utils/axios";

const { TextArea } = Input;

// Plain text helpers (view mode)
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

export default function ProfileEmergencyContactCard({
  form,
  profileData,
  cardEmergency,
  setCardEmergency,
  loadingForm,
  setLoadingForm,
  session,
  onUpdated,
  canUpdate, // <-- ditambahkan
}) {
  const getVal = (fv, dv) =>
    fv !== undefined && fv !== null && fv !== "" ? fv : dv ?? "-";

  // Watch untuk sinkronisasi view-mode
  const emergencyFullname = Form.useWatch("emergencyFullname", form);
  const emergencyRelationship = Form.useWatch("emergencyRelationship", form);
  const emergencyContact = Form.useWatch("emergencyContact", form);
  const emergencyAddress = Form.useWatch("emergencyAddress", form);

  const handleStartEdit = () => {
    form.setFieldsValue({
      emergencyFullname: profileData?.emergency_fullname ?? "",
      emergencyRelationship: profileData?.emergency_relationship ?? undefined,
      emergencyContact: profileData?.emergency_contact ?? "",
      emergencyAddress: profileData?.emergency_address ?? "",
    });
    setCardEmergency(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setCardEmergency(false);
  };

  return (
    <Form
      form={form}
      onFinish={async (values) => {
        setLoadingForm(true);
        try {
          const payload = {};
          if (values.emergencyFullname !== undefined)
            payload.emergency_fullname = values.emergencyFullname;
          if (values.emergencyRelationship !== undefined)
            payload.emergency_relationship = values.emergencyRelationship;
          if (values.emergencyContact !== undefined)
            payload.emergency_contact = values.emergencyContact;
          if (values.emergencyAddress !== undefined)
            payload.emergency_address = values.emergencyAddress;

          const response = await axiosInstance.put(
            `/profile/${profileData.user_id}`,
            payload
          );
          if (response.status === 200 || response.status === 201) {
            message.success("Emergency Contact Updated!");
            onUpdated?.(); // refresh profile di parent agar UI langsung sync
            setCardEmergency(false);
          } else {
            message.error(
              `Failed to update Emergency Contact: Status ${response.status}`
            );
          }
        } catch (error) {
          console.error("Failed to update emergency contact:", error);
          message.error(
            `Failed to update Emergency Contact: ${error.response?.data?.msg || error.message
            }`
          );
        } finally {
          setLoadingForm(false);
        }
      }}
      layout="vertical"
    >
      <Card
        className={`card-box card-form mb-5 ${cardEmergency === false ? "disabled" : ""
          }`}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-medium fc-base">Emergency Contact</h3>

          {/* Header actions */}
          {cardEmergency ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCancel}
                className="px-4 border-gray-300"
                disabled={loadingForm}
              >
                Cancel
              </Button>
              <Button
                htmlType="submit"
                className="btn-blue px-4"
                disabled={loadingForm}
              >
                Save
                {loadingForm ? (
                  <Spin
                    indicator={<LoadingOutlined spin className="text-white" />}
                    size="small"
                  />
                ) : null}
              </Button>
            </div>
          ) : (
            canUpdate && (
              <Button
                color="default"
                variant="outlined"
                onClick={handleStartEdit}
              >
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

        <div className="w-full sm:w-2/3">
          {/* VIEW MODE: plain text */}
          {!cardEmergency ? (
            <div className="grid grid-cols-2 gap-x-4">
              <ReadonlyField
                label="Fullname"
                value={getVal(
                  emergencyFullname,
                  profileData?.emergency_fullname
                )}
              />

              <ReadonlyField
                label="Relationship"
                value={getVal(
                  emergencyRelationship,
                  profileData?.emergency_relationship
                )}
              />
              <ReadonlyField
                label="Contact"
                value={getVal(
                  emergencyContact,
                  profileData?.emergency_contact
                )}
              />
              <div className="col-span-2">
                <ReadonlyArea
                  label="Address"
                  value={getVal(
                    emergencyAddress,
                    profileData?.emergency_address
                  )}
                />
              </div>
            </div>
          ) : (
            // EDIT MODE
            <>
              <div className="grid grid-cols-2 gap-x-4">
                <Form.Item
                  name="emergencyFullname"
                  label="First Name"
                  rules={[{ required: true, message: "First Name is required" }]}
                >
                  <Input size="large" placeholder="First Name" />
                </Form.Item>

                <Form.Item
                  name="emergencyRelationship"
                  label="Relationship"
                  rules={[{ required: true, message: "Relationship is required" }]}
                >
                  <Select
                    showSearch
                    size="large"
                    options={[
                      { value: "Spouse", label: "Spouse" },
                      { value: "Parent", label: "Parent" },
                      { value: "Sibling", label: "Sibling" },
                      { value: "Relative", label: "Relative" },
                      { value: "Friend", label: "Friend" },
                    ]}
                  />
                </Form.Item>
              </div>
              
              <Form.Item
                name="emergencyContact"
                label="Contact"
                rules={[{ required: true, message: "Contact is required" }]}
              >
                <Input size="large" type="number" placeholder="Contact" />
              </Form.Item>

              <Form.Item
                name="emergencyAddress"
                label="Address"
                rules={[{ required: true, message: "Address is required" }]}
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
