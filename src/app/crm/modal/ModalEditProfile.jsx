import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Form, Input, Modal, Select } from 'antd';
const { TextArea } = Input;

export default function ModalEditProfile({ modalEditProfile, setModalEditProfile }) {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log(values);
    };

    return (
        <>
            <Modal
                open={modalEditProfile}
                onCancel={() => setModalEditProfile(false)}
                closable={false}
                footer={null}
                classNames={{
                    content: 'p-0',
                    header: 'px-4 py-3 bg-[#0FA3B1]',
                    body: 'px-4 py-3',
                }}
                title={(
                    <div className='flex justify-between items-center'>
                        <h6 className='text-base text-white'>Edit Profile</h6>
                        <button className='text-gray-200' onClick={() => setModalEditProfile(false)}>
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                )}
            >
                <div className="mb-5">
                    <h4 className="text-sm text-gray-400">Registered</h4>
                    <h5 className="text-sm">2025-01-15 10:53:19</h5>
                </div>

                <Form
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="fullname"
                        label="Full Name"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input placeholder='Full name' />
                    </Form.Item>

                    <Form.Item
                        name="gender"
                        label="Gender"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Select
                            placeholder="Select Gender"
                            options={[
                                {
                                    value: 'male',
                                    label: 'Male',
                                },
                                {
                                    value: 'female',
                                    label: 'Female',
                                },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input type='email' placeholder='Email address' />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Phone"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <div className="flex gap-3">
                            <div className="w-24">
                                <Select
                                    showSearch
                                    defaultValue={'+62'}
                                    options={[
                                        {
                                            value: '+62',
                                            label: '+62',
                                        },
                                        {
                                            value: '+234',
                                            label: '+234',
                                        },
                                        {
                                            value: '+234',
                                            label: '+234',
                                        },
                                        {
                                            value: '+234',
                                            label: '+234',
                                        },
                                    ]}
                                />
                            </div>
                            <Input type='number' placeholder='8787xxxxx' />
                        </div>
                    </Form.Item>

                    <Form.Item
                        name="company"
                        label="Company"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input placeholder='Company' />
                    </Form.Item>

                    <Form.Item
                        name="department"
                        label="department"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input placeholder='Department' />
                    </Form.Item>

                    <Form.Item
                        name="lead-status"
                        label="Lead Status"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Select
                            placeholder="Select Lead Status"
                            showSearch
                            options={[
                                {
                                    value: 'aaa',
                                    label: 'aaa',
                                },
                                {
                                    value: 'bbbb',
                                    label: 'bbb',
                                },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="reason-for-closed"
                        label="Reason For Closed"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Select
                            placeholder="Select Reason"
                            showSearch
                            options={[
                                {
                                    value: 'aaa',
                                    label: 'aaa',
                                },
                                {
                                    value: 'bbbb',
                                    label: 'bbb',
                                },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="estimated-value"
                        label="Estimated Value"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <div className="flex items-center">
                            <div className="flex items-center justify-center rounded-s-md w-10 h-8 border border-e-0">
                                <h3 className="text-sm">Rp</h3>
                            </div>
                            <Input type='number' placeholder='8787xxxxx' className='rounded-s-none' />
                        </div>
                    </Form.Item>

                    <Form.Item
                        name="probability"
                        label="Probability"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Select
                            placeholder="Select Probability"
                            showSearch
                            options={[
                                {
                                    value: 'low',
                                    label: 'low',
                                },
                                {
                                    value: 'medium',
                                    label: 'medium',
                                },
                                {
                                    value: 'high',
                                    label: 'high',
                                },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="customer-type"
                        label="Customer Type"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Select
                            placeholder="Select Customer Type"
                            showSearch
                            options={[
                                {
                                    value: 'aaa',
                                    label: 'aaa',
                                },
                                {
                                    value: 'bbb',
                                    label: 'bbb',
                                },
                                {
                                    value: 'ccc',
                                    label: 'ccc',
                                },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="lead-source"
                        label="Lead Source"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Select
                            placeholder="Select Lead Source"
                            showSearch
                            options={[
                                {
                                    value: 'aaa',
                                    label: 'aaa',
                                },
                                {
                                    value: 'bbb',
                                    label: 'bbb',
                                },
                                {
                                    value: 'ccc',
                                    label: 'ccc',
                                },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="city"
                        label="City"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Select
                            placeholder="Select City"
                            showSearch
                            options={[
                                {
                                    value: 'aaa',
                                    label: 'aaa',
                                },
                                {
                                    value: 'bbb',
                                    label: 'bbb',
                                },
                                {
                                    value: 'ccc',
                                    label: 'ccc',
                                },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Address"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <TextArea
                            placeholder="Address"
                            autoSize={{
                                minRows: 3,
                                maxRows: 5,
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="postcode"
                        label="Postcode"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input placeholder='Postcode' />
                    </Form.Item>

                    <Form.Item
                        name="pin-maps"
                        label="Pin Maps"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <div className="flex items-center">
                            <div className="flex-none">
                                <button className="w-full flex items-center justify-center rounded-s-md h-8 border border-e-0 px-4 fc-blue">
                                    Pin Maps
                                </button>
                            </div>
                            <Input type='number' placeholder='8787xxxxx' className='rounded-s-none flex-1' />
                        </div>
                    </Form.Item>

                    <div className="mb-5">
                        <h4 className="text-sm text-gray-400">Agent</h4>
                        <h4 className="text-sm">Saint Carloss</h4>
                    </div>

                    <Form.Item
                        name="change-agent"
                        label="Change Agent"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Select
                            placeholder="Select Agent"
                            showSearch
                            options={[
                                {
                                    value: 'aaa',
                                    label: 'aaa',
                                },
                                {
                                    value: 'bbb',
                                    label: 'bbb',
                                },
                                {
                                    value: 'ccc',
                                    label: 'ccc',
                                },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item className='mt-7'>
                        <div className="flex justify-end gap-2">
                            <Button shape='round' color="default" variant="filled" className='px-4' onClick={() => setModalEditProfile(false)}>Close</Button>
                            <Button shape='round' htmlType="submit" className="btn-blue px-4">Save Changes</Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}
