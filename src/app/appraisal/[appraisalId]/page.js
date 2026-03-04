// src/app/appraisal/[appraisalId]/page.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Button, message, Tag } from "antd";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";

export default function AppraisalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appraisalId = params?.appraisalId;

  const [loading, setLoading] = useState(false);
  const [row, setRow] = useState(null);

  const fetchDetail = useCallback(async () => {
    if (!appraisalId) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/appraisal/${appraisalId}`);
      if (!data?.success) throw new Error(data?.msg || "Failed to load detail");
      setRow(data?.data || null);
    } catch (e) {
      message.error(e?.message || "Failed to load appraisal detail");
    } finally {
      setLoading(false);
    }
  }, [appraisalId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return (
    <section className="container pt-10">
      <Card
        className="card-box"
        loading={loading}
        title={<h3 className="text-lg">Appraisal Detail</h3>}
        extra={
          <div className="flex gap-2">
            <Button onClick={() => router.back()}>Back</Button>
            <Button
              type="primary"
              className="btn-blue-filled"
              onClick={() => window.open(`/api/appraisal/pdf?appraisalId=${appraisalId}`, "_blank")}
            >
              PDF
            </Button>
          </div>
        }
      >
        {!row ? (
          <div>-</div>
        ) : (
          <div className="text-sm leading-6">
            <div><b>Title:</b> {row.title || "-"}</div>
            <div>
              <b>Status:</b>{" "}
              <Tag>{row.status || "-"}</Tag>
            </div>
            <div className="mt-3">
              <b>Staff Snapshot:</b>
              <pre className="mt-2 text-xs bg-slate-50 p-3 rounded-lg overflow-auto">
                {JSON.stringify(row.staff_snapshot_json || {}, null, 2)}
              </pre>
            </div>
            <div className="mt-3">
              <b>Questions:</b>
              <pre className="mt-2 text-xs bg-slate-50 p-3 rounded-lg overflow-auto">
                {JSON.stringify(row.questions_json || [], null, 2)}
              </pre>
            </div>
            <div className="mt-3">
              <b>Answers:</b>
              <pre className="mt-2 text-xs bg-slate-50 p-3 rounded-lg overflow-auto">
                {JSON.stringify(row.answers_json || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}
