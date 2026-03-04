// src/components/leave/ModalLeave.jsx
"use client";
import { Modal } from "antd";
import FormLeave from "./FormLeave";

export default function ModalLeave({ modalLeave, setModalLeave, onSubmitted }) {
    const handleSuccess = (data) => {
        // beri tahu parent (jika ada), lalu tutup modal
        try {
            onSubmitted && onSubmitted(data);
        } finally {
            setModalLeave(false);
        }
        // broadcast event opsional (kalau ada komponen lain yg mendengarkan)
        try {
            window?.dispatchEvent(new CustomEvent("leave:submitted", { detail: data }));
        } catch { }
    };

    return (
        <Modal
            open={!!modalLeave}
            onCancel={() => setModalLeave(false)}
            width={720}
            footer={null}
            destroyOnClose
            title={<h3 className="text-base">Leave Form</h3>}
        >
            <FormLeave onSuccess={handleSuccess} onCancel={() => setModalLeave(false)} />
        </Modal>
    );
}
