// src/utils/avatarHelpers.js
import { getProfileImageUrl } from "@/utils/storageHelpers";

/**
 * Bangun URL avatar profil via API storage.
 * Default: resized (webp 300x300).
 *
 * @param {string} filename - isi dari user.profile_pic
 * @param {{resized?: boolean, size?: 'sm'|'small'}} [opts]
 * @returns {string} URL ke /api/storage atau "" jika filename kosong
 */
export function buildProfileImageUrl(filename, opts = { resized: true }) {
    const name = String(filename || "").trim();
    if (!name) return "";
    return getProfileImageUrl(name, { resized: opts?.resized !== false, size: opts?.size });
}

/**
 * Ambil URL avatar dari object user.
 * Kembalikan "" jika tidak ada, agar layer UI bisa fallback ke initials.
 *
 * @param {{profile_pic?: string}} user
 * @param {{resized?: boolean, size?: 'sm'|'small'}} [opts]
 * @returns {string}
 */
export function getAvatar(user, opts = { resized: true }) {
    const file = user?.profile_pic || "";
    return buildProfileImageUrl(file, opts);
}

export default {
    buildProfileImageUrl,
    getAvatar,
};
