import { LeftOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import FormProject from "../FormProject";
import Link from "next/link";

export const metadata = {
    title: "Add Project",
    description: "Add Project"
}

export default function page() {
    return (
        <section className="container py-10">
            <div className="flex justify-between">
                <h2 className="text-xl font-semibold text-gray">
                    <PlusOutlined /> Add Project
                </h2>

                <Link href="/website/project">
                    <Button variant="solid" className="btn-blue-filled font-semibold">
                        <LeftOutlined /> Back
                    </Button>
                </Link>
            </div>
            <hr className="my-5" />

            <Card className="shadow-lg">
                <FormProject />
            </Card>
        </section>
    )
}
