// src/components/utils/DrawerClient.jsx
"use client";

import { Avatar, Drawer } from "antd";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

export default function DrawerClient({ drawerClient, setDrawerClient, client, teamMembers = [] }) {
    const isMobile = useMobileQuery();

    const safe = (val) => (val ? val : "-");

    // --- Normalize brand (JSON / array / string) ---
    const normalizeBrand = (brand) => {
        if (!brand) return "-";
        if (typeof brand === "string") return brand;

        if (Array.isArray(brand)) {
            const items = brand
                .map((it) => {
                    if (it == null) return null;
                    if (typeof it === "string") return it;
                    if (typeof it === "object") return it.name ?? it.label ?? it.title ?? null;
                    return String(it);
                })
                .filter(Boolean);
            return items.length ? items.join(", ") : "-";
        }

        if (typeof brand === "object") {
            return brand.name ?? brand.label ?? brand.title ?? "-";
        }

        return String(brand);
    };

    const picName = safe(client?.pic_name);
    const picEmail = safe(client?.pic_email);
    const picPhone = safe(client?.pic_phone);

    const financeName = safe(client?.finance_name);
    const financeEmail = safe(client?.finance_email);
    const financePhone = safe(client?.finance_phone);

    const clientName = safe(client?.client_name);
    const address = safe(client?.Company?.address);
    const brandText = normalizeBrand(client?.brand);

    // --- Normalize team members ---
    const members = Array.isArray(teamMembers) ? teamMembers : [];
    const initial = (name) => (name ? String(name).trim().charAt(0).toUpperCase() : "?");

    return (
        <Drawer
            open={drawerClient}
            className="drawer-profile shadow-2xl"
            classNames={{ mask: "custom-mask", header: "pt-3" }}
            onClose={() => setDrawerClient(false)}
            zIndex={isMobile ? 3 : 4}
            width={isMobile ? "100%" : 400}
        >
            <div className="p-7 fc-base">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl">
                        {clientName}
                    </h2>
                    <button className="text-xl hover text-red-400" onClick={() => setDrawerClient(false)}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <hr className="my-5" />

                {/* PIC Section */}
                <div className="flex items-center gap-3 mb-7">
                    <Avatar size={50}>{picName && picName !== "-" ? initial(picName) : "?"}</Avatar>
                    <div>
                        <h3 className="text-base font-medium">{picName}</h3>
                        <h4 className="text-sm text-gray-400">PIC / Contact Person</h4>
                    </div>
                </div>

                <ul className="flex flex-col gap-5 mb-8">
                    <li className="flex items-center gap-2">
                        <Image src="/static/images/icon/mail.png" width={50} height={50} alt="" className="w-4" />
                        <h3 className="text-sm">{picEmail}</h3>
                    </li>
                    <li className="flex items-center gap-2">
                        <Image src="/static/images/icon/call.png" width={50} height={50} alt="" className="w-4" />
                        <h3 className="text-sm">{picPhone}</h3>
                    </li>
                </ul>

                {/* Client details */}
                <h3 className="text-base font-medium mb-3">Client Details</h3>
                <ul className="flex flex-col gap-5 mb-8">
                    <li className="flex items-center gap-2">
                        <Image src="/static/images/icon/finance.png" width={50} height={50} alt="" className="w-4" />
                        <h3 className="text-sm">{financeEmail}</h3>
                    </li>
                    <li className="flex items-center gap-2">
                        <Image src="/static/images/icon/call.png" width={50} height={50} alt="" className="w-4" />
                        <h3 className="text-sm">{financePhone}</h3>
                    </li>
                    <li className="flex items-center gap-2">
                        <Image src="/static/images/icon/money_bag.png" width={50} height={50} alt="" className="w-4" />
                        <h3 className="text-sm">{financeName}</h3>
                    </li>
                    <li className="flex items-center gap-2">
                        <Image src="/static/images/icon/work.png" width={50} height={50} alt="" className="w-4" />
                        <h3 className="text-sm">{brandText}</h3>
                    </li>
                    <li className="flex items-center gap-2">
                        <Image src="/static/images/icon/location.png" width={50} height={50} alt="" className="w-4" />
                        <h3 className="text-sm">{safe(address)}</h3>
                    </li>
                </ul>

                {/* Team Members */}
                <h3 className="text-base font-medium mb-3">Team Members</h3>
                {members.length ? (
                    <Avatar.Group max={{ count: 5 }}>
                        {members.map((m) => {
                            const key = m?.user_id ?? m?.id ?? m?.fullname ?? Math.random();
                            const name = m?.fullname || "-";
                            const pic = m?.profile_pic || null;
                            return (
                                <Avatar key={key} size="large" src={pic || undefined}>
                                    {!pic ? initial(name) : null}
                                </Avatar>
                            );
                        })}
                    </Avatar.Group>
                ) : (
                    <span className="text-xs text-[#98A2B3]">-</span>
                )}
            </div>
        </Drawer>
    );
}
