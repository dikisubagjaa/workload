"use client";

import { Modal, DatePicker, message } from "antd";
import { useState } from "react";

export default function ModalAttendanceReport({
  modalReport,
  setModalReport,
}) {
  const [reportRange, setReportRange] = useState([null, null]); // [from, to]

  const handleDownloadReport = () => {
    const [from, to] = reportRange;
    if (!from || !to) {
      message.error("Please select both From and To dates.");
      return;
    }

    const fromStr = from.format("YYYY-MM-DD");
    const toStr = to.format("YYYY-MM-DD");

    const params = new URLSearchParams({
      period: "period",
      from: fromStr,
      to: toStr,
    });

    if (typeof window !== "undefined") {
      window.open(`/api/attendance/export?${params.toString()}`, "_blank");
    }

    setModalReport(false);
  };

  return (
    <Modal
      open={modalReport}
      onCancel={() => setModalReport(false)}
      onOk={handleDownloadReport}
      okText="Download Report"
      cancelText="Cancel"
      destroyOnClose
    >
      <h3 className="text-lg font-semibold fc-blue">Attendance Report</h3>
      <hr className="my-3" />

      <div className="flex flex-col gap-4 mb-5">
        <div>
          <label className="block mb-1 text-sm font-medium">From</label>
          <DatePicker
            className="w-full"
            value={reportRange[0]}
            format="YYYY-MM-DD"
            onChange={(date) => setReportRange([date, reportRange[1]])}
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">To</label>
          <DatePicker
            className="w-full"
            value={reportRange[1]}
            format="YYYY-MM-DD"
            onChange={(date) => setReportRange([reportRange[0], date])}
          />
        </div>
      </div>
    </Modal>
  );
}
