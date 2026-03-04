// src/components/task/TaskDetailForm.jsx
"use client";

import { Form, Select, DatePicker, TimePicker, Button } from 'antd';
import dayjs from 'dayjs';

const format = 'HH:mm';

export default function TaskDetailForm({
    isDisabled,
    quotationOptions,
    poOptions,
    loadingQuotations, // Tambahkan ini
    loadingPOs, // Tambahkan ini
    fetchQuotation,
    fetchPo,
    form, // form instance dari parent
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
                name="pq_id"
                label="Quotation Number"
                rules={[{ required: true, message: 'Please select Quotation Number!' }]}
            >
                <Select
                    showSearch
                    placeholder="Quotation Numbers"
                    size='large'
                    disabled={isDisabled}
                    loading={loadingQuotations} // Gunakan loading prop
                    notFoundContent={loadingQuotations ? null : 'No Data'}
                    onDropdownVisibleChange={(open) => { 
                        if (open) {
                            fetchQuotation(form.getFieldValue('projectId')); 
                        }
                    }}
                    onChange={(quotationId) => {
                        fetchPo(quotationId);
                        form.setFieldsValue({ po_id: undefined });
                    }}
                    options={quotationOptions.map((item) => ({
                        label: item.quotation_number,
                        value: item.pq_id,
                    }))}
                />
            </Form.Item>

            <Form.Item
                name="po_id"
                label="PO Number"
                rules={[{ required: true, message: 'Please select PO Number!' }]}
            >
                <Select
                    showSearch
                    placeholder="PO Numbers"
                    disabled={isDisabled}
                    size='large'
                    loading={loadingPOs} // Gunakan loading prop
                    notFoundContent={loadingPOs ? null : 'No Data'} // Sembunyikan "No Data" saat loading
                    options={poOptions.map((item) => ({
                        label: item.po_number,
                        value: item.po_id,
                    }))}
                />
            </Form.Item>

            {/* ... sisanya tetap sama ... */}
            <Form.Item label="JE Numbers">
                <Button className='btn-blue rounded-md w-full' size='large' disabled>Cooming Soon</Button>
            </Form.Item>

            <Form.Item label="Actual Spending">
                <Button className='btn-blue rounded-md w-full' size='large' disabled>Cooming Soon</Button>
            </Form.Item>

            <Form.Item
                name="startDate"
                label="Start Date"
                rules={[{ required: true, message: 'Please select Start Date!' }]}
            >
                <DatePicker
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                    size='large'
                    className='w-full'
                    disabled={isDisabled}
                />
            </Form.Item>

            <Form.Item
                name="endDate"
                label="End Date"
                rules={[{ required: true, message: 'Please select End Date!' }]}
            >
                <DatePicker
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                    size='large'
                    className='w-full'
                    disabled={isDisabled}
                />
            </Form.Item>
        </div>
    );
}
