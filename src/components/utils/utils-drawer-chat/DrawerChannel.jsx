"use client";
import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlus,
  faGlobe,
  faPaperPlane,
  faCircle,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { Drawer, Avatar, Dropdown, Input, Menu } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import ModalNewChannel from "@/components/modal/ModalNewChannel";
import ModalSendMessage from "@/components/modal/ModalSendMessage";

const normalizeRoomId = (roomId) => {
  if (!roomId) return "/";
  if (typeof roomId !== "string") return "/";
  return roomId.startsWith("/") ? roomId : `${roomId}`;
};

const dropdownBrowseChannel = (setModalNewChannel, setModalSendMessage) => [
  {
    key: "new-channel",
    label: (
      <button
        className="w-full text-left"
        onClick={() => setModalNewChannel(true)}
      >
        <FontAwesomeIcon icon={faGlobe} className="me-2" /> New Channel
      </button>
    ),
  },
];

export default function DrawerChannel({
  drawerChannel,
  handleCloseOverlay,
  setDrawerChannel, // dibiarkan untuk kompatibilitas, tapi tidak dipakai
  isLaptop,
  roomId,
}) {
  const [modalNewChannel, setModalNewChannel] = useState(false);
  const [modalSendMessage, setModalSendMessage] = useState(false);

  const safeRoomId = useMemo(() => normalizeRoomId(roomId), [roomId]);

  // menu: hanya CHANNEL (sesuai roomId) + DIRECT MESSAGES
  const itemsChannel = useMemo(
    () => [
      {
        key: "channel-header",
        label: <span className="font-bold fc-base">CHANNEL</span>,
        children: [
          {
            key: "channel-current",
            disabled: true, // channel = roomId tidak bisa dipilih
            label: (
              <div className="w-full flex items-center">
                <FontAwesomeIcon icon={faGlobe} className="me-2" />
                <span>{safeRoomId}</span>
                <FontAwesomeIcon icon={faCircle} className="dot-notif" />
              </div>
            ),
          },
        ],
      },
      {
        key: "dm-header",
        label: <span className="font-bold fc-base">DIRECT MESSAGES</span>,
        children: [
          {
            key: "dm-1",
            label: (
              <button className="w-full flex items-center">
                <Avatar className="bg-gray-400 me-2" size={24}>
                  DS
                </Avatar>
                <span className="me-auto">Diki Subagja</span>
                <FontAwesomeIcon icon={faCircle} className="dot-notif" />
              </button>
            ),
          },
        ],
      },
      
    ],
    [safeRoomId]
  );

  return (
    <>
      <Drawer
        open={drawerChannel}
        closable={false}
        onClose={handleCloseOverlay}
        width={isLaptop ? "100%" : 300}
        zIndex={isLaptop ? 9 : 8}
        classNames={{
          mask: "custom-mask",
        }}
        className="drawer-chat shadow-2xl lg:ms-[-500px]"
      >
        <div className="px-5 pt-5 mb-3">
          <div className="flex items-center gap-3">
            <button className="hover" onClick={handleCloseOverlay}>
              <h3 className="text-lg font-bold">
                <CloseOutlined className="me-2" /> VP DIGITAL
              </h3>
            </button>

            <Dropdown
              menu={{
                items: dropdownBrowseChannel(
                  setModalNewChannel,
                  setModalSendMessage
                ),
              }}
              trigger={["click"]}
              className="ms-auto"
              placement="bottom"
            >
              <button className="text-gray-400">
                <FontAwesomeIcon icon={faCirclePlus} className="text-2xl" />
              </button>
            </Dropdown>
          </div>
          <hr className="my-4" />

          {/* <Input
            placeholder="Find channel"
            prefix={
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="text-gray-400 pe-3"
              />
            }
          /> */}
        </div>

        <div className="scrollbar-channel">
          <Menu
            className="menu-channels"
            mode="inline"
            items={itemsChannel}
            defaultOpenKeys={["channel-header", "dm-header"]}
            defaultSelectedKeys={[]} // tidak ada selected state (threads hidden)
          />
        </div>
      </Drawer>

      <ModalNewChannel
        modalNewChannel={modalNewChannel}
        setModalNewChannel={setModalNewChannel}
      />

      {/* <ModalSendMessage
        modalSendMessage={modalSendMessage}
        setModalSendMessage={setModalSendMessage}
      /> */}
    </>
  );
}
