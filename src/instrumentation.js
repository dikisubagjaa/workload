// src/instrumentation.js
import 'server-only';
export const runtime = 'nodejs';

export async function register() {
    // Beacon biar keliatan hook kepanggil
    console.log('[instrumentation] loaded. node=', (typeof process !== 'undefined' && process?.versions?.node) || 'n/a');

    const norm = (p) => String(p || '').replace(/\\/g, '/');
    const sanitize = (s) => String(s || 'server').replace(/[^a-zA-Z0-9_.-]+/g, '_');

    const SER = (parts) => parts.map(p => {
        if (typeof p === 'string') return p;
        try { return JSON.stringify(p); } catch { return String(p); }
    }).join(' ');

    function tagFromStack() {
        const err = new Error();
        Error.captureStackTrace?.(err, tagFromStack);
        const stack = String(err.stack || '').split('\n').slice(2);
        const SKIP = ['/instrumentation', '/node_modules/', '.next/', 'webpack-internal://', 'node:internal', 'internal/'];

        for (const raw of stack) {
            const cleaned = raw.replace('webpack-internal:///', '').replace('file:///', '');
            const m = cleaned.match(/\(?([^\s()]+):\d+:\d+\)?$/);
            let file = norm(m?.[1] || '');
            if (!file) continue;
            if (SKIP.some(s => file.includes(s))) continue;

            const cwd = norm(process.cwd());
            if (file.startsWith(cwd + '/')) file = file.slice(cwd.length + 1);

            file = file
                .replace(/^\.next\/server\/app\//, 'src/app/')
                .replace(/^\.next\/server\/pages\//, 'src/pages/')
                .replace(/\.(mjs|cjs|js|ts|jsx|tsx)$/, '');

            if (file.startsWith('src/app/api/')) {
                const p = file.slice('src/app/api/'.length).replace(/\/(route|page)$/, '');
                return ('api.' + p.replace(/\//g, '.'));
            }
            if (file.startsWith('src/')) file = file.slice(4);
            return (file || 'server').replace(/\//g, '.');
        }
        return 'server';
    }

    // Ambil modul Node saat runtime (bukan saat bundling)
    function getNodeMods() {
        try {
            // eslint-disable-next-line no-undef
            const req = typeof __non_webpack_require__ === 'function' ? __non_webpack_require__ : (0, eval)('require');
            return { fs: req('fs'), path: req('path') };
        } catch { return { fs: null, path: null }; }
    }

    // Normalisasi tag "tak dikenal" → build.webpack/app
    function normalizeTag(tag, serializedMsg) {
        let finalTag = String(tag || 'server');
        if (finalTag === '' || finalTag === 'app' || /^_anonymous_$/i.test(finalTag)) {
            if (/Critical dependency|webpack|bundle|compile/i.test(serializedMsg)) {
                finalTag = 'build.webpack';
            } else {
                finalTag = 'app';
            }
        }
        return finalTag.replace(/^\.+/, ''); // buang titik di depan kalau ada
    }

    async function write(level, tag, parts) {
        try {
            const mods = getNodeMods();
            if (!mods.fs || !mods.path) {
                if (!globalThis.__filelogWarned) {
                    globalThis.__filelogWarned = true;
                    (globalThis.__oe || console.error)('[filelog.skip] fs/path tidak tersedia (mungkin Edge). runtime=', (globalThis.EdgeRuntime || 'node'));
                }
                return;
            }
            const { fs, path } = mods;
            const { appendFile, mkdir } = fs.promises;
            const { isAbsolute, resolve, join, dirname } = path;

            const rawDir = process.env.LOG_DIR || './logs';
            const base = isAbsolute(rawDir) ? rawDir : resolve(process.cwd(), rawDir);
            const day = new Date().toISOString().slice(0, 10);

            const msg = SER(parts);
            const safeTag = sanitize(normalizeTag(tag, msg));
            const file = join(base, day, `${safeTag}.log`);

            const ts = new Date().toISOString().replace('T', ' ').replace('Z', '');
            const line = `[${ts}] ${level.toUpperCase()} ${safeTag}: ${msg}\n`;

            await mkdir(dirname(file), { recursive: true });
            await appendFile(file, line);
        } catch (e) {
            (globalThis.__oe || console.error)('[filelog.fail]', String(e));
        }
    }

    // Simpan console asli + mirror agar tetap tampil di terminal
    if (!globalThis.__ow) globalThis.__ow = console.warn.bind(console);
    if (!globalThis.__oe) globalThis.__oe = console.error.bind(console);
    if (!globalThis.__oi) globalThis.__oi = console.info.bind(console);

    // Hook error global (hanya bila benar-benar Node)
    const canHookProcess = typeof process !== 'undefined' && typeof process.on === 'function' && process?.versions?.node;
    if (canHookProcess && !globalThis.__procHooked) {
        globalThis.__procHooked = true;
        process.on('uncaughtException', (e) => write('error', 'process', [String(e), e?.stack]));
        process.on('unhandledRejection', (e) => write('error', 'process', [String(e), e?.stack]));
    }

    // Auto-log semua Response 4xx/5xx tanpa ubah route
    if (!globalThis.__responsePatched && typeof globalThis.Response === 'function') {
        globalThis.__responsePatched = true;
        const OrigResponse = globalThis.Response;

        const logIfBad = (res) => {
            const tag = tagFromStack();
            if (res.status >= 500) return write('error', tag, [`response.${res.status}`]);
            if (res.status >= 400) return write('warn', tag, [`response.${res.status}`]);
        };

        function PatchedResponse(body, init) {
            const res = new OrigResponse(body, init);
            logIfBad(res);
            return res;
        }
        PatchedResponse.prototype = OrigResponse.prototype;
        Object.setPrototypeOf(PatchedResponse, OrigResponse);

        PatchedResponse.json = (data, init) => { const r = OrigResponse.json(data, init); logIfBad(r); return r; };
        PatchedResponse.redirect = (url, status) => { const r = OrigResponse.redirect(url, status); logIfBad(r); return r; };

        globalThis.Response = PatchedResponse;
    }

    // Tulis WARN/ERROR ke file + mirror ke terminal (INFO hanya mirror)
    if (!globalThis.__consolePatched) {
        globalThis.__consolePatched = true;
        console.warn = (...a) => { write('warn', tagFromStack(), a); globalThis.__ow(...a); };
        console.error = (...a) => { write('error', tagFromStack(), a); globalThis.__oe(...a); };
        // Kalau mau INFO ikut masuk file, uncomment baris di bawah:
        // console.info  = (...a) => { write('info',  tagFromStack(), a); globalThis.__oi(...a); };
    }
}
