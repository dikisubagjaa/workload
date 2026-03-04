import { LeftOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import FormPage from "../FormPage";
import Link from "next/link";

export const metadata = {
    title: "Add Page",
    description: "Add Page"
}

export default function page() {
    return (
        <section className="container py-10">
            <div className="flex justify-between">
                <h2 className="text-xl font-semibold text-gray">
                    <PlusOutlined /> Add Page
                </h2>

                <Link href="/website/page">
                    <Button variant="solid" className="btn-blue-filled font-semibold">
                        <LeftOutlined /> Back
                    </Button>
                </Link>
            </div>
            <hr className="my-5" />

            <Card className="shadow-lg">
                <FormPage />
            </Card>
        </section>
    )
}
