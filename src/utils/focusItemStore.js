const PREFIX = 'taskFocusItem:';
const memory = new Map();

const canUseSession = () => {
    try {
        if (typeof window === 'undefined') return false;
        const k = '__focus_test__';
        window.sessionStorage.setItem(k, '1');
        window.sessionStorage.removeItem(k);
        return true;
    } catch {
        return false;
    }
};

const useSS = canUseSession();

const ssSet = (key, val) => {
    if (useSS) {
        try {
            window.sessionStorage.setItem(key, val);
            return;
        } catch { }
    }
    memory.set(key, val);
};

const ssConsume = (key) => {
    let val = null;
    if (useSS) {
        try {
            val = window.sessionStorage.getItem(key);
            if (val !== null) window.sessionStorage.removeItem(key);
        } catch { }
    }
    if (val === null && memory.has(key)) {
        val = memory.get(key);
        memory.delete(key);
    }
    return val;
};

/**
 * Simpan id item yang mau difokus (sekali pakai).
 * Dipanggil sebelum navigate ke modal task parent.
 * @param {number|string} parentTaskId
 * @param {number|string} itemId
 */
export const setTaskFocusItem = (parentTaskId, itemId) => {
    if (parentTaskId == null || itemId == null) return;
    const key = `${PREFIX}${String(parentTaskId)}`;
    ssSet(key, String(itemId));
};

/**
 * Ambil & hapus id item fokus untuk task tertentu (sekali pakai).
 * @param {number|string} taskId
 * @returns {string|null}
 */
export const consumeTaskFocusItem = (taskId) => {
    if (taskId == null) return null;
    const key = `${PREFIX}${String(taskId)}`;
    const v = ssConsume(key);
    return v ?? null;
};

// (Opsional) Lihat tanpa menghapus.
export const peekTaskFocusItem = (taskId) => {
    if (taskId == null) return null;
    const key = `${PREFIX}${String(taskId)}`;
    if (useSS) {
        try { return window.sessionStorage.getItem(key); } catch { }
    }
    return memory.get(key) ?? null;
};


export const clearTaskFocusItem = (taskId) => {
    try {
        const key = `taskFocusItem:${String(taskId)}`;
        if (typeof window !== 'undefined') window.sessionStorage.removeItem(key);
    } catch { }
};