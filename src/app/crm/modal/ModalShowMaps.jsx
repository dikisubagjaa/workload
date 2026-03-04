import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from 'antd';

export default function ModalShowMaps({ modalShowMaps, setModalShowMaps }) {
    return (
        <>
            <Modal
                open={modalShowMaps}
                onCancel={() => setModalShowMaps(false)}
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
                        <h6 className='text-base text-white'>Map View</h6>
                        <button className='text-gray-200' onClick={() => setModalShowMaps(false)}>
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                )}
            >
                
            </Modal>
        </>
    )
}
