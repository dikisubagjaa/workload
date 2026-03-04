"use client";

import React from "react";
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
import dayjs from "dayjs";
import axiosInstance from "@/utils/axios";

// Plain text field untuk view mode
const ReadonlyField = ({ label, value }) => (
  <div className="mb-4">
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="h-10 flex items-center text-black">{value ?? "-"}</div>
  </div>
);

export default function ProfileStatutoryCard({
  form,
  profileData,
  cardStatutory,
  setCardStatutory,
  loadingForm,
  setLoadingForm,
  session,
  onUpdated,
  canUpdate,
}) {
  // Watch field langsung untuk sinkronisasi view mode
  const identityNumber = Form.useWatch("identityNumber", form);
  const identityType = Form.useWatch("identityType", form);
  const npwpNumber = Form.useWatch("npwpNumber", form);
  const taxStartDate = Form.useWatch("taxStartDate", form);

  const bankCode = Form.useWatch("bankCode", form);
  const bankAccountNumber = Form.useWatch("bankAccountNumber", form);
  const beneficiaryName = Form.useWatch("beneficiaryName", form);

  const bpjsTkRegDate = Form.useWatch("bpjsTkRegDate", form);
  const bpjsTkTermDate = Form.useWatch("bpjsTkTermDate", form);
  const bpjsTkNumber = Form.useWatch("bpjsTkNumber", form);
  const pensionNumber = Form.useWatch("pensionNumber", form);

  const bpjsKesRegDate = Form.useWatch("bpjsKesRegDate", form);
  const bpjsKesTermDate = Form.useWatch("bpjsKesTermDate", form);
  const bpjsKesNumber = Form.useWatch("bpjsKesNumber", form);

  // helper nilai tampilan: prioritaskan value di form; fallback ke profileData
  const getVal = (fv, dv) =>
    fv !== undefined && fv !== null && fv !== "" ? fv : dv ?? "-";
  const fmtDateVal = (fv, dv) => {
    const d = fv ? dayjs(fv) : dv ? dayjs(dv) : null;
    return d ? d.format("YYYY-MM-DD") : "-";
  };

  const handleStartEdit = () => {
    const toDayjs = (v) => (v ? dayjs(v) : null);

    form.setFieldsValue({
      identityNumber: profileData?.identity_number ?? "",
      identityType: profileData?.identity_type ?? undefined,
      npwpNumber: profileData?.npwp_number ?? "",
      taxStartDate: toDayjs(profileData?.tax_start_date),

      bankCode: profileData?.bank_code ?? "",
      bankAccountNumber: profileData?.bank_account_number ?? "",
      beneficiaryName: profileData?.beneficiary_name ?? "",

      bpjsTkRegDate: toDayjs(profileData?.bpjs_tk_reg_date),
      bpjsTkTermDate: toDayjs(profileData?.bpjs_tk_term_date),
      bpjsTkNumber: profileData?.bpjs_tk_number ?? "",
      pensionNumber: profileData?.pension_number ?? "",

      bpjsKesRegDate: toDayjs(profileData?.bpjs_kes_reg_date),
      bpjsKesTermDate: toDayjs(profileData?.bpjs_kes_term_date),
      bpjsKesNumber: profileData?.bpjs_kes_number ?? "",
    });
    setCardStatutory(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setCardStatutory(false);
  };

  return (
    <Form
      form={form}
      onFinish={async (values) => {
        setLoadingForm(true);
        try {
          const payload = {};
          if (values.identityNumber !== undefined)
            payload.identity_number = values.identityNumber;
          if (values.identityType !== undefined)
            payload.identity_type = values.identityType;
          if (values.npwpNumber !== undefined)
            payload.npwp_number = values.npwpNumber;

          if (values.taxStartDate !== undefined) {
            payload.tax_start_date = values.taxStartDate
              ? dayjs(values.taxStartDate).format("YYYY-MM-DD")
              : null;
          } else if (values.taxStartDate === null) payload.tax_start_date = null;

          if (values.bankCode !== undefined) payload.bank_code = values.bankCode;
          if (values.bankAccountNumber !== undefined)
            payload.bank_account_number = values.bankAccountNumber;
          if (values.beneficiaryName !== undefined)
            payload.beneficiary_name = values.beneficiaryName;

          if (values.bpjsTkRegDate !== undefined) {
            payload.bpjs_tk_reg_date = values.bpjsTkRegDate
              ? dayjs(values.bpjsTkRegDate).format("YYYY-MM-DD")
              : null;
          } else if (values.bpjsTkRegDate === null)
            payload.bpjs_tk_reg_date = null;

          if (values.bpjsTkTermDate !== undefined) {
            payload.bpjs_tk_term_date = values.bpjsTkTermDate
              ? dayjs(values.bpjsTkTermDate).format("YYYY-MM-DD")
              : null;
          } else if (values.bpjsTkTermDate === null)
            payload.bpjs_tk_term_date = null;

          if (values.bpjsTkNumber !== undefined)
            payload.bpjs_tk_number = values.bpjsTkNumber;
          if (values.pensionNumber !== undefined)
            payload.pension_number = values.pensionNumber;

          if (values.bpjsKesRegDate !== undefined) {
            payload.bpjs_kes_reg_date = values.bpjsKesRegDate
              ? dayjs(values.bpjsKesRegDate).format("YYYY-MM-DD")
              : null;
          } else if (values.bpjsKesRegDate === null)
            payload.bpjs_kes_reg_date = null;

          if (values.bpjsKesTermDate !== undefined) {
            payload.bpjs_kes_term_date = values.bpjsKesTermDate
              ? dayjs(values.bpjsKesTermDate).format("YYYY-MM-DD")
              : null;
          } else if (values.bpjsKesTermDate === null)
            payload.bpjs_kes_term_date = null;

          if (values.bpjsKesNumber !== undefined)
            payload.bpjs_kes_number = values.bpjsKesNumber;

          const response = await axiosInstance.put(
            `/profile/${profileData.user_id}`,
            payload
          );
          if (response.status === 200 || response.status === 201) {
            message.success("Statutory Information Updated!");
            onUpdated?.();
            setCardStatutory(false);
          } else {
            message.error(
              `Failed to update Statutory Information: Status ${response.status}`
            );
          }
        } catch (error) {
          console.error("Failed to update Statutory info:", error);
          message.error(
            `Failed to update Statutory Information: ${error.response?.data?.msg || error.message
            }`
          );
        } finally {
          setLoadingForm(false);
        }
      }}
      layout="vertical"
    >
      <Card
        className={`card-box card-form mb-5 ${cardStatutory === false ? "disabled" : ""
          }`}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-medium fc-base">Statutory</h3>

          {/* Header actions */}
          {cardStatutory ? (
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
                htmlType="button"
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

        <div className="w-full lg:w-2/3">
          {/* VIEW MODE: plain text */}
          {!cardStatutory ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <ReadonlyField
                label="Identity Number"
                value={getVal(identityNumber, profileData?.identity_number)}
              />

              <ReadonlyField
                label="NPWP Number (16 Digits)"
                value={getVal(npwpNumber, profileData?.npwp_number)}
              />
              <ReadonlyField
                label="Tax Start Date"
                value={fmtDateVal(taxStartDate, profileData?.tax_start_date)}
              />


              <ReadonlyField
                label="Bank Account Number - BCA"
                value={getVal(
                  bankAccountNumber,
                  profileData?.bank_account_number
                )}
              />
              <ReadonlyField
                label="Beneficiary Name"
                value={getVal(beneficiaryName, profileData?.beneficiary_name)}
              />


              <ReadonlyField
                label="BPJS TK Registration Date"
                value={fmtDateVal(
                  bpjsTkRegDate,
                  profileData?.bpjs_tk_reg_date
                )}
              />
              <ReadonlyField
                label="BPJS TK Termination Date"
                value={fmtDateVal(
                  bpjsTkTermDate,
                  profileData?.bpjs_tk_term_date
                )}
              />
              <ReadonlyField
                label="BPJS TK Number"
                value={getVal(bpjsTkNumber, profileData?.bpjs_tk_number)}
              />
              <ReadonlyField
                label="Pension Number"
                value={getVal(pensionNumber, profileData?.pension_number)}
              />

              <ReadonlyField
                label="BPJS KS Registration Date"
                value={fmtDateVal(
                  bpjsKesRegDate,
                  profileData?.bpjs_kes_reg_date
                )}
              />
              <ReadonlyField
                label="BPJS KS Termination Date"
                value={fmtDateVal(
                  bpjsKesTermDate,
                  profileData?.bpjs_kes_term_date
                )}
              />
              <ReadonlyField
                label="BPJS KS Number"
                value={getVal(bpjsKesNumber, profileData?.bpjs_kes_number)}
              />
            </div>
          ) : (
            // EDIT MODE
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item
                name="identityNumber"
                label="Identity Number"
                rules={[{ required: true }]}
              >
                <Input type="number" size="large" placeholder="Identity Number" />
              </Form.Item>



              <Form.Item
                name="npwpNumber"
                label="NPWP Number (16 Digits)"
                rules={[{ required: false }]}
              >
                <Input size="large" type="number" placeholder="NPWP Number (16 Digits)" />
              </Form.Item>

              <Form.Item
                name="taxStartDate"
                label="Tax Start Date"
                rules={[{ required: false }]}
              >
                <DatePicker size="large" className="w-full" format="YYYY-MM-DD" />
              </Form.Item>



              <Form.Item
                name="bankAccountNumber"
                label="Bank Account Number - BCA"
                rules={[{ required: true }]}
              >
                <Input type="number" size="large" placeholder="Bank Account Number" />
              </Form.Item>

              <Form.Item
                name="beneficiaryName"
                label="Beneficiary Name - BCA"
                rules={[{ required: true }]}
              >
                <Input size="large" placeholder="Beneficiary Name" />
              </Form.Item>



              <Form.Item
                name="bpjsTkRegDate"
                label="BPJS TK Registration Date"
                rules={[{ required: false }]}
              >
                <DatePicker size="large" className="w-full" format="YYYY-MM-DD" />
              </Form.Item>

              <Form.Item name="bpjsTkTermDate" label="BPJS TK Termination Date">
                <DatePicker size="large" className="w-full" format="YYYY-MM-DD" />
              </Form.Item>

              <Form.Item
                name="bpjsTkNumber"
                label="BPJS TK Number"
                rules={[{ required: false }]}
              >
                <Input type="number" size="large" placeholder="BPJS TK Number" />
              </Form.Item>

              <Form.Item
                name="pensionNumber"
                label="Pension Number"
                rules={[{ required: false }]}
              >
                <Input type="number" size="large" placeholder="Pension Number" />
              </Form.Item>

              <Form.Item
                name="bpjsKesRegDate"
                label="BPJS KS Registration Date"
                rules={[{ required: false }]}
              >
                <DatePicker size="large" className="w-full" format="YYYY-MM-DD" />
              </Form.Item>

              <Form.Item name="bpjsKesTermDate" label="BPJS KS Termination Date">
                <DatePicker size="large" className="w-full" format="YYYY-MM-DD" />
              </Form.Item>

              <Form.Item
                name="bpjsKesNumber"
                label="BPJS KS Number"
                rules={[{ required: false }]}
              >
                <Input type="number" size="large" placeholder="BPJS KS Number" />
              </Form.Item>
            </div>
          )}
        </div>
      </Card>
    </Form>
  );
}
