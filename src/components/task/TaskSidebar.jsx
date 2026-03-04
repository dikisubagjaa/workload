// src/components/task/TaskSidebar.jsx
"use client";

import Image from 'next/image';
import { Button, Dropdown, Popover, Cascader, Tag, Popconfirm, Upload, message } from 'antd';
import axiosInstance from "@/utils/axios";
import { asset } from '@/utils/url';

export default function TaskSidebar({
    taskId,
    priority,
    priorityOptions,
    updateTask,
    departmentOptions,
    loadingDepartments,
    listDepartment,
    fetchDepartment,
    sideBarDisabled,
    handleUploadTask,
    onEditClick
}) {
    const handlePriorityChange = (value) => {
        updateTask("priority", value);
    };

    const handleDepartmentChange = (selected) => {
        console.log(selected);
        const ids = (selected || [])
            .map(path => Array.isArray(path) ? Number(path.at(-1)) : Number(path))
            .filter(Number.isFinite);
        console.log("ids", ids);
        updateTask("department", ids); // ⬅️ kirim array id

    };

    const handleRemoveDepartment = async (depId) => {
        try {
            await axiosInstance.delete(`/task/${taskId}/department/${depId}`);
            message.success("Department removed.");

            // Optional: sinkron UI ringan pakai updateTask (replace full array)
            const newIds = (listDepartment || [])
                .map(d => Number(d.department_id))
                .filter(id => id !== Number(depId));
            updateTask("department", newIds);
        } catch (err) {
            console.error("Delete department error:", err);
            const msg = err?.response?.data?.msg || "Gagal menghapus department";
            message.error(msg);
        }
    };

    return (
        <>
            <ul className="flex sm:flex-col gap-2 mb-5">
                <li>
                    <Dropdown
                        trigger={['click']}
                        disabled={sideBarDisabled}
                        menu={{
                            items: priorityOptions.map((level, index) => ({
                                key: index + 1,
                                label: (
                                    <button
                                        className='w-full text-left'
                                        onClick={() => handlePriorityChange(level)}
                                    >
                                        {level}
                                    </button>
                                ),
                            })),
                        }}
                    >
                        <Button block size='large' className='btn-blue-filled justify-start'>
                            <Image src={asset('static/images/icon/priority_high.png')} width={50} height={50} alt='Priority Icon' className='w-5 h-5' />
                            {priority}
                            <Image src={asset('static/images/icon/arrow_forward_ios.png')} width={50} height={50} alt='Arrow Icon' className='w-4 ms-auto' />
                        </Button>
                    </Dropdown>
                </li>

                <li>
                    <Button block size='large' className='btn-blue-filled justify-start' disabled={sideBarDisabled} onClick={onEditClick}>
                        <Image src={asset('static/images/icon/edit_square.png')} width={50} height={50} alt='Edit Icon' className='w-5 h-5' />
                        <span className='hidden sm:block'>Edit</span>
                    </Button>
                </li>

                <li>
                    <Popover
                        content={(
                            <Cascader
                                className="w-full"
                                options={departmentOptions}
                                labelInValue
                                multiple
                                maxTagCount="responsive"
                                onChange={handleDepartmentChange}
                                loading={loadingDepartments}
                                notFoundContent={loadingDepartments ? null : 'No Data'}
                                value={(listDepartment || []).map(dept => [dept.department_id])}
                            />
                        )}
                        trigger={'click'}
                        placement='bottom'
                        title={<p className='text-sm fc-base min-w-52'>Add Department</p>}
                        onOpenChange={(open) => {
                            if (open && departmentOptions.length === 0) {
                                fetchDepartment();
                            }
                        }}
                    >
                        <Button block size='large' className='btn-blue-filled justify-start' disabled={sideBarDisabled}>
                            <Image src={asset('static/images/icon/group_add.png')} width={50} height={50} alt='Add Dept Icon' className='w-5 h-5' />
                            <span className='hidden sm:block'>Add Dept</span>
                        </Button>
                    </Popover>

                </li>

                <li>
                    <Upload
                        className='ms-auto'
                        showUploadList={false}
                        onChange={handleUploadTask}
                    >
                        <Button block size='large' className='btn-blue-filled justify-start' disabled={sideBarDisabled}>
                            <Image src={asset('static/images/icon/attach_file_add.png')} width={50} height={50} alt='Attachment Icon' className='w-5 h-5' />
                            <span className='hidden sm:block'>Attachment</span>
                        </Button>
                    </Upload>
                </li>
            </ul>

            <h4 className="fc-blue text-base mb-2">Assigned Department</h4>
            <ul className="flex flex-wrap gap-y-1">
                {Array.isArray(listDepartment) && listDepartment.length > 0 &&
                    listDepartment.map((dept) => (
                        <li key={dept.department_id}>
                            <Tag
                                color="#46B8C5"
                                closable
                                onClose={(e) => {
                                    e.preventDefault();
                                    handleRemoveDepartment(dept.department_id);
                                }}
                            >
                                {dept.title}
                            </Tag>
                        </li>
                    ))
                }
            </ul>

        </>
    );
}