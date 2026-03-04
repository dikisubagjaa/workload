"use client"
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, Button, Card, Form, Input, Modal, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Time from '@/components/utils/Time';
import { useState } from 'react';

const { TextArea } = Input;

const props = {
    name: 'file',
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    headers: {
        authorization: 'authorization-text',
    },
    onChange(info) {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    },
};

export default function MainContent() {
    const [modalInfo, setModalInfo] = useState(true);

    return (
        <>
            <Link href={'/'} className='fixed z-10 top-5 left-5'>
                <h1>
                    <Image
                        priority
                        src={asset('static/images/logo.png')}
                        width={300}
                        height={300}
                        alt='Logo'
                        className='w-36'
                    />
                </h1>
            </Link>

            <section className="bg-login py-28 sm:py-0">
                <div className="container relative">
                    <div className="flex flex-col items-center justify-center min-h-screen">
                        <Card
                            variant="outlined"
                            style={{
                                width: 350,
                            }}
                            className='py-10 px-5 mb-6 shadow-xl rounded-2xl'
                            classNames={{
                                body: 'p-0'
                            }}
                        >
                            <div className='text-center'>
                                <h2 className="text-3xl fc-blue mb-1">VP WORKLOAD</h2>
                                <h3 className="text-gray-500">PT. Alpha Guna Media</h3>
                                <hr className='my-5' />
                            </div>

                            <div className="text-center mb-4">
                                <Avatar src="https://awsimages.detik.net.id/visual/2024/04/01/elon-musk-reutersguglielmo-mangiapanefile-photo_169.jpeg?w=1200" size={60} className='mb-2' />
                                <h3 className="text-base fc-base font-semibold">Elon Musk (VP Digital)</h3>
                            </div>

                            <Form
                                layout='vertical'
                            >
                                <Form.Item
                                    label="Reason"
                                    name="reason"
                                    rules={[
                                        { required: true }
                                    ]}
                                >
                                    <TextArea className='min-h-16' autoSize />
                                </Form.Item>

                                <Form.Item
                                    name="upload"
                                    className='mb-5'
                                >
                                    <Upload {...props}>
                                        <Button className='w-full' icon={<UploadOutlined />}>Upload</Button>
                                    </Upload>
                                </Form.Item>

                                <Form.Item>
                                    <Button className='w-full' type="primary" htmlType="submit">
                                        Submit
                                    </Button>
                                </Form.Item>
                            </Form>

                            <div className="text-center text-gray-500">
                                <div className="mb-1">
                                    <Time />
                                </div>
                                <h4 className="text-xs mb-1">Attendance Start From 06:00 - 09:30 WIB</h4>
                                <h4 className="text-xs mb-1">My IP Address: 182.253.126.6</h4>
                                {/* <h4 className="text-xs mb-1">Connecting with VP-Digital</h4> */}
                            </div>
                        </Card>

                        <div className="text-center">
                            <h4 className='text-xs text-gray-500'>Copyright VP Digital 2025</h4>
                        </div>
                    </div>
                </div>
            </section>

            <Modal
                open={modalInfo}
                onCancel={() => setModalInfo(false)}
                footer={null}
                classNames={
                    {
                        body: 'px-2 py-8'
                    }
                }
            >
                <p className="fc-base text-base text-center">Please enter your reason for logging in from outside the office.</p>
            </Modal>
        </>
    )
}