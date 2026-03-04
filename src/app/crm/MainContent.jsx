'use client'
import Image from "next/image";
import { useState } from "react";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faBook, faChevronDown, faDollarSign, faEnvelope, faGlobe, faLocationDot, faPhone, faPlus, faTrashCan, faUser, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Card, Dropdown, Form, Input, Popconfirm, Table, Tag } from "antd";
import ModalEditProfile from "./modal/ModalEditProfile";
import ModalCreateOpportunity from "./modal/ModalCreateOpportuity";
import ModalUploadQoutation from "./modal/ModalUploadQoutation";
import ModalShowMaps from "./modal/ModalShowMaps";
import ModalAddContact from "./modal/ModalAddContact";
import ModalOpportunity from "./modal/ModalOpportunity";
import ModalCreateActivity from "./modal/ModalCreateActivity";
import ModalTask from "./modal/ModalTaskCrm";
import ModalLost from "./modal/ModalLost";
import ModalWon from "./modal/ModalWon";
import { asset } from "@/utils/url";

const { TextArea } = Input;

const MainContent = () => {
    const [modalEditProfile, setModalEditProfile] = useState(false);
    const [modalCreateOpportunity, setModalCreateOpportunity] = useState(false);
    const [modalUploadQoutation, setModalUploadQoutation] = useState(false);
    const [modalShowMaps, setModalShowMaps] = useState(false);
    const [modalAddContact, setModalAddContact] = useState(false);
    const [modalOpportunity, setModalOpportunity] = useState(false);
    const [modalCreateActivity, setModalCreateActivity] = useState(false);
    const [modalTask, setModalTask] = useState(false);
    const [modalLost, setModalLost] = useState(false);
    const [modalWon, setModalWon] = useState(false);

    const [form1] = Form.useForm();
    const [form2] = Form.useForm();

    const SubmitClient = (values) => {
        console.log(values);
    };

    const SubmitPropossed = (values) => {
        console.log(values);
    };

    const columns = [
        {
            title: 'Created',
            dataIndex: 'created',
            key: 'created',
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
        },
        {
            title: 'Agent',
            dataIndex: 'agent',
            key: 'agent',
        },
        {
            title: 'Due Date',
            dataIndex: 'duedate',
            key: 'duedate',
        },
        {
            title: 'Quotation',
            dataIndex: 'qoutation',
            key: 'qoutation',
        },
    ];

    const data = [
        {
            key: '1',
            created: '20/12/2024',
            size: 'Small',
            agent: 'John Doe',
            duedate: '20/12/2024',
            qoutation: (
                <div className="flex gap-2 items-center">
                    <button className="fc-blue" onClick={() => setModalOpportunity(true)}>View</button>
                    <span className="fc-blue">|</span>
                    <button className="fc-blue">Download</button>
                </div>
            ),
        },
        {
            key: '1',
            created: '20/12/2024',
            size: 'Small',
            agent: 'John Doe',
            duedate: '20/12/2024',
            qoutation: (
                <div className="flex gap-2 items-center">
                    <button className="fc-blue" onClick={() => setModalOpportunity(true)}>View</button>
                    <span className="fc-blue">|</span>
                    <button className="fc-blue">Download</button>
                </div>
            ),
        },
        {
            key: '1',
            created: '20/12/2024',
            size: 'Small',
            agent: 'John Doe',
            duedate: '20/12/2024',
            qoutation: (
                <div className="flex gap-2 items-center">
                    <button className="fc-blue" onClick={() => setModalOpportunity(true)}>View</button>
                    <span className="fc-blue">|</span>
                    <button className="fc-blue">Download</button>
                </div>
            ),
        },
        {
            key: '1',
            created: '20/12/2024',
            size: 'Small',
            agent: 'John Doe',
            duedate: '20/12/2024',
            qoutation: (
                <div className="flex gap-2 items-center">
                    <button className="fc-blue" onClick={() => setModalOpportunity(true)}>View</button>
                    <span className="fc-blue">|</span>
                    <button className="fc-blue">Download</button>
                </div>
            ),
        },
        {
            key: '1',
            created: '20/12/2024',
            size: 'Small',
            agent: 'John Doe',
            duedate: '20/12/2024',
            qoutation: (
                <div className="flex gap-2 items-center">
                    <button className="fc-blue" onClick={() => setModalOpportunity(true)}>View</button>
                    <span className="fc-blue">|</span>
                    <button className="fc-blue">Download</button>
                </div>
            ),
        },
    ];

    const dropdownStatus = [
        {
            key: '1',
            label: <button className="w-full text-start">Mark as Not Started</button>,
        },
        {
            key: '2',
            label: <button className="w-full text-start">Mark as Internal Review</button>,
        },
        {
            key: '3',
            label: <button className="w-full text-start">Mark as Awaiting Feedback</button>,
        },
        {
            key: '4',
            label: <button className="w-full text-start">Mark as Complete</button>,
        },
        {
            key: '5',
            label: <button className="w-full text-start">Mark as Cancel</button>,
        },
    ];

    return (
        <>
            <section className="container pt-5">
                <div className="grid grid-cols-2 gap-8 fc-base">
                    <div className="scrollbar-card">
                        <Card className="card-box fc-base">
                            {/* profile */}
                            <div className="relative flex gap-3 mb-7">
                                <div className="w-full">
                                    <div className="mb-2">
                                        <h3 className="text-lg font-bold">PT. ABC Company</h3>
                                        <h4 className="text-lg fc-blue font-semibold">B2B</h4>
                                    </div>

                                    <h4 className="text-base text-gray-400">Lead in Date</h4>
                                    <p className="text-sm">20/12/2024 09:47</p>
                                </div>

                                <div className="w-full">
                                    <div className="mb-2">
                                        <h3 className="text-base">Agent Name</h3>
                                        <h3 className="text-lg font-bold"><FontAwesomeIcon icon={faUser} /> John Doe</h3>
                                    </div>

                                    <h4 className="text-base text-gray-400">Lead Source</h4>
                                    <p className="text-sm">Google Ads</p>
                                </div>

                                <div className="absolute top-0 right-0">
                                    <Button className="btn-outline-blue" size="small" onClick={() => setModalEditProfile(true)}>
                                        <FontAwesomeIcon icon={faPenToSquare} />
                                    </Button>
                                </div>
                            </div>

                            {/* lead status */}
                            <ul className="flex gap-1 current-status mb-1">
                                <li className="w-full">
                                    <button className="btn-link active">New</button>
                                </li>

                                <li className="w-full">
                                    <button className="btn-link">Validated</button>
                                </li>

                                <li className="w-full">
                                    <button className="btn-link">Client Needs</button>
                                </li>

                                <li className="w-full">
                                    <button className="btn-link">Offering</button>
                                </li>

                                <li className="w-full">
                                    <button className="btn-link">Qouted</button>
                                </li>

                                <li className="w-full">
                                    <button className="btn-link">Won</button>
                                </li>
                            </ul>
                            <h5 className="text-sm mb-7">Lead Current Status: <span className="fc-blue">Touched</span></h5>

                            {/* form */}
                            <div className="grid grid-cols-2 gap-6 mb-7">
                                <div>
                                    <div className="mb-3">
                                        <button className="fc-blue" onClick={() => setModalCreateOpportunity(true)}>
                                            <FontAwesomeIcon icon={faPlus} /> Create Opportunity
                                        </button>
                                    </div>
                                    <Form
                                        form={form1}
                                        onFinish={SubmitClient}
                                        variant={'filled'}
                                    >
                                        <Form.Item
                                            name="clientNeeds"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Please input!',
                                                },
                                            ]}
                                        >
                                            <TextArea rows={4} placeholder="Client Needs" className="rounded-xl" />
                                        </Form.Item>

                                        <Form.Item
                                            className="text-center"
                                        >
                                            <Button type="primary" htmlType="submit" size="small" shape="round" className="px-3">
                                                Submit
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </div>

                                <div>
                                    <div className="mb-3">
                                        <button className="fc-blue" onClick={() => setModalUploadQoutation(true)}>
                                            <FontAwesomeIcon icon={faPlus} />  Upload Quotation
                                        </button>
                                    </div>

                                    <Form
                                        form={form2}
                                        onFinish={SubmitPropossed}
                                        variant={'filled'}
                                    >
                                        <Form.Item
                                            name="propossedOffer"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Please input!',
                                                },
                                            ]}
                                        >
                                            <TextArea rows={4} placeholder="Propossed Offer" className="rounded-xl" />
                                        </Form.Item>

                                        <Form.Item
                                            className="text-center"
                                        >
                                            <Button type="primary" htmlType="submit" size="small" shape="round" className="px-3">
                                                Submit
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </div>
                            </div>

                            {/* customer notes */}
                            <div className="mb-8">
                                <div className="flex items-center gap-4 mb-5">
                                    <FontAwesomeIcon icon={faBook} className="text-2xl fc-blue bg-white" />
                                    <div className="w-full border border-[#f1f1f1]" />
                                </div>

                                <h3 className="text-gray-400 text-sm mb-2">Customer Notes</h3>
                                <ul>
                                    <li className="mb-3">
                                        <Card className="shadow-sm" classNames={{ body: 'p-2' }}>
                                            <h6 className="text-sm fc-base">15/01 called no answer</h6>
                                        </Card>
                                    </li>

                                    <li className="mb-3">
                                        <Card className="shadow-sm" classNames={{ body: 'p-2' }}>
                                            <h6 className="text-sm fc-base">15/01 called no answer</h6>
                                        </Card>
                                    </li>

                                    <li className="mb-3">
                                        <Card className="shadow-sm" classNames={{ body: 'p-2' }}>
                                            <h6 className="text-sm fc-base">15/01 called no answer</h6>
                                        </Card>
                                    </li>

                                    <li className="mb-3">
                                        <Card className="shadow-sm" classNames={{ body: 'p-2' }}>
                                            <h6 className="text-sm fc-base">15/01 called no answer</h6>
                                        </Card>
                                    </li>
                                </ul>
                            </div>

                            {/* contacts */}
                            <div className="mb-8">
                                <div className="flex items-center gap-4">
                                    <FontAwesomeIcon icon={faUserPlus} className="text-2xl fc-blue bg-white" />
                                    <div className="w-full border border-[#f1f1f1]" />
                                </div>

                                <div className="text-end mb-3">
                                    <Button shape="round" className="btn-outline-blue px-3" onClick={() => setModalAddContact(true)}>
                                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Add/Edit Contact
                                    </Button>
                                </div>

                                <ul className="mb-5">
                                    <li className="py-3 border-b">
                                        <div className="grid grid-cols-2">
                                            <div>
                                                <div className="mb-3">
                                                    <h6 className="text-gray-400 text-sm">Customer Name</h6>
                                                    <h5 className="font-semibold text-sm">Chris Evans</h5>
                                                </div>

                                                <h5 className="text-sm"><FontAwesomeIcon icon={faEnvelope} className="text-sm text-gray-400" /> chris.evans@america.com</h5>
                                                <h5 className="text-sm"><FontAwesomeIcon icon={faPhone} className="text-sm text-gray-400" /> +62 819-9876-9087</h5>
                                            </div>

                                            <div>
                                                <div className="mb-3">
                                                    <h6 className="text-gray-400 text-sm">Department (if any)</h6>
                                                    <h5 className="font-semibold text-sm">Procurement</h5>
                                                </div>

                                                <h6 className="text-gray-400 text-sm">Gender</h6>
                                                <h5 className="font-semibold text-sm">Male</h5>
                                            </div>
                                        </div>
                                    </li>

                                    <li className="py-3 border-b">
                                        <div className="grid grid-cols-2">
                                            <div>
                                                <div className="mb-3">
                                                    <h6 className="text-gray-400 text-sm">Customer Name</h6>
                                                    <h5 className="font-semibold text-sm">Chris Evans</h5>
                                                </div>

                                                <h5 className="text-sm"><FontAwesomeIcon icon={faEnvelope} className="text-sm text-gray-400" /> chris.evans@america.com</h5>
                                                <h5 className="text-sm"><FontAwesomeIcon icon={faPhone} className="text-sm text-gray-400" /> +62 819-9876-9087</h5>
                                            </div>

                                            <div>
                                                <div className="mb-3">
                                                    <h6 className="text-gray-400 text-sm">Department (if any)</h6>
                                                    <h5 className="font-semibold text-sm">Procurement</h5>
                                                </div>

                                                <h6 className="text-gray-400 text-sm">Gender</h6>
                                                <h5 className="font-semibold text-sm">Male</h5>
                                            </div>
                                        </div>
                                    </li>
                                </ul>

                                <div className="text-end">

                                </div>
                            </div>

                            {/* address */}
                            <div className="mb-8">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="flex items-center fc-blue">
                                        <FontAwesomeIcon icon={faLocationDot} className="text-2xl" />
                                        <FontAwesomeIcon icon={faPlus} className="text-sm" />
                                    </div>
                                    <div className="w-full border border-[#f1f1f1]" />
                                </div>

                                <ul>
                                    <li className="flex items-center justify-between">
                                        <div className="w-1/2">
                                            <h6 className="text-gray-400 text-sm mb-1">Address</h6>
                                            <p className="text-sm">Jl. Mas Putih No.33 Blok D, RT.10/RW.8, Grogol Utara, Kec. Kby. Lama, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12210</p>
                                        </div>

                                        <Button className="btn-outline-blue" onClick={() => setModalShowMaps(true)}>
                                            <FontAwesomeIcon icon={faGlobe} className="me-2" /> Show Maps
                                        </Button>
                                    </li>
                                </ul>
                            </div>

                            {/* opportunity */}
                            <div className="mb-8">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="flex items-center fc-blue">
                                        <FontAwesomeIcon icon={faUser} className="text-2xl" />
                                        <FontAwesomeIcon icon={faDollarSign} className="text-sm" />
                                    </div>
                                    <div className="w-full border border-[#f1f1f1]" />
                                </div>
                                <h6 className="text-gray-400 text-sm mb-1">Opportunity</h6>
                                <Table
                                    columns={columns}
                                    dataSource={data}
                                    pagination={2}
                                    size="small"
                                    className="text-sm"
                                />
                            </div>
                        </Card>
                    </div>

                    <div className="scrollbar-card">
                        <Card className="card-box fc-base">
                            <div className="flex justify-between gap-2">
                                <div className="flex gap-2">
                                    <Button className="btn-blue" shape="round" onClick={() => setModalCreateActivity(true)}>
                                        <FontAwesomeIcon icon={faPlus} className="me-1" />New Activity
                                    </Button>

                                    <Button className="btn-blue" shape="round" onClick={() => setModalTask(true)}>
                                        <FontAwesomeIcon icon={faPlus} className="me-1" />New Task
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <Button color="danger" variant="solid" shape="round" onClick={() => setModalLost(true)}>
                                        LOST
                                    </Button>

                                    <Button className="btn-success" shape="round" onClick={() => setModalWon(true)}>
                                        WON
                                    </Button>
                                </div>
                            </div>
                            <hr className="my-4" />

                            <div className="mb-8">
                                <h3 className="text-base font-semibold mb-3">TASK LIST</h3>

                                <ul>
                                    <li className="mb-4">
                                        <Card className="shadow-sm fc-base">
                                            <div className="flex gap-5 mb-4">
                                                <div className="flex-1">
                                                    <p className="text-sm">nulla voluptates id repellat! Dignissimos obcaecati reprehenderit omnis, hic consequuntur autem aliquid explicabo voluptatibus reiciendis.</p>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <button className="text-[#ffc107]" onClick={() => setModalTask(true)}>
                                                        <FontAwesomeIcon icon={faPenToSquare} />
                                                    </button>

                                                    <Popconfirm
                                                        title="Delete the task"
                                                        description="Are you sure to delete this task?"
                                                        okText="Yes"
                                                        cancelText="No"
                                                    >
                                                        <button className="text-red-500">
                                                            <FontAwesomeIcon icon={faTrashCan} />
                                                        </button>
                                                    </Popconfirm>
                                                </div>
                                            </div>

                                            <div className="flex gap-5">
                                                <div>
                                                    <h4 className="text-gray-400 text-sm mb-1">DUE DATE:</h4>
                                                    <h5 className="text-sm">2025-01-16</h5>
                                                </div>

                                                <div>
                                                    <h4 className="text-gray-400 text-sm mb-1">OVERDUE:</h4>
                                                    <h5 className="text-sm">2w 12h ago</h5>
                                                </div>

                                                <div>
                                                    <h4 className="text-gray-400 text-sm mb-1">PRIORITY:</h4>
                                                    <Tag color="error">high</Tag>
                                                </div>

                                                <div>
                                                    <h4 className="text-gray-400 text-sm mb-1">STATUS:</h4>
                                                    <Dropdown
                                                        menu={{ items: dropdownStatus }}
                                                        trigger={['click']}
                                                    >
                                                        <Button size="small" className="btn-outline-blue px-3" onClick={(e) => e.preventDefault()}>
                                                            Mark as Not Started <FontAwesomeIcon icon={faChevronDown} />
                                                        </Button>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                        </Card>
                                    </li>

                                    <li className="mb-4">
                                        <Card className="shadow-sm fc-base">
                                            <div className="flex gap-5 mb-4">
                                                <div className="flex-1">
                                                    <p className="text-sm">nulla voluptates id repellat! Dignissimos obcaecati reprehenderit omnis, hic consequuntur autem aliquid explicabo voluptatibus reiciendis.</p>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <button className="text-[#ffc107]" onClick={() => setModalTask(true)}>
                                                        <FontAwesomeIcon icon={faPenToSquare} />
                                                    </button>

                                                    <Popconfirm
                                                        title="Delete the task"
                                                        description="Are you sure to delete this task?"
                                                        okText="Yes"
                                                        cancelText="No"
                                                    >
                                                        <button className="text-red-500">
                                                            <FontAwesomeIcon icon={faTrashCan} />
                                                        </button>
                                                    </Popconfirm>
                                                </div>
                                            </div>

                                            <div className="flex gap-5">
                                                <div>
                                                    <h4 className="text-gray-400 text-sm mb-1">DUE DATE:</h4>
                                                    <h5 className="text-sm">2025-01-16</h5>
                                                </div>

                                                <div>
                                                    <h4 className="text-gray-400 text-sm mb-1">OVERDUE:</h4>
                                                    <h5 className="text-sm">2w 12h ago</h5>
                                                </div>

                                                <div>
                                                    <h4 className="text-gray-400 text-sm mb-1">PRIORITY:</h4>
                                                    <Tag color="error">high</Tag>
                                                </div>

                                                <div>
                                                    <h4 className="text-gray-400 text-sm mb-1">STATUS:</h4>
                                                    <Dropdown
                                                        menu={{ items: dropdownStatus }}
                                                        trigger={['click']}
                                                    >
                                                        <Button size="small" className="btn-outline-blue px-3" onClick={(e) => e.preventDefault()}>
                                                            Mark as Not Started <FontAwesomeIcon icon={faChevronDown} />
                                                        </Button>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                        </Card>
                                    </li>
                                </ul>
                            </div>
                            <hr className="mb-5" />

                            <div className="mb-8">
                                <h3 className="text-base font-semibold mb-3">ACTIVITY LIST</h3>
                                <ul>
                                    <li className="mb-4">
                                        <Card className="shadow-sm fc-base">
                                            <div className="flex">
                                                <div className="flex-1">
                                                    <h4 className="text-sm"><b>Activity Name</b> started at <b>Date &amp; Time</b> by <b>Agent Name</b></h4>
                                                    <h4 className="text-sm">Some notes which get taken during the call:</h4>
                                                    <ul className="list-disc ps-4 mb-3">
                                                        <li>Need A</li>
                                                        <li>Need B</li>
                                                        <li>Need C</li>
                                                        <li>Need D</li>
                                                        <li>Need E</li>
                                                    </ul>
                                                    <h4 className="text-sm">Follow Up Date: <b>21/12/2024 18:04</b></h4>
                                                </div>

                                                <div className="flex-none">
                                                    <div className="flex flex-col justify-between h-full">
                                                        <div className="flex justify-end gap-3">
                                                            <button className="text-[#ffc107]" onClick={() => setModalCreateActivity(true)}>
                                                                <FontAwesomeIcon icon={faPenToSquare} />
                                                            </button>

                                                            <Popconfirm
                                                                title="Delete the Activity"
                                                                description="Are you sure to delete this activity?"
                                                                okText="Yes"
                                                                cancelText="No"
                                                            >
                                                                <button className="text-red-500">
                                                                    <FontAwesomeIcon icon={faTrashCan} />
                                                                </button>
                                                            </Popconfirm>
                                                        </div>
                                                        <Tag color="success" className="text-xs">Answered</Tag>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="icon-base shadow-md">
                                                <Image
                                                    src={asset('static/images/icon/ic-call.png')}
                                                    width={20}
                                                    height={20}
                                                    alt='Avatar'
                                                    className='rounded-full'
                                                />
                                            </div>
                                        </Card>
                                    </li>

                                    <li className="mb-4">
                                        <Card className="shadow-sm fc-base">
                                            <div className="flex">
                                                <div className="flex-1">
                                                    <h4 className="text-sm"><b>Activity Name</b> started at <b>Date &amp; Time</b> by <b>Agent Name</b></h4>
                                                    <h4 className="text-sm">Some notes which get taken during the call:</h4>
                                                    <ul className="list-disc ps-4 mb-3">
                                                        <li>Need A</li>
                                                        <li>Need B</li>
                                                        <li>Need C</li>
                                                        <li>Need D</li>
                                                        <li>Need E</li>
                                                    </ul>
                                                    <h4 className="text-sm">Follow Up Date: <b>21/12/2024 18:04</b></h4>
                                                </div>

                                                <div className="flex-none">
                                                    <div className="flex flex-col justify-between h-full">
                                                        <div className="flex justify-end gap-3">
                                                            <button className="text-[#ffc107]" onClick={() => setModalCreateActivity(true)}>
                                                                <FontAwesomeIcon icon={faPenToSquare} />
                                                            </button>

                                                            <Popconfirm
                                                                title="Delete the Activity"
                                                                description="Are you sure to delete this activity?"
                                                                okText="Yes"
                                                                cancelText="No"
                                                            >
                                                                <button className="text-red-500">
                                                                    <FontAwesomeIcon icon={faTrashCan} />
                                                                </button>
                                                            </Popconfirm>
                                                        </div>
                                                        <Tag color="error" className="text-xs">Not Answered</Tag>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="icon-base shadow-md">
                                                <Image
                                                    src={asset('static/images/icon/ic-meet.png')}
                                                    width={20}
                                                    height={20}
                                                    alt='Avatar'
                                                    className='rounded-full'
                                                />
                                            </div>
                                        </Card>
                                    </li>

                                    <li className="mb-4">
                                        <Card className="shadow-sm fc-base">
                                            <div className="flex">
                                                <div className="flex-1">
                                                    <h4 className="text-sm"><b>Activity Name</b> started at <b>Date &amp; Time</b> by <b>Agent Name</b></h4>
                                                    <h4 className="text-sm">Some notes which get taken during the call:</h4>
                                                    <ul className="list-disc ps-4 mb-3">
                                                        <li>Need A</li>
                                                        <li>Need B</li>
                                                        <li>Need C</li>
                                                        <li>Need D</li>
                                                        <li>Need E</li>
                                                    </ul>
                                                    <h4 className="text-sm">Follow Up Date: <b>21/12/2024 18:04</b></h4>
                                                </div>

                                                <div className="flex-none">
                                                    <div className="flex flex-col justify-between h-full">
                                                        <div className="flex justify-end gap-3">
                                                            <button className="text-[#ffc107]" onClick={() => setModalCreateActivity(true)}>
                                                                <FontAwesomeIcon icon={faPenToSquare} />
                                                            </button>

                                                            <Popconfirm
                                                                title="Delete the Activity"
                                                                description="Are you sure to delete this activity?"
                                                                okText="Yes"
                                                                cancelText="No"
                                                            >
                                                                <button className="text-red-500">
                                                                    <FontAwesomeIcon icon={faTrashCan} />
                                                                </button>
                                                            </Popconfirm>
                                                        </div>
                                                        <Tag color="success" className="text-xs">Answered</Tag>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="icon-base shadow-md">
                                                <Image
                                                    src={asset('static/images/icon/ic-wa.png')}
                                                    width={20}
                                                    height={20}
                                                    alt='Avatar'
                                                    className='rounded-full'
                                                />
                                            </div>
                                        </Card>
                                    </li>
                                </ul>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            <ModalEditProfile
                modalEditProfile={modalEditProfile}
                setModalEditProfile={setModalEditProfile}
            />

            <ModalCreateOpportunity
                modalCreateOpportunity={modalCreateOpportunity}
                setModalCreateOpportunity={setModalCreateOpportunity}
            />

            <ModalUploadQoutation
                modalUploadQoutation={modalUploadQoutation}
                setModalUploadQoutation={setModalUploadQoutation}
            />

            <ModalAddContact
                modalAddContact={modalAddContact}
                setModalAddContact={setModalAddContact}
            />

            <ModalShowMaps
                modalShowMaps={modalShowMaps}
                setModalShowMaps={setModalShowMaps}
            />

            <ModalOpportunity
                modalOpportunity={modalOpportunity}
                setModalOpportunity={setModalOpportunity}
            />

            <ModalCreateActivity
                modalCreateActivity={modalCreateActivity}
                setModalCreateActivity={setModalCreateActivity}
                setModalCreateOpportunity={setModalCreateOpportunity}
                setModalUploadQoutation={setModalUploadQoutation}
            />

            <ModalTask
                modalTask={modalTask}
                setModalTask={setModalTask}
            />

            <ModalLost
                modalLost={modalLost}
                setModalLost={setModalLost}
            />

            <ModalWon
                modalWon={modalWon}
                setModalWon={setModalWon}
            />
        </>
    )
}

export default MainContent
