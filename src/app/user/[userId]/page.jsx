// src/app/user/[userId]/page.jsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Card, Form, Input, Select, Switch, Button, message, Spin,
    DatePicker, Row, Col, Skeleton,
} from "antd";
import { LeftOutlined, LoadingOutlined } from "@ant-design/icons";
import axiosInstance from "@/utils/axios";
import dayjs from "dayjs";

const { TextArea } = Input;

// ======= select options (tetap simple; sesuaikan dengan backend) =======
const STATUS_OPTIONS = [
    { value: "new", label: "New" },
    { value: "waiting", label: "Waiting" },
    { value: "active", label: "Active" },
    { value: "banned", label: "Banned" },
];
const USER_TYPE_OPTIONS = [
    { value: "staff", label: "Staff" },
    { value: "probation", label: "Probation" },
    { value: "internship", label: "Internship" },
    { value: "contract", label: "Contract" },
];
const ATTENDANCE_OPTIONS = [
    { value: "anywhere", label: "Anywhere" },
    { value: "office", label: "Office" },
];
const ABSENT_TYPE_OPTIONS = [
    { value: "timeless", label: "Timeless" },
    { value: "timeable", label: "Timeable" },
];
const RELATIONSHIP_OPTIONS = [
    { value: "Spouse", label: "Spouse" },
    { value: "Parent", label: "Parent" },
    { value: "Sibling", label: "Sibling" },
    { value: "Relative", label: "Relative" },
    { value: "Friend", label: "Friend" },
];
const MARITAL_OPTIONS = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "widowed", label: "Widowed" },
    { value: "divorced", label: "Divorced" },
];

// ======= helpers =======
const calcAge = (d) => (d ? dayjs().diff(d, "year") : null);
const toStrBoolEnum = (v) => (v ? "true" : "false"); // ENUM('true','false')

// Aman untuk number (unix seconds / ms), ISO string, atau dayjs instance
const fmtDate = (d) => {
    if (d == null || d === "") return "-";
    let m;
    if (dayjs.isDayjs(d)) {
        m = d;
    } else if (typeof d === "number") {
        // heuristik: > 1e12 dianggap ms, selainnya s
        m = d > 1e12 ? dayjs(d) : dayjs.unix(d);
    } else {
        m = dayjs(d);
    }
    return m.isValid() ? m.format("YYYY-MM-DD") : "-";
};

export default function EditUserProfilePage() {
    const { userId: userIdParam } = useParams();
    const userId = Number(userIdParam);
    const router = useRouter();

    // meta
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const roleOptions = useMemo(
        () => roles.map((r) => ({ value: r.slug ?? r.role_id, label: r.title ?? r.name ?? r.slug })),
        [roles]
    );
    const departmentOptions = useMemo(
        () =>
            departments.map((d) => ({
                value: d.department_id ?? d.id,
                label: d.title ?? d.name ?? String(d.department_id ?? d.id),
            })),
        [departments]
    );
    const [countryCodes, setCountryCodes] = useState([]); // untuk nationality dropdown

    // data
    const [profile, setProfile] = useState(null);
    const [loadingPage, setLoadingPage] = useState(true);
    const [loadingForm, setLoadingForm] = useState(false);

    // per-card edit flags
    const [editTop, setEditTop] = useState(false);
    const [editPersonal, setEditPersonal] = useState(false);
    const [editStatutory, setEditStatutory] = useState(false);
    const [editEmergency, setEditEmergency] = useState(false);
    const [editAccess, setEditAccess] = useState(false);

    // per-card forms
    const [formTop] = Form.useForm();
    const [formPersonal] = Form.useForm();
    const [formStatutory] = Form.useForm();
    const [formEmergency] = Form.useForm();
    const [formAccess] = Form.useForm();

    // ===== meta fetchers =====
    const fetchRoles = useCallback(async () => {
        try {
            const r = await axiosInstance.get("/role");
            setRoles(r.data?.roles || r.data?.data || []);
        } catch { }
    }, []);
    const fetchDepartments = useCallback(async () => {
        try {
            const r = await axiosInstance.get("/department");
            setDepartments(r.data?.departments || r.data?.data || []);
        } catch { }
    }, []);
    const fetchCountryCodes = useCallback(async () => {
        try {
            const r = await axiosInstance.get("/countrycode");
            const list = Array.isArray(r.data?.countryCode) ? r.data.countryCode : [];
            setCountryCodes(list.map((c) => ({ value: c.title, label: c.title })));
        } catch { }
    }, []);

    // ===== data fetcher =====
    const getProfile = useCallback(async () => {
        if (!Number.isInteger(userId)) {
            message.error("Invalid user id");
            router.replace("/user");
            return;
        }
        setLoadingPage(true);
        try {
            // Asumsi: endpoint profil lengkap
            const { data } = await axiosInstance.get(`/profile/${userId}`);
            const p = data?.data || data?.user || data;
            setProfile(p || {});
        } catch (e) {
            console.error(e);
            message.error(e?.response?.data?.msg || e.message || "Failed to load profile");
            router.replace("/user");
        } finally {
            setLoadingPage(false);
        }
    }, [userId, router]);

    useEffect(() => {
        fetchRoles();
        fetchDepartments();
        getProfile();
    }, [fetchRoles, fetchDepartments, getProfile]);

    // ===== prefill handlers =====
    const startEditTop = () => {
        formTop.setFieldsValue({
            jobPosition: profile?.job_position ?? "",
            email: profile?.email ?? "",
            phone: profile?.phone ?? "",
        });
        setEditTop(true);
    };
    const startEditPersonal = () => {
        const bd = profile?.birthdate ? dayjs(profile.birthdate) : null;
        formPersonal.setFieldsValue({
            fullname: profile?.fullname ?? "",
            birthdate: bd,
            age: bd ? calcAge(bd) : null,
            maritalStatus: profile?.marital_status ?? undefined,
            nationality: profile?.nationality ?? undefined,
            address: profile?.address ?? "",
            addressBaseOnId: profile?.address_on_identity ?? "",
        });
        setEditPersonal(true);
    };
    const startEditStatutory = () => {
        const toD = (v) => (v ? dayjs(v) : null);
        formStatutory.setFieldsValue({
            identityNumber: profile?.identity_number ?? "",
            npwpNumber: profile?.npwp_number ?? "",
            taxStartDate: toD(profile?.tax_start_date),

            bankAccountNumber: profile?.bank_account_number ?? "",
            beneficiaryName: profile?.beneficiary_name ?? "",

            bpjsTkRegDate: toD(profile?.bpjs_tk_reg_date),
            bpjsTkTermDate: toD(profile?.bpjs_tk_term_date),
            bpjsTkNumber: profile?.bpjs_tk_number ?? "",
            pensionNumber: profile?.pension_number ?? "",

            bpjsKesRegDate: toD(profile?.bpjs_kes_reg_date),
            bpjsKesTermDate: toD(profile?.bpjs_kes_term_date),
            bpjsKesNumber: profile?.bpjs_kes_number ?? "",
        });
        setEditStatutory(true);
    };
    const startEditEmergency = () => {
        formEmergency.setFieldsValue({
            emergencyFullname: profile?.emergency_fullname ?? "",
            emergencyRelationship: profile?.emergency_relationship ?? undefined,
            emergencyContact: profile?.emergency_contact ?? "",
            emergencyAddress: profile?.emergency_address ?? "",
        });
        setEditEmergency(true);
    };
    const startEditAccess = () => {
        // employment prefill (ambil dari profile.employment.* lalu fallback ke field datar)
        const emp = profile?.employment || {};
        const empStart = emp.start_date ?? profile?.start_date;
        const empEnd = emp.end_date ?? profile?.end_date;

        formAccess.setFieldsValue({
            userRole: profile?.user_role ?? undefined,
            departmentId: profile?.department_id ?? undefined,
            status: profile?.status ?? "new",
            userType: profile?.user_type ?? "staff",
            attendanceType: profile?.attendance_type ?? "anywhere",
            absentType: profile?.absent_type ?? "timeable",
            isTimesheet: String(profile?.is_timesheet ?? "false") === "true",
            joinDate: profile?.join_date ? dayjs.unix(profile.join_date) : null,

            // Employment (contract)
            empContractNumber: emp.contract_number ?? profile?.contract_number ?? "",
            empStartDate: empStart ? dayjs.unix(empStart) : null,
            empEndDate: empEnd ? dayjs.unix(empEnd) : null,
            empDurationMonths: emp.duration_months ?? profile?.duration_months ?? null,
            empSalaryJson: emp.salary_json ?? profile?.salary_json ?? "",

            // Employment (probation)
            empEvaluationNotes: emp.evaluation_notes ?? profile?.evaluation_notes ?? "",
            empRecommendedStatus: emp.recommended_status ?? profile?.recommended_status ?? "",
        });
        setEditAccess(true);
    };

    // ===== submit handlers (PUT per-kartu) =====
    const saveTop = async (vals) => {
        setLoadingForm(true);
        try {
            const payload = {};
            if (vals.jobPosition !== undefined) payload.job_position = vals.jobPosition;
            if (vals.email !== undefined) payload.email = vals.email;
            if (vals.phone !== undefined) payload.phone = vals.phone;
            await axiosInstance.put(`/profile/${profile.user_id}`, payload);
            message.success("General Information Updated!");
            await getProfile();
            setEditTop(false);
        } catch (e) {
            console.error(e);
            message.error(e?.response?.data?.msg || e.message || "Failed to update");
        } finally {
            setLoadingForm(false);
        }
    };

    const savePersonal = async (vals) => {
        setLoadingForm(true);
        try {
            const payload = {};
            if (vals.fullname !== undefined) payload.fullname = vals.fullname;
            if (vals.birthdate !== undefined)
                payload.birthdate = vals.birthdate ? dayjs(vals.birthdate).format("YYYY-MM-DD") : null;
            if (vals.maritalStatus !== undefined) payload.marital_status = vals.maritalStatus;
            if (vals.nationality !== undefined) payload.nationality = vals.nationality;
            if (vals.address !== undefined) payload.address = vals.address;
            if (vals.addressBaseOnId !== undefined) payload.address_on_identity = vals.addressBaseOnId;

            await axiosInstance.put(`/profile/${profile.user_id}`, payload);
            message.success("Personal Information Updated!");
            await getProfile();
            setEditPersonal(false);
        } catch (e) {
            console.error(e);
            message.error(e?.response?.data?.msg || e.message || "Failed to update");
        } finally {
            setLoadingForm(false);
        }
    };

    const saveStatutory = async (vals) => {
        setLoadingForm(true);
        try {
            const payload = {};
            if (vals.identityNumber !== undefined) payload.identity_number = vals.identityNumber;
            if (vals.npwpNumber !== undefined) payload.npwp_number = vals.npwpNumber;
            if (vals.taxStartDate !== undefined)
                payload.tax_start_date = vals.taxStartDate
                    ? dayjs(vals.taxStartDate).format("YYYY-MM-DD")
                    : null;

            if (vals.bankAccountNumber !== undefined) payload.bank_account_number = vals.bankAccountNumber;
            if (vals.beneficiaryName !== undefined) payload.beneficiary_name = vals.beneficiaryName;

            if (vals.bpjsTkRegDate !== undefined)
                payload.bpjs_tk_reg_date = vals.bpjsTkRegDate
                    ? dayjs(vals.bpjsTkRegDate).format("YYYY-MM-DD")
                    : null;
            if (vals.bpjsTkTermDate !== undefined)
                payload.bpjs_tk_term_date = vals.bpjsTkTermDate
                    ? dayjs(vals.bpjsTkTermDate).format("YYYY-MM-DD")
                    : null;
            if (vals.bpjsTkNumber !== undefined) payload.bpjs_tk_number = vals.bpjsTkNumber;
            if (vals.pensionNumber !== undefined) payload.pension_number = vals.pensionNumber;

            if (vals.bpjsKesRegDate !== undefined)
                payload.bpjs_kes_reg_date = vals.bpjsKesRegDate
                    ? dayjs(vals.bpjsKesRegDate).format("YYYY-MM-DD")
                    : null;
            if (vals.bpjsKesTermDate !== undefined)
                payload.bpjs_kes_term_date = vals.bpjsKesTermDate
                    ? dayjs(vals.bpjsKesTermDate).format("YYYY-MM-DD")
                    : null;
            if (vals.bpjsKesNumber !== undefined) payload.bpjs_kes_number = vals.bpjsKesNumber;

            await axiosInstance.put(`/profile/${profile.user_id}`, payload);
            message.success("Statutory Updated!");
            await getProfile();
            setEditStatutory(false);
        } catch (e) {
            console.error(e);
            message.error(e?.response?.data?.msg || e.message || "Failed to update");
        } finally {
            setLoadingForm(false);
        }
    };

    const saveEmergency = async (vals) => {
        setLoadingForm(true);
        try {
            const payload = {};
            if (vals.emergencyFullname !== undefined) payload.emergency_fullname = vals.emergencyFullname;
            if (vals.emergencyRelationship !== undefined)
                payload.emergency_relationship = vals.emergencyRelationship;
            if (vals.emergencyContact !== undefined) payload.emergency_contact = vals.emergencyContact;
            if (vals.emergencyAddress !== undefined) payload.emergency_address = vals.emergencyAddress;

            await axiosInstance.put(`/profile/${profile.user_id}`, payload);
            message.success("Emergency Contact Updated!");
            await getProfile();
            setEditEmergency(false);
        } catch (e) {
            console.error(e);
            message.error(e?.response?.data?.msg || e.message || "Failed to update");
        } finally {
            setLoadingForm(false);
        }
    };

    const saveAccess = async (vals) => {
        setLoadingForm(true);
        try {
            const payload = {
                user_role: vals.userRole ?? null,
                department_id: vals.departmentId ?? null,
                status: vals.status ?? "new",
                user_type: vals.userType ?? "staff",
                attendance_type: vals.attendanceType ?? "anywhere",
                absent_type: vals.absent_type ?? "timeable",
                is_timesheet: toStrBoolEnum(!!vals.isTimesheet),                 // ENUM('true','false')
                join_date: vals.joinDate ? dayjs(vals.joinDate).unix() : null,
            };

            const userTypeVal = vals.userType ?? "staff";

            // Employment payload khusus tipe
            if (userTypeVal === "contract") {
                if (vals.empContractNumber !== undefined) payload.contract_number = vals.empContractNumber || null;
                if (vals.empStartDate !== undefined) payload.start_date = vals.empStartDate ? dayjs(vals.empStartDate).unix() : null;
                if (vals.empEndDate !== undefined) payload.end_date = vals.empEndDate ? dayjs(vals.empEndDate).unix() : null;
                if (vals.empDurationMonths !== undefined) payload.duration_months = vals.empDurationMonths ?? null;
                if (vals.empSalaryJson !== undefined) payload.salary_json = vals.empSalaryJson ?? null;
            } else if (userTypeVal === "probation") {
                if (vals.empEvaluationNotes !== undefined) payload.evaluation_notes = vals.empEvaluationNotes ?? null;
                if (vals.empRecommendedStatus !== undefined) payload.recommended_status = vals.empRecommendedStatus ?? null;
            }

            await axiosInstance.put(`/user/${profile.user_id}`, payload);
            message.success("Account & Access Updated!");
            await getProfile();
            setEditAccess(false);
        } catch (e) {
            console.error(e);
            message.error(e?.response?.data?.msg || e.message || "Failed to update");
        } finally {
            setLoadingForm(false);
        }
    };

    // ===== page =====
    if (loadingPage || !profile) {
        return (
            <section className="container pt-10">
                <Card className="card-box mb-5" title={<h3 className="text-lg">Edit User</h3>}>
                    <Skeleton active paragraph={{ rows: 10 }} />
                </Card>
            </section>
        );
    }

    return (
        <section className="container pt-10">
            {/* ===== Top / General ===== */}
            <Form form={formTop} layout="vertical" onFinish={saveTop}>
                <Card className={`card-box card-form mb-5 ${editTop ? "" : ""}`}>
                    <div className="flex items-center justify-between mb-5">
                        <button className="btn-back fc-base" onClick={() => router.back()}>
                            <h3 className="text-lg font-medium fc-base"><LeftOutlined /> General</h3>
                        </button>
                        {editTop ? (
                            <div className="flex items-center gap-2">
                                <Button onClick={() => { formTop.resetFields(); setEditTop(false); }} disabled={loadingForm}>Cancel</Button>
                                <Button htmlType="submit" className="btn-blue px-4" disabled={loadingForm}>
                                    Save {loadingForm ? <Spin indicator={<LoadingOutlined spin className="text-white" />} size="small" /> : null}
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={startEditTop}>Edit</Button>
                        )}
                    </div>

                    {!editTop ? (
                        <ul className="flex flex-col lg:flex-row lg:gap-6 fc-base text-sm">
                            <li className="min-w-[220px]">
                                <div className="text-xs text-gray-500 mb-1">Position</div>
                                <div className="h-10 flex items-center text-black">{profile?.job_position ?? "-"}</div>
                            </li>
                            <li className="min-w-[220px]">
                                <div className="text-xs text-gray-500 mb-1">Email</div>
                                <div className="h-10 flex items-center text-black">{profile?.email ?? "-"}</div>
                            </li>
                            <li className="min-w-[220px]">
                                <div className="text-xs text-gray-500 mb-1">Phone</div>
                                <div className="h-10 flex items-center text-black">{profile?.phone ?? "-"}</div>
                            </li>
                        </ul>
                    ) : (
                        <Row gutter={[16, 8]}>
                            <Col xs={24} md={8}>
                                <Form.Item name="jobPosition" label="Position" rules={[{ required: true }]}>
                                    <Input size="large" placeholder="Position" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                                    <Input size="large" placeholder="Email" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                                    <Input size="large" type="number" placeholder="Phone" />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}
                </Card>
            </Form>

            {/* ===== Personal Information ===== */}
            <Form form={formPersonal} layout="vertical" onFinish={savePersonal}>
                <Card className={`card-box card-form mb-5`}>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-medium fc-base">Personal Information</h3>
                        {editPersonal ? (
                            <div className="flex items-center gap-2">
                                <Button onClick={() => { formPersonal.resetFields(); setEditPersonal(false); }} disabled={loadingForm}>Cancel</Button>
                                <Button htmlType="submit" className="btn-blue px-4" disabled={loadingForm}>
                                    Save {loadingForm ? <Spin indicator={<LoadingOutlined spin className="text-white" />} size="small" /> : null}
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={() => { startEditPersonal(); fetchCountryCodes(); }}>Edit</Button>
                        )}
                    </div>

                    {!editPersonal ? (
                        <div className="w-full lg:w-2/3 grid grid-cols-2 gap-x-4">
                            <Readonly label="Fullname" value={profile?.fullname} />
                            <Readonly label="Birthdate" value={fmtDate(profile?.birthdate)} />
                            <Readonly label="Age" value={profile?.birthdate ? calcAge(dayjs(profile.birthdate)) : "-"} />
                            <Readonly label="Marital Status" value={profile?.marital_status} />
                            <Readonly label="Nationality" value={profile?.nationality} />
                            <div className="col-span-2"><ReadonlyArea label="Address" value={profile?.address} /></div>
                            <div className="col-span-2"><ReadonlyArea label="Address (based on ID)" value={profile?.address_on_identity} /></div>
                        </div>
                    ) : (
                        <div className="w-full lg:w-2/3">
                            <Row gutter={[16, 8]}>
                                <Col xs={24} md={12}>
                                    <Form.Item name="fullname" label="Fullname" rules={[{ required: true }]}><Input size="large" /></Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="birthdate" label="Birthdate">
                                        <DatePicker className="w-full" format="YYYY-MM-DD" size="large"
                                            onChange={(d) => formPersonal?.setFieldsValue?.({ age: calcAge(d) })} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="age" label="Age"><Input size="large" type="number" disabled /></Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="maritalStatus" label="Marital Status" rules={[{ required: true }]}>
                                        <Select size="large" options={MARITAL_OPTIONS} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="nationality" label="Nationality" rules={[{ required: true }]}>
                                <Select size="large" showSearch options={countryCodes} onDropdownVisibleChange={(o) => o && fetchCountryCodes()} />
                            </Form.Item>

                            <Form.Item name="address" label="Address" rules={[{ required: true }]}>
                                <TextArea autoSize={{ minRows: 3, maxRows: 5 }} />
                            </Form.Item>
                            <Form.Item name="addressBaseOnId" label="Address (based on ID)" rules={[{ required: true }]}>
                                <TextArea autoSize={{ minRows: 3, maxRows: 5 }} />
                            </Form.Item>
                        </div>
                    )}
                </Card>
            </Form>

            {/* ===== Statutory ===== */}
            <Form form={formStatutory} layout="vertical" onFinish={saveStatutory}>
                <Card className={`card-box card-form mb-5`}>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-medium fc-base">Statutory</h3>
                        {editStatutory ? (
                            <div className="flex items-center gap-2">
                                <Button onClick={() => { formStatutory.resetFields(); setEditStatutory(false); }} disabled={loadingForm}>Cancel</Button>
                                <Button htmlType="submit" className="btn-blue px-4" disabled={loadingForm}>
                                    Save {loadingForm ? <Spin indicator={<LoadingOutlined spin className="text-white" />} size="small" /> : null}
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={startEditStatutory}>Edit</Button>
                        )}
                    </div>

                    {!editStatutory ? (
                        <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                            <Readonly label="Identity Number" value={profile?.identity_number} />
                            <Readonly label="NPWP Number (16 Digits)" value={profile?.npwp_number} />
                            <Readonly label="Tax Start Date" value={fmtDate(profile?.tax_start_date)} />

                            <Readonly label="Bank Account Number - BCA" value={profile?.bank_account_number} />
                            <Readonly label="Beneficiary Name" value={profile?.beneficiary_name} />

                            <Readonly label="BPJS TK Registration Date" value={fmtDate(profile?.bpjs_tk_reg_date)} />
                            <Readonly label="BPJS TK Termination Date" value={fmtDate(profile?.bpjs_tk_term_date)} />
                            <Readonly label="BPJS TK Number" value={profile?.bpjs_tk_number} />
                            <Readonly label="Pension Number" value={profile?.pension_number} />

                            <Readonly label="BPJS KS Registration Date" value={fmtDate(profile?.bpjs_kes_reg_date)} />
                            <Readonly label="BPJS KS Termination Date" value={fmtDate(profile?.bpjs_kes_term_date)} />
                            <Readonly label="BPJS KS Number" value={profile?.bpjs_kes_number} />
                        </div>
                    ) : (
                        <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                            <Form.Item name="identityNumber" label="Identity Number" rules={[{ required: true }]}><Input type="number" size="large" /></Form.Item>
                            <Form.Item name="npwpNumber" label="NPWP Number (16 Digits)"><Input type="number" size="large" /></Form.Item>
                            <Form.Item name="taxStartDate" label="Tax Start Date"><DatePicker size="large" className="w-full" format="YYYY-MM-DD" /></Form.Item>

                            <Form.Item name="bankAccountNumber" label="Bank Account Number - BCA" rules={[{ required: true }]}><Input type="number" size="large" /></Form.Item>
                            <Form.Item name="beneficiaryName" label="Beneficiary Name - BCA" rules={[{ required: true }]}><Input size="large" /></Form.Item>

                            <Form.Item name="bpjsTkRegDate" label="BPJS TK Registration Date"><DatePicker size="large" className="w-full" format="YYYY-MM-DD" /></Form.Item>
                            <Form.Item name="bpjsTkTermDate" label="BPJS TK Termination Date"><DatePicker size="large" className="w-full" format="YYYY-MM-DD" /></Form.Item>
                            <Form.Item name="bpjsTkNumber" label="BPJS TK Number"><Input type="number" size="large" /></Form.Item>
                            <Form.Item name="pensionNumber" label="Pension Number"><Input type="number" size="large" /></Form.Item>

                            <Form.Item name="bpjsKesRegDate" label="BPJS KS Registration Date"><DatePicker size="large" className="w-full" format="YYYY-MM-DD" /></Form.Item>
                            <Form.Item name="bpjsKesTermDate" label="BPJS KS Termination Date"><DatePicker size="large" className="w-full" format="YYYY-MM-DD" /></Form.Item>
                            <Form.Item name="bpjsKesNumber" label="BPJS KS Number"><Input type="number" size="large" /></Form.Item>
                        </div>
                    )}
                </Card>
            </Form>

            {/* ===== Account & Access (role/department/status/flags + EMPLOYMENT dinamis) ===== */}
            <Form form={formAccess} layout="vertical" onFinish={saveAccess}>
                <Card className="card-box card-form mb-5">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-medium fc-base">Account & Access</h3>
                        {editAccess ? (
                            <div className="flex items-center gap-2">
                                <Button onClick={() => { formAccess.resetFields(); setEditAccess(false); }} disabled={loadingForm}>Cancel</Button>
                                <Button htmlType="submit" className="btn-blue px-4" disabled={loadingForm}>
                                    Save {loadingForm ? <Spin indicator={<LoadingOutlined spin className="text-white" />} size="small" /> : null}
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={startEditAccess}>Edit</Button>
                        )}
                    </div>

                    {!editAccess ? (
                        <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                            <Readonly label="Role" value={profile?.user_role} />
                            <Readonly label="Department" value={profile?.department_title || profile?.department_id} />
                            <Readonly label="Status" value={profile?.status} />
                            <Readonly label="User Type" value={profile?.user_type} />
                            <Readonly label="Attendance Type" value={profile?.attendance_type} />
                            <Readonly label="Absent Type" value={profile?.absent_type} />
                            <Readonly label="Timesheet" value={String(profile?.is_timesheet) === "true" ? "Yes" : "No"} />
                            <Readonly label="Join Date" value={fmtDate(profile?.join_date)} />

                            {/* Employment view-only */}
                            {profile?.user_type === "contract" && (
                                <>
                                    <div className="col-span-2 mt-4 font-medium">Employment (Contract)</div>
                                    <Readonly label="Contract Number" value={profile?.employment?.contract_number ?? profile?.contract_number} />
                                    <Readonly label="Start Date" value={fmtDate(profile?.employment?.start_date ?? profile?.start_date)} />
                                    <Readonly label="End Date" value={fmtDate(profile?.employment?.end_date ?? profile?.end_date)} />
                                    <Readonly label="Duration (months)" value={profile?.employment?.duration_months ?? profile?.duration_months} />
                                    <div className="col-span-2"><ReadonlyArea label="Salary JSON" value={profile?.employment?.salary_json ?? profile?.salary_json} /></div>
                                </>
                            )}
                            {profile?.user_type === "probation" && (
                                <>
                                    <div className="col-span-2 mt-4 font-medium">Employment (Probation)</div>
                                    <div className="col-span-2"><ReadonlyArea label="Evaluation Notes" value={profile?.employment?.evaluation_notes ?? profile?.evaluation_notes} /></div>
                                    <Readonly label="Recommended Status" value={profile?.employment?.recommended_status ?? profile?.recommended_status} />
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="w-full lg:w-2/3">
                            <Row gutter={[16, 8]}>
                                <Col xs={24} md={12}>
                                    <Form.Item name="userRole" label="Role">
                                        <Select options={roleOptions} showSearch optionFilterProp="label" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="departmentId" label="Department">
                                        <Select options={departmentOptions} allowClear showSearch optionFilterProp="label" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item name="status" label="Status">
                                        <Select options={STATUS_OPTIONS} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="userType" label="User Type">
                                        <Select options={USER_TYPE_OPTIONS} />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item name="attendanceType" label="Attendance Type">
                                        <Select options={ATTENDANCE_OPTIONS} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="absentType" label="Absent Type">
                                        <Select options={ABSENT_TYPE_OPTIONS} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="joinDate" label="Join Date">
                                        <DatePicker className="w-full" format="YYYY-MM-DD" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={8}><Form.Item name="isTimesheet" valuePropName="checked" label="Timesheet"><Switch /></Form.Item></Col>
                            </Row>

                            {/* ===== EMPLOYMENT Dynamic Subform ===== */}
                            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.userType !== cur.userType}>
                                {({ getFieldValue }) => {
                                    const ut = getFieldValue("userType");
                                    if (ut === "contract") {
                                        return (
                                            <div className="mt-4">
                                                <div className="text-base font-medium mb-2">Employment (Contract)</div>
                                                <Row gutter={[16, 8]}>
                                                    <Col xs={24} md={12}>
                                                        <Form.Item name="empContractNumber" label="Contract Number" rules={[{ required: true }]}>
                                                            <Input size="large" placeholder="e.g. CTR-001/HR/2025" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} md={12}>
                                                        <Form.Item name="empDurationMonths" label="Duration (months)" rules={[{ required: true }]}>
                                                            <Input size="large" type="number" placeholder="e.g. 12" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} md={12}>
                                                        <Form.Item name="empStartDate" label="Start Date" rules={[{ required: true }]}>
                                                            <DatePicker className="w-full" format="YYYY-MM-DD" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} md={12}>
                                                        <Form.Item name="empEndDate" label="End Date" rules={[{ required: false }]}>
                                                            <DatePicker className="w-full" format="YYYY-MM-DD" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Form.Item name="empSalaryJson" label="Salary JSON" tooltip="Simpan string JSON dari FE, contoh: { &quot;base&quot;: 6000000, &quot;allowance&quot;: 1500000 }">
                                                            <TextArea autoSize={{ minRows: 3, maxRows: 6 }} placeholder='{"base":6000000,"allowance":1500000}' />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            </div>
                                        );
                                    }
                                    if (ut === "probation") {
                                        return (
                                            <div className="mt-4">
                                                <div className="text-base font-medium mb-2">Employment (Probation)</div>
                                                <Form.Item name="empEvaluationNotes" label="Evaluation Notes" rules={[{ required: true }]}>
                                                    <TextArea autoSize={{ minRows: 3, maxRows: 6 }} placeholder="Ringkasan evaluasi probation..." />
                                                </Form.Item>
                                                <Form.Item name="empRecommendedStatus" label="Recommended Status" rules={[{ required: true }]}>
                                                    <Input size="large" placeholder='Mis: "promote to contract" / "extend probation"' />
                                                </Form.Item>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            </Form.Item>
                        </div>
                    )}
                </Card>
            </Form>
        </section>
    );
}

// ===== view-mode utility components (simple, tanpa border) =====
function Readonly({ label, value }) {
    return (
        <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="h-10 flex items-center text-black">{value ?? "-"}</div>
        </div>
    );
}
function ReadonlyArea({ label, value }) {
    return (
        <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="text-black whitespace-pre-line">{value ?? "-"}</div>
        </div>
    );
}
