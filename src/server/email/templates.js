// src/server/email/templates.js
function esc(s = '') {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function layout({ title, body, ctaHref, ctaText }) {
    const safeTitle = esc(title || 'Workload Notification');
    const button = ctaHref
        ? `<p><a href="${ctaHref}" style="display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;">${esc(ctaText || 'Open')}</a></p>`
        : '';
    return `<!doctype html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px">
    <tr><td style="padding:24px">
      <h2 style="margin:0 0 12px 0;font-size:18px">${safeTitle}</h2>
      <div style="font-size:14px;line-height:1.6;color:#334155">${body || ''}</div>
      ${button}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">
      <p style="font-size:12px;color:#94a3b8;margin:0">This is an automated message from Workload.</p>
    </td></tr>
  </table>
</body></html>`;
}

function asText(html = '') {
    return String(html).replace(/<[^>]+>/g, '').replace(/\s+\n/g, '\n').trim();
}

/** Render subject/html/text untuk tipe tertentu */
function renderEmail(type, data = {}) {
    let subject = '[Workload] Notification';
    let html = '';
    let template_key = type || 'generic';
    const vars = { ...data };

    const link = data.link;
    switch (type) {
        case 'task_comment': {
            const taskTitle = data.taskTitle || 'Task';
            const actor = data.actorName || 'Someone';
            subject = `[Workload] New comment on ${taskTitle}`;
            const body = `
        <p><b>${esc(actor)}</b> commented on <b>${esc(taskTitle)}</b>.</p>
        ${data.comment ? `<blockquote style="margin:8px 0;padding-left:12px;border-left:3px solid #e2e8f0">${esc(data.comment)}</blockquote>` : ''}
      `;
            html = layout({ title: 'New Task Comment', body, ctaHref: link, ctaText: 'View task' });
            break;
        }
        case 'task_status_changed': {
            const taskTitle = data.taskTitle || 'Task';
            const newStatus = data.newStatus || 'updated';
            subject = `[Workload] Task status changed: ${taskTitle}`;
            const body = `<p>Status for <b>${esc(taskTitle)}</b> changed to <b>${esc(newStatus)}</b>.</p>`;
            html = layout({ title: 'Task Status Updated', body, ctaHref: link, ctaText: 'Open task' });
            break;
        }
        case 'subtask_assigned': {
            const taskTitle = data.taskTitle || 'Task';
            subject = `[Workload] You were assigned a subtask: ${taskTitle}`;
            const body = `<p>You have a new subtask on <b>${esc(taskTitle)}</b>.</p>`;
            html = layout({ title: 'New Subtask Assigned', body, ctaHref: link, ctaText: 'View subtask' });
            break;
        }
        case 'timesheet_reminder': {
            subject = `[Workload] Timesheet reminder`;
            const body = `<p>This is a reminder to submit your timesheet.</p>`;
            html = layout({ title: 'Timesheet Reminder', body, ctaHref: link, ctaText: 'Open timesheet' });
            break;
        }
        case 'user_status_changed': {
            const userName = data.user_name || data.userName || "User";
            const fromStatus = data.status_from || data.statusFrom || "-";
            const toStatus = data.status_to || data.statusTo || "active";
            const activatedBy = data.activated_by || data.activatedBy || "Administrator";
            subject = `[Workload] Account status updated: ${toStatus}`;
            const body = `
        <p>Hello <b>${esc(userName)}</b>,</p>
        <p>Your account status has been updated.</p>
        <table role="presentation" cellspacing="0" cellpadding="6" style="border-collapse:collapse;border:1px solid #e2e8f0;margin:8px 0">
          <tr>
            <td style="border:1px solid #e2e8f0"><b>Previous status</b></td>
            <td style="border:1px solid #e2e8f0">${esc(fromStatus)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #e2e8f0"><b>Current status</b></td>
            <td style="border:1px solid #e2e8f0">${esc(toStatus)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #e2e8f0"><b>Updated by</b></td>
            <td style="border:1px solid #e2e8f0">${esc(activatedBy)}</td>
          </tr>
        </table>
        <p>You can now continue to your dashboard.</p>
      `;
            html = layout({ title: "Account Activated", body, ctaHref: link, ctaText: "Open dashboard" });
            break;
        }
        default: {
            subject = `[Workload] Notification`;
            const rawTitle = String(data.title || "You have a new notification.").trim();
            const rawBody = String(data.body || "").trim();
            const sameText = rawBody && rawBody.toLowerCase() === rawTitle.toLowerCase();
            const body = `<p>${esc(rawTitle)}</p>${rawBody && !sameText ? `<p>${esc(rawBody)}</p>` : ''}`;
            html = layout({ title: data.title || 'Notification', body, ctaHref: link, ctaText: 'Open' });
            template_key = 'generic';
        }
    }
    return { subject, html, text: asText(html), template_key, template_vars: vars };
}

module.exports = { renderEmail };
