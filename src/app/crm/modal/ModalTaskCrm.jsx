import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, DatePicker, Form, Input, Modal, Radio } from 'antd';

const { TextArea } = Input;

export default function ModalTask({ modalTask, setModalTask }) {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log(values);
    };

    return (
        <>
            <Modal
                open={modalTask}
                onCancel={() => setModalTask(false)}
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
                        <h6 className='text-base text-white'>New Task</h6>
                        <button className='text-gray-200' onClick={() => setModalTask(false)}>
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
                    <Form.Item
                        name='description'
                        label='Task Description'
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <TextArea
                            className='shadow-sm'
                            autoSize={{
                                minRows: 4,
                                maxRows: 6,
                            }}
                        />
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

                    <Form.Item
                        name="priority"
                        label="Priority:"
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

                    <Form.Item className='mt-7'>
                        <div className="flex justify-end gap-2">
                            <Button shape='round' color="default" variant="filled" className='px-4' onClick={() => setModalTask(false)}>Close</Button>
                            <Button shape='round' htmlType="submit" className="btn-blue px-4">Submit</Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal >
        </>
    )
}
