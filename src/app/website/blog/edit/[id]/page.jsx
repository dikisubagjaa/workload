"use client";
import { EditOutlined, LeftOutlined } from "@ant-design/icons";
import { Button, Card, message, Spin } from "antd";
import FormBLog from "../../FormBLog";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function Page() {
    const params = useParams();
    const id = params?.id;

    const [initialValues, setInitialValues] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch blog data
    useEffect(() => {
        if (!id) return;
        const fetchBlog = async () => {
            try {
                const res = await fetch(`/api/website/blog/${id}`);
                if (!res.ok) throw new Error("Failed to fetch blog");
                const data = await res.json();
                setInitialValues(data);
            } catch (error) {
                message.error("Failed to load blog data.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    // Handle update
    const handleSubmit = async (values) => {
        try {
            const res = await fetch(`/api/website/blog/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            });

            if (!res.ok) throw new Error("Failed to update blog");
            message.success("Blog updated successfully.");
        } catch (error) {
            message.error("Update failed.");
            console.error(error);
        }
    };

    return (
        <section className="container py-10">
            <div className="flex justify-between">
                <h2 className="text-xl font-semibold text-gray">
                    <EditOutlined /> Edit Blog
                </h2>

                <Link href="/website/blog">
                    <Button variant="solid" className="btn-blue-filled font-semibold">
                        <LeftOutlined /> Back
                    </Button>
                </Link>
            </div>
            <hr className="my-5" />

            <Card className="shadow-lg">
                {!loading && initialValues ? (
                    <FormBLog
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
