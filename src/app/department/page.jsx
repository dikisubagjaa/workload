"use client";

import { Card } from "antd";
import TableDepartment from "@/components/department/TableDepartment";

export default function DepartmentPage() {
  return (
    <section className="container pt-10">
      <Card className="card-box mb-5" title={<h3 className="text-xl">Department</h3>}>
        <TableDepartment />
      </Card>
    </section>
  );
}
