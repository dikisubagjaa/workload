// src/app/profile/MainContent.jsx
"use client";

import dayjs from "dayjs";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, useMemo } from "react";
import axiosInstance from "@/utils/axios";
import {
  Alert,
  Avatar,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  message,
  Select,
  Spin,
  Upload,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

import ProfileTopCard from "@/components/profile/ProfileTopCard";
import ProfilePersonalInfoCard from "@/components/profile/ProfilePersonalInfoCard";
import ProfileStatutoryCard from "@/components/profile/ProfileStatutoryCard";
import ProfileEmergencyContactCard from "@/components/profile/ProfileEmergencyContactCard";

import { getProfileImageUrl } from "@/utils/storageHelpers";

// Fallback 15 detik jika ENV tidak ada
const PROFILE_POLL_MS = parseInt(process.env.NEXT_PUBLIC_PROFILE_POLL_MS ?? "15000", 10);

const { TextArea } = Input;

export default function MainContent({ slug }) {
  const [profileData, setProfileData] = useState(null);
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();
  const [form4] = Form.useForm();

  // flags edit per kartu
  const [cardTop, setCardTop] = useState(false);
  const [cardPersonal, setCardPersonal] = useState(false);
  const [cardStatutory, setCardStatutory] = useState(false);
  const [cardEmergency, setCardEmergency] = useState(false);
  const isEditing = cardTop || cardPersonal || cardStatutory || cardEmergency;

  const [loading, setLoading] = useState(false);
  const [loadingForm1, setLoadingForm1] = useState(false);
  const [loadingForm2, setLoadingForm2] = useState(false);
  const [loadingForm3, setLoadingForm3] = useState(false);
  const [loadingForm4, setLoadingForm4] = useState(false);

  const [loadingAvatarUpload, setLoadingAvatarUpload] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [lastStatus, setLastStatus] = useState(null);

  const { data: session, status, update } = useSession();
  const router = useRouter();

  const sessionUserId = useMemo(
    () => session?.user?.user_id ?? session?.user?.id ?? null,
    [session]
  );

  // Jangan auto-open kartu lain untuk user tanpa role

  const refreshProfile = useCallback(
    async (silent = false) => {
      if (status !== "authenticated") return;
      const idOrSlug = slug ?? sessionUserId;
      if (!idOrSlug) return;

      if (!silent) setLoading(true);
      try {
        const response = await axiosInstance.get(`/profile/${idOrSlug}`);
        const data = response.data.user;
        setProfileData(data);
        setImageUrl(
          data.profile_pic ? getProfileImageUrl(data.profile_pic, { resized: true }) : ""
        );
      } catch (error) {
        message.error("Gagal mengambil data profil.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [status, sessionUserId, slug]
  );

  // initial fetch
  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }
    refreshProfile(false);
  }, [status, sessionUserId, slug, refreshProfile]);

  const role = session?.user?.user_role;
  const isPrivileged = role === "superadmin" || role === "hrd";

  const canEditPersonal = useMemo(() => {
    const profileUserId = profileData?.user_id ?? profileData?.id ?? null;
    return !!(
      (sessionUserId && profileUserId && sessionUserId === profileUserId) ||
      isPrivileged
    );
  }, [sessionUserId, profileData, isPrivileged]);

  // melihat profil sendiri?
  const isSelfProfile = useMemo(() => {
    const pid = profileData?.user_id ?? profileData?.id;
    return pid && sessionUserId && String(pid) === String(sessionUserId);
  }, [profileData, sessionUserId]);

  const isNewProfile = useMemo(
    () => String(profileData?.status || "").toLowerCase() === "new",
    [profileData?.status]
  );
  const isWaitingProfile = useMemo(
    () => String(profileData?.status || "").toLowerCase() === "waiting",
    [profileData?.status]
  );
  const isActiveProfile = useMemo(
    () => String(profileData?.status || "").toLowerCase() === "active",
    [profileData?.status]
  );

  const canEditTop = isPrivileged || (isSelfProfile && !isNewProfile);
  const canEditOther = isPrivileged;

  useEffect(() => {
    if (!canEditTop && cardTop) setCardTop(false);
    if (!canEditPersonal && cardPersonal) setCardPersonal(false);
    if (!canEditOther && cardStatutory) setCardStatutory(false);
    if (!canEditOther && cardEmergency) setCardEmergency(false);
  }, [
    canEditTop,
    canEditPersonal,
    canEditOther,
    cardTop,
    cardPersonal,
    cardStatutory,
    cardEmergency,
  ]);

  // Saat status user BERUBAH menjadi active (bukan setiap render), refresh JWT session,
  // set cookie bypass middleware, lalu arahkan ke dashboard.
  useEffect(() => {
    if (status !== "authenticated") return;
    if (!isSelfProfile) return;
    const currentStatus = String(profileData?.status || "").toLowerCase();
    const wasStatus = String(lastStatus || "").toLowerCase();

    // redirect hanya saat transisi non-active -> active
    if (currentStatus !== "active") return;
    if (!wasStatus || wasStatus === "active") return;

    let cancelled = false;
    const promoteSessionAndRedirect = async () => {
      try {
        // sinkron dengan middleware pending gate
        document.cookie = "wl_act=1; Path=/; Max-Age=86400; SameSite=Lax";
        document.cookie = `wl_ck_ts=${Date.now()}; Path=/; Max-Age=300; SameSite=Lax`;
        await update?.();
      } catch {
        // no-op: tetap lanjut redirect
      }
      if (!cancelled) router.replace("/dashboard");
    };

    promoteSessionAndRedirect();
    return () => {
      cancelled = true;
    };
  }, [status, isSelfProfile, profileData?.status, lastStatus, update, router]);

  // polling hanya saat status belum active, dan TIDAK saat edit
  useEffect(() => {
    if (status !== "authenticated") return;
    if (!isSelfProfile) return;

    const st = profileData?.status;
    if (!st || st === "active") return; // aktif = tidak perlu polling profil
    if (isEditing) return; // pause polling saat edit

    const t = setInterval(() => {
      refreshProfile(true);
    }, PROFILE_POLL_MS);

    return () => clearInterval(t);
  }, [status, isSelfProfile, profileData?.status, refreshProfile, isEditing]);

  // Notifikasi perubahan status untuk user sendiri
  useEffect(() => {
    if (!isSelfProfile) return;
    const st = String(profileData?.status || "").toLowerCase() || null;
    if (!st) return;
    if (lastStatus && lastStatus !== st) {
      if (st === "waiting") {
        message.info("Profil sudah dikirim. Menunggu verifikasi HRD.");
      } else if (st === "active") {
        message.success("Profil sudah aktif. Anda bisa mulai menggunakan sistem.");
      }
    }
    setLastStatus(st);
  }, [profileData?.status, isSelfProfile, lastStatus]);

  // === Ganti seluruh fungsi ini di MainContent.jsx ===
  const handleUpload = async (info) => {
    const fileObj = info?.file?.originFileObj;
    if (!fileObj) return;

    // pakai userId yang pasti ada
    const userId = profileData?.user_id ?? sessionUserId;
    if (!userId) {
      message.error("Target user not found for upload.");
      return;
    }

    try {
      setLoadingAvatarUpload(true);

      const formData = new FormData();
      formData.append("file", fileObj);

      const response = await axiosInstance.post(`/profile/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = response?.data || {};
      const ok = result?.ok ?? (response.status >= 200 && response.status < 300);
      const apiFilename = result?.filename ?? result?.data?.filename ?? "";
      const apiUrlRaw = result?.url ?? result?.data?.url ?? "";

      if (!ok) {
        console.error("Upload gagal:", result?.error || response.status);
        message.error(`Upload foto profil gagal: ${result?.error || response.status}`);
        return;
      }

      // URL preview (pakai dari API; fallback build dari filename)
      const previewUrl = apiUrlRaw || (apiFilename ? getProfileImageUrl(apiFilename, { resized: true }) : "");
      const ts = Date.now();

      // opsional: langsung tampilkan preview sambil nunggu refetch (cache-bust pakai ts)
      if (previewUrl) {
        setImageUrl(`${previewUrl}${previewUrl.includes("?") ? "&" : "?"}v=${ts}`);
      }

      // refetch supaya state profil sinkron (filename terbaru, dsb.)
      await refreshProfile(true);

      // broadcast ke Navbar & Drawer biar avatar ikut ganti real-time
      window.dispatchEvent(new CustomEvent("avatar:updated", {
        detail: { userId, url: previewUrl, filename: apiFilename, ts }
      }));
      try {
        localStorage.setItem(`avatarVersion:${userId}`, String(ts));
        if (apiFilename) localStorage.setItem(`avatarFilename:${userId}`, apiFilename);
        if (previewUrl) localStorage.setItem(`avatarUrl:${userId}`, previewUrl);
      } catch { }

      message.success("Upload foto profil berhasil!");
    } catch (error) {
      console.error("Error saat upload:", error);
      message.error(
        `Terjadi kesalahan saat upload foto profil: ${error.response?.data?.msg || error.message}`
      );
    } finally {
      setLoadingAvatarUpload(false);
    }
  };


  // === Re-populate form: skip saat EDIT agar input user tidak ketimpa ===
  useEffect(() => {
    if (!profileData) return;
    if (isEditing) return;

    form1?.setFieldsValue?.({
      jobPosition: profileData.job_position,
      email: profileData.email || "",
      phone: profileData.phone || "",
      join_date: profileData?.join_date ? dayjs.unix(profileData.join_date) : null,
    });

    form2?.setFieldsValue?.({
      fullname: profileData.fullname,
      birthdate: profileData?.birthdate ? dayjs(profileData.birthdate) : null,
      age: profileData?.birthdate ? dayjs().diff(dayjs(profileData.birthdate), "year") : null,
      maritalStatus: profileData.marital_status || "",
      nationality: profileData.nationality || "-",
      address: profileData.address || "-",
      addressBaseOnId: profileData.address_on_identity || "-",
    });

    form3?.setFieldsValue?.({
      identityNumber: profileData.identity_number || "-",
      identityType: profileData.identity_type || "-",
      npwpNumber: profileData.npwp_number || "-",
      taxStartDate: profileData?.tax_start_date ? dayjs(profileData.tax_start_date) : null,
      bankCode: profileData.bank_code || "-",
      bankAccountNumber: profileData.bank_account_number || "-",
      beneficiaryName: profileData.beneficiary_name || "-",
      currency: profileData.currency || "-",
      bpjsTkRegDate: profileData?.bpjs_tk_reg_date ? dayjs(profileData.bpjs_tk_reg_date) : null,
      bpjsTkTermDate: profileData?.bpjs_tk_term_date ? dayjs(profileData.bpjs_tk_term_date) : null,
      bpjsTkNumber: profileData.bpjs_tk_number || "-",
      pensionNumber: profileData.pension_number || "-",
      bpjsKesRegDate: profileData?.bpjs_kes_reg_date ? dayjs(profileData.bpjs_kes_reg_date) : null,
      bpjsKesTermDate: profileData?.bpjs_kes_term_date ? dayjs(profileData.bpjs_kes_term_date) : null,
      bpjsKesNumber: profileData.bpjs_kes_number || "-",
    });

    form4?.setFieldsValue?.({
      emergencyFullname: profileData.emergency_fullname || "-",
      emergencyRelationship: profileData.emergency_relationship || "-",
      emergencyContact: profileData.emergency_contact || "-",
      emergencyAddress: profileData.emergency_address || "-",
    });
  }, [profileData, isEditing, form1, form2, form3, form4]);

  return (
    <section className="container pt-10" id="profile-main">
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <p>Loading profile data...</p>
        </div>
      ) : (
        profileData && (
          <>
            {profileData.status === "waiting" ? (
              <Alert
                message="Profil sudah dikirim. Menunggu verifikasi HRD."
                type="warning"
                className="mb-3"
                showIcon
                closable
              />
            ) : null}

            {profileData.status === "new" || !profileData.job_position ? (
              <Alert
                message="Please Fill this Profile Form"
                type="warning"
                className="mb-3"
                showIcon
                closable
              />
            ) : null}

            {isActiveProfile && (
              <Alert
                message="Profil sudah aktif. Jika ada data yang perlu diubah, hubungi HRD."
                type="success"
                className="mb-3"
                showIcon
                closable
                action={
                  isSelfProfile ? (
                    status === "authenticated" ? (
                      <Button size="small" type="primary" onClick={() => router.replace("/dashboard")}>
                        Go to Dashboard
                      </Button>
                    ) : (
                      <Button size="small" type="primary" onClick={() => router.replace("/login-form")}>
                        Go to Login
                      </Button>
                    )
                  ) : null
                }
              />
            )}

            <ProfileTopCard
              form={form1}
              profileData={profileData}
              cardTop={cardTop}
              setCardTop={setCardTop}
              loadingForm={loadingForm1}
              setLoadingForm={setLoadingForm1}
              handleUpload={handleUpload}
              imageUrl={imageUrl}
              loadingAvatarUpload={loadingAvatarUpload}
              onUpdated={refreshProfile}
              canUpdate={canEditTop}
            />

            <ProfilePersonalInfoCard
              form={form2}
              profileData={profileData}
              cardPersonal={cardPersonal}
              setCardPersonal={setCardPersonal}
              loadingForm={loadingForm2}
              setLoadingForm={setLoadingForm2}
              onUpdated={refreshProfile}
              canUpdate={canEditPersonal}
            />

            <ProfileStatutoryCard
              form={form3}
              profileData={profileData}
              cardStatutory={cardStatutory}
              setCardStatutory={setCardStatutory}
              loadingForm={loadingForm3}
              setLoadingForm={setLoadingForm3}
              session={session}
              onUpdated={refreshProfile}
              canUpdate={canEditOther}
            />

            <ProfileEmergencyContactCard
              form={form4}
              profileData={profileData}
              cardEmergency={cardEmergency}
              setCardEmergency={setCardEmergency}
              loadingForm={loadingForm4}
              setLoadingForm={setLoadingForm4}
              session={session}
              onUpdated={refreshProfile}
              canUpdate={canEditOther}
            />
          </>
        )
      )}
    </section>
  );
}
