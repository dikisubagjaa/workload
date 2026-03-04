// src/utils/logger.js
import 'server-only';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'node:path';

const { combine, timestamp, printf, label } = format;

const LOG_DIR = process.env.LOG_DIR || './logs';
const LEVEL = (process.env.LOG_LEVEL || 'warn').toLowerCase(); // tulis warn/error saja
const TZ = process.env.NEXT_PUBLIC_APP_TIMEZONE || process.env.APP_TZ || 'Asia/Jakarta';

function sanitize(s) { return String(s || 'app').replace(/[^a-zA-Z0-9_.-]+/g, '_'); }
function baseDir() { return path.isAbsolute(LOG_DIR) ? LOG_DIR : path.resolve(process.cwd(), LOG_DIR); }

const cache = new Map();

export function getLogger(tag = 'app') {
    const t = sanitize(tag);
    if (cache.has(t)) return cache.get(t);

    const transport = new DailyRotateFile({
        dirname: path.join(baseDir(), '%DATE%'),
        filename: `${t}.log`,
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
    });

    const fmt = printf(({ level, message, timestamp, label, ...meta }) => {
        const ts = new Date(timestamp).toLocaleString('sv-SE', { timeZone: TZ }).replace('T', ' ');
        const msg = typeof message === 'string' ? message : JSON.stringify(message);
        const rest = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
        return `[${ts}] ${level.toUpperCase()} ${label}: ${msg}${rest}`;
    });

    const logger = createLogger({
        level: LEVEL,
        format: combine(label({ label: t }), timestamp(), fmt),
        transports: [transport],
    });

    cache.set(t, logger);
    return logger;
}

export default { getLogger };
