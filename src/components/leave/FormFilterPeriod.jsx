// src/components/leave/FormFilterPeriod.jsx
"use client"
import { useState } from 'react';
import { Input, DatePicker, Button, Select, Form } from 'antd';
import { RiResetLeftLine } from 'react-icons/ri';
import { SearchOutlined } from '@ant-design/icons';

export default function FormFilterPeriod({ onFilter }) {
    const [period, setPeriod] = useState('period');
    const [form] = Form.useForm();


    const submit = (values) => {
        if (period === 'today') {
            onFilter && onFilter({ period: 'today', q: values.q || '' });
        } else {
            onFilter && onFilter({
                period: 'period',
                from: values.from?.format('YYYY-MM-DD'),
                to: values.to?.format('YYYY-MM-DD'),
                q: values.q || '',
            });
        }
    };

    const reset = () => {
        form.resetFields();
        setPeriod('period');
        onFilter && onFilter({ period: 'period', q: '' });
    };

    return (
        <Form
            form={form}
            name="leaveFilter"
            layout="vertical"
            onFinish={submit}
            autoComplete="off"
            initialValues={{ period: 'today' }}
        >
            <div className="grid grid-cols-1 sm:grid-cols-5 lg:grid-cols-7 gap-x-3 mb-5">
                <Form.Item name="from">
                    <DatePicker className="w-full" />
                </Form.Item>

                <Form.Item name="to">
                    <DatePicker className="w-full" />
                </Form.Item>

                <Form.Item name="q" className="lg:col-span-3">
                    <Input placeholder="Search" allowClear suffix={<SearchOutlined />} />
                </Form.Item>

                <Form.Item>
                    <Button onClick={reset} className='w-full'><RiResetLeftLine /> Reset</Button>
                </Form.Item>

                <Form.Item>
                    <Button htmlType="submit" type="primary" className='w-full'>Submit</Button>
                </Form.Item>
            </div>
        </Form>
    );
}
