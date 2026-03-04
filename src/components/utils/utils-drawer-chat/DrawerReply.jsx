"use client"
import { useRef, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbtack, faFile, faImage, faMicrophone, faCopy, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { Drawer, Tooltip, Avatar, Mentions, Form, Button, message, Upload, Dropdown } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";

const MOCK_DATA = {
    '@': ['afc163', 'zombiej', 'yesmeck'],
    '#': ['1.0', '2.0', '3.0'],
};

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

export default function DrawerReply({ drawerReply, handleCloseDrawerReply, handleCloseOverlay, isLaptop }) {
    const [prefix, setPrefix] = useState('@');
    const [pinned, setPinned] = useState(false);
    const [isActiveSend, setIsActiveSend] = useState(false);

    const refInputFile = useRef(null);
    const refInputMedia = useRef(null);
    const refInputAudio = useRef(null);

    const props = {
        name: 'file',
        action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
        multiple: true,
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
                setIsActiveSend(true);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    const onSearch = (_, newPrefix) => {
        setPrefix(newPrefix);
    };

    const onFinish = (values) => {
        console.log('Success:', values);
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const handleActiveSubmit = (e) => {
        if (e.length > 0) {
            setIsActiveSend(true);
        } else {
            setIsActiveSend(false);
        }
    }

    const handleCopyClipboard = () => {
        message.open({
            icon: <FontAwesomeIcon icon={faCopy} className="text-blue-400 me-2" />,
            content: 'Copied: https://workload.vp-digital.com/tasks/view/20130',
        });
    }

    return (
        <Drawer
            open={drawerReply}
            closable={false}
            onClose={handleCloseOverlay}
            width={isLaptop ? '100%' : 500}
            zIndex={isLaptop ? 9 : 8}
            classNames={{
                mask: 'custom-mask',
                content: 'relative',
            }}
            className="drawer-chat shadow-2xl lg:ms-[-500px]"
        >
            <div className="bg-bluelight flex items-center gap-3 border-b p-5">
                <button className="hover text-base flex items-center" onClick={handleCloseDrawerReply}>
                    <CloseOutlined />
                    <h3 className="text-sm font-bold border-r pe-3 ms-3">REPLY</h3>
                </button>

                <h4 className="text-sm">Bugfix & Request Web RRI</h4>

                <div className="ms-auto">
                    <Button size="small" className={`px-2 ${pinned === true ? 'btn-blue' : ''} text-xs`} onClick={() => setPinned(!pinned)}>
                        <FontAwesomeIcon icon={faThumbtack} className="me-2" /> {pinned === true ? 'Pinned' : 'Pin'}
                    </Button>
                </div>
            </div>

            <ul className="ui-chat thread p-5">
                <li className="wrapper gap-3">
                    <Link href="#">
                        <Avatar className="bg-gray-400">BN</Avatar>
                    </Link>

                    <div>
                        <div className="content mb-2">
                            <div className="flex items-center gap-2 relative z-10">
                                <Link href="#" className="text-sm font-bold fc-base">
                                    Bayu Nugroho
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
                            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Optio, minima.</p>
                        </div>
                    </div>
                </li>

                <li className="wrapper gap-3">
                    <Link href="#">
                        <Avatar className="bg-gray-400">SE</Avatar>
                    </Link>

                    <div>
                        <div className="content mb-2">
                            <div className="flex items-center gap-2 relative z-10">
                                <Link href="#" className="text-sm font-bold fc-base">
                                    Seto Enggar
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
                            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Optio, minima.</p>
                        </div>
                    </div>
                </li>

                <li className="wrapper gap-3 replies">
                    <Link href="#">
                        <Avatar className="bg-gray-400">DS</Avatar>
                    </Link>

                    <div>
                        <div className="content mb-2">
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
                            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Optio, minima.</p>
                        </div>
                    </div>
                </li>

                <li className="wrapper gap-3">
                    <Link href="#">
                        <Avatar className="bg-gray-400">BN</Avatar>
                    </Link>

                    <div>
                        <div className="content mb-2">
                            <div className="flex items-center gap-2 relative z-10">
                                <Link href="#" className="text-sm font-bold fc-base">
                                    Bayu Nugroho
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
                            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Optio, minima.</p>
                        </div>
                    </div>
                </li>

                <li className="wrapper gap-3">
                    <Link href="#">
                        <Avatar className="bg-gray-400">SE</Avatar>
                    </Link>

                    <div>
                        <div className="content mb-2">
                            <div className="flex items-center gap-2 relative z-10">
                                <Link href="#" className="text-sm font-bold fc-base">
                                    Seto Enggar
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
                            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Optio, minima.</p>
                        </div>
                    </div>
                </li>

                <li className="wrapper gap-3 replies">
                    <Link href="#">
                        <Avatar className="bg-gray-400">DS</Avatar>
                    </Link>

                    <div>
                        <div className="content mb-2">
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
                            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Optio, minima.</p>
                        </div>
                    </div>
                </li>

                <li className="wrapper gap-3 replies">
                    <Link href="#">
                        <Avatar className="bg-gray-400">DS</Avatar>
                    </Link>

                    <div>
                        <div className="content mb-2">
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
                            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Optio, minima.</p>
                        </div>
                    </div>
                </li>

                <li className="wrapper gap-3">
                    <Link href="#">
                        <Avatar className="bg-gray-400">BN</Avatar>
                    </Link>

                    <div>
                        <div className="content mb-2">
                            <div className="flex items-center gap-2 relative z-10">
                                <Link href="#" className="text-sm font-bold fc-base">
                                    Bayu Nugroho
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
                            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Optio, minima.</p>
                        </div>
                    </div>
                </li>

                <li className="wrapper gap-3">
                    <Link href="#">
                        <Avatar className="bg-gray-400">SE</Avatar>
                    </Link>

                    <div>
                        <div className="content mb-2">
                            <div className="flex items-center gap-2 relative z-10">
                                <Link href="#" className="text-sm font-bold fc-base">
                                    Seto Enggar
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
                            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Optio, minima.</p>
                        </div>
                    </div>
                </li>

                <li className="text-center">
                    <Button>
                        Load more
                    </Button>
                </li>
            </ul>

            <div className="absolute bottom-0 left-0 w-full p-5 z-10 bg-white">
                <Form
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <div className="upload-filelist">
                        <Upload {...props}>
                            <button ref={refInputFile} />
                        </Upload>

                        <Upload {...props}>
                            <button ref={refInputMedia} />
                        </Upload>

                        <Upload {...props}>
                            <button ref={refInputAudio} />
                        </Upload>
                    </div>

                    <div className="ui-chat-input">
                        <Form.Item
                            name="message"
                            className="mb-0"
                        >
                            <Mentions
                                autoSize
                                allowClear
                                placeholder="Type here..."
                                className="w-full border-0 shadow-none"
                                onSearch={onSearch}
                                onChange={(e) => handleActiveSubmit(e)}
                                prefix={['@', '#']}
                                options={(MOCK_DATA[prefix] || []).map((value) => ({
                                    key: value,
                                    value,
                                    label: value,
                                }))}
                            />
                        </Form.Item>

                        <div className="flex gap-3 px-3 pb-2">
                            <Tooltip title="Upload File" placement="top">
                                <button className="text-gray-400 text-lg hover" onClick={() => refInputFile.current.click()}>
                                    <FontAwesomeIcon icon={faFile} />
                                </button>
                            </Tooltip>

                            <Tooltip title="Upload Media" placement="top">
                                <button className="text-gray-400 text-lg hover" onClick={() => refInputMedia.current.click()}>
                                    <FontAwesomeIcon icon={faImage} />
                                </button>
                            </Tooltip>

                            <Tooltip title="Upload Audio" placement="top">
                                <button className="text-gray-400 text-lg hover" onClick={() => refInputAudio.current.click()}>
                                    <FontAwesomeIcon icon={faMicrophone} />
                                </button>
                            </Tooltip>

                            <Button
                                className="btn-blue ms-auto"
                                htmlType="submit"
                                disabled={isActiveSend == false ? true : false}
                            >
                                Send
                            </Button>
                        </div>
                    </div>
                </Form>
            </div>
        </Drawer >
    )
}
