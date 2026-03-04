"use client";

import TableProjectList from "@/components/table/TableProjectList";

export default function ProjectList({
  title = "Ongoing Projects",
  projects,
  loading,
  onDeleteClick,
  onChangeStatus,
}) {
  return (
    <section className="mb-7">
      <p className="fc-base text-lg mb-4">{title}</p>
      <TableProjectList
        dataSource={projects}
        loading={loading}
        onDeleteClick={onDeleteClick}
        onChangeStatus={onChangeStatus}
      />
    </section>
  );
}
