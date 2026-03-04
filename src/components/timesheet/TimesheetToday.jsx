// src/components/timesheet/TimesheetToday.jsx
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import TimesheetWidget from "./TimesheetWidget"; // FIX path
import TimesheetForm from "./TimesheetForm";
import TimesheetConfirmation from "./TimesheetConfirmation"; // ADD import
import { Card, Collapse, Spin, message, Modal, Empty } from "antd";
import { TableTimesheetOverview } from "@/components/table/TableTimesheet";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";

export default function TimesheetToday() {
  const [loading, setLoading] = useState(true);
  const [timesheetData, setTimesheetData] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/timesheet");
      setTimesheetData(response.data.data);
    } catch (error) {
      message.error("Failed to load timesheet data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditClick = (record) => {
    setEditingRecord(record);
    setIsEditModalVisible(true);
  };

  const handleDeleteClick = (record) => {
    Modal.confirm({
      title: "Delete this timesheet entry?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await axiosInstance.delete(`/timesheet/${record.timesheet_id}`);
          message.success("Timesheet deleted");
          fetchData();
        } catch (e) {
          message.error(e?.response?.data?.msg || "Failed to delete.");
        }
      },
    });
  };

  const handleModalCancel = () => {
    setIsEditModalVisible(false);
    setEditingRecord(null);
  };

  // pengecekan H-1 tetap pakai semua data (termasuk submitted)
  const yesterdayDate = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  const needsConfirmation = useMemo(
    () =>
      timesheetData.some(
        (item) => item.date === yesterdayDate && item.status === "submitted"
      ),
    [timesheetData, yesterdayDate]
  );

  // 1. ambil yang BELUM approved
  const pendingTimesheet = useMemo(
    () => timesheetData.filter((item) => item.status !== "approved"),
    [timesheetData]
  );

  // 2. group by tanggal
  const groupedByDate = useMemo(() => {
    const map = {};
    pendingTimesheet.forEach((item) => {
      const d = item.date; // asumsi API sudah kirim "YYYY-MM-DD"
      if (!map[d]) map[d] = [];
      map[d].push(item);
    });
    // urutkan tanggal dari yang terbaru ke lama
    return Object.entries(map).sort(([dateA], [dateB]) => {
      const a = dayjs(dateA);
      const b = dayjs(dateB);
      if (a.isBefore(b)) return 1;
      if (a.isAfter(b)) return -1;
      return 0;
    });
  }, [pendingTimesheet]);

  // 3. bikin item collapse dari grup
  const itemsCollapse =
    groupedByDate.length > 0
      ? groupedByDate.map(([date, items]) => ({
        key: date,
        label: dayjs(date).format("dddd, D MMM YYYY"),
        children: (
          <TableTimesheetOverview
            dataSource={items}
            onActionSuccess={fetchData}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        ),
      }))
      : [
        {
          key: "empty",
          label: "Timesheet",
          children: <Empty description="No pending timesheet" />,
        },
      ];

  return (
    <Spin spinning={loading}>
      {/* form input hari ini */}
      <TimesheetForm onTimesheetSubmit={fetchData} />

      {/* widget ringkasan */}
      <TimesheetWidget timesheetData={timesheetData} />

      {/* konfirmasi H-1 */}
      {needsConfirmation && (
        <TimesheetConfirmation
          dateToConfirm={yesterdayDate}
          onConfirm={fetchData}
        />
      )}

      {/* accordion per tanggal, hanya yang belum approved */}
      <Card className="card-box">
        <Collapse
          defaultActiveKey={groupedByDate.length ? [groupedByDate[0][0]] : []}
          items={itemsCollapse}
          expandIconPosition="end"
        />
      </Card>

      {/* modal edit */}
      <Modal
        title="Edit Timesheet Entry"
        open={isEditModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        destroyOnClose
      >
        <TimesheetForm
          onTimesheetSubmit={fetchData}
          initialValues={editingRecord}
          onCancel={handleModalCancel}
          timesheetId={editingRecord?.timesheet_id}
        />
      </Modal>
    </Spin>
  );
}
