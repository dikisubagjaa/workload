import { LeftOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import FormBLog from "../FormBLog";
import Link from "next/link";

export const metadata = {
    title: "Add BLog",
    description: "Add BLog"
}

export default function page() {
    return (
        <section className="container py-10">
            <div className="flex justify-between">
                <h2 className="text-xl font-semibold text-gray">
                    <PlusOutlined /> Add BLog
                </h2>

                <Link href="/website/blog">
                    <Button variant="solid" className="btn-blue-filled font-semibold">
                        <LeftOutlined /> Back
                    </Button>
                </Link>
            </div>
            <hr className="my-5" />

            <Card className="shadow-lg">
                <FormBLog />
            </Card>
        </section>
    )
}
