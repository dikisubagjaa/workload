import { asset } from '@/utils/url';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, DatePicker, Dropdown, Form, Input, Modal, Radio, Select } from 'antd';
import Image from 'next/image';

const { TextArea } = Input;

export default function ModalCreateActivity({ modalCreateActivity, setModalCreateActivity, setModalCreateOpportunity, setModalUploadQoutation }) {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log(values);
    };

    return (
        <>
            <Modal
                open={modalCreateActivity}
                onCancel={() => setModalCreateActivity(false)}
                closable={false}
                footer={null}
                width={800}
                classNames={{
                    content: 'p-0',
                    header: 'px-4 py-3 bg-[#0FA3B1]',
                    body: 'px-4 py-3',
                }}
                title={(
                    <div className='flex justify-between items-center'>
                        <h6 className='text-base text-white'>Create Activity</h6>
                        <button className='text-gray-200' onClick={() => setModalCreateActivity(false)}>
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                )}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="form_in_modal"
                    onFinish={onFinish}
                >
                    <h5 className="text-sm fc-base mb-2">
                        <span className="font-bold fc-blue">LIVE CALL</span> Started: 13:04
                    </h5>

                    <div className="bg-slate-50 rounded-xl px-5 py-2 mb-5 shadow-md">
                        <div className="flex items-center fc-base gap-5">
                            <div className="flex-none">
                                <Dropdown
                                    trigger={['click']}
                                    menu={{
                                        items: [
                                            {
                                                key: '1',
                                                label: (
                                                    <button className='fc-base'>
                                                        <FontAwesomeIcon icon={faPhone} className='me-1' /> CALL
                                                    </button>
                                                ),
                                            },
                                            {
                                                key: '2',
                                                label: (
                                                    <button className='fc-base'>
                                                        <FontAwesomeIcon icon={faWhatsapp} className='me-1' /> WHATSAPP
                                                    </button>
                                                ),
                                            },
                                            {
                                                key: '3',
                                                label: (
                                                    <button className='fc-base'>
                                                        <FontAwesomeIcon icon={faEnvelope} className='me-1' /> EMAIL
                                                    </button>
                                                ),
                                            },
                                        ],
                                    }}
                                >
                                    <button className='flex flex-col justify-center items-center'>
                                        <Image
                                            src={asset('static/images/icon/phone-dial.png')}
                                            alt='Google'
                                            width={35}
                                            height={35}
                                        />
                                        <span className='text-xs text-gray-400'>Call</span>
                                    </button>
                                </Dropdown>
                            </div>

                            <div className="flex-none text-center">
                                <h6 className="text-sm text-gray-400">Contact Detail</h6>
                                <h6 className="text-sm">+6283877901211</h6>
                                <h6 className="text-sm">-</h6>
                            </div>

                            <div className="call-status-bar flex-1">
                                <h6 className="text-sm text-gray-400 mb-2">Call Status</h6>
                                <Form.Item
                                    name='call-status'
                                    className='mb-0'
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Radio.Group
                                        className='flex gap-2'
                                    >
                                        <Radio.Button value="a">Answer</Radio.Button>
                                        <Radio.Button value="b">No Answer</Radio.Button>
                                        <Radio.Button value="c">Busy</Radio.Button>
                                        <Radio.Button value="d">Invalid</Radio.Button>
                                        <Radio.Button value="e">Bad Number</Radio.Button>
                                        <Radio.Button value="f">Voicemail</Radio.Button>
                                        <Radio.Button value="g">Reject</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                            </div>
                        </div>
                    </div>

                    <Form.Item
                        name="note"
                        label="Note from Activity"
                    >
                        <TextArea
                            className='shadow-sm'
                            autoSize={{
                                minRows: 4,
                                maxRows: 6,
                            }}
                        />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="mb-5">
                            <Form.Item
                                name="call-outcome"
                                label="Call Outcome"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Select a person"
                                    options={[
                                        {
                                            value: 'jack',
                                            label: 'Jack',
                                        },
                                        {
                                            value: 'lucy',
                                            label: 'Lucy',
                                        },
                                        {
                                            value: 'tom',
                                            label: 'Tom',
                                        },
                                    ]}
                                />
                            </Form.Item>

                            <Form.Item
                                name="back-date"
                                label="Manual Call Back Date:"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <DatePicker className='w-full' />
                            </Form.Item>

                            <Form.Item
                                name="call-back"
                                label="Call Back Priority:"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Radio.Group
                                    className='flex'
                                >
                                    <Radio.Button value="a">Low</Radio.Button>
                                    <Radio.Button value="b">Medium</Radio.Button>
                                    <Radio.Button value="c">High</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </div>

                        <div className="mb-5">
                            <h5 className="text-sm mb-2">Shortcut</h5>
                            <ul className="bg-slate-50 p-5 rounded-xl shadow-md">
                                <li className='mb-2'>
                                    <button className='underline fc-blue hover'>Add New Lead</button>
                                </li>

                                <li className='mb-2'>
                                    <button className='underline fc-blue hover' onClick={() => setModalCreateOpportunity(true)}>Create Opportunity</button>
                                </li>

                                <li className='mb-2'>
                                    <button className='underline fc-blue hover'>Next Lead</button>
                                </li>

                                <li className='mb-2'>
                                    <button className='underline fc-blue hover' onClick={() => setModalUploadQoutation(true)}>Upload Qoutation</button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <Button shape='round' htmlType="submit" className="btn-blue px-4">Call Completed</Button>
                </Form>
            </Modal >
        </>
    )
}
