// src/app/leave/create/page.jsx
import { Card } from 'antd';
import FormLeave from '@/components/leave/FormLeave';

export const metadata = {
    title: 'Create Leave',
    description: 'Create a leave request',
};

export default function Create() {
    return (
        <section className="container pt-10">
            <div className="flex justify-center">
                <Card
                    className="card-box fc-base w-full xl:w-1/2 mb-5"
                    title={<h2 className="font-semibold text-base">Leave Form</h2>}
                >
                    <FormLeave />
                </Card>
            </div>
        </section>
    );
}
