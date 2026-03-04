// /src/components/timesheet/TimesheetForm.jsx
"use client";
import { Button, Card, TimePicker, TreeSelect, Form, Spin, message, Segmented } from "antd";
import dayjs from "dayjs";
import { LoadingOutlined } from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const format = "HH:mm";

export default function TimesheetForm({
  onTimesheetSubmit,   // callback lama
  onSubmitted,          // callback baru (alias)
  initialValues,
  onCancel,
  timesheetId, 
  lockedDate,        // "YYYY-MM-DD" jika mode wajib
  forceMode = false, // true jika datang dari enforcement
}) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const [duration, setDuration] = useState("00:00");
  const [isStartFinish, setIsStartFinish] = useState(true);
  const [isTimeDuration, setIsTimeDuration] = useState(false);
  const [dateOption, setDateOption] = useState("today"); // 'today' | 'yesterday'

  // Pilih tanggal efektif
  const selectedDate = useMemo(() => {
    if (lockedDate) return dayjs(lockedDate, "YYYY-MM-DD");
    return dateOption === "yesterday" ? dayjs().subtract(1, "day") : dayjs();
  }, [lockedDate, dateOption]);

  // load project-task tree
  useEffect(() => {
    axiosInstance
      .get("/project-task")
      .then((res) => setTreeData(res.data.data))
      .catch(() => message.error("Failed to load project data."));
  }, []);

  // helper: HH:mm (dayjs) -> minutes
  const hhmmToMinutes = (dj) => (dj ? dj.hour() * 60 + dj.minute() : 0);

  // helper: ambil koordinat realtime (Promise)
  const getGeo = () =>
    new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });

  // set initial form (edit mode)
  useEffect(() => {
    if (initialValues) {
      const ivDate = dayjs(initialValues.date);
      const isYesterday = ivDate.isSame(dayjs().subtract(1, "day"), "day");
      if (!lockedDate) setDateOption(isYesterday ? "yesterday" : "today");

      form.setFieldsValue({
        ...initialValues,
        task: `${initialValues.project_id}-${initialValues.task_id}`,
        start_time: initialValues.start_time ? dayjs(initialValues.start_time, format) : undefined,
        end_time: initialValues.end_time ? dayjs(initialValues.end_time, format) : undefined,
      });

      // Hitung hours awal untuk mode Start/Finish
      const s = initialValues.start_time ? dayjs(initialValues.start_time, format) : null;
      const e = initialValues.end_time ? dayjs(initialValues.end_time, format) : null;
      if (s && e && e.isAfter(s)) {
        const diff = e.diff(s, "minute");
        const h = String(Math.floor(diff / 60)).padStart(2, "0");
        const m = String(diff % 60).padStart(2, "0");
        setDuration(`${h}:${m}`);
      } else {
        setDuration("00:00");
      }
    } else {
      form.resetFields();
      if (!lockedDate) setDateOption("today");
      setDuration("00:00");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, lockedDate]);

  const handleChangeFormStart = () => {
    setIsTimeDuration(false);
    setIsStartFinish(true);
    form.setFieldsValue({ duration_hhmm: undefined });
    handleTimeChange();
  };

  const handleChangeFormDuration = () => {
    setIsStartFinish(false);
    setIsTimeDuration(true);
    form.setFieldsValue({ duration_hhmm: dayjs("00:00", format) });
    setDuration("00:00");
  };

  // Update tampilan Hours
  const handleTimeChange = () => {
    if (isTimeDuration) {
      const dur = form.getFieldValue("duration_hhmm");
      const mins = hhmmToMinutes(dur);
      const h = String(Math.floor(mins / 60)).padStart(2, "0");
      const m = String(mins % 60).padStart(2, "0");
      setDuration(`${h}:${m}`);
      return;
    }
    const start = form.getFieldValue("start_time");
    const end = form.getFieldValue("end_time");
    if (!start || !end) {
      setDuration("00:00");
      return;
    }
    if (end.isBefore(start)) {
      setDuration("Invalid");
      return;
    }
    const diff = end.diff(start, "minute");
    const h = String(Math.floor(diff / 60)).padStart(2, "0");
    const m = String(diff % 60).padStart(2, "0");
    setDuration(`${h}:${m}`);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const [projectId, taskId] = String(values.task).split("-");
      const base = {
        projectId: parseInt(projectId, 10),
        taskId: parseInt(taskId, 10),
        date: selectedDate.format("YYYY-MM-DD"),
      };

      let payload;

      if (isTimeDuration) {
        // Mode Durasi: hanya kirim durationMinutes
        const mins = hhmmToMinutes(values.duration_hhmm);
        if (!mins) {
          message.error("Duration must be > 0");
          setLoading(false);
          return;
        }
        payload = { ...base, durationMinutes: mins };
      } else {
        // Mode Start/Finish: ambil koordinat realtime lalu kirim
        const start = values.start_time?.format(format);
        const end = values.end_time?.format(format);
        if (!start || !end) {
          message.error("Start and End time are required");
          setLoading(false);
          return;
        }

        // Ambil koordinat realtime (tidak memblokir submit kalau gagal)
        const coords = await getGeo();

        payload = {
          ...base,
          startTime: start,
          endTime: end,
          ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
        };
      }

      let res;
      if (timesheetId) {
        res = await axiosInstance.put(`/timesheet/${timesheetId}`, payload);
        message.success("Timesheet updated successfully!");
      } else {
        res = await axiosInstance.post("/timesheet", payload);
        message.success("Timesheet submitted successfully!");
      }

      // ambil data baru dari API (kalau dikirim)
      const created = res?.data?.data ?? res?.data ?? null;

      // panggil semua callback yang ada
      if (typeof onTimesheetSubmit === "function") {
        onTimesheetSubmit(created);
      }
      if (typeof onSubmitted === "function") {
        onSubmitted(created);
      }

      // reset form tapi jangan kabur dari halaman enforce
      form.resetFields();
      setDuration("00:00");
      if (!lockedDate) setDateOption("today");
    } catch (error) {
      message.error(error?.response?.data?.msg || "Failed to submit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-box mb-5" classNames={{ body: "p-5" }}>
      <Form form={form} onFinish={onFinish}>
        <div className="flex items-center gap-5 lg:gap-7 overflow-x-auto lg:overflow-x-visible">
          {/* Left: Date chooser */}
          <div className="flex-none text-center">
            {lockedDate ? (
              <>
                <div className="text-xs fc-blue">Date</div>
                <div className="mt-2">
                  <h3 className="text-xs fc-base">{selectedDate.format("MMM")}</h3>
                  <h4 className="text-xl font-medium fc-base">{selectedDate.format("DD")}</h4>
                </div>
              </>
            ) : (
              <>
                <Segmented
                  options={[
                    { label: "Today", value: "today" },
                    { label: "Yesterday", value: "yesterday" },
                  ]}
                  value={dateOption}
                  onChange={setDateOption}
                  size="small"
                />
                <div className="mt-2">
                  <h3 className="text-xs fc-blue">{selectedDate.format("MMM")}</h3>
                  <h4 className="text-xl font-medium fc-base">{selectedDate.format("DD")}</h4>
                </div>
              </>
            )}
          </div>

          {/* Middle: Task selector + toggle mode */}
          <div className="flex-1 w-full lg:px-7 h-full lg:border-x">
            <div className="relative">
              <div className="static sm:absolute top-[-26px] right-0 fc-blue">
                {isStartFinish && (
                  <Button size="small" color="cyan" variant="filled" onClick={handleChangeFormDuration}>
                    <FontAwesomeIcon icon={faRepeat} /> Enter Time Duration
                  </Button>
                )}
                {isTimeDuration && (
                  <Button size="small" color="cyan" variant="filled" onClick={handleChangeFormStart}>
                    <FontAwesomeIcon icon={faRepeat} /> Enter Start Finish
                  </Button>
                )}
              </div>
              <Form.Item
                name="task"
                className="mb-0"
                rules={[{ required: true, message: "Please choose a project/task" }]}
              >
                <TreeSelect
                  loading={!treeData.length}
                  treeLine
                  treeData={treeData}
                  placeholder="Select Project / Task"
                  variant="filled"
                  allowClear
                  showSearch
                />
              </Form.Item>
            </div>
          </div>

          {/* Duration mode */}
          {isTimeDuration && (
            <>
              <div className="flex-none lg:border-e">
                <div className="flex justify-center items-center gap-5">
                  <div className="text-center">
                    <h3 className="fc-blue text-sm">Duration</h3>
                    <div className="custom-timepicker">
                      <Form.Item name="duration_hhmm" className="mb-0" rules={[{ required: true }]}>
                        <TimePicker
                          onChange={handleTimeChange}
                          format={format}
                          minuteStep={15}
                          placeholder="HH:mm"
                          allowClear={false}
                          variant="borderless"
                          defaultValue={dayjs("00:00", format)}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-none">
                <div className="flex justify-center items-center gap-7">
                  <div className="text-center">
                    <h3 className="fc-blue text-sm">Hours</h3>
                    <h4 className={`text-base py-1 ${duration === "Invalid" ? "text-red-500" : "text-[#737373]"}`}>
                      {duration}
                    </h4>
                  </div>
                  <div className="flex gap-2">
                    {timesheetId && <Button onClick={onCancel} className="px-5">Cancel</Button>}
                    <Button className="btn-blue px-7" htmlType="submit">
                      Submit
                      {loading ? <Spin indicator={<LoadingOutlined spin className="text-white" />} size="small" /> : null}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Start/Finish mode */}
          {isStartFinish && (
            <>
              <div className="flex-none lg:border-e">
                <div className="flex justify-center items-center gap-5">
                  <div className="text-center">
                    <h3 className="fc-blue text-sm">Start</h3>
                    <div className="custom-timepicker">
                      <Form.Item name="start_time" className="mb-0" rules={[{ required: true }]}>

                        <TimePicker
                          onChange={handleTimeChange}
                          format={format}
                          minuteStep={15}
                          placeholder="Start"
                          allowClear={false}
                          variant="borderless"
                          defaultValue={dayjs("00:00", format)}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <h4 className="fc-blue text-xl font-bold">-</h4>
                  <div className="text-center">
                    <h3 className="fc-blue text-sm">Finish</h3>
                    <div className="custom-timepicker">
                      <Form.Item name="end_time" className="mb-0" rules={[{ required: true }]}>

                        <TimePicker
                          onChange={handleTimeChange}
                          format={format}
                          minuteStep={15}
                          placeholder="End"
                          allowClear={false}
                          variant="borderless"
                          defaultValue={dayjs("00:00", format)}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-none">
                <div className="flex justify-center items-center gap-7">
                  <div className="text-center">
                    <h3 className="fc-blue text-sm">Hours</h3>
                    <h4 className={`text-base ${duration === "Invalid" ? "text-red-500" : "text-[#737373]"}`}>
                      {duration}
                    </h4>
                  </div>
                  <div className="flex gap-2">
                    {timesheetId && <Button onClick={onCancel} className="px-5">Cancel</Button>}
                    <Button className="btn-blue px-7" htmlType="submit">
                      Submit
                      {loading ? <Spin indicator={<LoadingOutlined spin className="text-white" />} size="small" /> : null}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Form>
    </Card>
  );
}
