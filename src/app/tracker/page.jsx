import { Card } from "antd";
import TableTracker from "@/components/table/TableTracker";

export const metadata = {
    title: 'Tracker',
    description: 'Tracker'
}

export default function Attendace() {
    return (
        <>
            <section className="container pt-10">
                <Card
                    className="card-box mb-5"
                    title={<h3 className="text-lg">Tracker</h3>}
                >
                    <TableTracker />
                </Card>
            </section>
        </>
    )
}
