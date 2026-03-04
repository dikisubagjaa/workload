// src/app/holiday/page.jsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "antd";
import HolidayManagementUI from "@/components/holiday/HolidayManagementUI";
import { LeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function HolidayPage() {
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

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
        title={
          <button className="btn-back fc-base" onClick={() => router.back()}>
            <h3 className="text-lg"><LeftOutlined /> Holiday Management</h3>
          </button>
        }
      >
        <HolidayManagementUI />
      </Card>
    </section>
  );
}
