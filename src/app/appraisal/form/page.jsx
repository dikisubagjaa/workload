"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, message, Select, Button, Space } from "antd";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import axiosInstance from "@/utils/axios";
import { fetchUsers as fetchUsersList, getUserLabel } from "@/utils/userHelpers";
import FormAppraisal from "@/components/appraisal/FormAppraisal";
import { useSession } from "next-auth/react";

function isTrue(v) {
  return v === true || v === "true" || v === 1 || v === "1";
}

function safeText(v, fallback = "-") {
  const s = (v ?? "").toString().trim();
  return s ? s : fallback;
}

export default function AppraisalFormPage() {
  const { data: session, status: sessionStatus } = useSession();
  const isSuperadmin = useMemo(
    () => isTrue(session?.user?.is_superadmin),
    [session]
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const title =
    searchParams?.get("title") || "Performance Appraisal (Probation Period)";

  const staffIdFromUrl = searchParams?.get("staffId") || "";
  const [targetStaffId, setTargetStaffId] = useState(staffIdFromUrl);

  const [staffOptions, setStaffOptions] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [row, setRow] = useState(null);

  useEffect(() => {
    setTargetStaffId(staffIdFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffIdFromUrl]);

  const fetchStaff = useCallback(async (keyword = "") => {
    setStaffLoading(true);
    try {
      const list = await fetchUsersList({ q: keyword || undefined, limit: 50 });
      setStaffOptions(
        list.slice(0, 50).map((u) => ({
          value: String(u.user_id ?? u.id),
          label: `${safeText(getUserLabel(u))} (${safeText(u.email, "-")})`,
        }))
      );
    } catch {
      // ignore
    } finally {
      setStaffLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === "loading") return;

    // 🚫 Staff biasa: tidak boleh akses form
    if (!isSuperadmin) {
      setRow(null);
      return;
    }

    fetchStaff("");
  }, [sessionStatus, isSuperadmin, fetchStaff]);

  const fetchDraft = useCallback(
    async (staffIdArg = "") => {
      if (!isSuperadmin) return;
      if (!staffIdArg) return;

      setLoading(true);
      try {
        const params = { staffId: staffIdArg, title };

        const { data } = await axiosInstance.get("/appraisal/draft", { params });
        if (!data?.success) throw new Error(data?.msg || "Failed to load draft");
        setRow(data?.data || null);
      } catch (e) {
        console.error(e);
        message.error(e?.message || "Failed to load appraisal draft");
      } finally {
        setLoading(false);
      }
    },
    [isSuperadmin, title]
  );

  useEffect(() => {
    if (!isSuperadmin) return;
    if (targetStaffId) fetchDraft(targetStaffId);
  }, [isSuperadmin, targetStaffId, fetchDraft]);

  const applyStaffToUrl = (staffId) => {
    const sp = new URLSearchParams(searchParams?.toString() || "");
    if (staffId) sp.set("staffId", String(staffId));
    else sp.delete("staffId");
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  return (
    <section className="container pt-10">
      <Card
        className="card-box"
        loading={loading}
        title={<h3 className="text-lg">Appraisal Form</h3>}
        extra={
          isSuperadmin ? (
            <Space wrap>
              <Select
                value={targetStaffId || undefined}
                placeholder="Select staff"
                options={staffOptions}
                loading={staffLoading}
                showSearch
                filterOption={false}
                onSearch={(kw) => fetchStaff(kw)}
                onChange={(v) => setTargetStaffId(v || "")}
                style={{ width: 320 }}
              />
              <Button
                type="primary"
                className="btn-blue-filled"
                onClick={() => {
                  if (!targetStaffId) {
                    message.warning("Please select staff.");
                    return;
                  }
                  applyStaffToUrl(targetStaffId);
                }}
              >
                Load
              </Button>
              <Button
                onClick={() => {
                  setTargetStaffId("");
                  applyStaffToUrl("");
                  setRow(null);
                }}
              >
                Clear
              </Button>
            </Space>
          ) : null
        }
      >
        {!isSuperadmin ? (
          <div className="text-sm text-slate-600">
            Forbidden. Only superadmin can fill appraisal.
          </div>
        ) : !targetStaffId ? (
          <div className="text-sm text-slate-600">
            Select a staff first to open/create their appraisal draft.
          </div>
        ) : !row ? null : (
          <FormAppraisal
            initialRow={row}
            onReload={() => fetchDraft(targetStaffId)}
            onRowChange={(nextRow) => setRow(nextRow)}
          />
        )}
      </Card>
    </section>
  );
}
