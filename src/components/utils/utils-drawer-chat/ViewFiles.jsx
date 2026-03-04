"use client"
import Fancybox from '@/components/libs/Fancybox';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faDownload, faShareFromSquare, faEye, faImage, faCopy } from "@fortawesome/free-solid-svg-icons";
import { Tooltip, Button, message } from "antd";
import CopyToClipboard from 'react-copy-to-clipboard';

export default function ViewFiles({ handleBackViewFiles }) {
    const handleCopyClipboard = () => {
        message.open({
            icon: <FontAwesomeIcon icon={faCopy} className="text-blue-400 me-2" />,
            content: 'Copied: https://workload.vp-digital.com/tasks/view/20130',
        });
    }

    return (
        <>
            <div className="flex items-center gap-3 border-b p-5">
                <button className="hover text-base flex items-center" onClick={handleBackViewFiles}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                    <h3 className="text-sm font-bold border-r pe-3 ms-3">FILLES</h3>
                </button>

                <h4 className="text-sm">Bugfix & Request Web RRI</h4>
            </div>

            <div className="scrollbar p-5">
                <Fancybox
                    options={{
                        Carousel: {
                            infinite: false,
                        },
                    }}
                >
                    <ul className="mb-5">
                        {Array.from({ length: 15 }).map((_, i) =>
                            <li key={i} className='border-b py-4'>
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
                                        <CopyToClipboard text='https://workload.vp-digital.com/tasks/view/20130'>
                                            <Button size="small" onClick={handleCopyClipboard}>
                                                <FontAwesomeIcon icon={faShareFromSquare} />
                                            </Button>
                                        </CopyToClipboard>
                                    </Tooltip>
                                </div>
                            </li>
                        )}
                    </ul>
                </Fancybox>

                <div className="text-center">
                    <Button>Load more</Button>
                </div>
            </div>
        </>
    )
};
