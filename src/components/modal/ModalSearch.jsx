"use client"
import { Modal, Input, Tag } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useState } from 'react';
import ModalTask from './ModalTask';
import Fancybox from '@/components/libs/Fancybox';

const { Search } = Input;

export default function ModalSearch({ modalSearch }) {
    const [modalTask, setModalTask] = useState(false);

    return (
        <>
            <Modal
                open={modalSearch}
                footer={null}
                mask={false}
                closeIcon={false}
                zIndex={9}
                classNames={{
                    wrapper: 'modal-search',
                    content: 'px-0'
                }}
            >
                <div className="container">
                    <Search
                        placeholder="Search"
                        className='w-full searchbar mb-5'
                        size='large'
                    />

                    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <li>
                            <h3 className="text-lg font-semibold fc-base mb-5">Tasks</h3>
                            <ul>
                                <li className='card-list p-4 mb-4'>
                                    <div className="flex items-center fc-base gap-5">
                                        <div className='w-full'>
                                            <div className="mb-2">
                                                <button onClick={() => setModalTask(true)} className='text-base block fc-blue'>Bugfix & Request Web RRI</button>
                                                <Link href="/projects/3128937812972" className="text-sm fc-base font-semibold">#730 - Radio Republik Indonesia</Link>
                                            </div>

                                            <Fancybox
                                                options={{
                                                    Carousel: {
                                                        infinite: false,
                                                    },
                                                }}
                                            >
                                                <ul className='list-disc ps-5'>
                                                    <li>
                                                        <div className="flex">
                                                            <Link data-fancybox="attachment" href="/static/images/bg-profile.png" className='me-5'>
                                                                <h5 className="text-sm">
                                                                    <FontAwesomeIcon icon={faPaperclip} /> Google.png
                                                                </h5>
                                                            </Link>
                                                        </div>
                                                    </li>

                                                    <li>
                                                        <div className="flex">
                                                            <Link data-fancybox="attachment" href="/static/images/bg-profile.png" className='me-5'>
                                                                <h5 className="text-sm">
                                                                    <FontAwesomeIcon icon={faPaperclip} /> Revisi.pdf
                                                                </h5>
                                                            </Link>
                                                        </div>
                                                    </li>

                                                    <li>
                                                        <div className="flex">
                                                            <Link data-fancybox="attachment" href="/static/images/bg-profile.png" className='me-5'>
                                                                <h5 className="text-sm">
                                                                    <FontAwesomeIcon icon={faPaperclip} /> Document B.doxc
                                                                </h5>
                                                            </Link>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </Fancybox>
                                        </div>
                                    </div>
                                </li>
                                
                                <li className='card-list p-4 mb-4'>
                                    <div className="flex items-center fc-base gap-5">
                                        <div className='w-full'>
                                            <div className="mb-2">
                                                <button onClick={() => setModalTask(true)} className='text-base block fc-blue'>Bugfix & Request Web RRI</button>
                                                <Link href="/projects/3128937812972" className="text-sm fc-base font-semibold">#730 - Radio Republik Indonesia</Link>
                                            </div>

                                            <Fancybox
                                                options={{
                                                    Carousel: {
                                                        infinite: false,
                                                    },
                                                }}
                                            >
                                                <ul className='list-disc ps-5'>
                                                    <li>
                                                        <div className="flex">
                                                            <Link data-fancybox="attachment" href="/static/images/bg-profile.png" className='me-5'>
                                                                <h5 className="text-sm">
                                                                    <FontAwesomeIcon icon={faPaperclip} /> Google.png
                                                                </h5>
                                                            </Link>
                                                        </div>
                                                    </li>

                                                    <li>
                                                        <div className="flex">
                                                            <Link data-fancybox="attachment" href="/static/images/bg-profile.png" className='me-5'>
                                                                <h5 className="text-sm">
                                                                    <FontAwesomeIcon icon={faPaperclip} /> Revisi.pdf
                                                                </h5>
                                                            </Link>
                                                        </div>
                                                    </li>

                                                    <li>
                                                        <div className="flex">
                                                            <Link data-fancybox="attachment" href="/static/images/bg-profile.png" className='me-5'>
                                                                <h5 className="text-sm">
                                                                    <FontAwesomeIcon icon={faPaperclip} /> Document B.doxc
                                                                </h5>
                                                            </Link>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </Fancybox>
                                        </div>
                                    </div>
                                </li>

                                <li className='card-list p-4 mb-4'>
                                    <div className="flex items-center fc-base gap-5">
                                        <div className='w-full'>
                                            <div className="mb-2">
                                                <button onClick={() => setModalTask(true)} className='text-base block fc-blue'>Bugfix & Request Web RRI</button>
                                                <Link href="/projects/3128937812972" className="text-sm fc-base font-semibold">#730 - Radio Republik Indonesia</Link>
                                            </div>

                                            <Fancybox
                                                options={{
                                                    Carousel: {
                                                        infinite: false,
                                                    },
                                                }}
                                            >
                                                <ul className='list-disc ps-5'>
                                                    <li>
                                                        <div className="flex">
                                                            <Link data-fancybox="attachment" href="/static/images/bg-profile.png" className='me-5'>
                                                                <h5 className="text-sm">
                                                                    <FontAwesomeIcon icon={faPaperclip} /> Google.png
                                                                </h5>
                                                            </Link>
                                                        </div>
                                                    </li>

                                                    <li>
                                                        <div className="flex">
                                                            <Link data-fancybox="attachment" href="/static/images/bg-profile.png" className='me-5'>
                                                                <h5 className="text-sm">
                                                                    <FontAwesomeIcon icon={faPaperclip} /> Revisi.pdf
                                                                </h5>
                                                            </Link>
                                                        </div>
                                                    </li>

                                                    <li>
                                                        <div className="flex">
                                                            <Link data-fancybox="attachment" href="/static/images/bg-profile.png" className='me-5'>
                                                                <h5 className="text-sm">
                                                                    <FontAwesomeIcon icon={faPaperclip} /> Document B.doxc
                                                                </h5>
                                                            </Link>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </Fancybox>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </li>

                        <li>
                            <h3 className="text-lg font-semibold fc-base mb-5">Projects</h3>
                            <ul>
                                <li className='card-list p-4 mb-4'>
                                    <div className="block sm:flex items-center fc-base w-full gap-5">
                                        <div className='w-full m-auto mb-2 sm:mb-0'>
                                            <Link href="/projects/idjawi93298392" className='block text-sm'>4 New EDM Development - SFMC Warming</Link>
                                            <h3 className='text-sm fc-base'>Pocari</h3>
                                        </div>

                                        <div className='sm:text-center mb-2 sm:mb-0'>
                                            <small className="text-sm font-semibold block mb-1">Status</small>
                                            <Tag color='green'>Finished</Tag>
                                        </div>
                                    </div>
                                </li>

                                <li className='card-list p-4 mb-4'>
                                    <div className="block sm:flex items-center fc-base w-full gap-5">
                                        <div className='w-full m-auto mb-2 sm:mb-0'>
                                            <Link href="/projects/idjawi93298392" className='block text-sm'>4 New EDM Development - SFMC Warming</Link>
                                            <h3 className='text-sm fc-base'>Pocari</h3>
                                        </div>

                                        <div className='sm:text-center mb-2 sm:mb-0'>
                                            <small className="text-sm font-semibold block mb-1">Status</small>
                                            <Tag color='green'>Finished</Tag>
                                        </div>
                                    </div>
                                </li>

                                <li className='card-list p-4 mb-4'>
                                    <div className="block sm:flex items-center fc-base w-full gap-5">
                                        <div className='w-full m-auto mb-2 sm:mb-0'>
                                            <Link href="/projects/idjawi93298392" className='block text-sm'>4 New EDM Development - SFMC Warming</Link>
                                            <h3 className='text-sm fc-base'>Pocari</h3>
                                        </div>

                                        <div className='sm:text-center mb-2 sm:mb-0'>
                                            <small className="text-sm font-semibold block mb-1">Status</small>
                                            <Tag color='green'>Finished</Tag>
                                        </div>
                                    </div>
                                </li>

                                <li className='card-list p-4 mb-4'>
                                    <div className="block sm:flex items-center fc-base w-full gap-5">
                                        <div className='w-full m-auto mb-2 sm:mb-0'>
                                            <Link href="/projects/idjawi93298392" className='block text-sm'>4 New EDM Development - SFMC Warming</Link>
                                            <h3 className='text-sm fc-base'>Pocari</h3>
                                        </div>

                                        <div className='sm:text-center mb-2 sm:mb-0'>
                                            <small className="text-sm font-semibold block mb-1">Status</small>
                                            <Tag color='green'>Finished</Tag>
                                        </div>
                                    </div>
                                </li>

                                <li className='card-list p-4 mb-4'>
                                    <div className="block sm:flex items-center fc-base w-full gap-5">
                                        <div className='w-full m-auto mb-2 sm:mb-0'>
                                            <Link href="/projects/idjawi93298392" className='block text-sm'>4 New EDM Development - SFMC Warming</Link>
                                            <h3 className='text-sm fc-base'>Pocari</h3>
                                        </div>

                                        <div className='sm:text-center mb-2 sm:mb-0'>
                                            <small className="text-sm font-semibold block mb-1">Status</small>
                                            <Tag color='green'>Finished</Tag>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </Modal>

            <ModalTask
                modalTask={modalTask}
                setModalTask={setModalTask}
            />
        </>
    )
}
