// src/app/leave/page.jsx
"use client";
import { Card, Button } from "antd";
import TableLeave from "@/components/leave/TableLeave";
import ModalLeave from "@/components/leave/ModalLeave";
import { useState, useCallback } from "react";

export default function Leave() {
    const [modalLeave, setModalLeave] = useState(false);
    const [tableKey, setTableKey] = useState(0);

    const handleSubmitted = useCallback(() => {
        setTableKey((v) => v + 1);
    }, []);

    return (
        <>
            <section className="container pt-10">
                <Card
                    className="card-box mb-5"
                    title={
                        <div className="flex items-center justify-between py-2">
                            <h3 className="text-lg">Leave History</h3>
                            <Button
                                type="primary"
                                className="btn-blue-filled"
                                onClick={() => setModalLeave(true)}
                            >
                                Leave Form
                            </Button>
                        </div>
                    }
                >
                    <TableLeave key={tableKey} />
                </Card>
            </section>

            <ModalLeave
                modalLeave={modalLeave}
                setModalLeave={setModalLeave}
                onSubmitted={handleSubmitted}
            />
        </>
    );
}
