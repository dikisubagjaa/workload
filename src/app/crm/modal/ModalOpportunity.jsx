import { faEye, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal, Table, Upload, message, Popconfirm } from 'antd';
import Fancybox from '@/components/libs/Fancybox';

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

export default function ModalOpportunity({ modalOpportunity, setModalOpportunity }) {
    const columns = [
        {
            title: 'File Name',
            dataIndex: 'filename',
            key: 'filename',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            className: 'text-right w-1/4',
        },
    ];

    const data = [
        {
            key: '1',
            filename: 'Document A',
            type: '.docx',
            action: (
                <div className="flex justify-end gap-3">
                    <a data-fancybox="file" href="https://lipsum.app/id/60/1600x1200">
                        <FontAwesomeIcon icon={faEye} />
                    </a>

                    <Popconfirm
                        title="Delete the file"
                        description="Are you sure to delete this file?"
                        okText="Yes"
                        cancelText="No"
                    >
                        <button className='text-red-500'>
                            <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                    </Popconfirm>
                </div >
            ),
        },
        {
            key: '2',
            filename: 'Document A',
            type: '.docx',
            action: (
                <div className="flex justify-end gap-3">
                    <a data-fancybox="file" href="https://lipsum.app/id/60/1600x1200">
                        <FontAwesomeIcon icon={faEye} />
                    </a>
                    
                    <Popconfirm
                        title="Delete the file"
                        description="Are you sure to delete this file?"
                        okText="Yes"
                        cancelText="No"
                        classNames={{
                            confirmBtn: 'text-red-500',
                        }}
                    >
                        <button className='text-red-500'>
                            <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                    </Popconfirm>
                </div>
            ),
        },
        {
            key: '3',
            filename: 'Document A',
            type: '.docx',
            action: (
                <div className="flex justify-end gap-3">
                    <a data-fancybox="file" href="https://lipsum.app/id/60/1600x1200">
                        <FontAwesomeIcon icon={faEye} />
                    </a>
                    
                    <Popconfirm
                        title="Delete the file"
                        description="Are you sure to delete this file?"
                        okText="Yes"
                        cancelText="No"
                    >
                        <button className='text-red-500'>
                            <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                    </Popconfirm>
                </div>
            ),
        },
        {
            key: '4',
            filename: 'Document A',
            type: '.docx',
            action: (
                <div className="flex justify-end gap-3">
                    <a data-fancybox="file" href="https://lipsum.app/id/60/1600x1200">
                        <FontAwesomeIcon icon={faEye} />
                    </a>
                    
                    <Popconfirm
                        title="Delete the file"
                        description="Are you sure to delete this file?"
                        okText="Yes"
                        cancelText="No"
                    >
                        <button className='text-red-500'>
                            <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                    </Popconfirm>
                </div>
            ),
        },
        {
            key: '5',
            filename: 'Document A',
            type: '.docx',
            action: (
                <div className="flex justify-end gap-3">
                    <a data-fancybox="file" href="https://lipsum.app/id/60/1600x1200">
                        <FontAwesomeIcon icon={faEye} />
                    </a>
                    
                    <Popconfirm
                        title="Delete the file"
                        description="Are you sure to delete this file?"
                        okText="Yes"
                        cancelText="No"
                    >
                        <button className='text-red-500'>
                            <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <>
            <Modal
                open={modalOpportunity}
                onCancel={() => setModalOpportunity(false)}
                closable={false}
                footer={null}
                classNames={{
                    content: 'p-0',
                    header: 'px-4 py-3 bg-[#0FA3B1]',
                    body: 'px-4 py-5',
                }}
                title={(
                    <div className='flex justify-between items-center'>
                        <h6 className='text-base text-white'>21 Nov 24 (Tue)</h6>
                        <button className='text-gray-200' onClick={() => setModalOpportunity(false)}>
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                )}
            >
                <ul className="fc-base mb-4">
                    <li>Size:  <span className='font-bold'>5000</span></li>
                    <li>Agent Name: <span className='font-bold'>John Doe</span></li>
                    <li>Due Date: <span className='font-bold'>22 Nov 24 (Wed)</span></li>
                </ul>

                <Fancybox
                    options={{
                        Carousel: {
                            infinite: false,
                        },
                    }}
                >
                    <Table
                        columns={columns}
                        dataSource={data}
                        pagination={2}
                        size="small"
                        className="text-sm"
                    />
                </Fancybox>

                <Dragger {...props}>
                    <p className="fc-base">Click or drag file to this area to upload</p>
                </Dragger>
            </Modal>
        </>
    )
}
