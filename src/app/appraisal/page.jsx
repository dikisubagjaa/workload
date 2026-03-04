// src/app/appraisal/page.jsx
"use client";

import { Card } from "antd";
import TableAppraisal from "@/components/appraisal/TableAppraisal";

export default function AppraisalPage() {
  return (
    <section className="container pt-10">
      <Card className="card-box mb-5" title={<h3 className="text-lg">Appraisal History</h3>}>
        <TableAppraisal />
      </Card>
    </section>
  );
}
