// src/components/task/TaskAttachments.jsx
"use client";

import Image from 'next/image';
import { Dropdown, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useMemo, useCallback } from 'react';
dayjs.extend(relativeTime);

import { asset } from '@/utils/url';
import { getStorageUrl } from '@/utils/storageHelpers';

export default function TaskAttachments({
    taskId,
    listTaskAttachment,
    handleUploadTask,
    sideBarDisabled,
    taskTitle,
    deleteTaskAttachment,
    onCommentAttachment, // ← dipakai untuk prefill #file di TaskActivity
}) {
    // ==== Helpers (lokal) ====
    const IMG_EXTS = new Set(["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg", "tif", "tiff"]);
    const RASTER_RESIZEABLE = new Set(["png", "jpg", "jpeg", "webp"]); // thumbnail tersedia
    const getExt = (name = "") => {
        const m = String(name).toLowerCase().match(/\.([a-z0-9]+)$/i);
        return m ? m[1] : "";
    };
    const getDisplayName = (att) => att?.real_filename || att?.filename || "file";

    // Fancybox (imperatif) — sudah terbukti stabil
    const fbOptions = useMemo(() => ({
        Carousel: { infinite: false },
        autoFocus: false,
        trapFocus: false,
        placeFocusBack: false,
        dragToClose: false,
    }), []);

    // Resolve attachment → { hrefView, hrefOriginal, isImage, extension }
    const resolveAttachment = (att = {}) => {
        const realName = String(att?.real_filename || "").trim();
        const storedName = String(att?.filename || "").trim(); // nama fisik (wajib ada)
        const baseForDetect = realName || storedName;

        const extLower = getExt(baseForDetect);
        const ext = (extLower || "file").toUpperCase();
        const isImage = baseForDetect ? IMG_EXTS.has(extLower) : false;

        let hrefView = null;
        let hrefOriginal = null;

        if (storedName) {
            hrefOriginal = getStorageUrl('task', storedName); // ← SELALU original untuk download
            if (isImage) {
                // View pakai resized untuk raster; non-raster pakai original
                hrefView = RASTER_RESIZEABLE.has(extLower)
                    ? getStorageUrl('task', storedName, { resized: true })
                    : hrefOriginal;
            } else {
                hrefView = hrefOriginal;
            }
        }

        return { hrefView, hrefOriginal, isImage, extension: ext };
    };

    // Kumpulan item image untuk galeri Fancybox
    const galleryItems = useMemo(() => {
        return (Array.isArray(listTaskAttachment) ? listTaskAttachment : [])
            .map((att) => {
                const r = resolveAttachment(att);
                return r.isImage && r.hrefView ? { src: r.hrefView, type: 'image' } : null;
            })
            .filter(Boolean);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listTaskAttachment]);

    // Buka Fancybox pada index tertentu
    const openGalleryAt = useCallback(async (index) => {
        if (index == null || index < 0 || index >= galleryItems.length) return;
        const mod = await import('@fancyapps/ui');
        const { Fancybox } = mod;
        Fancybox.show(galleryItems, { ...fbOptions, startIndex: index });
    }, [galleryItems, fbOptions]);

    // === Download ORIGINAL tanpa buka tab / preview ===
    const handleDownloadOriginal = useCallback(async (att) => {
        if (!att) return;
        const { hrefOriginal } = resolveAttachment(att);
        const filename = getDisplayName(att);

        if (!hrefOriginal) return;

        try {
            const res = await fetch(hrefOriginal, { credentials: 'include' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;         // ← paksa save-as pakai nama asli
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            /* no-op */
        }
    }, []);

    // Thumbnail kiri:
    // - Image → tampilkan GAMBAR aslinya (hrefView) dan klik buka Fancybox
    // - Non-image → kotak statis berisi ekstensi (tanpa klik/preview)
    const renderPreview = (att, imgIndex) => {
        const { hrefView, isImage, extension } = resolveAttachment(att);
        if (!hrefView) {
            return (
                <div className="bg-[#F5F5F5] w-14 h-10 rounded flex items-center justify-center">
                    <h6 className="fc-base text-xs font-bold">FILE</h6>
                </div>
            );
        }

        if (isImage) {
            return (
                <button
                    type="button"
                    onClick={() => openGalleryAt(imgIndex)}
                    aria-label="View"
                    className="leading-none"
                >
                    <Image
                        src={hrefView}
                        width={56}
                        height={40}
                        alt={getDisplayName(att)}
                        className="w-14 h-10 object-cover rounded"
                        unoptimized
                    />
                </button>
            );
        }

        // Non-image: tampilkan box dengan extension (bukan link)
        return (
            <div className="bg-[#F5F5F5] w-14 h-10 rounded flex items-center justify-center">
                <h6 className="fc-base text-xs font-bold">{extension}</h6>
            </div>
        );
    };

    return (
        <>
            <h3 className="text-sm fc-base mb-4">Files</h3>

            <ul className="flex flex-col gap-5">
                {listTaskAttachment.map((item) => {
                    const { hrefView, hrefOriginal, isImage } = resolveAttachment(item);
                    const displayName = getDisplayName(item);

                    // Index image ini di galeri:
                    const thisImgIndex = isImage && hrefView
                        ? galleryItems.findIndex((gi) => gi.src === hrefView)
                        : -1;

                    return (
                        <li key={item.attachment_id} className="flex gap-4 border-b sm:border-0 pb-3 sm:pb-0">
                            <div className="flex-none hidden sm:block">
                                {renderPreview(item, thisImgIndex)}
                            </div>

                            <div className="flex-1 me-auto">
                                {/* Judul bukan link view */}
                                <h3 className="text-sm font-semibold fc-base">{displayName}</h3>
                                <h4 className="text-xs text-gray-400">
                                    Added {item.created && typeof item.created === 'number' ? dayjs.unix(item.created).fromNow() : 'just now'}
                                    {' by '}
                                    <span className="font-semibold">
                                        {item.user_payload?.fullname || 'Unknown User'}
                                    </span>
                                    {' for '}
                                    <span className="font-semibold">{taskTitle}</span>
                                </h4>
                            </div>

                            <div className="flex-none">
                                <div className="flex mb-auto gap-3">
                                    {/* View: image buka Fancybox; non-image tidak ada preview */}
                                    {isImage && hrefView ? (
                                        <button
                                            type="button"
                                            onClick={() => openGalleryAt(thisImgIndex)}
                                            aria-label="View"
                                            className="leading-none"
                                        >
                                            <Image
                                                src={asset('static/images/icon/pan_zoom.png')}
                                                width={50}
                                                height={50}
                                                alt="View"
                                                className="w-5"
                                            />
                                        </button>
                                    ) : (
                                        <span className="opacity-40 cursor-not-allowed" aria-hidden>
                                            <Image
                                                src={asset('static/images/icon/pan_zoom.png')}
                                                width={50}
                                                height={50}
                                                alt="View"
                                                className="w-5"
                                            />
                                        </span>
                                    )}

                                    <Dropdown
                                        menu={{
                                            items: [
                                                {
                                                    key: 'cmt',
                                                    label: (
                                                        <button
                                                            type="button"
                                                            className="border-b text-left w-full"
                                                            onClick={() => onCommentAttachment?.(item)}
                                                        >
                                                            Comment
                                                        </button>
                                                    ),
                                                },
                                                {
                                                    key: 'dl',
                                                    // ⬇️ SELALU download ORIGINAL via fetch blob — tidak buka tab
                                                    label: hrefOriginal ? (
                                                        <button
                                                            type="button"
                                                            className="border-b text-left w-full"
                                                            onClick={() => handleDownloadOriginal(item)}
                                                        >
                                                            Download
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400 cursor-not-allowed border-b block">Download</span>
                                                    ),
                                                },
                                                {
                                                    key: 'del',
                                                    label: (
                                                        <Popconfirm
                                                            title="Delete the file"
                                                            description="Are you sure to delete this file?"
                                                            okText="Yes"
                                                            cancelText="No"
                                                            onConfirm={() => deleteTaskAttachment(item.attachment_id)}
                                                        >
                                                            <button type="button" className="text-red-500 text-left w-full">Delete</button>
                                                        </Popconfirm>
                                                    ),
                                                },
                                            ],
                                        }}
                                        trigger={['click']}
                                        placement="bottomRight"
                                    >
                                        <button type="button" className="hover">
                                            <Image src="/static/images/icon/dot-3.png" width={50} height={50} alt="More actions" className="w-6" />
                                        </button>
                                    </Dropdown>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}
