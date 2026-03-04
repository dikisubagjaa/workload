// src/utils/cronLock.js
import fsMod from 'fs';
const fs = fsMod.promises;
import path from 'path';
import os from 'os';

const LOCK_DIR = process.env.CRON_LOCK_DIR || path.join(os.tmpdir(), 'workload-cron-locks');

async function ensureDir() { try { await fs.mkdir(LOCK_DIR, { recursive: true }); } catch { } }

async function tryAcquire(key, ttlSec = 60) {
    await ensureDir();
    const p = path.join(LOCK_DIR, `${key}.lock`);
    try {
        const st = await fs.stat(p);
        if ((Date.now() - st.mtimeMs) / 1000 < ttlSec) return { ok: false, path: p };
        await fs.unlink(p).catch(() => { });
    } catch { }
    try {
        const fd = await fs.open(p, 'wx');
        await fd.write(`${process.pid}:${new Date().toISOString()}`);
        await fd.close();
        return { ok: true, path: p };
    } catch { return { ok: false, path: p }; }
}

async function release(p) { if (!p) return; try { await fs.unlink(p); } catch { } }

export async function withCronLock(key, fn, { ttlSec = 60 } = {}) {
    const { ok, path } = await tryAcquire(key, ttlSec);
    if (!ok) return { locked: true };
    try { return await fn(); } finally { await release(path); }
}
