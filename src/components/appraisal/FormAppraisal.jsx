// src/components/appraisal/FormAppraisal.jsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Button, Card, Divider, Input, message, Select, Space, Tag } from "antd";
import axiosInstance from "@/utils/axios";
import { useRouter } from "next/navigation";

const { TextArea } = Input;

const RATING_OPTIONS = [
  { value: 1, label: "1 - Tidak Memuaskan" },
  { value: 2, label: "2 - Kurang Memuaskan" },
  { value: 3, label: "3 - Cukup Memuaskan" },
  { value: 4, label: "4 - Memuaskan" },
  { value: 5, label: "5 - Sangat Memuaskan" },
];

// kamu bisa tambah opsi status kerja sesuai kebutuhan (probation/kontrak/tetap)
const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "", label: "-" },
  { value: "Baru Masuk", label: "Baru Masuk" },
  { value: "Diangkat Karyawan Kontrak", label: "Diangkat Karyawan Kontrak" },
  { value: "Diangkat Karyawan Tetap", label: "Diangkat Karyawan Tetap" },
];

function safeText(v, fallback = "-") {
  const s = (v ?? "").toString().trim();
  return s ? s : fallback;
}

function computeGrade(avg) {
  const a = Number(avg || 0);
  if (a >= 4.1) return "A";
  if (a >= 3.0) return "B";
  if (a >= 2.0) return "C";
  if (a >= 1.1) return "D";
  return "E";
}

function calcScore(questions, answers) {
  const qs = Array.isArray(questions) ? questions : [];
  const ans = answers && typeof answers === "object" ? answers : {};

  let total = 0;
  let answered = 0;

  for (const q of qs) {
    const key = String(q.question_id);
    const raw = ans[key];
    const v = raw && typeof raw === "object" ? raw.value : raw;
    const n = v == null || v === "" ? NaN : Number(v);

    if (Number.isFinite(n)) {
      total += n;
      answered += 1;
    }
  }

  const count = qs.length || 0;
  const avg = count ? total / count : 0;
  return {
    total: Number(total.toFixed(2)),
    avg: Number(avg.toFixed(3)),
    grade: computeGrade(avg),
    answered,
    count,
  };
}

function normalizeAnswersFromRow(row) {
  const answers = row?.answers_json && typeof row.answers_json === "object" ? row.answers_json : {};
  // pastikan bentuknya { [qid]: {value, note} }
  const out = {};
  for (const [k, v] of Object.entries(answers)) {
    if (v && typeof v === "object") {
      const n = v.value == null || v.value === "" ? null : Number(v.value);
      out[String(k)] = {
        value: Number.isFinite(n) ? n : null,
        note: typeof v.note === "string" ? v.note : "",
      };
    } else {
      const n = v == null || v === "" ? null : Number(v);
      out[String(k)] = { value: Number.isFinite(n) ? n : null, note: "" };
    }
  }
  return out;
}

export default function FormAppraisal({ initialRow, onReload, onRowChange }) {
  const router = useRouter();

  const appraisalId = initialRow?.appraisal_id ?? initialRow?.id;
  const status = String(initialRow?.status || "draft");

  const staff = initialRow?.staff_snapshot_json || {};
  const emp = initialRow?.employment_snapshot_json || {};
  const questions = Array.isArray(initialRow?.questions_json) ? initialRow.questions_json : [];

  const [answers, setAnswers] = useState(() => normalizeAnswersFromRow(initialRow));
  const [beforeStatus, setBeforeStatus] = useState(emp?.before_status || "");
  const [afterStatus, setAfterStatus] = useState(emp?.after_status || "");
  const [generalComment, setGeneralComment] = useState(initialRow?.general_comment || "");

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isReadOnly = status !== "draft";

  const score = useMemo(() => calcScore(questions, answers), [questions, answers]);

  // debounced autosave
  const autosaveTimer = useRef(null);
  const queueAutosave = useCallback(() => {
    if (isReadOnly) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      handleSave({ silent: true });
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReadOnly, answers, beforeStatus, afterStatus, generalComment]);

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, []);

  const handleSave = useCallback(
    async ({ silent } = { silent: false }) => {
      if (!appraisalId) return;
      if (isReadOnly) return;

      setSaving(true);
      try {
        const payload = {
          answers,
          beforeStatus,
          afterStatus,
          generalComment,
        };

        const { data } = await axiosInstance.put(`/appraisal/${appraisalId}`, payload);
        if (!data?.success) throw new Error(data?.msg || "Failed to save");

        const nextRow = data?.data;
        if (nextRow) {
          onRowChange?.(nextRow);
        }

        if (!silent) message.success("Saved");
      } catch (e) {
        console.error(e);
        if (!silent) message.error(e?.message || "Failed to save");
      } finally {
        setSaving(false);
      }
    },
    [appraisalId, isReadOnly, answers, beforeStatus, afterStatus, generalComment, onRowChange]
  );

  const handleSubmit = useCallback(async () => {
    if (!appraisalId) return;

    // validasi cepat FE (backend juga validasi)
    for (const q of questions) {
      const qid = String(q.question_id);
      const v = answers?.[qid]?.value;
      const n = v == null || v === "" ? NaN : Number(v);
      if (!Number.isFinite(n) || n < 1 || n > 5) {
        message.error(`Question ${q.sort_order} belum diisi (1-5).`);
        return;
      }
    }

    setSubmitting(true);
    try {
      // pastiin save terakhir
      await handleSave({ silent: true });

      const { data } = await axiosInstance.post("/appraisal/submit", { appraisalId });
      if (!data?.success) throw new Error(data?.msg || "Failed to submit");

      message.success("Submitted");
      await onReload?.(); // refresh draft -> status berubah
      router.push("/appraisal"); // balik ke history
    } catch (e) {
      console.error(e);
      message.error(e?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }, [appraisalId, questions, answers, handleSave, onReload, router]);

  const setAnswerValue = (questionId, value) => {
    setAnswers((prev) => {
      const next = { ...(prev || {}) };
      const key = String(questionId);
      const cur = next[key] && typeof next[key] === "object" ? next[key] : { value: null, note: "" };
      next[key] = { ...cur, value };
      return next;
    });
    queueAutosave();
  };

  const setAnswerNote = (questionId, note) => {
    setAnswers((prev) => {
      const next = { ...(prev || {}) };
      const key = String(questionId);
      const cur = next[key] && typeof next[key] === "object" ? next[key] : { value: null, note: "" };
      next[key] = { ...cur, note };
      return next;
    });
    queueAutosave();
  };

  const headerRight = (
    <Space>
      <Button onClick={() => router.push("/appraisal")}>Back</Button>

      <Button
        onClick={() => window.open(`/api/appraisal/pdf?appraisalId=${appraisalId}`, "_blank")}
      >
        PDF
      </Button>

      <Button
        type="primary"
        className="btn-blue-filled"
        loading={saving}
        disabled={isReadOnly}
        onClick={() => handleSave({ silent: false })}
      >
        Save
      </Button>

      <Button
        type="primary"
        danger
        loading={submitting}
        disabled={isReadOnly}
        onClick={handleSubmit}
      >
        Submit
      </Button>
    </Space>
  );

  return (
    <div className="flex flex-col gap-4">
      <Card
        className="card-box"
        title={<div className="text-base">{safeText(initialRow?.title, "Appraisal")}</div>}
        extra={headerRight}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold">Staff</div>
            <div>{safeText(staff.fullname)}</div>
            <div className="text-xs">{safeText(staff.job_position)}</div>
            <div className="text-xs">{safeText(staff.email)}</div>
            <div className="text-xs">{safeText(staff.phone)}</div>
          </div>

          <div>
            <div className="font-semibold">Score</div>
            <div className="flex items-center gap-2 mt-1">
              <div>
                <div className="text-xs">Total</div>
                <div className="font-semibold">{score.total}</div>
              </div>
              <Divider type="vertical" />
              <div>
                <div className="text-xs">Average</div>
                <div className="font-semibold">{score.avg}</div>
              </div>
              <Divider type="vertical" />
              <div>
                <div className="text-xs">Grade</div>
                <div className="font-semibold">
                  <Tag color={score.grade === "A" ? "green" : "default"}>{score.grade}</Tag>
                </div>
              </div>
              <Divider type="vertical" />
              <div>
                <div className="text-xs">Answered</div>
                <div className="font-semibold">
                  {score.answered}/{score.count}
                </div>
              </div>
            </div>

            <div className="mt-2">
              <Tag>{status}</Tag>
              {isReadOnly ? (
                <Tag color="gold">Read only</Tag>
              ) : (
                <Tag color="blue">Editable</Tag>
              )}
            </div>
          </div>
        </div>

        <Divider />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-semibold mb-1">Before</div>
            <Select
              className="w-full"
              value={beforeStatus}
              disabled={isReadOnly}
              options={EMPLOYMENT_STATUS_OPTIONS}
              onChange={(v) => {
                setBeforeStatus(v);
                queueAutosave();
              }}
              placeholder="-"
            />
          </div>

          <div>
            <div className="text-sm font-semibold mb-1">After</div>
            <Select
              className="w-full"
              value={afterStatus}
              disabled={isReadOnly}
              options={EMPLOYMENT_STATUS_OPTIONS}
              onChange={(v) => {
                setAfterStatus(v);
                queueAutosave();
              }}
              placeholder="-"
            />
          </div>
        </div>
      </Card>

      <Card className="card-box" title="Evaluasi / Penilaian">
        <div className="flex flex-col gap-4">
          {questions
            .slice()
            .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
            .map((q) => {
              const qid = String(q.question_id);
              const cur = answers?.[qid] || { value: null, note: "" };

              return (
                <div key={qid} className="border rounded-xl p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold">
                        Q{q.sort_order}. {safeText(q.title, "-")}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {safeText(q.description, "")}
                      </div>
                    </div>

                    <div className="w-full md:w-[320px]">
                      <div className="text-xs mb-1">Rating (1–5)</div>
                      <Select
                        className="w-full"
                        value={cur.value ?? null}
                        disabled={isReadOnly}
                        options={RATING_OPTIONS}
                        onChange={(v) => setAnswerValue(q.question_id, v)}
                        placeholder="Select..."
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs mb-1">Note (optional)</div>
                    <TextArea
                      value={cur.note || ""}
                      disabled={isReadOnly}
                      onChange={(e) => setAnswerNote(q.question_id, e.target.value)}
                      rows={2}
                      placeholder="Catatan tambahan (opsional)"
                    />
                  </div>
                </div>
              );
            })}
        </div>

        <Divider />

        <div>
          <div className="text-sm font-semibold mb-1">General Comment</div>
          <TextArea
            value={generalComment}
            disabled={isReadOnly}
            onChange={(e) => {
              setGeneralComment(e.target.value);
              queueAutosave();
            }}
            rows={4}
            placeholder="Komentar umum..."
          />
        </div>

        <Divider />

        <div className="text-xs text-slate-600">
          <div className="font-semibold">Grading Rule</div>
          <div>A: average ≥ 4.1</div>
          <div>B: average ≥ 3.0</div>
          <div>C: average ≥ 2.0</div>
          <div>D: average ≥ 1.1</div>
          <div>E: below 1.1</div>
        </div>
      </Card>
    </div>
  );
}
