"use client"
import { Button, Form, Input, Modal } from 'antd';

const { TextArea } = Input;

export default function ModalNewChannel({ modalNewChannel, setModalNewChannel }) {
    const onFinish = (values) => {
        console.log('Success:', values);
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <Modal
            title={
                <h6 className='mb-5 text-lg fc-base border-b pb-3' >Create a new channel</h6>
            }
            open={modalNewChannel}
            onCancel={() => setModalNewChannel(false)}
            footer={null}
            width={550}
        >
            <Form
                name="basic"
                layout='vertical'
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Form.Item
                    label="Channel Name"
                    name="channel"
                    rules={[
                        {
                            required: true,
                            message: 'Please input!',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Enter a purpose for this channel (optional)"
                    name="purpose"
                >
                    <TextArea
                        autoSize={{
                            minRows: 3,
                            maxRows: 5,
                        }}
                    />
                    <small>This will be displayed when browsing for channels.</small>
                </Form.Item>

                <div className='flex justify-end items-center gap-3'>
                    <Button onClick={() => setModalNewChannel(false)}>
                        Cancel
                    </Button>

                    <Button className='btn-blue' htmlType="submit">
                        Create channel
                    </Button>
                </div>
            </Form>
        </Modal>
    )
}
