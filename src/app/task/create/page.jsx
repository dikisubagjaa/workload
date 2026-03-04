"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ModalTask from "@/components/modal/ModalTask";

export default function CreateTaskPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialProjectId = useMemo(() => {
        const raw = searchParams.get("project");
        const parsed = Number(raw);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }, [searchParams]);

    const returnTo = useMemo(() => {
        const raw = searchParams.get("returnTo");
        return raw && raw.startsWith("/") ? raw : "/task";
    }, [searchParams]);

    return (
        <ModalTask
            mode="page"
            modalTask={true}
            initialProjectId={initialProjectId}
            onCancel={() => router.push(returnTo)}
        />
    );
}
