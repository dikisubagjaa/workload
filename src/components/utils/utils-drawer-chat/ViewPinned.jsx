"use client"
import { useState } from "react";
import Link from "next/link";
import { Avatar, Button, Dropdown, message, Tooltip } from "antd";
import Fancybox from '@/components/libs/Fancybox';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faReply, faThumbtack, faPaperclip, faDownload, faShareFromSquare, faEye, faImage, faCopy, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";

const itemsDropdownChat = () => [
    {
        key: '1',
        label: (
            <button className="text-left text-sm w-full">
                <FontAwesomeIcon icon={faTrashCan} className="me-1" /> Delete
            </button>
        ),
    },
];

export default function ViewPinned({
    handleBackViewPinned,
    isActiveChat,
    setIsActiveChat,
    handleDrawerReply
}) {
    const [moreAttachments, setMoreAttachments] = useState(false);

    const handleCopyClipboard = () => {
        message.open({
            icon: <FontAwesomeIcon icon={faCopy} className="text-blue-400 me-2" />,
            content: 'Copied: https://workload.vp-digital.com/tasks/view/20130',
        });
    }

    return (
        <div className="pinned-post">
            <div className="flex items-center gap-3 border-b p-5">
                <button className="hover text-base flex items-center" onClick={handleBackViewPinned}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                    <h3 className="text-sm font-bold border-r pe-3 ms-3">PINNED POST</h3>
                </button>

                <h4 className="text-sm">Bugfix & Request Web RRI</h4>
            </div>

            <ul className="ui-chat p-5">
                {Array.from({ length: 10 }).map((_, i) =>
                    <li key={i} className={`wrapper gap-3 ${isActiveChat === i ? 'active' : ''}`}>
                        <Link href="#">
                            <Avatar className="bg-gray-400">DS</Avatar>
                        </Link>

                        <div>
                            <div className="content relative mb-2">
                                <div className="mb-2">
                                    <div className="flex items-center gap-2 relative z-10">
                                        <Link href="#" className="text-sm font-bold fc-base">
                                            Diki Subagja
                                        </Link>
                                        <Tooltip title="July 20 2022 at 9:47 AM" placement="top">
                                            <small>9:47 AM</small>
                                        </Tooltip>

                                        <div className="ms-auto">
                                            <Dropdown
                                                menu={{
                                                    items: itemsDropdownChat(handleCopyClipboard)
                                                }}
                                                placement="bottomRight"
                                            >
                                                <button>
                                                    <FontAwesomeIcon icon={faEllipsis} />
                                                </button>
                                            </Dropdown>
                                        </div>
                                    </div>
                                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero amet earum quaerat! Culpa mollitia quasi deleniti aliquid iusto corporis sit repellendus vitae non neque facilis molestiae, cumque aliquam, sapiente illo.</p>
                                </div>
                                {moreAttachments === i ?
                                    <div className="attachments relative z-10 border-t pt-2 mt-3">
                                        <Fancybox
                                            options={{
                                                Carousel: {
                                                    infinite: false,
                                                },
                                            }}
                                        >
                                            <ul>
                                                <li className='mb-2'>
                                                    <div className="flex items-center gap-1">
                                                        <div className="me-auto">
                                                            <a data-fancybox="gallery" href="https://lipsum.app/id/60/1600x1200">
                                                                <h5 className="text-sm leading-3">
                                                                    <FontAwesomeIcon icon={faImage} /> Google.png
                                                                </h5>
                                                                <small className="fc-base">202kb - May 07 at 7:31 AM</small>
                                                            </a>
                                                        </div>

                                                        <Tooltip title="View" placement="top">
                                                            <a data-fancybox="gallery" href="https://lipsum.app/id/60/1600x1200">
                                                                <Button size="small">
                                                                    <FontAwesomeIcon icon={faEye} />
                                                                </Button>
                                                            </a>
                                                        </Tooltip>

                                                        <Tooltip title="Download" placement="top">
                                                            <a href="/images/google.png" target="_blank">
                                                                <Button size="small">
                                                                    <FontAwesomeIcon icon={faDownload} />
                                                                </Button>
                                                            </a>
                                                        </Tooltip>

                                                        <Tooltip title="Share" placement="top">
                                                            <Button size="small" onClick={handleCopyClipboard}>
                                                                <FontAwesomeIcon icon={faShareFromSquare} />
                                                            </Button>
                                                        </Tooltip>
                                                    </div>
                                                </li>

                                                <li className='mb-2'>
                                                    <div className="flex items-center gap-1">
                                                        <div className="me-auto">
                                                            <a data-fancybox="gallery" href="https://lipsum.app/id/60/1600x1200">
                                                                <h5 className="text-sm leading-3">
                                                                    <FontAwesomeIcon icon={faImage} /> Google.png
                                                                </h5>
                                                                <small className="fc-base">202kb - May 07 at 7:31 AM</small>
                                                            </a>
                                                        </div>

                                                        <Tooltip title="View" placement="top">
                                                            <a data-fancybox="gallery" href="https://lipsum.app/id/60/1600x1200">
                                                                <Button size="small">
                                                                    <FontAwesomeIcon icon={faEye} />
                                                                </Button>
                                                            </a>
                                                        </Tooltip>

                                                        <Tooltip title="Download" placement="top">
                                                            <a href="/images/google.png" target="_blank">
                                                                <Button size="small">
                                                                    <FontAwesomeIcon icon={faDownload} />
                                                                </Button>
                                                            </a>
                                                        </Tooltip>

                                                        <Tooltip title="Share" placement="top">
                                                            <Button size="small" onClick={handleCopyClipboard}>
                                                                <FontAwesomeIcon icon={faShareFromSquare} />
                                                            </Button>
                                                        </Tooltip>
                                                    </div>
                                                </li>
                                            </ul>
                                        </Fancybox>

                                        <div className="text-center">
                                            <button className="text-xs fc-blue" size="small" onClick={() => setMoreAttachments(false)}>
                                                Hide
                                            </button>
                                        </div>
                                    </div>
                                    :
                                    <Button
                                        className=" text-xs relative z-10"
                                        size="small"
                                        onClick={() => {
                                            setMoreAttachments(i)
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faPaperclip} className="me-1" /> Attachments
                                    </Button>
                                }

                                <button
                                    className="stratched-link"
                                    onClick={() => {
                                        setIsActiveChat(i);
                                        handleDrawerReply();
                                    }}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    className="text-xs fc-base pe-3 border-r link-reply hover-blue"
                                    onClick={() => {
                                        setIsActiveChat(i);
                                        handleDrawerReply();
                                    }}
                                >
                                    <FontAwesomeIcon icon={faReply} /> 21 Replies
                                </button>

                                <button className="text-xs fc-base hover-blue">
                                    <FontAwesomeIcon icon={faThumbtack} /> Pinned
                                </button>

                                <small className="text-xs fc-base border-l ps-3 last-reply">Last reply May 20</small>
                            </div>
                        </div>
                    </li>
                )}
            </ul>
        </div>
    )
};
