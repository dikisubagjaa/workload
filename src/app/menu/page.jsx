// src/app/menu/page.jsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "antd";
import MenuManagementUI from "@/components/menu-role/MenuManagementUI";

export default function MenuPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR & render pertama di client: null (markup kosong, aman dari hydration)
  if (!mounted) {
    return null;
  }

  return (
    <section className="container py-10">
      <Card
        className="card-table shadow-md"
        title={<h3 className="fc-base text-xl">Menu Management</h3>}
      >
        <MenuManagementUI />
      </Card>
    </section>
  );
}
