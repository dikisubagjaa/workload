"use client";
import Link from "next/link";
import TableTask from "@/components/table/TableTask";

 

export default function TaskListSection({ dataTask = [], onChangeStatus, dataSession = [] }) {

  return (
    <section className='mb-7'>
      <div className="flex justify-between mb-4">
        <p className='fc-base text-lg'>Task List</p>
        <Link href={'tasks'} className='text-[#00939F]'>View All</Link>
      </div>
      <TableTask dataTask={dataTask} onChangeStatus={onChangeStatus} dataSession={dataSession}/>
    </section>
  );
}
