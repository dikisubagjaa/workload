// src/components/task/TaskDescription.jsx
"use client"; // Tambahkan ini!

import { Form, Input } from 'antd';

const { TextArea } = Input;

export default function TaskDescription({ isDisabled }) {
    return (
        <Form.Item
            name="description"
            rules={[{ required: true, message: 'Please input description!' }]}
        >
            <TextArea
                disabled={isDisabled}
                placeholder="Write description here"
                autoSize
                className='min-h-28'
            />
        </Form.Item>
    );
}