import { faPlus, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Form, Input, Modal, Select } from 'antd';

export default function ModalAddContact({ modalAddContact, setModalAddContact }) {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log(values);
    };

    return (
        <>
            <Modal
                open={modalAddContact}
                onCancel={() => setModalAddContact(false)}
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
                        <h6 className='text-base text-white'>Others Contact</h6>
                        <button className='text-gray-200' onClick={() => setModalAddContact(false)}>
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                )}
            >
                <Form
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <div className='flex gap-3'>
                        <div className='flex-none'>
                            <Button className='btn-outline-danger'>
                                <FontAwesomeIcon icon={faTrashCan} />
                            </Button>
                        </div>

                        <Form.Item
                            name="gender"
                            className="flex-1"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Select
                                placeholder="Select Gender"
                                options={[
                                    { value: 'male', label: 'Male' },
                                    { value: 'Female', label: 'Female' },
                                ]}
                            />
                        </Form.Item>

                        <Form.Item
                            name="fullname"
                            className="flex-1"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Input placeholder='fullname' />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            className="flex-1"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Input placeholder='Size' type='number' />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            className="flex-1"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Input placeholder='Size' type='email' />
                        </Form.Item>
                    </div>

                    <Button shape="round" className="btn-outline-blue px-3">
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Contact
                    </Button>

                    <Form.Item className='mt-7'>
                        <div className="flex justify-end gap-2">
                            <Button shape='round' color="default" variant="filled" className='px-4' onClick={() => setModalAddContact(false)}>Close</Button>
                            <Button shape='round' htmlType="submit" className="btn-blue px-4">Submit</Button>
                        </div>
                    </Form.Item>
                </Form>

            </Modal>
        </>
    )
}
