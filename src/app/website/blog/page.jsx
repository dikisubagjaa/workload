import { PlusOutlined } from "@ant-design/icons"
import { Button, Card } from "antd"
import Link from "next/link"
import DataTable from "./DataTable"

export const metadata = {
    title: 'CMS Website | BLog',
    description: 'CMS Website | BLog',
}

export default function page() {
    return (
        <section className="container py-10">
            <Card
                className="shadow-lg"
                title={
                    <h3 className="fc-base text-xl">Blog</h3>
                }
            >
                <DataTable />
            </Card>
        </section>
    )
}
