import { PlusOutlined } from "@ant-design/icons"
import { Button, Card } from "antd"
import Link from "next/link"
import DataTable from "./DataTable"

export const metadata = {
    title: 'CMS Website | Service',
    description: 'CMS Website | Service',
}

export default function page() {
    return (
        <section className="container py-10">
            <Card
                className="shadow-lg"
                title={
                    <h3 className="fc-base text-xl">Service</h3>
                }
            >
                <DataTable />
            </Card>
        </section>
    )
}
