#!/usr/bin/env node
/**
 * EOD Report Generator
 * Runs daily at 6am ET via GitHub Actions (cron: 0 10 * * *)
 *
 * Flow:
 * 1. Connect to Gmail via IMAP (lolasuperbot@gmail.com)
 * 2. Fetch EOD emails from reports@operations.rrealtacos.com (last 24h)
 * 3. Parse each email for location data
 * 4. Save JSON to data/eod-reports/YYYY-MM-DD.json
 * 5. Generate PDF report (Cover → Executive Summary → Breakdown → Critical → Maintenance)
 * 6. Email PDF to majo@rrealtacos.com
 *
 * Required secrets (GitHub Actions):
 *   GMAIL_APP_PASSWORD — Gmail App Password for lolasuperbot@gmail.com
 *   SURGE_TOKEN        — For dashboard deploy (optional)
 */

'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── Config ──────────────────────────────────────────────────────────────────
const GMAIL_USER = 'lolasuperbot@gmail.com';
const EOD_SENDER = 'reports@operations.rrealtacos.com';
const REPORT_TO  = 'majo@rrealtacos.com';

const LOCATIONS = [
  'Midtown', 'West Midtown', 'Chamblee', 'Sandy Springs', 'Cumming',
  'Sugar Hill', 'Buckhead', 'Decatur', 'Lawrenceville', 'Beltline', 'Duluth'
];

const CRITICAL_KEYWORDS = [
  'health department', 'injury', 'fight', 'theft', 'police', 'fire',
  'flood', 'broken', 'emergency', 'ambulance', 'raw', 'contamination', 'poisoning'
];
const MAINT_KEYWORDS = [
  'broken', 'not working', 'repair', 'fix', 'leak', 'ac', 'heat',
  'freezer', 'cooler', 'oven', 'fryer', 'plumbing', 'electrical', 'pest', 'roach', 'mouse'
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const isCritical    = t => CRITICAL_KEYWORDS.some(k => (t||'').toLowerCase().includes(k));
const isMaintenance = t => MAINT_KEYWORDS.some(k => (t||'').toLowerCase().includes(k));

function getYesterdayET() {
  // Rough ET conversion (UTC-5; handles most cases)
  const now = new Date();
  const et  = new Date(now.getTime() + (-5 * 60 * 60 * 1000));
  et.setDate(et.getDate() - 1);
  return et.toISOString().split('T')[0];
}

// ── Gmail IMAP ────────────────────────────────────────────────────────────────
async function fetchEODEmails() {
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!appPassword) {
    console.log('[EOD] No GMAIL_APP_PASSWORD — using empty dataset');
    return [];
  }
  try {
    const { ImapFlow } = require('imapflow');
    const client = new ImapFlow({
      host: 'imap.gmail.com', port: 993, secure: true,
      auth: { user: GMAIL_USER, pass: appPassword },
      logger: false
    });
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    const emails = [];
    try {
      const since = new Date();
      since.setDate(since.getDate() - 1);
      const messages = client.fetch(
        { from: EOD_SENDER, since },
        { source: true, envelope: true }
      );
      for await (const msg of messages) {
        const source = msg.source ? msg.source.toString('utf8') : '';
        emails.push({ subject: msg.envelope?.subject || '', body: source });
      }
    } finally { lock.release(); }
    await client.logout();
    console.log(`[EOD] Fetched ${emails.length} email(s)`);
    return emails;
  } catch (e) {
    console.error('[EOD] IMAP error:', e.message);
    return [];
  }
}

// ── Email Parser ──────────────────────────────────────────────────────────────
function parseEmail(email) {
  const lines = (email.body || '').split('\n').map(l => l.trim()).filter(Boolean);
  const extract = (...labels) => {
    for (const label of labels) {
      const line = lines.find(l => l.toLowerCase().startsWith(label.toLowerCase() + ':'));
      if (line) return line.substring(line.indexOf(':') + 1).trim();
    }
    return null;
  };
  return {
    closing_time:        extract('Closing Time', 'Close Time', 'Closed at'),
    manager_on_duty:     extract('Manager on Duty', 'MOD', 'Manager'),
    sales_summary:       extract('Sales', 'Net Sales', 'Total Sales'),
    staff_issues:        extract('Staff Issues', 'Staff', 'Team Issues'),
    customer_complaints: extract('Customer Complaints', 'Complaints', 'Customer Issues'),
    maintenance_needs:   extract('Maintenance', 'Repair Needed', 'Equipment'),
    critical_incidents:  extract('Critical', 'Incident', 'Emergency'),
    notes:               extract('Notes', 'Additional Notes', 'Other')
  };
}

// ── Build Report Data ─────────────────────────────────────────────────────────
function buildReport(emailData, dateStr) {
  const report = { date: dateStr, generated_at: new Date().toISOString(), locations: {} };
  LOCATIONS.forEach(loc => {
    const email = emailData.find(e =>
      e.subject.toLowerCase().includes(loc.toLowerCase()) ||
      e.body.toLowerCase().includes(`location: ${loc.toLowerCase()}`)
    );
    if (!email) {
      report.locations[loc] = { location: loc, date: dateStr, status: 'MISSING', is_critical: false, has_maintenance: false };
      return;
    }
    const parsed  = parseEmail(email);
    const fullTxt = Object.values(parsed).filter(Boolean).join(' ');
    const critical = isCritical(fullTxt);
    const maint    = isMaintenance(fullTxt);
    report.locations[loc] = {
      location: loc, date: dateStr,
      status: critical ? 'CRITICAL' : 'ON TIME',
      ...parsed,
      is_critical: critical,
      has_maintenance: maint,
      submitted_at: new Date().toISOString()
    };
  });
  return report;
}

// ── PDF HTML Generator ────────────────────────────────────────────────────────
function generatePDFHtml(report, dateStr) {
  const locs     = report.locations || {};
  const received = Object.values(locs).filter(r => r.status !== 'MISSING');
  const missing  = Object.values(locs).filter(r => r.status === 'MISSING');
  const critical = Object.values(locs).filter(r => r.is_critical);
  const maint    = Object.values(locs).filter(r => r.has_maintenance);

  const fmtDate = d => new Date(d).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const today    = fmtDate(new Date());
  const nightDate = fmtDate(dateStr + 'T12:00:00');

  // Location cards for breakdown page
  const locationRows = LOCATIONS.map(loc => {
    const r = locs[loc] || { location: loc, status: 'MISSING' };
    const sc  = r.is_critical ? '#dc2626' : r.status === 'LATE' ? '#d97706' : r.status === 'MISSING' ? '#dc2626' : '#16a34a';
    const bdg = r.is_critical ? '🚨 CRITICAL' : r.status === 'MISSING' ? 'MISSING' : r.status === 'LATE' ? 'WATCH' : 'ALL GOOD';
    return `<div style="margin-bottom:18px;padding:14px 16px;border:1px solid ${r.is_critical ? '#dc2626' : '#e2e8f0'};border-radius:8px;${r.is_critical ? 'background:#fff5f5;' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <div style="font-size:.95rem;font-weight:700;">${loc}</div>
        <span style="background:${sc};color:white;padding:2px 9px;border-radius:4px;font-size:.72rem;font-weight:700;">${bdg}</span>
      </div>
      ${r.manager_on_duty     ? `<div style="font-size:.79rem;color:#475569;margin-bottom:3px;">👤 ${r.manager_on_duty}</div>` : ''}
      ${r.closing_time        ? `<div style="font-size:.79rem;color:#475569;margin-bottom:3px;">🕐 Closed: ${r.closing_time}</div>` : ''}
      ${r.sales_summary       ? `<div style="font-size:.79rem;color:#1e293b;margin-bottom:3px;">💰 ${r.sales_summary}</div>` : ''}
      ${r.staff_issues        ? `<div style="font-size:.79rem;color:#475569;margin-bottom:3px;">👥 ${r.staff_issues}</div>` : ''}
      ${r.customer_complaints ? `<div style="font-size:.79rem;color:#475569;margin-bottom:3px;">💬 ${r.customer_complaints}</div>` : ''}
      ${r.is_critical && r.critical_incidents ? `<div style="font-size:.79rem;color:#dc2626;font-weight:700;margin-top:5px;">🚨 ${r.critical_incidents}</div>` : ''}
      ${r.has_maintenance && r.maintenance_needs ? `<div style="font-size:.79rem;color:#d97706;margin-top:3px;">🔧 ${r.maintenance_needs}</div>` : ''}
      ${r.status === 'MISSING' ? `<div style="font-size:.79rem;color:#dc2626;font-weight:600;margin-top:5px;">No EOD report received by 2:00 AM</div>` : ''}
    </div>`;
  }).join('');

  // Critical page
  const critSection = critical.length ? `
<div style="page-break-before:always;padding:40px 48px;">
  <h2 style="font-size:1.4rem;font-weight:700;color:#dc2626;border-bottom:2px solid #dc2626;padding-bottom:10px;margin-bottom:20px;">🚨 Critical Incidents</h2>
  ${critical.map(r => `<div style="background:#fff5f5;border:2px solid #dc2626;border-radius:8px;padding:16px;margin-bottom:16px;">
    <div style="font-size:1rem;font-weight:700;color:#dc2626;margin-bottom:6px;">${r.location}</div>
    <div style="font-size:.86rem;color:#7f1d1d;">${r.critical_incidents || 'See full report for details'}</div>
    <div style="font-size:.82rem;color:#dc2626;font-weight:700;margin-top:8px;border-top:1px solid #fecaca;padding-top:6px;">⚠️ REQUIRED ACTION: Immediate management review</div>
  </div>`).join('')}
</div>` : '';

  // Maintenance page
  const maintSection = maint.length ? `
<div style="page-break-before:always;padding:40px 48px;">
  <h2 style="font-size:1.4rem;font-weight:700;border-bottom:2px solid #f97316;padding-bottom:10px;margin-bottom:20px;">🔧 Maintenance Requests</h2>
  <table style="width:100%;border-collapse:collapse;">
    <thead><tr style="background:#f8fafc;">
      <th style="padding:10px;text-align:left;font-size:.73rem;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0;">Location</th>
      <th style="padding:10px;text-align:left;font-size:.73rem;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0;">Issue Reported</th>
      <th style="padding:10px;text-align:left;font-size:.73rem;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0;">Priority</th>
      <th style="padding:10px;text-align:left;font-size:.73rem;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0;">Reported By</th>
    </tr></thead>
    <tbody>${maint.map(r => {
      const p = /urgent|emergency|not working/i.test(r.maintenance_needs || '') ? 'URGENT' : 'NORMAL';
      const pb = p === 'URGENT' ? '#fee2e2' : '#fef3c7';
      const pc = p === 'URGENT' ? '#991b1b' : '#92400e';
      return `<tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:9px 10px;font-weight:600;">${r.location}</td>
        <td style="padding:9px 10px;">${r.maintenance_needs || '—'}</td>
        <td style="padding:9px 10px;"><span style="background:${pb};color:${pc};padding:2px 8px;border-radius:4px;font-size:.72rem;font-weight:700;">${p}</span></td>
        <td style="padding:9px 10px;color:#64748b;">${r.manager_on_duty || '—'}</td>
      </tr>`;
    }).join('')}</tbody>
  </table>
</div>` : '';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; background: white; color: #1e293b; }
  @page { margin: 0; size: A4; }
</style>
</head><body>

<!-- PAGE 1: Cover -->
<div style="height:100vh;background:linear-gradient(135deg,#0f2d4a,#1e3a5f,#164e7a);display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;text-align:center;padding:60px;">
  <img src="https://rrealtacos-dashboard.surge.sh/receipt-logo_1680210631_400.jpg" style="width:140px;margin-bottom:32px;border-radius:12px;" onerror="this.style.display='none'">
  <h1 style="font-size:2.4rem;font-weight:900;margin:0 0 12px;letter-spacing:-1px;">End of Day Report</h1>
  <h2 style="font-size:1.3rem;font-weight:400;margin:0 0 8px;opacity:.85;">All Locations</h2>
  <div style="font-size:1rem;opacity:.7;margin-top:12px;">${nightDate}</div>
  <div style="font-size:.88rem;opacity:.55;margin-top:6px;">Generated ${today} at 6:00 AM ET</div>
  <div style="margin-top:40px;background:rgba(255,255,255,.15);border-radius:12px;padding:16px 32px;font-size:.95rem;">
    <strong>${received.length} of 11</strong> locations reporting
    ${missing.length  ? ` &nbsp;·&nbsp; <span style="color:#fca5a5;">${missing.length} missing</span>` : ''}
    ${critical.length ? ` &nbsp;·&nbsp; <span style="color:#fca5a5;">🚨 ${critical.length} critical</span>` : ''}
  </div>
</div>

<!-- PAGE 2: Executive Summary -->
<div style="page-break-before:always;padding:40px 48px;">
  <h2 style="font-size:1.4rem;font-weight:700;border-bottom:2px solid #e2e8f0;padding-bottom:10px;margin-bottom:20px;">Executive Summary</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
    <div style="background:#f0fdf4;border-radius:8px;padding:16px;text-align:center;">
      <div style="font-size:2rem;font-weight:900;color:#16a34a;">${received.length}/11</div>
      <div style="font-size:.8rem;color:#15803d;font-weight:600;">Locations Reporting</div>
    </div>
    <div style="background:${missing.length ? '#fff5f5' : '#f0fdf4'};border-radius:8px;padding:16px;text-align:center;">
      <div style="font-size:2rem;font-weight:900;color:${missing.length ? '#dc2626' : '#16a34a'};">${missing.length}</div>
      <div style="font-size:.8rem;font-weight:600;color:${missing.length ? '#991b1b' : '#15803d'};">Missing Locations</div>
    </div>
    <div style="background:${critical.length ? '#fff5f5' : '#f0fdf4'};border-radius:8px;padding:16px;text-align:center;">
      <div style="font-size:2rem;font-weight:900;color:${critical.length ? '#dc2626' : '#16a34a'};">${critical.length}</div>
      <div style="font-size:.8rem;font-weight:600;color:${critical.length ? '#991b1b' : '#15803d'};">🚨 Critical Incidents</div>
    </div>
    <div style="background:${maint.length ? '#fffbeb' : '#f0fdf4'};border-radius:8px;padding:16px;text-align:center;">
      <div style="font-size:2rem;font-weight:900;color:${maint.length ? '#d97706' : '#16a34a'};">${maint.length}</div>
      <div style="font-size:.8rem;font-weight:600;color:${maint.length ? '#92400e' : '#15803d'};">🔧 Maintenance Requests</div>
    </div>
  </div>
  ${missing.length ? `<div style="background:#fff5f5;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;">
    <div style="font-size:.85rem;font-weight:700;color:#dc2626;margin-bottom:5px;">❌ Missing Reports:</div>
    <div style="font-size:.85rem;color:#7f1d1d;">${missing.map(r => r.location).join(' · ')}</div>
  </div>` : `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;font-size:.85rem;color:#15803d;font-weight:600;">✅ All 11 locations submitted their EOD report</div>`}
</div>

<!-- PAGE 3: Location Breakdown -->
<div style="page-break-before:always;padding:40px 48px;">
  <h2 style="font-size:1.4rem;font-weight:700;border-bottom:2px solid #e2e8f0;padding-bottom:10px;margin-bottom:20px;">Location by Location Breakdown</h2>
  ${locationRows}
</div>

${critSection}
${maintSection}

</body></html>`;
}

// ── Email Sender ──────────────────────────────────────────────────────────────
async function sendEmailReport(dateStr, pdfPath, report) {
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!appPassword) { console.log('[EOD] No email password — skipping send'); return; }
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: appPassword }
    });
    const locs     = report.locations || {};
    const received = Object.values(locs).filter(r => r.status !== 'MISSING');
    const missing  = Object.values(locs).filter(r => r.status === 'MISSING');
    const critical = Object.values(locs).filter(r => r.is_critical);
    const maint    = Object.values(locs).filter(r => r.has_maintenance);

    const nightDate = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    });

    const body = [
      `Good morning Maria Jose,`,
      ``,
      `Here is the End of Day Report for ${nightDate}.`,
      ``,
      `📊 ${received.length}/11 locations submitted their EOD report.`,
      missing.length  ? `❌ Missing: ${missing.map(r => r.location).join(', ')}` : `✅ All locations reported`,
      critical.length ? `🚨 CRITICAL incidents at: ${critical.map(r => r.location).join(', ')}` : '',
      maint.length    ? `🔧 Maintenance requests from: ${maint.map(r => r.location).join(', ')}` : '',
      ``,
      `Full PDF report attached.`,
      ``,
      `— Lola 🌺`
    ].filter(l => l !== null).join('\n');

    await transporter.sendMail({
      from: `Lola AI <${GMAIL_USER}>`,
      to: REPORT_TO,
      subject: `EOD Report — All Locations · ${nightDate} · ${received.length} of 11 locations reporting`,
      text: body,
      attachments: pdfPath && fs.existsSync(pdfPath)
        ? [{ filename: `EOD-Report-${dateStr}.pdf`, path: pdfPath }]
        : []
    });
    console.log(`[EOD] Email sent to ${REPORT_TO}`);
  } catch (e) {
    console.error('[EOD] Email error:', e.message);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const dateStr = getYesterdayET();
  console.log(`[EOD] Processing reports for: ${dateStr}`);

  const emails = await fetchEODEmails();
  const report  = buildReport(emails, dateStr);

  // Save JSON
  const dataDir  = path.join(__dirname, '..', 'data', 'eod-reports');
  fs.mkdirSync(dataDir, { recursive: true });
  const jsonPath = path.join(dataDir, `${dateStr}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`[EOD] Saved: ${jsonPath}`);

  // Generate PDF via Chrome headless
  const pdfHtml = generatePDFHtml(report, dateStr);
  const htmlTmp = path.join('/tmp', `eod-${dateStr}.html`);
  fs.writeFileSync(htmlTmp, pdfHtml);
  let pdfPath = null;
  try {
    const pdfOut = path.join('/tmp', `EOD-Report-${dateStr}.pdf`);
    try {
      execSync(`google-chrome --headless --disable-gpu --no-sandbox --print-to-pdf="${pdfOut}" "file://${htmlTmp}" 2>/dev/null`);
    } catch {
      execSync(`chromium-browser --headless --disable-gpu --no-sandbox --print-to-pdf="${pdfOut}" "file://${htmlTmp}" 2>/dev/null`);
    }
    if (fs.existsSync(pdfOut)) { pdfPath = pdfOut; console.log('[EOD] PDF generated'); }
  } catch (e) {
    console.log('[EOD] PDF generation skipped (no Chrome):', e.message);
  }

  await sendEmailReport(dateStr, pdfPath, report);
  console.log('[EOD] Complete.');
}

main().catch(e => { console.error('[EOD] Fatal:', e); process.exit(1); });
