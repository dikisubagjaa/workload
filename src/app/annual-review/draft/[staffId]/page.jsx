"use client";

import { EditOutlined } from "@ant-design/icons";
import { Button, Card, Form, Radio, Tag, message } from "antd";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axios";
import { useSession } from "next-auth/react";

export default function MainContent() {
  const { data: session, status: sessionStatus } = useSession();

  const [form] = Form.useForm();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const staffId = params?.staffId;

  // ✅ year dari query (kalau gak ada, fallback current year)
  const year = useMemo(() => {
    const y = Number(searchParams?.get("year"));
    return Number.isFinite(y) ? y : new Date().getFullYear();
  }, [searchParams]);

  const [questionRows, setQuestionRows] = useState([]);
  const [statusLabel, setStatusLabel] = useState("Open");
  const [statusColor, setStatusColor] = useState("green");
  const [submitBeforeLabel, setSubmitBeforeLabel] = useState("-");
  const [draftSavedLabel, setDraftSavedLabel] = useState("-");
  const [editHref, setEditHref] = useState("/annual-review/form/0");

  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const [detailStaff, setDetailStaff] = useState(null);
  const [detailAssessment, setDetailAssessment] = useState(null);
  const [staffPayload, setStaffPayload] = useState({ answers: {} });
  const [hodPayload, setHodPayload] = useState(null);

  const didInitRef = useRef(false);

  const isHod = useMemo(() => {
    const v = session?.user?.is_hod;
    return v === true || v === "true" || v === 1 || v === "1";
  }, [session]);

  // Block non-HOD ASAP
  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!isHod) {
      message.warning("You don't have access to Team Member’s Review.");
      router.replace("/annual-review");
    }
  }, [isHod, router, sessionStatus]);

  const formatDateLong = (unixSeconds) => {
    if (!unixSeconds) return "-";
    const d = new Date(Number(unixSeconds) * 1000);
    const dd = String(d.getDate()).padStart(2, "0");
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = months[d.getMonth()];
    const yyyy = d.getFullYear();
    return `${dd} ${month} ${yyyy}`;
  };

  const safeParseOptions = (val) => {
    try {
      if (!val) return null;
      if (Array.isArray(val)) return val;
      return JSON.parse(String(val));
    } catch (e) {
      return null;
    }
  };

  const buildOptionsWithColors = (optionsArr) => {
    if (!Array.isArray(optionsArr) || optionsArr.length === 0) return [];
    return optionsArr.map((opt, idx) => ({
      value: opt?.value ?? opt,
      label: opt?.label ?? opt?.value ?? opt,
      color: `radio-${idx + 1}`,
    }));
  };

  const isLocked = useMemo(() => {
    const st = detailAssessment?.status;
    return st === "approved" || st === "finalized" || st === "rejected";
  }, [detailAssessment]);

  const canFinalize = useMemo(() => {
    const st = detailAssessment?.status;
    return st === "submitted_by_staff";
  }, [detailAssessment]);

  const getStaffAnswerValue = (questionKey) => {
    const item = staffPayload?.answers?.[questionKey];
    if (!item) return "-";
    if (typeof item === "string") return item;
    if (typeof item?.value !== "undefined") return item.value;
    if (typeof item?.text !== "undefined") return item.text;
    return "-";
  };

  const optionsByQuestionIndex = useMemo(() => {
    return questionRows.map((q) => {
      const parsed = safeParseOptions(q?.options_json) || [];
      const normalized = Array.isArray(parsed)
        ? parsed.map((x) => ({
            value: typeof x === "object" ? x.value : x,
            label: typeof x === "object" ? x.label ?? x.value : x,
          }))
        : [];

      if (!normalized.length) {
        return buildOptionsWithColors([
          { value: 1, label: "1" },
          { value: 2, label: "2" },
          { value: 3, label: "3" },
          { value: 4, label: "4" },
          { value: 5, label: "5" },
        ]);
      }

      return buildOptionsWithColors(normalized);
    });
  }, [questionRows]);

  const questions = useMemo(() => {
    if (!questionRows.length) return [];
    return questionRows.map((q) => {
      const title = q?.title ? String(q.title) : "";
      const desc = q?.description ? String(q.description) : "";
      if (title && desc) return `${title}\n${desc}`;
      return title || desc || "-";
    });
  }, [questionRows]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!staffId) return;
      if (sessionStatus === "loading") return;
      if (!isHod) return;

      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/annual-assestment/hod/detail?staffId=${staffId}&year=${year}`
        );
        const data = res?.data?.data;

        const staff = data?.staff || null;
        const assessment = data?.assessment || null;
        const qRows = data?.questions || [];
        const sPayload = data?.staffPayload || { answers: {} };
        const hPayload = data?.hodPayload || null;

        setDetailStaff(staff);
        setDetailAssessment(assessment);
        setQuestionRows(qRows);
        setStaffPayload(sPayload);
        setHodPayload(hPayload);

        const apiStatus = assessment?.status;

        if (!assessment) {
          setStatusLabel("Open");
          setStatusColor("gold");
        } else if (apiStatus === "approved" || apiStatus === "finalized") {
          setStatusLabel("Approved");
          setStatusColor("green");
        } else if (apiStatus === "rejected") {
          setStatusLabel("Rejected");
          setStatusColor("red");
        } else if (apiStatus === "submitted_by_staff" || apiStatus === "reviewed_by_hod") {
          setStatusLabel("Open");
          setStatusColor("green");
        } else {
          setStatusLabel("Open");
          setStatusColor("gold");
        }

        setSubmitBeforeLabel("-");

        setDraftSavedLabel(
          assessment?.staff_submitted_at ? formatDateLong(assessment.staff_submitted_at) : "-"
        );

        if (assessment?.annual_assestment_id) {
          setEditHref(`/annual-review/form/${assessment.annual_assestment_id}?year=${year}`);
        } else {
          setEditHref(`/annual-review/form/0?year=${year}`);
        }

        // reset init tiap ganti staffId/year
        didInitRef.current = false;

        if (!didInitRef.current) {
          const init = {};
          const answers = hPayload?.answers || {};

          qRows.forEach((q, idx) => {
            const fieldName = `question_${idx + 1}`;
            const item = answers[q.question_key];

            let v = "";
            if (typeof item === "string") v = item;
            else if (typeof item?.value !== "undefined") v = item.value;
            else if (typeof item?.text !== "undefined") v = item.text;

            init[fieldName] = v;
          });

          form.setFieldsValue(init);
          didInitRef.current = true;
        }
      } catch (e) {
        const code = e?.response?.status;
        if (code === 401 || code === 403) {
          message.warning("You don't have access to Team Member’s Review.");
          router.replace("/annual-review");
        } else {
          message.error(e?.response?.data?.msg || "Failed to load review.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId, year, isHod, sessionStatus]);

  const buildHodPayloadFromForm = () => {
    const values = form.getFieldsValue();
    const answers = {};

    questionRows.forEach((q, idx) => {
      const fieldName = `question_${idx + 1}`;
      const val = values[fieldName];
      answers[q.question_key] = { value: val };
    });

    return { answers };
  };

  const handleDownloadPdf = () => {
    if (!staffId) return;
    window.open(`/api/annual-assestment/pdf?staffId=${staffId}&year=${year}`, "_blank");
  };

  const onFinish = async () => {
    if (!detailAssessment) {
      message.error("Assessment not found.");
      return;
    }
    if (isLocked) {
      message.warning("This assessment is locked.");
      return;
    }
    if (!canFinalize) {
      message.warning("Staff has not submitted yet.");
      return;
    }

    setFinalizing(true);
    try {
      await form.validateFields();
      const payload = buildHodPayloadFromForm();

      await axiosInstance.post("/annual-assestment/hod/submit", {
        staffId: Number(staffId),
        year, // ✅ ikut period
        payload,
      });

      message.success("Approved. PDF is ready.");
      router.push("/annual-review");
    } catch (e) {
      if (e?.errorFields) {
        message.error("Please complete all required questions.");
      } else {
        message.error(e?.response?.data?.msg || "Failed to approve.");
      }
    } finally {
      setFinalizing(false);
    }
  };

  if (sessionStatus === "loading") return null;
  if (!isHod) return null;

  return (
    <section className="container py-10">
      <Card className="card-box">
        <h1 className="text-xl font-semibold mb-3">Annual Review</h1>

        <div className="flex flex-col sm:flex-row items-start gap-5 mb-5">
          <div className="flex-1">
            <div className="mb-4">
              <h3 className="text-sm">
                This form is to check your work progress and quality in the past year.
              </h3>
              <h3 className="text-sm">
                Please answer honestly to help improve your performance and work together better
                as a team.
              </h3>
            </div>

            <h4 className="text-sm">How to Fill This Form:</h4>
            <ol className="text-sm list-decimal list-inside">
              <li>Read each question carefully.</li>
              <li>Choose the answer that matches your situation best</li>
              <li>Submit the form before the deadline.</li>
            </ol>
          </div>

          <div className="w-full sm:w-auto border border-green-500 rounded-lg p-3 sm:p-5">
            <div className="flex justify-between gap-3 sm:gap-10 mb-3">
              <div className="text-sm">Status:</div>
              <div className="text-sm">
                <Tag color={statusColor} variant="outlined" className="rounded-full px-3">
                  {statusLabel}
                </Tag>
              </div>
            </div>
            <div className="flex justify-between gap-3 sm:gap-10">
              <div className="text-sm">Submit before:</div>
              <div className="text-sm font-bold">{submitBeforeLabel}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm">
            Draft saved: <b className="font-bold">{draftSavedLabel}</b>
            {detailStaff?.fullname ? (
              <span className="ml-2">
                | Staff: <b className="font-bold">{detailStaff.fullname}</b>
              </span>
            ) : null}
          </h3>

          <div className="flex items-center gap-3">
            <Button
              type="default"
              color="cyan"
              variant="outlined"
              className="px-4"
              onClick={handleDownloadPdf}
              disabled={!detailAssessment}
            >
              Download PDF
            </Button>

            <Link href={editHref}>
              <Button type="primary" className="btn-blue-filled">
                <EditOutlined /> Edit
              </Button>
            </Link>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="border rounded-lg p-5 sm:p-7 mb-5">
            {questions.map((question, index) => (
              <div key={index}>
                <Form.Item
                  name={`question_${index + 1}`}
                  rules={[{ required: true, message: "Please select an option" }]}
                >
                  <p className="text-sm text-gray-800 mb-5">{question}</p>

                  <p className="text-xs mb-3">
                    <b>Staff Answer:</b>{" "}
                    {questionRows[index]?.question_key
                      ? String(getStaffAnswerValue(questionRows[index].question_key))
                      : "-"}
                  </p>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-red-500 whitespace-nowrap hidden sm:block">
                      Strongly Disagree
                    </span>

                    <Radio.Group className="flex items-center gap-2" disabled={isLocked || loading}>
                      {(optionsByQuestionIndex[index] || []).map((opt) => (
                        <Radio
                          key={String(opt.value)}
                          value={opt.value}
                          className={`custom-radio-annual ${opt.color}`}
                        />
                      ))}
                    </Radio.Group>

                    <span className="text-xs text-green-600 whitespace-nowrap hidden sm:block">
                      Strongly Agree
                    </span>
                  </div>
                </Form.Item>

                {index !== questions.length - 1 && <hr className="my-7" />}
              </div>
            ))}
          </div>

          {/* NOTE: bagian Performance Summary masih dummy sesuai file kamu */}
          <h3 className="text-base font-semibold mb-3">Performance Summary</h3>
          <div className="border rounded-lg p-5 sm:p-7 mb-5">
            <h4 className="text-sm">
              Over the past year, I have consistently met project deadlines and maintained the
              quality of my work. I took initiative to suggest improvements in workflow and
              supported team members when needed. While I achieved most of my targets, I see
              opportunities to further improve my time management during high workload periods.
            </h4>
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-5">
            <Button
              type="primary"
              htmlType="submit"
              className="px-4"
              loading={finalizing}
              disabled={isLocked || loading || !detailAssessment || !canFinalize}
            >
              Approve
            </Button>
          </div>
        </Form>
      </Card>
    </section>
  );
}
