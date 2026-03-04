"use client";
import Link from "next/link";
import TableTaskHod from "@/components/table/TableTaskHod";

 

export default function TaskListHodSection({ dataTask = [], onChangeStatus, dataSession = [] }) {

  return (
    <section className='mb-7'>
      <div className="flex justify-between mb-4">
        <p className='fc-base text-lg'>Task List HOD</p>
        <Link href={'/task-hod'} className='text-[#00939F]'>View All</Link>
      </div>
      <TableTaskHod dataTask={dataTask} onChangeStatus={onChangeStatus} dataSession={dataSession}/>
    </section>
  );
}
