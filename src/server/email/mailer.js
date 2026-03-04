// src/server/email/mailer.js
const nodemailer = require('nodemailer');

function must(x, name) {
    if (!x) throw new Error(`Missing env: ${name}`);
    return x;
}

// cache transporter agar tidak dibuat ulang di dev/hot-reload
let cached = global.__mailerTransporter;
if (!cached) cached = global.__mailerTransporter = { transporter: null, from: null, enabled: false };

function getTransporter() {
    if (cached.transporter) return cached;

    const host = must(process.env.EMAIL_SMTP_HOST, 'EMAIL_SMTP_HOST');
    const port = Number(process.env.EMAIL_SMTP_PORT || 587);
    const user = must(process.env.EMAIL_SMTP_USER, 'EMAIL_SMTP_USER');
    const pass = must(process.env.EMAIL_SMTP_PASS, 'EMAIL_SMTP_PASS');
    const from = must(process.env.EMAIL_FROM, 'EMAIL_FROM');

    const secure = port === 465; // 465 = SSL/TLS; 587 = STARTTLS
    const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });

    cached.transporter = transporter;
    cached.from = from;
    return cached;
}

/** Kirim email sederhana (HTML + optional text) */
async function sendMail({ to, subject, html, text, headers, attachments = [] }) {
    const { transporter, from } = getTransporter();
    const info = await transporter.sendMail({
        from,
        to,
        subject: subject || '(no subject)',
        html,
        text,
        headers: headers || {},
        attachments: attachments || [],
    });
    return { messageId: info.messageId || '', response: info.response || '' };
}

async function verify() {
    const { transporter } = getTransporter();
    return transporter.verify();
}

module.exports = { getTransporter, sendMail, verify };
