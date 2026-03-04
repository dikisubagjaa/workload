import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal } from 'antd';

export default function ModalInfoAttendance({ modalInfoAttendance, onCancel }) {

    return (
        <>
            <Modal
                open={modalInfoAttendance}
                onCancel={onCancel}
                width={400}
                footer={null}
                closable={false}
                title={<h3 className='text-white'>Confirm Timesheet</h3>}
                classNames={{
                    mask: 'custom-mask',
                    header: 'hidden'
                }}
            >
                <h3 className="text-base text-[#B3B3B3] mb-2">Attendance</h3>
                <div className="flex gap-3">
                    <Button className='fc-base rounded-full px-5'>
                        <FontAwesomeIcon icon={faCircle} className='text-[#14AE5C] text-[9px]' /> Normal
                    </Button>

                    <Button className='fc-base rounded-full px-5'>
                        <FontAwesomeIcon icon={faCircle} className='text-[#E8B931] text-[9px]' /> Late
                    </Button>

                    <Button className='fc-base rounded-full px-5'>
                        <FontAwesomeIcon icon={faCircle} className='text-[#EC221F] text-[9px]' /> Absent
                    </Button>
                </div>
                <hr className='my-4' />

                <h3 className="text-base text-[#B3B3B3] mb-2">Rules</h3>
                <ul className="list-disc ps-4 fc-base">
                    <li>A 1-hour grace period is provided for tardiness.</li>
                    <li>Failure to submit your timesheet within 2 days will result in it being marked as an absence.</li>
                    <li>Leave will be considered as attendance.</li>
                </ul>
            </Modal >
        </>
    )
}
