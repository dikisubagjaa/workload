"use client"
import { Button, Drawer, Tag } from "antd";
import { useMobileQuery } from "@/components/libs/UseMediaQuery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { CalendarOutlined } from "@ant-design/icons";

export default function DrawerTracker({ drawerTracker, setDrawerTracker }) {
    const isMobile = useMobileQuery();

    const listDataTracker = [
        { type: 'Proposal', client: 'Pocari Sweat', description: 'Jakarta Run 2025', status: 'Submitted' },
        { type: 'Proposal', client: 'Siloam Hospital', description: 'Corporate Website', status: 'Overdue' },
        { type: 'Invoice', client: 'Pocari Sweat', description: 'Jakarta Run 2025', status: 'Pending' },
        { type: 'Proposal', client: 'Pocari Sweat', description: 'Jakarta Run 2025', status: 'Submitted' },
        { type: 'Proposal', client: 'Siloam Hospital', description: 'Corporate Website', status: 'Overdue' },
        { type: 'Invoice', client: 'Pocari Sweat', description: 'Jakarta Run 2025', status: 'Pending' },
        { type: 'Proposal', client: 'Pocari Sweat', description: 'Jakarta Run 2025', status: 'Submitted' },
        { type: 'Proposal', client: 'Siloam Hospital', description: 'Corporate Website', status: 'Overdue' },
        { type: 'Invoice', client: 'Pocari Sweat', description: 'Jakarta Run 2025', status: 'Pending' },
        { type: 'Proposal', client: 'Pocari Sweat', description: 'Jakarta Run 2025', status: 'Submitted' },
        { type: 'Proposal', client: 'Siloam Hospital', description: 'Corporate Website', status: 'Overdue' },
        { type: 'Invoice', client: 'Pocari Sweat', description: 'Jakarta Run 2025', status: 'Pending' },
        { type: 'Proposal', client: 'Pocari Sweat', description: 'Jakarta Run 2025', status: 'Submitted' },
        { type: 'Proposal', client: 'Siloam Hospital', description: 'Corporate Website', status: 'Overdue' },
        { type: 'Invoice', client: 'Pocari Sweat', description: 'Jakarta Run 2025', status: 'Pending' },
    ];

    return (
        <>
            <Drawer
                open={drawerTracker}
                className="drawer-tracker shadow-2xl"
                classNames={{
                    mask: 'custom-mask',
                    header: 'pt-3'
                }}
                onClose={() => setDrawerTracker(false)}
                zIndex={isMobile ? 3 : 4}
                width={isMobile ? '100%' : 400}
            >
                <div className="px-5 pt-7 mb-5">
                    <div className="flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <Button type='primary' size='small' shape='round' className='px-3 bg-[#E6E6E6] text-[#1E1E1E]'>All</Button>
                            <Button type='primary' size='small' shape='round' className='px-3 bg-[#E6E6E6]' disabled>Invoice</Button>
                            <Button type='primary' size='small' shape='round' className='px-3 bg-[#E6E6E6]' disabled>Proposal</Button>
                            <button className="ms-auto text-lg text-red-400" onClick={() => setDrawerTracker(false)}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-5 scrollbar">
                    {listDataTracker.map((item, index) => (
                        <div className="flex items-center py-2 px-3 gap-3 border-b-2" key={index}>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex gap-2">
                                    <CalendarOutlined className="text-[#02542D]" />
                                    <p className="text-sm fc-base">{item.type}</p>
                                </div>
                                <h3 className="text-sm text-[#383F50] truncate">
                                    {item.client} - {item.description}
                                </h3>
                            </div>

                            <div>
                                {item.status === 'Submitted' && (
                                    <Tag color="success" bordered={false} className='rounded-xl m-0 px-2'>
                                        {item.status}
                                    </Tag>
                                )}
                                {item.status === 'Pending' && (
                                    <Tag color="warning" bordered={false} className='rounded-xl m-0 px-2'>
                                        {item.status}
                                    </Tag>
                                )}
                                {item.status === 'Overdue' && (
                                    <Tag color="error" bordered={false} className='rounded-xl m-0 px-2'>
                                        {item.status}
                                    </Tag>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Drawer >
        </>
    )
};
