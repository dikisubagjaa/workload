"use client";

import { Button, Card } from "antd";
import TableAttendance from "@/components/attendance/TableAttendance";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ModalManualAttendance from "@/components/modal/ModalManualAttendance";
import ModalAttendanceReport from "@/components/modal/ModalAttendanceReport";

export default function Attendace() {
  const [modalManualAttendance, setModalManualAttendance] = useState(false);
  const [modalReport, setModalReport] = useState(false);
  const router = useRouter();

  return (
    <>
      <section className="container pt-10">
        <Card
          className="card-box mb-5"
          title={
            <div className="flex flex-col sm:flex-row justify-between">
              <h3 className="text-lg py-3 sm:py-0">Attendance</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="primary"
                  className="btn-blue-filled"
                  onClick={() => router.push("/attendance/maps")}
                >
                  Maps
                </Button>
                <Button
                  type="primary"
                  className="btn-blue-filled"
                  onClick={() => router.push("/holiday")}
                >
                  Holiday
                </Button>
                <Button
                  type="primary"
                  className="btn-blue-filled"
                  onClick={() => setModalReport(true)}
                >
                  Report
                </Button>
                <Button
                  type="primary"
                  className="btn-blue-filled"
                  onClick={() => setModalManualAttendance(true)}
                >
                  Attendance Manual
                </Button>
              </div>
            </div>
          }
        >
          <TableAttendance />
        </Card>
      </section>

      <ModalManualAttendance
        modalManualAttendance={modalManualAttendance}
        setModalManualAttendance={setModalManualAttendance}
      />

      <ModalAttendanceReport
        modalReport={modalReport}
        setModalReport={setModalReport}
      />
    </>
  );
}
