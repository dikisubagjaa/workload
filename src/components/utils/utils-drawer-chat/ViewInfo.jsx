"use client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faStar, faCopy, faThumbtack, faFileLines } from "@fortawesome/free-solid-svg-icons";
import { Button, message } from "antd";
import CopyToClipboard from "react-copy-to-clipboard";

export default function ViewInfo({
    favorited,
    handleFavorited,
    handleBackViewInfo,
    handleViewPinned,
    handleViewFiles
}) {
    
    const handleCopyClipboard = () => {
        message.open({
            icon: <FontAwesomeIcon icon={faCopy} className="text-blue-400 me-2" />,
            content: 'Copied: https://workload.vp-digital.com/tasks/view/20130',
        });
    }

    return (
        <>
            <div className="flex items-center gap-3 border-b p-5">
                <button className="hover text-base flex items-center" onClick={handleBackViewInfo}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                    <h3 className="text-sm font-bold border-r pe-3 ms-3">INFO</h3>
                </button>

                <h4 className="text-sm">Bugfix & Request Web RRI</h4>
            </div>

            <div className="p-5">
                <div className="grid grid-cols-4 gap-3 mb-5">
                    <Button className={`btn-view-info ${favorited === true ? 'active' : ''}`} onClick={handleFavorited}>
                        <FontAwesomeIcon icon={faStar} className="text-lg" /> Favorited
                    </Button>

                    <Button className="btn-view-info" onClick={handleViewPinned}>
                        <FontAwesomeIcon icon={faThumbtack} className="text-lg" /> Pinned
                    </Button>

                    <Button className="btn-view-info" onClick={handleViewFiles}>
                        <FontAwesomeIcon icon={faFileLines} className="text-lg" /> Files
                    </Button>

                    <CopyToClipboard text='https://workload.vp-digital.com/tasks/view/20130'>
                        <Button className="btn-view-info" onClick={() => handleCopyClipboard()}>
                            <FontAwesomeIcon icon={faCopy} className="text-lg" /> Copy Link
                        </Button>
                    </CopyToClipboard>
                </div>

                <h3 className="text-base font-bold mb-2">Description:</h3>
                <div className="description">
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque iure numquam rerum, voluptatem voluptatibus, quod deleniti saepe architecto maxime maiores dolorum voluptatum culpa ipsam ex tenetur id natus, consectetur nostrum!</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora delectus aperiam qui distinctio ea? Minus a reiciendis accusamus nemo assumenda?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores sit aliquam voluptates at, tempore libero eius repellendus dolore hic perspiciatis recusandae delectus corporis atque, eveniet, expedita in! Earum, eum sequi.</p>
                </div>
            </div>
        </>
    )
};
