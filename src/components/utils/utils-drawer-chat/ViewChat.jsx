"use client";
import { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReply,
  faCopy,
  faThumbtack,
  faPaperclip,
  faFile,
  faMicrophone,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import {
  Tooltip,
  Avatar,
  Mentions,
  Form,
  Button,
  message,
  Dropdown,
} from "antd";
import {
  AppstoreOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import Fancybox from "@/components/libs/Fancybox";

// Firebase
import { db } from "@/components/libs/firebaseClient";
import { ensureAnonLogin } from "@/components/libs/firebaseAuthAnon";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const MOCK_DATA = {
  "@": ["afc163", "zombiej", "yesmeck"],
  "#": ["1.0", "2.0", "3.0"],
};

const itemsDropdownChat = () => [
  {
    key: "1",
    label: (
      <button className="text-left text-sm w-full">
        <FontAwesomeIcon icon={faTrashCan} className="me-1" /> Delete
      </button>
    ),
  },
];

const normalizeRoomId = (roomId) => {
  if (!roomId) return "/";
  if (typeof roomId !== "string") return "/";
  return roomId.startsWith("/") ? roomId : `/${roomId}`;
};

const toTitleCase = (str) =>
  (str || "").replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

const formatRoomLabel = (roomId) => {
  const safe = normalizeRoomId(roomId);
  if (!safe || safe === "/") return "General Chat";
  if (safe === "/dashboard") return "Dashboard";

  const segments = safe.split("/").filter(Boolean);
  const last = segments[segments.length - 1] || "Chat";
  return toTitleCase(last.replace(/[-_]/g, " "));
};

const formatRoomSubtitle = (roomId) => {
  const safe = normalizeRoomId(roomId);
  if (!safe || safe === "/") return "general";

  const segments = safe.split("/").filter(Boolean);
  if (segments.length === 0) return "general";

  return segments
    .map((seg) => seg.replace(/[-_]/g, " "))
    .join(" / ");
};

const buildRoomLink = (roomId) => normalizeRoomId(roomId);
const getDateFromCreatedAt = (createdAt) => {
  if (!createdAt) return null;
  if (typeof createdAt?.toDate === "function") return createdAt.toDate();
  if (createdAt instanceof Date) return createdAt;
  return null;
};

const getDayLabel = (d) => {
  if (!d) return "";
  const now = new Date();
  const todayKey = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((todayKey - targetKey) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ViewChat({
  roomId,
  drawerChannel, // no longer used (channel drawer disabled)
  favorited, // no longer used
  handleDrawerChannel, // no longer used
  handleFavorited, // no longer used
  handleDrawerReply, // not used, but kept in props
  handleViewInfo,
  isActiveChat,
  setIsActiveChat, // no longer used
  handleCloseDrawerChat,
}) {
  const { data: session } = useSession();
  const currentUser = session?.user;

  const [prefix, setPrefix] = useState("@");
  const [isActiveSend, setIsActiveSend] = useState(false);
  const [moreAttachments, setMoreAttachments] = useState(false);

  const refInputFile = useRef(null);
  const refInputMedia = useRef(null);
  const refInputAudio = useRef(null);
  const messagesEndRef = useRef(null);
  const chatRef = useRef();


  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form] = Form.useForm();

  const safeRoomId = normalizeRoomId(roomId);
  const roomLabel = useMemo(
    () => formatRoomLabel(safeRoomId),
    [safeRoomId]
  );
  const roomSubtitle = useMemo(
    () => formatRoomSubtitle(safeRoomId),
    [safeRoomId]
  );
  const roomLink = useMemo(
    () => buildRoomLink(safeRoomId),
    [safeRoomId]
  );

  const onSearch = (_, newPrefix) => {
    setPrefix(newPrefix);
  };

  // Subscribe ke Firestore berdasarkan roomId
  useEffect(() => {
    if (!safeRoomId) return;

    let unsub;

    async function subscribe() {
      try {
        await ensureAnonLogin();

        const ref = collection(db, "chatMessages");
        const q = query(
          ref,
          where("roomId", "==", safeRoomId),
          orderBy("createdAt", "asc"),
          limit(200)
        );

        unsub = onSnapshot(
          q,
          (snap) => {
            const rows = snap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setMessages(rows);
            setLoading(false);
          },
          (err) => {
            console.error("Firestore onSnapshot error:", err);
            message.error("Failed to load chat: " + err.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error(err);
        message.error("Failed to load chat");
        setLoading(false);
      }
    }

    subscribe();

    return () => {
      if (unsub) unsub();
    };
  }, [safeRoomId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const onFinish = async (values) => {
    const raw = values?.message || "";
    const text = raw.trim();
    if (!text) return;

    try {
      setIsActiveSend(false);
      const fbUser = await ensureAnonLogin();

      const ref = collection(db, "chatMessages");
      const payload = {
        roomId: safeRoomId,
        text,
        createdAt: serverTimestamp(),
        userId: currentUser?.user_id ?? null,
        userName:
          currentUser?.fullname || currentUser?.name || "Guest",
        userAvatar: currentUser?.profile_pic || null,
        firebaseUid: fbUser?.uid || null,
      };

      await addDoc(ref, payload);
      form.resetFields(["message"]);
    } catch (err) {
      console.error(err);
      message.error("Failed to send message");
      setIsActiveSend(true);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const handleCopyClipboard = () => {
    message.open({
      icon: (
        <FontAwesomeIcon
          icon={faCopy}
          className="text-blue-400 me-2"
        />
      ),
      content:
        "Copied: https://workload.vp-digital.com/tasks/view/20130",
    });
  };

  const handleActiveSubmit = (e) => {
    if (e && e.length > 0) {
      setIsActiveSend(true);
    } else {
      setIsActiveSend(false);
    }
  };

  const messageRows = useMemo(() => {
    const rows = [];
    let lastDayKey = null;

    (messages || []).forEach((msg, idx) => {
      const dt = getDateFromCreatedAt(msg?.createdAt);
      const dayKey = dt
        ? `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
          dt.getDate()
        ).padStart(2, "0")}`
        : null;

      if (dayKey && dayKey !== lastDayKey) {
        rows.push({
          type: "separator",
          key: `sep-${dayKey}-${idx}`,
          label: getDayLabel(dt),
        });
        lastDayKey = dayKey;
      }

      rows.push({
        type: "message",
        key: msg.id || `msg-${idx}`,
        index: idx,
        msg,
      });
    });

    return rows;
  }, [messages]);

  return (
    <div className="flex flex-col min-h-full">
      {/* HEADER - simpel: hanya judul + subtitle + menu 3 titik */}
      <div className="flex items-center border-b p-5">
        <button className="hidden" onClick={() => { }}>
          <AppstoreOutlined />
        </button>

        <div className="me-auto">
          <div className="flex items-center gap-3">
            <Link href={roomLink} className="text-sm fc-base">
              {roomLabel}
            </Link>
          </div>
          <Link href={roomLink} className="text-xs">
            #{roomSubtitle}
          </Link>
        </div>

        <div className="ms-auto">
          <button
            className="text-left text-lg text-red-500 w-full"
            onClick={handleCloseDrawerChat}
          >
            <CloseOutlined />
          </button>
        </div>
      </div>

      {/* LIST CHAT */}
      <ul ref={chatRef} className="ui-chat p-5 pb-24">
        {loading && (
          <li className="text-center text-xs text-gray-400">
            Loading chat...
          </li>
        )}

        {!loading && messages.length === 0 && (
          <li className="text-center text-xs text-gray-400">
            No chat in this page yet
          </li>
        )}

        {!loading &&
          messageRows.map((row) => {
            if (row.type === "separator") {
              return (
                <li key={row.key} className="flex justify-center py-2">
                  <span className="rounded-full bg-[#edf2f5] px-3 py-1 text-[11px] font-medium text-[#667085]">
                    {row.label}
                  </span>
                </li>
              );
            }

            const msg = row.msg;
            const i = row.index;
            const messageDate = getDateFromCreatedAt(msg?.createdAt);
            const time24 = messageDate
              ? messageDate.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
              : "";

            return (
            <li
              key={row.key}
              className={`wrapper gap-3 ${isActiveChat === i ? "active" : ""
                }`}
            >
              <Link href="#">
                <Avatar className="bg-gray-400">
                  {msg.userName?.[0]?.toUpperCase() || "?"}
                </Avatar>
              </Link>

              {/* BUBBLE CHAT FULL WIDTH (sisa area setelah avatar) */}
              <div className="w-full">
                <div className="content relative mb-2">
                  <div className="mb-2">
                    <div className="flex items-center gap-2 relative z-10">
                      <Link
                        href="#"
                        className="text-sm font-bold fc-base"
                      >
                        {msg.userName || "Guest"}
                      </Link>
                      <Tooltip
                        title={
                          messageDate
                            ? messageDate.toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                            : ""
                        }
                        placement="top"
                      >
                        <small>{time24}</small>
                      </Tooltip>
                    </div>
                    <p>{msg.text}</p>
                  </div>

                  {/* Attachment section disembunyikan (text only) */}
                  {moreAttachments === i ? (
                    <div className="attachments relative z-10 border-t pt-2 mt-3 hidden">
                      <Fancybox
                        options={{
                          Carousel: {
                            infinite: false,
                          },
                        }}
                      >
                        <ul></ul>
                      </Fancybox>

                      <div className="text-center">
                        <button
                          className="text-xs fc-blue"
                          size="small"
                          onClick={() => setMoreAttachments(false)}
                        >
                          Hide
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="text-xs relative z-10 hidden"
                      size="small"
                      onClick={() => {
                        setMoreAttachments(i);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faPaperclip}
                        className="me-1"
                      />{" "}
                      Attachments
                    </Button>
                  )}

                  {/* stretched link: nonaktifkan reply drawer */}
                  <button
                    className="stratched-link hidden"
                    onClick={() => { }}
                  />
                </div>

                {/* BARIS REPLY / PINNED DI-HIDE */}
                <div className="flex gap-3">
                  <button
                    className="text-xs fc-base pe-3 border-r link-reply hover-blue hidden"
                    onClick={() => { }}
                  >
                    <FontAwesomeIcon icon={faReply} /> 21 Replies
                  </button>

                  <button className="text-xs fc-base hover-blue hidden">
                    <FontAwesomeIcon icon={faThumbtack} /> Pinned
                  </button>

                  <small className="text-xs fc-base border-l ps-3 last-reply hidden">
                    Last reply May 20
                  </small>
                </div>
              </div>
            </li>
          );
        })}

        {/* anchor buat auto-scroll ke bawah */}
        <li />
      </ul>

      {/* INPUT AREA */}
      <div className="absolute bottom-0 left-0 w-full p-5 z-10 bg-white">
        <Form
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          {/* upload filelist (disembunyikan) */}
          <div className="upload-filelist">
            {/* Upload dimatikan untuk chat text-only */}
          </div>

          <div className="ui-chat-input">
            <Form.Item name="message" className="mb-0">
              <Mentions
                autoSize
                allowClear
                placeholder="Type here..."
                className="w-full border-0 shadow-none"
                onSearch={onSearch}
                onChange={(e) => handleActiveSubmit(e)}
                prefix={["@", "#"]}
                options={(MOCK_DATA[prefix] || []).map((value) => ({
                  key: value,
                  value,
                  label: value,
                }))}
              />
            </Form.Item>

            <div className="flex gap-3 px-3 pb-2">
              {/* tombol upload disembunyikan */}
              <Tooltip title="Upload File" placement="top">
                <button
                  className="hidden text-gray-400 text-lg hover"
                  onClick={() => { }}
                >
                  <FontAwesomeIcon icon={faFile} />
                </button>
              </Tooltip>

              <Tooltip title="Upload Audio" placement="top">
                <button
                  className="hidden text-gray-400 text-lg hover"
                  onClick={() => { }}
                >
                  <FontAwesomeIcon icon={faMicrophone} />
                </button>
              </Tooltip>

              <Button
                className="btn-blue ms-auto"
                htmlType="submit"
                disabled={isActiveSend == false}
              >
                Send
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
