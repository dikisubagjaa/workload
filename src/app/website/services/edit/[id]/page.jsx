"use client";
import { EditOutlined, LeftOutlined } from "@ant-design/icons";
import { Button, Card, message, Spin } from "antd";
import FormService from "../../FormService";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function Page() {
    const params = useParams();
    const id = params?.id;

    const [initialValues, setInitialValues] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch service data
    useEffect(() => {
        if (!id) return;
        const fetchService = async () => {
            try {
                const res = await fetch(`/api/website/service/${id}`);
                if (!res.ok) throw new Error("Failed to fetch service");
                const data = await res.json();
                setInitialValues(data);
            } catch (error) {
                message.error("Failed to load service data.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    // Handle update
    const handleSubmit = async (values) => {
        try {
            const res = await fetch(`/api/website/service/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            });

            if (!res.ok) throw new Error("Failed to update service");
            message.success("Service updated successfully.");
        } catch (error) {
            message.error("Update failed.");
            console.error(error);
        }
    };

    return (
        <section className="container py-10">
            <div className="flex justify-between">
                <h2 className="text-xl font-semibold text-gray">
                    <EditOutlined /> Edit Service
                </h2>

                <Link href="/website/services">
                    <Button variant="solid" className="btn-blue-filled font-semibold">
                        <LeftOutlined /> Back
                    </Button>
                </Link>
            </div>
            <hr className="my-5" />

            <Card className="shadow-lg">
                {!loading && initialValues ? (
                    <FormService
                        initialValues={initialValues}
                        onSubmit={handleSubmit}
                        isEdit
                    />
                ) : (
                    <div className="flex justify-center py-10">
                        <Spin size="large" />
                    </div>
                )}
            </Card>
        </section>
    );
}
