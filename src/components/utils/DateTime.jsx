"use client"
import { useState, useEffect } from "react";

export default function DateTime() {
    const [currentTime, setcurrentTime] = useState(new Date());
    const [hydrated, setHydrated] = useState(false);

    const getDateTime = () => {
        const now = currentTime
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const options = { day: 'numeric', month: 'long', year: 'numeric' };

        const day = now.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedTime = `${hours}:${minutes}:${seconds}`;
        const formatedDate = now.toLocaleDateString('en-US', options);

        return { formattedTime, formatedDate, day };
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            setcurrentTime(new Date());
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        setHydrated(true);
    }, []);

    if (!hydrated) {
        return null;
    }

    const { formatedDate, formattedTime, day } = getDateTime();

    return (
        <>
            <div className="flex items-center justify-end gap-1">
                <h3 className="text-xs sm:text-base nunito-reg">{day},</h3>
                <h3 className="text-xs sm:text-base nunito-reg">{formatedDate}</h3>
                <h3 className='text-xs sm:text-base nunito-reg'>{formattedTime} WIB</h3>
            </div>
        </>
    )
}