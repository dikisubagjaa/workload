"use client";
import Link from "next/link";
import TableProject from "@/components/table/TableProject";

export default function OngoingProjects({ projectOnGoing = [] }) {
  return (
    <section className="mb-7">
      <div className="flex justify-between mb-4">
        <p className="fc-base text-lg">Ongoing Projects</p>
        <Link href="/projects" className="text-[#00939F]">
          View All
        </Link>
      </div>
      <TableProject dataProject={projectOnGoing} />
    </section>
  );
}
