// src/components/utils/DrawerChat.jsx
"use client"
import { useState } from "react";
import { Drawer, message } from "antd";
import DrawerReply from "./utils-drawer-chat/DrawerReply";
import DrawerChannel from "./utils-drawer-chat/DrawerChannel";
import ViewChat from "./utils-drawer-chat/ViewChat";
import ViewInfo from "./utils-drawer-chat/ViewInfo";
import ViewPinned from "./utils-drawer-chat/ViewPinned";
import ViewFiles from "./utils-drawer-chat/ViewFiles";

export default function DrawerChat({
    drawerChat,
    setDrawerChat,
    drawerReply,
    setDrawerReply,
    drawerChannel,
    setDrawerChannel,
    isLaptop,
    roomId,              // <<-- TERIMA roomId dari Navbar
}) {
    const [viewChat, setViewChat] = useState(true);
    const [viewInfo, setViewInfo] = useState(false);
    const [viewPinned, setViewPinned] = useState(false);
    const [viewFiles, setViewFiles] = useState(false);
    const [favorited, setFavorited] = useState(false);
    const [isActiveChat, setIsActiveChat] = useState(false);

    const handleViewInfo = () => {
        setViewInfo(true);
        setViewChat(false);
    }

    const handleBackViewInfo = () => {
        setViewInfo(false)
        setViewChat(true);
    }

    const handleViewPinned = () => {
        setViewPinned(true);
        setViewInfo(false);
    }

    const handleBackViewPinned = () => {
        setViewPinned(false)
        setViewInfo(true);
    }

    const handleViewFiles = () => {
        setViewFiles(true);
        setViewInfo(false);
    }

    const handleBackViewFiles = () => {
        setViewFiles(false)
        setViewInfo(true);
    }

    const handleDrawerReply = () => {
        setDrawerReply(true)
        setDrawerChannel(false)
    }

    const handleCloseDrawerReply = () => {
        setDrawerReply(false);
        setIsActiveChat(false);
    }

    const handleDrawerChannel = () => {
        setDrawerChannel(!drawerChannel)
        setDrawerReply(false)
    }

    const handleCloseDrawerChat = () => {
        setDrawerChat(false);
        setDrawerReply(false);
        setDrawerChannel(false);
    }

    const handleFavorited = () => {
        setFavorited(!favorited)
        if (!favorited == true) {
            message.open({
                type: 'success',
                content: 'Bugfix & Request Web RRI, add to Favorite, added to favorite',
            });
        } else {
            message.open({
                type: 'error',
                content: 'Bugfix & Request Web RRI, add to Favorite, removed from favorite',
            });
        }
    }

    const handleCloseOverlay = () => {
        setDrawerChat(false);
        setDrawerChannel(false);
        setDrawerReply(false);
    }

    return (
        <>
            {/* drawer chat */}
            <Drawer
                open={drawerChat}
                onClose={handleCloseDrawerChat}
                closable={false}
                width={isLaptop ? '100%' : 500}
                zIndex={9}
                className="drawer-chat shadow-2xl"
                classNames={{
                    mask: "custom-mask",
                    header: "pt-3",
                }}
            >
                {viewChat === true ?
                    <ViewChat
                        roomId={roomId}                         // <<-- KIRIM roomId ke ViewChat
                        drawerChannel={drawerChannel}
                        favorited={favorited}
                        handleDrawerChannel={() => handleDrawerChannel()}
                        handleFavorited={() => handleFavorited()}
                        handleDrawerReply={() => handleDrawerReply()}
                        handleViewInfo={() => handleViewInfo()}
                        handleCloseDrawerChat={() => handleCloseDrawerChat()}
                        isActiveChat={isActiveChat}
                        setIsActiveChat={setIsActiveChat}
                    />
                    : null
                }

                {viewInfo === true ?
                    <ViewInfo
                        favorited={favorited}
                        handleBackViewInfo={() => handleBackViewInfo()}
                        handleFavorited={() => handleFavorited()}
                        handleViewPinned={() => handleViewPinned()}
                        handleViewFiles={() => handleViewFiles()}
                    />
                    : null
                }

                {viewPinned === true ?
                    <ViewPinned
                        handleBackViewPinned={() => handleBackViewPinned()}
                        isActiveChat={isActiveChat}
                        setIsActiveChat={setIsActiveChat}
                        handleDrawerReply={() => handleDrawerReply()}
                    />
                    : null
                }

                {viewFiles === true ?
                    <ViewFiles
                        handleBackViewFiles={() => handleBackViewFiles()}
                    />
                    : null
                }
            </Drawer>

            {/* drawer reply */}
            <DrawerReply
                drawerReply={drawerReply}
                setDrawerReply={setDrawerReply}
                handleCloseOverlay={() => handleCloseOverlay()}
                handleCloseDrawerReply={() => handleCloseDrawerReply()}
                isLaptop={isLaptop}
            />

        </>
    )
};
