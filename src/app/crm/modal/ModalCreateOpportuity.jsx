import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, DatePicker, Form, Input, Modal } from 'antd';

export default function ModalCreateOpportuity({ modalCreateOpportunity, setModalCreateOpportunity }) {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log(values);
    };

    return (
        <>
            <Modal
                open={modalCreateOpportunity}
                onCancel={() => setModalCreateOpportunity(false)}
                closable={false}
                footer={null}
                classNames={{
                    content: 'p-0',
                    header: 'px-4 py-3 bg-[#0FA3B1]',
                    body: 'px-4 py-3',
                }}
                title={(
                    <div className='flex justify-between items-center'>
                        <h6 className='text-base text-white'>Create Opportunity</h6>
                        <button className='text-gray-200' onClick={() => setModalCreateOpportunity(false)}>
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
                    <Form.Item
                        name="size"
                        label="Size"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input placeholder='Size' type='number' />
                    </Form.Item>

                    <Form.Item
                        name="due-date"
                        label="Due Date"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <DatePicker className='w-full' />
                    </Form.Item>


                    <Form.Item className='mt-7'>
                        <div className="flex justify-end gap-2">
                            <Button shape='round' color="default" variant="filled" className='px-4' onClick={() => setModalCreateOpportunity(false)}>Close</Button>
                            <Button shape='round' htmlType="submit" className="btn-blue px-4">Submit</Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}
