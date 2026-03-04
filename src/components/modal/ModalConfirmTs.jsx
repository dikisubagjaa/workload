import { Button, Modal } from 'antd';

export default function ModalConfirmTs({ modalConfirmTs, setModalConfirmTs }) {

    return (
        <>
            <Modal
                open={modalConfirmTs}
                width={600}
                footer={null}
                closable={false}
                title={<h3 className='text-white'>Confirm Timesheet</h3>}
                classNames={{
                    header: 'bg-[#0FA3B1] text-white text-center py-3 m-0',
                    content: 'p-0 rounded-xl',
                    mask: 'custom-mask',
                }}
            >
                <div className="py-7 px-3 sm:px-10">
                    <p className='text-base text-center fc-base mb-7'>
                        Please <span className="font-bold">review and confirm</span> your timesheet from yesterday.
                        Once confirmed, it will be locked and no further edits can be made.
                    </p>

                    <div className="flex justify-center gap-3">
                        <Button
                            size='large'
                            color="danger"
                            variant="filled"
                            className='px-5'
                        >
                            Cancel
                        </Button>

                        <Button
                            size='large'
                            className="btn-success px-5"
                            onClick={() => setModalConfirmTs(false)}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </Modal >
        </>
    )
}
