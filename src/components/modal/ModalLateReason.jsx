// ModalLateReason.jsx
"use client";
import { Modal, Form, Input, Button } from "antd";
import { useMemo, useState } from "react";

const { TextArea } = Input;

function charCountNoSpaces(s) {
  return String(s || "").replace(/\s/g, "").length;
}

export default function ModalLateReason({ open, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [val, setVal] = useState("");

  const count = useMemo(() => charCountNoSpaces(val), [val]);
  const MIN = 8;

  const handleOk = async () => {
    try {
      await form.validateFields();
      onSubmit?.(val);
      form.resetFields();
      setVal("");
    } catch {
      // stay open
    }
  };

  return (
    <Modal
      open={open}
      title="Alasan Keterlambatan"
      onCancel={() => { form.resetFields(); setVal(""); onCancel?.(); }}
      footer={[
        <Button key="cancel" onClick={() => { form.resetFields(); setVal(""); onCancel?.(); }}>
          Batal
        </Button>,
        <Button key="ok" type="primary" onClick={handleOk} disabled={count < MIN}>
          Kirim
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="reason"
          label="Tulis alasan (min 8 huruf, spasi tidak dihitung)"
          rules={[
            {
              validator: (_, v) =>
                charCountNoSpaces(v) >= MIN
                  ? Promise.resolve()
                  : Promise.reject(new Error("Minimal 8 huruf (spasi tidak dihitung).")),
            },
          ]}
        >
          <TextArea
            rows={5}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Contoh: macet berat, kendaraan mogok, ada keperluan darurat, dst."
          />
        </Form.Item>
        <div className="text-right text-xs text-gray-500">
          {count} / {MIN} huruf (tanpa spasi)
        </div>
      </Form>
    </Modal>
  );
}
