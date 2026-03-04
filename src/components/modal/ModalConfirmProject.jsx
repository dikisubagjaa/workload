import Image from 'next/image';
import { Button, Modal } from 'antd';
import { asset } from '@/utils/url';

export default function ModalConfirmProject({ modalConfirm, setModalConfirm }) {
    return (
        <>
            <Modal
                open={modalConfirm}
                onCancel={() => setModalConfirm(false)}
                width={600}
                footer={null}
            >
                {/* header */}
                <div className="flex gap-3 border-b pb-3 fc-base mb-6">
                    <div className="flex-none">
                        <div className="flex items-center h-[38px]">
                            <Image alt='registraion' src={asset('static/images/icon/app_registration.png')} width={24} height={24} />
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center h-[38px]">
                            <h4 className="text-lg">Confirmation</h4>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center py-5">
                    <h4 className="text-xl fc-base mb-5">Lorem ipsum dolor sit amet consectetur.</h4>
                    <div className="flex gap-3">
                        <Button htmlType='button' size='large' color='danger' variant='outlined' onClick={() => setModalConfirm(false)}>
                            No
                        </Button>

                        <Button htmlType='button' size='large' className="btn-success">
                            Yes
                        </Button>
                    </div>
                </div>
            </Modal >
        </>
    )
}
