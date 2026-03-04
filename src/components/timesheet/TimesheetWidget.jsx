// /src/components/timesheet/TimesheetWidgets.jsx
"use client"
import 'swiper/css';
import 'swiper/css/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from "next/image";
import { Card } from "antd";
import { asset } from "@/utils/url";
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useMobileQuery, useDekstopQuery, useLaptopQuery } from '../libs/UseMediaQuery';

// Fungsi helper untuk format durasi dari menit
const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

export default function TimesheetWidget({ timesheetData }) {
    const isDekstop = useDekstopQuery();
    const isLaptop = useLaptopQuery();
    const isMobile = useMobileQuery();

    const stats = useMemo(() => {
        const now = dayjs();
        const today = now.format('YYYY-MM-DD');
        const yesterday = now.subtract(1, 'day').format('YYYY-MM-DD');
        const startOfWeek = now.startOf('week');
        const endOfWeek = now.endOf('week');

        const todayEntries = timesheetData.filter(item => item.date === today);
        const yesterdayEntries = timesheetData.filter(item => item.date === yesterday);
        const thisWeekEntries = timesheetData.filter(item =>
            dayjs(item.date).isAfter(startOfWeek.subtract(1, 'day')) && dayjs(item.date).isBefore(endOfWeek.add(1, 'day'))
        );

        const todayMinutes = todayEntries.reduce((sum, item) => sum + item.duration_minutes, 0);
        const yesterdayMinutes = yesterdayEntries.reduce((sum, item) => sum + item.duration_minutes, 0);
        const thisWeekMinutes = thisWeekEntries.reduce((sum, item) => sum + item.duration_minutes, 0);

        // Assuming tasks have a 'status' property
        const tasks = timesheetData.flatMap(entry => entry.tasks || []);
        const doneTasks = tasks.filter(task => task.status === 'completed').length;
        const pendingTasks = tasks.filter(task => task.status === 'pending').length;
        const overdueTasks = tasks.filter(task => task.status === 'overdue').length;

        return {
            today: formatDuration(todayMinutes),
            yesterday: formatDuration(yesterdayMinutes),
            thisWeek: formatDuration(thisWeekMinutes),
            taskEntries: todayEntries.length,
            doneTasks,
            pendingTasks,
            overdueTasks,
        };
    }, [timesheetData]);

    const widgetData = [
        {
            imageUrl: asset('static/images/icon/alarm-blue-lg.png'),
            title: 'Yesterday Total Hours',
            count: stats.yesterday,
        },
        {
            imageUrl: asset('static/images/icon/alarm-blue-lg.png'),
            title: 'This Week Total Hours',
            count: stats.thisWeek,
        },
        {
            imageUrl: asset('static/images/icon/check-blue-lg.png'),
            title: 'Task Done',
            count: stats.doneTasks,
            color: 'text-[#0FA3B1]',
        },
        {
            imageUrl: asset('static/images/icon/arrow-upload.png'),
            title: 'Task Pending',
            count: stats.pendingTasks,
            color: 'text-[#E8B931]',
        },
        {
            imageUrl: asset('static/images/icon/error.png'),
            title: 'Task Overdue',
            count: stats.overdueTasks,
            color: 'text-[#C00F0C]',
        },
    ];

    return (
        <Swiper
            spaceBetween={15}
            className='py-2 mb-5'
            slidesPerView={isDekstop ? 1 : 5}
            width={isDekstop ? 250 : null}
        >
            {widgetData.map((item, index) => (
                <SwiperSlide key={index}>
                    <Card bordered={false} className='card-box'>
                        <div className="flex items-center gap-3">
                            <Image src={item.imageUrl} width={50} height={50} alt='' className='w-8' />
                            <div className="fc-base">
                                <h3 className="text-sm">{item.title}</h3>
                                <h4 className={`text-2xl font-medium ${item.color}`}>{item.count}</h4>
                            </div>
                        </div>
                    </Card>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
