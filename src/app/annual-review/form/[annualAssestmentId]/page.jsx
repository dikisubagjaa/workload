"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Select, Tag, message } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import { useSession } from "next-auth/react";

const { TextArea } = Input;

// ✅ Rating options harus angka (1..5) supaya backend bisa hitung average/grade
const RatingOptions = [
  { label: "Mengecewakan", value: 1 },
  { label: "Perlu Di tingkatkan", value: 2 },
  { label: "Baik /  Cukup Baik", value: 3 },
  { label: "Sangat Baik", value: 4 },
  { label: "Diatas rata-rata", value: 5 },
];

// fallback kalau API belum masuk
const questionsExample = [
  {
    key: "pemahaman_tanggung_jawab",
    title: "PEMAHAMAN TANGGUNG JAWAB",
    description:
      "Telah menunjukkan pemahaman mengenai tugas dan kewajibannya atas posisi pekerjaan di dalam perusahaan. Dan menunjukkan kemampuan untuk melaksanakan tugas yang diberikan sesuai dengan instruksi dari pimpinan dan mematuhi / memahami prosedur yang ada.",
    inputType: "rating",
  },
];

function formatUnix(ts) {
  try {
    if (!ts) return "-";
    const d = new Date(Number(ts) * 1000);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function getAnswerValue(raw) {
  if (raw == null) return null;
  if (typeof raw === "object") {
    if (typeof raw.value !== "undefined") return raw.value;
    if (typeof raw.text !== "undefined") return raw.text;
    return null;
  }
  return raw;
}

function getAnswerText(raw) {
  if (raw == null) return "";
  if (typeof raw === "object" && typeof raw.text === "string") return raw.text;
  if (typeof raw === "string") return raw;
  return "";
}

function getAnswerNote(raw) {
  if (raw == null) return "";
  if (typeof raw === "object" && typeof raw.note === "string") return raw.note;
  return "";
}

export default function MainContent() {
  const { data: session, status: sessionStatus } = useSession();

  const [form] = Form.useForm();
  const params = useParams();
  const router = useRouter();
  const annualAssestmentId = params?.annualAssestmentId;

  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [questionRows, setQuestionRows] = useState([]);
  const [assestmentRow, setAssestmentRow] = useState(null);

  const didSetInitialRef = useRef(false);

  const isHod = useMemo(() => {
    const v = session?.user?.is_hod;
    return v === true || v === "true" || v === 1 || v === "1";
  }, [session]);

  const canShowHodCompare = useMemo(() => {
    // anti flicker ketika session masih loading
    return sessionStatus !== "loading" && isHod;
  }, [sessionStatus, isHod]);

  const assessmentStatus = useMemo(() => {
    return String(assestmentRow?.status || "");
  }, [assestmentRow]);

  // ✅ pertanyaan harus pakai master (questionRows) kalau ada,
  // fallback ke example biar UI tidak blank
  const questionsList = useMemo(() => {
    if (Array.isArray(questionRows) && questionRows.length) {
      return questionRows
        .filter((q) => q?.question_key)
        .map((q) => ({
          key: q.question_key,
          title: q.title || "-",
          description: q.description || "",
          inputType: q.input_type || "rating",
          optionsJson: q.options_json || null,
        }));
    }
    return questionsExample;
  }, [questionRows]);

  const questionMetaByKey = useMemo(() => {
    const map = {};
    questionsList.forEach((q) => {
      map[q.key] = q;
    });
    return map;
  }, [questionsList]);

  const isLocked = useMemo(() => {
    if (!assestmentRow) return false;
    return assestmentRow.status !== "draft";
  }, [assestmentRow]);

  const statusUi = useMemo(() => {
    const st = assestmentRow?.status;

    if (st === "approved" || st === "finalized") return { label: "Approved", color: "green" };
    if (st === "rejected") return { label: "Rejected", color: "red" };
    if (st === "reviewed_by_hod") return { label: "Reviewed", color: "blue" };
    if (st === "submitted_by_staff") return { label: "Submitted", color: "gold" };
    if (st === "draft") return { label: "Open", color: "green" };

    return { label: "Open", color: "green" };
  }, [assestmentRow]);

  const submitBeforeLabel = useMemo(() => {
    const closeAt = assestmentRow?.__periodState?.closeAt || null;
    return closeAt ? formatUnix(closeAt) : "-";
  }, [assestmentRow]);

  const getInputType = (item) => String(item?.inputType || "rating").toLowerCase();
  const isRating = (item) => getInputType(item) === "rating";
  const showManagerSectionForItem = (item) => canShowHodCompare && isRating(item); // ✅ selain rating: tidak ada pembanding

  const isStaffView = useMemo(() => !canShowHodCompare, [canShowHodCompare]);

  const canStaffEdit = useMemo(() => {
    return isStaffView && assessmentStatus === "draft";
  }, [isStaffView, assessmentStatus]);

  const canStaffDownloadPdf = useMemo(() => {
    return isStaffView && (assessmentStatus === "approved" || assessmentStatus === "finalized");
  }, [isStaffView, assessmentStatus]);

  const handleDownloadPdf = () => {
    // staff: download PDF miliknya sendiri (endpoint default = me)
    window.open("/api/annual-assestment/pdf", "_blank");
  };

  // ✅ render input sesuai input_type
  const renderStaffInput = (item) => {
    const t = getInputType(item);

    if (t === "text") {
      return <Input disabled={!canStaffEdit || loading} />;
    }

    if (t === "textarea") {
      return <TextArea rows={2} disabled={!canStaffEdit || loading} />;
    }

    // default rating
    return (
      <Select
        placeholder="Pilih kinerja"
        options={RatingOptions}
        disabled={!canStaffEdit || loading}
      />
    );
  };

  // Manager/HOD input: hanya untuk compare (rating) dan hanya terlihat kalau opener = HOD
  const renderManagerInput = (item) => {
    return <Select placeholder="Pilih kinerja" options={RatingOptions} disabled={true} />;
  };

  const buildPayloadFromForm = () => {
    const values = form.getFieldsValue();
    const answers = {};

    questionsList.forEach((item) => {
      const key = item.key;
      const meta = questionMetaByKey?.[key] || item;
      const t = String(meta?.inputType || "rating").toLowerCase();

      const staffVal = values?.[key]?.kinerja_pribadi;
      const staffNote = values?.[key]?.catatan_pribadi;

      if (typeof staffVal === "undefined") return;

      if (t === "rating") {
        answers[key] = {
          value: Number(staffVal),
          text: typeof staffNote === "string" ? staffNote : "",
        };
      } else {
        answers[key] = {
          text: typeof staffVal === "string" ? staffVal : String(staffVal ?? ""),
          note: typeof staffNote === "string" ? staffNote : "",
        };
      }
    });

    return { answers };
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // 1) questions (master)
        const qRes = await axiosInstance.get("/annual-assestment/question");
        const qRows = qRes?.data?.data || [];
        setQuestionRows(qRows);

        // 2) me (security: staff hanya dapat row miliknya)
        const meRes = await axiosInstance.get("/annual-assestment/me");
        const row = meRes?.data?.data || null;

        const periodState = meRes?.data?.meta?.periodState || null;
        const mergedRow = row ? { ...row, __periodState: periodState } : null;
        setAssestmentRow(mergedRow);

        // ✅ Ini memastikan user (staff) hanya melihat form miliknya
        if (
          row?.annual_assestment_id &&
          String(row.annual_assestment_id) !== String(annualAssestmentId)
        ) {
          router.replace(`/annual-review/form/${row.annual_assestment_id}`);
        }

        // initial answers
        const staffAnswers =
          (row?.staff_answers_json && typeof row.staff_answers_json === "object"
            ? row.staff_answers_json
            : null) ||
          (row?.staff_payload_json?.answers &&
          typeof row.staff_payload_json.answers === "object"
            ? row.staff_payload_json.answers
            : {});

        const hodAnswers =
          (row?.hod_answers_json && typeof row.hod_answers_json === "object"
            ? row.hod_answers_json
            : null) ||
          (row?.hod_payload_json?.answers &&
          typeof row.hod_payload_json.answers === "object"
            ? row.hod_payload_json.answers
            : {});

        const effectiveList =
          Array.isArray(qRows) && qRows.length
            ? qRows
                .filter((q) => q?.question_key)
                .map((q) => ({
                  key: q.question_key,
                  inputType: q.input_type || "rating",
                }))
            : questionsExample;

        const init = {};

        effectiveList.forEach((q) => {
          const key = q.key;
          const t = String(q.inputType || "rating").toLowerCase();

          const sItem = staffAnswers?.[key];
          const hItem = hodAnswers?.[key];

          if (t === "rating") {
            const sVal = getAnswerValue(sItem);
            const sNote = getAnswerText(sItem);
            const hVal = getAnswerValue(hItem);
            const hNote = getAnswerText(hItem);

            init[key] = {
              kinerja_pribadi:
                sVal !== null && typeof sVal !== "undefined" && sVal !== ""
                  ? Number(sVal)
                  : undefined,
              catatan_pribadi: sNote || undefined,

              // manager fields tetap disimpan (kalau HOD yang buka akan kelihatan)
              kinerja_manager:
                hVal !== null && typeof hVal !== "undefined" && hVal !== ""
                  ? Number(hVal)
                  : undefined,
              catatan_manager: hNote || undefined,
            };
          } else {
            const sText = getAnswerText(sItem);
            const sNote = getAnswerNote(sItem);

            // ✅ Non-rating: tidak perlu pembanding manager/hod
            init[key] = {
              kinerja_pribadi: sText || undefined,
              catatan_pribadi: sNote || undefined,
            };
          }
        });

        if (!didSetInitialRef.current) {
          form.setFieldsValue(init);
          didSetInitialRef.current = true;
        }
      } catch (e) {
        message.error(e?.response?.data?.msg || "Failed to load annual assessment.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annualAssestmentId]);

  const handleSaveDraft = async () => {
    if (!canStaffEdit) return;

    try {
      await form.validateFields();
      setSavingDraft(true);

      const payload = buildPayloadFromForm();
      await axiosInstance.post("/annual-assestment/draft", { payload });

      message.success("Draft saved.");
    } catch (e) {
      if (e?.errorFields) {
        message.error("Please complete all required questions.");
      } else {
        message.error(e?.response?.data?.msg || "Failed to save draft.");
      }
    } finally {
      setSavingDraft(false);
    }
  };

  const onFinish = async () => {
    if (!canStaffEdit) return;

    setSubmitting(true);
    try {
      const payload = buildPayloadFromForm();
      await axiosInstance.post("/annual-assestment/submit", { payload });

      message.success("Submitted. HOD has been notified.");
      router.push("/annual-review");
    } catch (e) {
      message.error(e?.response?.data?.msg || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container py-10">
      <Card className="card-box">
        <h1 className="text-xl font-semibold mb-3">Penilaian Tahunan</h1>

        <div className="flex flex-col sm:flex-row items-start gap-5 mb-5">
          <div className="flex-1">
            <div className="mb-4">
              <h3 className="text-sm">
                Formulir ini digunakan untuk mengevaluasi perkembangan kinerja
                dan kualitas pekerjaan Anda selama satu tahun terakhir.
              </h3>
              <h3 className="text-sm">
                Mohon mengisi formulir ini dengan jujur agar dapat membantu
                meningkatkan kinerja serta memperkuat kerja sama dalam tim.
              </h3>
            </div>
            <h4 className="text-sm">Petunjuk Pengisian Formulir:</h4>
            <ol className="text-sm list-decimal list-inside">
              <li>Bacalah setiap pertanyaan dengan saksama.</li>
              <li>Pilih jawaban yang paling sesuai dengan kondisi Anda.</li>
              <li>Kirimkan formulir ini sebelum batas waktu yang ditentukan.</li>
            </ol>

            {isStaffView && assessmentStatus !== "approved" && assessmentStatus !== "finalized" && assessmentStatus !== "draft" ? (
              <div className="mt-3 text-xs text-gray-500">
                Status Anda sudah terkirim. Hasil lengkap akan tersedia dalam PDF setelah disetujui.
              </div>
            ) : null}
          </div>

          <div className="w-full sm:w-auto border border-green-500 rounded-lg p-3 sm:p-5">
            <div className="flex justify-between gap-3 sm:gap-10 mb-3">
              <div className="text-sm">Status:</div>
              <div className="text-sm">
                <Tag
                  color={statusUi.color}
                  variant="outlined"
                  className="rounded-full px-3"
                >
                  {statusUi.label}
                </Tag>
              </div>
            </div>
            <div className="flex justify-between gap-3 sm:gap-10">
              <div className="text-sm">Submit before:</div>
              <div className="text-sm font-bold">{submitBeforeLabel}</div>
            </div>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="border rounded-lg p-3 sm:p-4 lg:p-7 mb-5">
            <div className="hidden sm:grid grid-cols-3 bg-gray-100 font-semibold text-sm ">
              <div className="p-4 border-r">PENILAIAN</div>
              <div className="p-4 border-r">KINERJA</div>
              <div className="p-4">KETERANGAN</div>
            </div>

            {questionsList.map((item, index) => {
              const key = item.key || String(index);
              const showManager = showManagerSectionForItem(item); // ✅ hanya HOD + rating

              return (
                <div key={key}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 sm:border-t text-sm">
                    {/* Penilaian */}
                    <div className="p-2 sm:p-4 sm:border-r">
                      <p className="text-sm font-semibold mb-2">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>

                    {/* Kinerja */}
                    <div className="p-2 sm:p-4 sm:border-r space-y-3">
                      <Form.Item
                        label="Penilaian Pribadi"
                        name={[item.key, "kinerja_pribadi"]}
                        className="mb-0"
                        rules={[
                          { required: true, message: "Penilaian pribadi wajib diisi" },
                        ]}
                      >
                        {renderStaffInput(item)}
                      </Form.Item>

                      {/* ✅ HIDE total untuk staff & non-rating */}
                      {showManager ? (
                        <Form.Item
                          label="Penilaian Manager"
                          name={[item.key, "kinerja_manager"]}
                          className="mb-0"
                          rules={[]}
                        >
                          {renderManagerInput(item)}
                        </Form.Item>
                      ) : null}
                    </div>

                    {/* Keterangan */}
                    <div className="p-2 sm:p-4 space-y-3">
                      <Form.Item
                        label="Catatan Pribadi"
                        name={[item.key, "catatan_pribadi"]}
                        className="mb-0"
                      >
                        <TextArea rows={2} disabled={!canStaffEdit || loading} />
                      </Form.Item>

                      {/* ✅ HIDE total untuk staff & non-rating */}
                      {showManager ? (
                        <Form.Item
                          label="Catatan Manager"
                          name={[item.key, "catatan_manager"]}
                          className="mb-0"
                        >
                          <TextArea rows={2} disabled={true} />
                        </Form.Item>
                      ) : null}
                    </div>
                  </div>

                  <hr className="my-5 sm:hidden" />
                </div>
              );
            })}
          </div>

          <h3 className="text-base font-semibold mb-3">Performance Summary</h3>
          <div className="border rounded-lg p-3 sm:p-4 lg:p-7 mb-5">
            <h4 className="text-sm">
              Over the past year, I have consistently met project deadlines and
              maintained the quality of my work. I took initiative to suggest
              improvements in workflow and supported team members when needed.
              While I achieved most of my targets, I see opportunities to
              further improve my time management during high workload periods.
            </h4>
          </div>

          {/* ✅ Action area */}
          {isStaffView ? (
            <div className="flex items-center justify-center sm:justify-end gap-5">
              {assessmentStatus === "draft" ? (
                <>
                  <Button
                    type="default"
                    color="cyan"
                    variant="outlined"
                    className="px-4"
                    onClick={handleSaveDraft}
                    loading={savingDraft}
                    disabled={!canStaffEdit || loading}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="px-4"
                    loading={submitting}
                    disabled={!canStaffEdit || loading}
                  >
                    Submit
                  </Button>
                </>
              ) : canStaffDownloadPdf ? (
                <Button
                  type="primary"
                  className="px-4"
                  onClick={handleDownloadPdf}
                  icon={<DownloadOutlined />}
                >
                  Download PDF
                </Button>
              ) : null}
            </div>
          ) : null}
        </Form>
      </Card>
    </section>
  );
}
