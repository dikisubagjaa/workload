"use client";
import Link from "next/link";
import TableUnderReviewList from "@/components/table/TableUnderReview";

export default function ClientReviewSection({ dataTaskReview = [], fetchDashboard }) {
  return (
    <section className='mb-7'>
      <div className="flex justify-between mb-4">
        <p className='fc-base text-lg'>Client Review List</p>
        <Link href={'/task-review'} className='text-[#00939F]'>View All</Link>
      </div>
      <TableUnderReviewList dataTaskReview={dataTaskReview} fetchDashboard={fetchDashboard} />
    </section>
  );
}
