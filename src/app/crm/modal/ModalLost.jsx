import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Form, Input, Modal, Radio } from 'antd';

const { TextArea } = Input;

export default function ModalLost({ modalLost, setModalLost }) {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log(values);
    };

    return (
        <>
            <Modal
                open={modalLost}
                onCancel={() => setModalLost(false)}
                closable={false}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="form_in_modal"
                    onFinish={onFinish}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="text-sm fc-base">
                            <span className="font-bold fc-blue">LIVE CALL</span> Started: 13:04
                        </h5>

                        <button className='text-lg text-gray-400 hover' onClick={() => setModalLost(false)}>
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>

                    <div className="bg-slate-50 rounded-xl px-5 py-2 mb-5 shadow-md">
                        <div className="call-status-bar">
                            <h6 className="text-sm text-gray-400 mb-2">Reason Lost</h6>
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
                                    <Radio.Button value="a">Affordibility</Radio.Button>
                                    <Radio.Button value="b">Uncotactable</Radio.Button>
                                    <Radio.Button value="c">Chose Competitor</Radio.Button>
                                    <Radio.Button value="d">No Interested</Radio.Button>
                                    <Radio.Button value="e">Cannot Provide Product/Service</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </div>
                    </div>

                    <Form.Item
                        name="note"
                        label="Note for Reason List:"
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

                    <div className="flex gap-3 mt-7">
                        <Button shape='round' htmlType="submit" className="btn-blue px-4">Call Completed</Button>
                        <Button shape='round' variant='solid' color='danger'>Delete Activity</Button>
                    </div>
                </Form>
            </Modal >
        </>
    )
}
