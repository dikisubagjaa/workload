// src/components/task/TaskActivity.jsx
"use client";

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, Mentions, Tooltip, Button, Spin, message } from 'antd';
import CommentOutlined from '@ant-design/icons/CommentOutlined';
import SendOutlined from '@ant-design/icons/SendOutlined';
import { fetchUsers as fetchUsersList, getUserLabel } from "@/utils/userHelpers";

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { getInitials } from '@/utils/stringHelpers';
import { asset } from '@/utils/url';
import { getStorageUrl } from "@/utils/storageHelpers"; // NEW: gateway /api/file

export default function TaskActivity({
  taskId,
  taskTitle,
  activityLog,
  subtaskItemTitleMap,
  currentUser,
  addComment,
  loadingComments,
  buildProfileHrefByEmail,
  buildProfileHrefByName,
  attachmentToComment,
  // ✅ NEW: target comment untuk item subtask
  itemToComment,
}) {
  const [commentValue, setCommentValue] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');

  const [userOptions, setUserOptions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const inputRef = useRef(null);

  // commentFor akan diisi object saat menargetkan item subtask: { type: 'task_item', id }
  // atau nilai lain sesuai skema lama (mis. reply ke comment id).
  const [commentFor, setCommentFor] = useState(null);
  const [mentionedUserIds, setMentionedUserIds] = useState(new Set());

  // ID file yang di-mention (untuk case klik "Comment" di FILE)
  const [mentionedAttachmentIds, setMentionedAttachmentIds] = useState(new Set());
  const addAttachmentId = (id) => id && setMentionedAttachmentIds(prev => new Set([...prev, id]));
  const addMentionId = (id) => id && setMentionedUserIds(prev => new Set([...prev, id]));
  const normalizeAvatarSrc = (src) => {
    const v = String(src || "").trim();
    if (!v || v === "null" || v === "undefined") return undefined;
    return v;
  };

  const parseCommentFor = useCallback((raw) => {
    if (!raw) return null;

    let v = raw;
    if (typeof v === "string") {
      try {
        v = JSON.parse(v);
      } catch {
        return null;
      }
    }

    if (typeof v === "number") {
      return { type: "task_item", id: Number(v) };
    }

    if (v && typeof v === "object") {
      const type = String(v.type || "").toLowerCase() || null;
      const id = v.id ?? v.task_item_id ?? null;
      const itemId = Number.isFinite(Number(id)) ? Number(id) : null;
      const title =
        v.title ||
        v.item_title ||
        v.task_item_title ||
        null;

      if ((type === "task_item" || itemId) && itemId) {
        return { type: "task_item", id: itemId, title };
      }
    }

    return null;
  }, []);

  // ==== FIX: fullname itu STRING, jangan diperlakukan array ====
  const getFullname = (u) => {
    return String(getUserLabel(u)).trim();
  };

  const toHyphenName = (s) => String(s).trim().replace(/\s+/g, '-');
  const fromHyphenName = (s) => String(s).replace(/-/g, ' ');
  const toMentionKey = (s) => String(s || '').trim().toLowerCase();
  const escapeRegExp = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const toFileSlug = (s) => String(s || 'file').trim().toLowerCase().replace(/\s+/g, '-');

  // NEW: util kecil
  const toBasename = (s = "") => String(s).replace(/\\/g, "/").split("/").pop();

  const getDownloadName = useCallback((f) => {
    return f?.real_filename || f?.filename || 'file';
  }, []);

  // NEW: bangun URL aman berbasis filename; fallback ke filepath lama jika ada
  const buildDownloadUrl = useCallback((f) => {
    const stored = toBasename(f?.filename || "");
    // /api/file?folder=task&file=<stored>
    if (stored) return getStorageUrl('task', stored);
    return f?.filepath || null; // legacy fallback
  }, []);
  // Download helper: coba via Blob; kalau gagal (CORS), fallback open tab
  const handleDownload = useCallback(async (e, f) => {
    e?.preventDefault?.();
    try {
      const url = buildDownloadUrl(f);
      const name = getDownloadName(f);
      if (!url) return;

      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const blob = await res.blob();

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = name;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      const url = buildDownloadUrl(f);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [buildDownloadUrl, getDownloadName]);

  const insertAttachmentMention = useCallback((att) => {
    if (!att) return;
    const slug = toFileSlug(att.real_filename || att.filename || 'file');
    setCommentValue(prev => {
      const base = prev || '';
      const spacer = base && !base.endsWith(' ') ? ' ' : '';
      return `${base}${spacer}#${slug} `;
    });
    addAttachmentId(att.attachment_id);
    setTimeout(() => inputRef.current?.focus?.(), 0);
  }, []);

  // parent set attachmentToComment → prefill otomatis (mention #file)
  useEffect(() => {
    if (attachmentToComment && attachmentToComment.attachment_id) {
      insertAttachmentMention(attachmentToComment);
    }
  }, [attachmentToComment, insertAttachmentMention]);

  // ✅ NEW: parent set itemToComment → set target item subtask
  useEffect(() => {
    if (!itemToComment || !itemToComment.task_item_id) return;
    // set target comment ke item
    setCommentFor({
      type: 'task_item',
      id: itemToComment.task_item_id,
      task_item_title: itemToComment.title || null,
    });
    // saat pindah target ke item, bersihkan mention file agar tidak tercampur
    setMentionedAttachmentIds(new Set());
    // fokuskan input
    setTimeout(() => inputRef.current?.focus?.(), 0);
  }, [itemToComment]);

  // ====== Mentions @user (sederhana) ======
  const fetchUsers = useCallback(async (keyword = '') => {
    setLoadingUsers(true);
    try {
      const rows = await fetchUsersList({ q: keyword || undefined, limit: 200 });
      setUserOptions(rows.map(u => {
        const label = getFullname(u);
        const value = label;
        return { value, label, __id: u?.user_id ?? u?.id ?? null, __email: u?.email ?? null };
      }));
    } finally { setLoadingUsers(false); }
  }, []);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const userLookupByName = useMemo(() => {
    const map = {};
    (userOptions || []).forEach(o => {
      const id = o.__id ?? null;
      if (o?.label && id !== null) map[toMentionKey(o.label)] = id;
    });
    return map;
  }, [userOptions]);

  const mentionLabels = useMemo(() => {
    return (userOptions || [])
      .map(o => o?.label)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
  }, [userOptions]);

  const handleFocus = useCallback(() => {
    if (!userOptions.length && !loadingUsers) fetchUsers();
  }, [fetchUsers, userOptions.length, loadingUsers]);

  const handleSearchMentions = useCallback((text, prefix) => {
    if (prefix === '@') {
      const q = text || '';
      setMentionQuery(q);
      fetchUsers(q);
    }
  }, [fetchUsers]);

  const handleChange = (val) => {
    const v = typeof val === 'string' ? val : (val?.target?.value ?? '');
    setCommentValue(v);
    // sinkronkan mentioned ids dari token @Nama Lengkap (pakai daftar label)
    const ids = new Set();
    if (mentionLabels.length) {
      const lower = v.toLowerCase();
      mentionLabels.forEach((label) => {
        const key = toMentionKey(label);
        if (!key) return;
        const needle = `@${key}`;
        if (lower.includes(needle)) {
          const id = userLookupByName[key];
          if (id) ids.add(id);
        }
      });
    }
    setMentionedUserIds(ids);
  };

  const handleSelectMention = (option) => {
    const label = option?.label || option?.value;
    const id = userLookupByName[toMentionKey(label)];
    if (id) addMentionId(id);
    if (!label) return;
    // Replace the last "@query" with "@Full Name".
    // Antd Mentions already inserts the selected text, so only replace when needed.
    setCommentValue(prev => {
      const base = String(prev || '');
      const already = `@${label}`;
      if (base.endsWith(`${already} `) || base.endsWith(already)) return base;
      const next = base.replace(/@[^@\s]*$/, `${already} `);
      return next === base ? base : next;
    });
  };

  // Kirim komentar (ikutkan mentioned_attachment_ids + commentFor yg bisa target item)
  const handlePostComment = useCallback(async () => {
    const trimmed = commentValue.trim();
    if (!trimmed) return message.warning("Comment content cannot be empty.");
    try {
      await addComment(
        trimmed,
        commentFor || null,
        Array.from(mentionedUserIds),
        Array.from(mentionedAttachmentIds),
        null,
        'comment'
      );
      setCommentValue('');
      setCommentFor(null);
      setMentionedUserIds(new Set());
      setMentionedAttachmentIds(new Set());
    } catch (e) { console.error("Error posting comment:", e); }
  }, [commentValue, commentFor, mentionedUserIds, mentionedAttachmentIds, addComment]);

  const handleCommentKeyDown = useCallback((e) => {
    if (e.key !== "Enter") return;
    if (e.shiftKey) return;
    e.preventDefault();
    if (loadingComments) return;
    handlePostComment();
  }, [loadingComments, handlePostComment]);

  const buildHrefByEmail = useCallback((uuid) => {
    if (typeof buildProfileHrefByEmail === 'function') return buildProfileHrefByEmail(uuid);
    return `/profile/${encodeURIComponent(uuid)}`;
  }, [buildProfileHrefByEmail]);

  const buildHrefByName = useCallback((name) => {
    if (typeof buildProfileHrefByName === 'function') return buildProfileHrefByName(name);
    return `/users?name=${encodeURIComponent(name)}`;
  }, [buildProfileHrefByName]);

  // Render konten: @user dari activity.mentioned → link
  const renderContentWithClickableMentions = (content, mentions = []) => {
    if (!content) return null;
    const text = String(content);
    const toSlug = (s) =>
      String(s || '').trim().toLowerCase();
    const userSlug = (u) => toSlug(u?.fullname || (u?.email ? u.email.split('@')[0] : ''));
    const mentionMap = new Map(
      (Array.isArray(mentions) ? mentions : []).map(u => [userSlug(u), u])
    );
    const re = mentionLabels.length
      ? new RegExp(`@(${mentionLabels.map(escapeRegExp).join('|')})`, 'gi')
      : /@([^\s]+)/g;
    const nodes = [];
    let last = 0, m, idx = 0;
    while ((m = re.exec(text)) !== null) {
      const start = m.index, end = start + m[0].length;
      if (start > last) nodes.push(<span key={`t-${idx++}`}>{text.slice(last, start)}</span>);
      const raw = m[1] || '';
      const u = mentionMap.get(toSlug(raw));
      const displayName = u?.fullname || raw.replace(/-/g, ' ');
      const href = u?.uuid ? buildHrefByEmail(u.uuid) : buildHrefByName(displayName);
      nodes.push(
        <Link
          key={`m-${idx++}`}
          href={href}
          title={`Open profile of ${displayName}`}
          style={{ color: '#1677ff', fontWeight: 600 }}
          onClick={(e) => e.stopPropagation?.()}
        >
          @{displayName}
        </Link>
      );
      last = end;
    }
    if (last < text.length) nodes.push(<span key={`t-${idx++}`}>{text.slice(last)}</span>);
    return nodes;
  };

  const filterOption = useCallback((input, option) => {
    if (!input) return true;
    const val = String(option?.value || '').toLowerCase(),
      lbl = String(option?.label || '').toLowerCase(),
      q = String(input).toLowerCase();
    return val.includes(q) || lbl.includes(q);
  }, []);
  const mentionOptions = useMemo(
    () => userOptions.map(({ value, label }) => ({ value, label })),
    [userOptions]
  );

  const sortedActivities = useMemo(() => {
    const arr = Array.isArray(activityLog) ? activityLog.slice() : [];
    return arr.sort((a, b) => (b?.created || 0) - (a?.created || 0));
  }, [activityLog]);

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-3">
        <Image src={asset('static/images/icon/segment.png')} width={50} height={50} alt='Activity Icon' className='w-5 h-5' />
        <h3 className="text-base fc-blue">Activity</h3>
      </div>

      <ul className='sm:ps-6'>
        {/* Input Komentar */}
        <li>
          <div className='flex gap-3 mb-5'>
            <div className="flex-none">
              <Avatar size="large" src={normalizeAvatarSrc(currentUser?.profile_pic)}>
                {getInitials(currentUser?.fullname || currentUser?.email || '')}
              </Avatar>
            </div>
            <div className="flex-1">
              {/* Context line (file mention / item target) */}
              {commentFor?.type === 'task_item' && itemToComment?.task_item_id === commentFor?.id && (
                <div className="mb-1 text-xs text-gray-600">
                  Commenting on item: <b>{itemToComment?.title || `#${itemToComment.task_item_id}`}</b>
                  <button
                    type="button"
                    className="ml-2 underline hover:text-gray-800"
                    onClick={() => setCommentFor(null)}
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="input-comment">
                <Mentions
                  ref={inputRef}
                  value={commentValue}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  prefix="@"
                  onSearch={handleSearchMentions}
                  onSelect={handleSelectMention}
                  options={mentionOptions}
                  filterOption={filterOption}
                  autoSize
                  spellCheck={false}
                  onKeyDown={handleCommentKeyDown}
                  className='w-full min-h-10'
                  placeholder={loadingUsers ? "Loading users..." : "Write a comment (type @Nama Lengkap)"}
                  notFoundContent={loadingUsers ? 'Loading...' : 'No users'}
                />
                <div className="text-end send-btn">
                  <Tooltip title="Send">
                    <Button type="text" className='fc-blue text-xl px-3' onClick={handlePostComment} loading={loadingComments} icon={<SendOutlined />} />
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </li>

        {/* List Activity */}
        {loadingComments && activityLog.length === 0 ? (
          <li className="text-center py-5"><Spin /><p className="text-gray-500">Loading activities...</p></li>
        ) : activityLog.length === 0 ? (
          <li className="text-center text-gray-500 py-5">No activities yet.</li>
        ) : (
          sortedActivities.map((activity) => {
            const author = activity.creator || activity.user || {};
            const authorName = author.fullname || 'Unknown User';
            const commentTarget = parseCommentFor(activity?.comment_for);
            const targetItemTitle =
              commentTarget?.title ||
              (commentTarget?.id ? subtaskItemTitleMap?.[Number(commentTarget.id)] : null) ||
              (commentTarget?.id ? `#${commentTarget.id}` : null);
            return (
              <li key={activity.comment_id} id={`comment-${activity.comment_id}`} className="mb-5">
                <div className='flex items-start gap-3'>
                  <div className="flex-none">
                    <Avatar size="large" src={normalizeAvatarSrc(author.profile_pic)}>{getInitials(authorName)}</Avatar>
                  </div>
                  <div className='flex-1'>
                    <h4 className="text-sm fc-base mb-1">
                      <b>{authorName}</b>{' '}
                      {activity.type === 'comment' ? (
                        <span>{renderContentWithClickableMentions(activity.content, activity.mentioned)}</span>
                      ) : activity.type === 'upload' ? (
                        <>uploaded <b>{activity.real_filename || 'a file'}</b></>
                      ) : activity.type === 'created' ? (
                        <>added this <b>{activity.task_title || taskTitle}</b></>
                      ) : (<>{activity.content || 'performed an action'}</>)}
                    </h4>

                    {activity.type === "comment" && commentTarget?.type === "task_item" && (
                      <div className="text-xs text-gray-500 mb-1">
                        Comment on item: <span className="font-medium">{targetItemTitle}</span>
                      </div>
                    )}

                    {Array.isArray(activity.mentioned_attachments) && activity.mentioned_attachments.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {activity.mentioned_attachments.map((f) => {
                          const url = buildDownloadUrl(f);
                          return (
                            <a
                              key={f.attachment_id}
                              href={url || undefined}
                              onClick={(e) => handleDownload(e, f)}
                              className="text-xs px-2 py-1 rounded bg-gray-100 hover:underline"
                            >
                              #{getDownloadName(f)}
                            </a>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex gap-2 mt-1">
                      <p className="text-xs text-gray-400">
                        {activity.created ? dayjs.unix(activity.created).fromNow() : 'just now'}
                      </p>
                      <button
                        type="button"
                        className="text-xs text-gray-400 hover"
                        onClick={() => {
                          const target = activity?.creator || activity?.user;
                          if (!target) return;
                          const name = target.fullname || target.name || target.email || '';
                          // reply ke user: set mention @user dan fokus
                          setCommentValue(prev => {
                            const base = prev || '';
                            const spacer = base && !base.endsWith(' ') ? ' ' : '';
                            return `${base}${spacer}@${name} `;
                          });
                          const targetId = target.user_id || target.id;
                          if (targetId) addMentionId(targetId);
                          // NOTE: jangan set commentFor jadi object item di kasus Reply
                          setTimeout(() => inputRef.current?.focus?.(), 0);
                        }}
                      >
                        <CommentOutlined /> Reply
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
