import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';
import MainContent from './MainContent';

export const metadata = {
    title: 'VPD Workload',
    description: 'VPD Workload',
};

export default async function Reason() {
    const session = await getServerSession();
    if (session && session?.user) {
        redirect('/dashboard')
    }

    return (
        <MainContent />
    )
}