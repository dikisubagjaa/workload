import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Form, Modal, Select, Upload } from 'antd';

const { Dragger } = Upload;

const props = {
    name: 'file',
    multiple: true,
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    onChange(info) {
        const { status } = info.file;
        if (status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    },
    onDrop(e) {
        console.log('Dropped files', e.dataTransfer.files);
    },
};

export default function ModalUploadQoutation({ modalUploadQoutation, setModalUploadQoutation }) {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log(values);
    };

    return (
        <>
            <Modal
                open={modalUploadQoutation}
                onCancel={() => setModalUploadQoutation(false)}
                closable={false}
                footer={null}
                classNames={{
                    content: 'p-0',
                    header: 'px-4 py-3 bg-[#0FA3B1]',
                    body: 'px-4 py-3',
                }}
                title={(
                    <div className='flex justify-between items-center'>
                        <h6 className='text-base text-white'>Upload Qoutation</h6>
                        <button className='text-gray-200' onClick={() => setModalUploadQoutation(false)}>
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
                        name="select-opportunity"
                        label="Select Opportunity"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            placeholder="Select Opportunity"
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
                                {
                                    value: 'ddd',
                                    label: 'ddd',
                                },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Dragger {...props}>
                            <p className="fc-base">Click or drag file to this area to upload</p>
                        </Dragger>
                    </Form.Item>

                    <Form.Item className='mt-7'>
                        <div className="flex justify-end gap-2">
                            <Button shape='round' color="default" variant="filled" className='px-4' onClick={() => setModalUploadQoutation(false)}>Close</Button>
                            <Button shape='round' htmlType="submit" className="btn-blue px-4">Submit</Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}
