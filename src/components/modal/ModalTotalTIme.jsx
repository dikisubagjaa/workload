import Image from 'next/image';
import { Button, Form, Input, message, Modal, Spin, TimePicker } from 'antd';
import { useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { asset } from '@/utils/url';

const format = 'HH:mm';

export default function ModalTotalTime({ modalTotalTime, setModalTotalTime }) {
    const [form] = Form.useForm();
    const [editTime, setEditTime] = useState(false);
    const [loadingForm, setLoadingForm] = useState(false);

    const formTime = async (values) => {
        // submit success
        setLoadingForm(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setLoadingForm(false);
        message.success('Form Submitted');
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setModalTotalTime(false);
        setEditTime(false);
    }

    return (
        <>
            <Modal
                open={modalTotalTime}
                onCancel={handleCloseModal}
                width={500}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={formTime}
                    layout="vertical"
                >
                    {/* header */}
                    <div className="flex items-center gap-3 border-b pb-3 fc-base mb-3">
                        <Image
                            src={asset('static/images/icon/alarm-blue.png')}
                            alt=''
                            width={50}
                            height={50}
                            className='w-6'
                        />
                        <h3 className="text-base">Total Time Spent</h3>
                    </div>

                    {/* content */}
                    <div className="text-center py-8 px-0 sm:px-10">
                        <h3 className="text-lg fc-base mb-7">You spend <span className="fc-blue font-semibold">3h 13m</span> for this task.</h3>
                        {editTime === false ?
                            <div className="flex justify-center gap-5">
                                <Button
                                    size='large'
                                    color="primary"
                                    variant="outlined"
                                    onClick={() => setEditTime(true)}
                                >
                                    Edit
                                </Button>

                                <Button
                                    size='large'
                                    className="btn-success px-7"
                                >
                                    Yes
                                </Button>
                            </div>
                            :
                            <>
                                {/* edit form */}
                                <Form.Item
                                    name="timeSpend"
                                    className='mb-5'
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <TimePicker
                                        placeholder='Write your actual time spend'
                                        format={format}
                                        className='w-full text-center'
                                        size="large"
                                    />
                                </Form.Item>

                                <div className="flex justify-center gap-5">
                                    <Button
                                        size='large'
                                        color="danger"
                                        variant="filled"
                                        className='px-5'
                                        onClick={() => setEditTime(false)}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        size='large'
                                        htmlType="submit"
                                        className="btn-blue px-5"
                                    >
                                        Save
                                        {loadingForm ?
                                            <Spin indicator={<LoadingOutlined spin className='text-white' />} size="small" />
                                            : null
                                        }
                                    </Button>
                                </div>
                            </>
                        }
                    </div>
                </Form>
            </Modal >
        </>
    )
}
