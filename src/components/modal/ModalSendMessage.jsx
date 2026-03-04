"use client"
import { faCheck, faCircle, faGlobe, faMagnifyingGlass, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Button, Checkbox, Input, Modal, Select } from 'antd';

export default function ModalSendMessage({ modalSendMessage, setModalSendMessage }) {
    return (
        <Modal
            title={
                <h6 className='mb-5 text-lg fc-base border-b pb-3' >Send Message</h6>
            }
            open={modalSendMessage}
            onCancel={() => setModalSendMessage(false)}
            footer={null}
            width={550}
        >
            <div className="mb-4">
                <Input
                    placeholder="Search Channel / Member"
                    prefix={
                        <FontAwesomeIcon icon={faMagnifyingGlass} className='text-gray-400 pe-3' />
                    }
                />
            </div>

            <div className="flex items-center justify-between gap-3 mb-5">
                <h3 className="text-sm">91 Results</h3>
                <div className="flex items-center gap-3">
                    <Select
                        defaultValue="public channel"
                        options={[
                            {
                                value: 'public channel',
                                label: 'Public Channels',
                            },
                            {
                                value: 'archived channel',
                                label: 'Archived Channels',
                            },
                        ]}
                    />

                    <Checkbox>Hide joined</Checkbox>
                </div>
            </div>

            <ul className='list-channel'>
                <li className='list'>
                    <div className="flex items-center">
                        <Avatar>DS</Avatar>
                        <div className='ms-2'>
                            <h3 className="text-sm font-semibold">@dikisubagjaa</h3>
                            <h4 className='text-xs'>diki@vp-digital.com</h4>
                        </div>
                    </div>

                    <Button className="btn-blue">Send</Button>
                </li>

                <li className='list'>
                    <div className="flex items-center">
                        <Avatar>DS</Avatar>
                        <div className='ms-2'>
                            <h3 className="text-sm font-semibold">@dikisubagjaa</h3>
                            <h4 className='text-xs'>diki@vp-digital.com</h4>
                        </div>
                    </div>

                    <Button className="btn-blue">Send</Button>
                </li>

                <li className='list'>
                    <div className="flex items-center">
                        <Avatar>DS</Avatar>
                        <div className='ms-2'>
                            <h3 className="text-sm font-semibold">@dikisubagjaa</h3>
                            <h4 className='text-xs'>diki@vp-digital.com</h4>
                        </div>
                    </div>

                    <Button className="btn-blue">Send</Button>
                </li>

                <li className='list'>
                    <div className='fc-base'>
                        <h3 className="text-sm">
                            <FontAwesomeIcon icon={faGlobe} /> AFA Skincare
                        </h3>
                        <h4 className="text-xs"><FontAwesomeIcon icon={faUser} /> 30</h4>
                    </div>

                    <Button className="btn-blue">Join</Button>
                </li>

                <li className='list'>
                    <div className='fc-base'>
                        <h3 className="text-sm">
                            <FontAwesomeIcon icon={faGlobe} /> AFA Skincare
                        </h3>
                        <h4 className="text-xs"><FontAwesomeIcon icon={faUser} /> 30</h4>
                    </div>

                    <Button className="btn-blue">Join</Button>
                </li>

                <li className='list'>
                    <div className='fc-base'>
                        <h3 className="text-sm">
                            <FontAwesomeIcon icon={faGlobe} /> RRI
                        </h3>
                        <div className="flex items-center">
                            <h4 className="text-xs font-semibold text-green-500"><FontAwesomeIcon icon={faCheck} /> Joined</h4>
                            <FontAwesomeIcon icon={faCircle} className='text-[4px] mx-2' />
                            <h4 className="text-xs"><FontAwesomeIcon icon={faUser} /> 30</h4>
                            <FontAwesomeIcon icon={faCircle} className='text-[4px] mx-2' />
                            <h4 className="text-xs">Diskusi</h4>
                        </div>
                    </div>

                    <Button className="btn-blue">View</Button>
                </li>

                <li className='list'>
                    <div className='fc-base'>
                        <h3 className="text-sm">
                            <FontAwesomeIcon icon={faGlobe} /> RRI
                        </h3>
                        <div className="flex items-center">
                            <h4 className="text-xs font-semibold text-green-500"><FontAwesomeIcon icon={faCheck} /> Joined</h4>
                            <FontAwesomeIcon icon={faCircle} className='text-[4px] mx-2' />
                            <h4 className="text-xs"><FontAwesomeIcon icon={faUser} /> 30</h4>
                            <FontAwesomeIcon icon={faCircle} className='text-[4px] mx-2' />
                            <h4 className="text-xs">Diskusi</h4>
                        </div>
                    </div>

                    <Button className="btn-blue">View</Button>
                </li>

                <li className='list'>
                    <div className='fc-base'>
                        <h3 className="text-sm">
                            <FontAwesomeIcon icon={faGlobe} /> RRI
                        </h3>
                        <div className="flex items-center">
                            <h4 className="text-xs font-semibold text-green-500"><FontAwesomeIcon icon={faCheck} /> Joined</h4>
                            <FontAwesomeIcon icon={faCircle} className='text-[4px] mx-2' />
                            <h4 className="text-xs"><FontAwesomeIcon icon={faUser} /> 30</h4>
                            <FontAwesomeIcon icon={faCircle} className='text-[4px] mx-2' />
                            <h4 className="text-xs">Diskusi</h4>
                        </div>
                    </div>

                    <Button className="btn-blue">View</Button>
                </li>
            </ul>
        </Modal >
    )
}
