// src/app/project/[projectId]/page.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { faChevronLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Card, Collapse, Tooltip } from "antd";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DrawerClient from "@/components/utils/DrawerClient";
import ModalProject from "@/components/modal/ModalProject";
import TableDetailProject from "@/components/table/TableDetailProject";
import ProjectStats from "@/components/project/ProjectStats";

export default function Page() {
    const { projectId } = useParams() || {};
    const router = useRouter();
    const [modalProject, setModalProject] = useState(false);
    const [drawerClient, setDrawerClient] = useState(false);

    // state dinamis untuk judul project (dan info dasar lain jika diperlukan)
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let abort = false;
        async function load() {
            if (!projectId) return;
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/project/${projectId}`, { cache: "no-store" });
                const json = await res.json();
                if (!res.ok || !json?.data) {
                    throw new Error(json?.msg || "Failed to load project");
                }
                if (!abort) setProject(json.data || null);
            } catch (e) {
                if (!abort) setError(e?.message || "Failed to load project");
            } finally {
                if (!abort) setLoading(false);
            }
        }
        load();
        return () => {
            abort = true;
        };
    }, [projectId]);

    // === Client button dynamics ===
    const { clientName, hasClient } = useMemo(() => {
        const c = project?.Client || project?.client || null;
        const name = c?.client_name || c?.name || "-";
        const exists = !!(c && (c.client_id || c.id));
        return { clientName: name, hasClient: exists };
    }, [project]);

    // HANYA 2 panel: On Going + Completed
    // statusGroup dipakai nanti di TableDetailProject (ongoing/completed)
    const itemsCollapse = [
        {
            key: "1",
            label: "On Going Project",
            children: (
                <TableDetailProject
                    statusGroup="ongoing"
                />
            ),
        },
        {
            key: "2",
            label: "Completed Project",
            children: (
                <TableDetailProject
                    statusGroup="completed"
                />
            ),
        },
    ];

    return (
        <>
            <section className="container py-10">
                <div className="flex items-center justify-between mb-5">
                    <h1 className="sm:text-xl lg:text-3xl">Projects</h1>
                    <Button className="btn-blue-filled" onClick={() => setModalProject(true)}>
                        <FontAwesomeIcon icon={faPlus} /> Register Project
                    </Button>
                </div>

                <Card className="card-box">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
                        <Link href="/project">
                            <h4 className="text-sm sm:text-lg fc-base">
                                <FontAwesomeIcon icon={faChevronLeft} />{" "}
                                {error ? "Project not found" : loading ? "Loading..." : project?.title || "-"}
                            </h4>
                        </Link>

                        <div className="flex items-center gap-3 mx-auto sm:mx-0 sm:ms-auto">
                            <Tooltip title={hasClient ? "Open client details" : "No client on this project"}>
                                <Button
                                    color="primary"
                                    variant="outlined"
                                    disabled={!hasClient}
                                    onClick={() => hasClient && setDrawerClient(true)}
                                >
                                    {hasClient ? `Client: ${clientName}` : "Client: -"}
                                </Button>
                            </Tooltip>

                            <Button
                                color="primary"
                                variant="outlined"
                                onClick={() =>
                                    router.push(`/task/create?project=${projectId}&returnTo=${encodeURIComponent(`/project/${projectId}`)}`)
                                }
                            >
                                <FontAwesomeIcon icon={faPlus} /> Add Task
                            </Button>
                        </div>
                    </div>

                    {/* default buka panel On Going Project */}
                    <Collapse defaultActiveKey={["1"]} items={itemsCollapse} expandIconPosition="end" />
                </Card>
            </section>

            {/* Modal */}
            <ModalProject modalProject={modalProject} setModalProject={setModalProject} />

            {/* drawer client */}
            <DrawerClient
                drawerClient={drawerClient}
                setDrawerClient={setDrawerClient}
                client={project?.Client || project?.client}
                teamMembers={project?.members ?? []}
            />
        </>
    );
}
