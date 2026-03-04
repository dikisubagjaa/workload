import { LeftOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import FormClient from "../FormClient";
import Link from "next/link";

export const metadata = {
    title: "Add Client",
    description: "Add Client"
}

export default function page() {
    return (
        <section className="container py-10">
            <div className="flex justify-between">
                <h2 className="text-xl font-semibold text-gray">
                    <PlusOutlined /> Add Client
                </h2>

                <Link href="/website/clients">
                    <Button variant="solid" className="btn-blue-filled font-semibold">
                        <LeftOutlined /> Back
                    </Button>
                </Link>
            </div>
            <hr className="my-5" />

            <Card className="max-w-[800px] mx-auto shadow-lg">
                <FormClient />
            </Card>
        </section>
    )
}
