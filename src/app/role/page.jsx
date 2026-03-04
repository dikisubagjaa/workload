// src/app/role/page.jsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "antd";
import RoleManagementUI from "@/components/menu-role/RoleManagementUI";

export default function RolePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <section className="container py-10">
      <Card
        className="card-table shadow-md"
        title={<h3 className="fc-base text-xl">Role Management</h3>}
      >
        <RoleManagementUI />
      </Card>
    </section>
  );
}
