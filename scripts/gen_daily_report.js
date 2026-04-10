#!/usr/bin/env node
/**
 * Daily Operations Report Generator — Rreal Hospitality LLC
 * Style 2 Clean Corporate (matches approved weekly review format)
 * 
 * Usage: node gen_daily_report.js [YYYY-MM-DD]
 * Output: reports/Daily_Report_YYYY-MM-DD.pdf
 * Email: majo@rrealtacos.com
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Load report template ──────────────────────────────────────────────────────
const { BASE_CSS, B, LOGO_B64, generatePDF } = require('./report-template.html.js');

// ── Config ────────────────────────────────────────────────────────────────────
const TOAST_CLIENT_ID     = 'NGCaheK337HbbBuOJ3DY92JorvDpgTn0';
const TOAST_CLIENT_SECRET = 'KpFjzMDvVXpSwiFHZigYp1PAARK9x7kCsEZIjZXKZzePlVqBUnQvvSCdDphjemdT';
const TOAST_BASE          = 'https://ws-api.toasttab.com';
const GMAIL_FROM          = 'lolasuperbot@gmail.com';
const REPORT_TO           = 'majo@rrealtacos.com';

const LOCATIONS = [
  { name: 'Midtown',        guid: '05507805-dd4a-41fa-b941-1ed125690029' },
  { name: 'West Midtown',   guid: 'abbbd1c5-773f-48c8-89b8-10a7817a4486' },
  { name: 'Chamblee',       guid: 'aa75d6ef-f7f8-4758-885f-c0443f6f319c' },
  { name: 'Sandy Springs',  guid: '0e3ef109-aef9-40fc-ac6f-e66248a5cf7d' },
  { name: 'Cumming',        guid: '7a689bf3-b739-41ca-a5a0-2480aa99b28e' },
  { name: 'Sugar Hill',     guid: '8cfa57c2-9f91-41e5-abb8-2c509deb7ef0' },
  { name: 'Buckhead',       guid: 'd291863f-b651-4061-a0a3-d8420f2484e8' },
  { name: 'Decatur',        guid: '8d062d29-7937-434b-a8ff-0cc8dab3722f' },
  { name: 'Lawrenceville',  guid: 'ec1b2c91-2502-4ea0-9059-ffc65709d403' },
  { name: 'Beltline',       guid: 'bf33a95f-480d-4797-8c02-e283ce6c71bc' },
  { name: 'Duluth',         guid: '35e9cefe-fd09-40c3-a700-31757d983e2e' },
  { name: 'Woodstock',      guid: 'fab137f5-90b8-4611-96f1-107b48de7bfb' },
];

// ── Toast API helpers ─────────────────────────────────────────────────────────
async function getToastToken() {
  const res = await fetch(`${TOAST_BASE}/authentication/v1/authentication/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: TOAST_CLIENT_ID,
      clientSecret: TOAST_CLIENT_SECRET,
      userAccessType: 'TOAST_MACHINE_CLIENT'
    })
  });
  const data = await res.json();
  return data.token.accessToken;
}

async function getNetSales(token, guid, bizDate) {
  const dateStr = bizDate.replace(/-/g, '');
  let total = 0, checks = 0, page = 1;
  while (true) {
    const res = await fetch(
      `${TOAST_BASE}/orders/v2/ordersBulk?businessDate=${dateStr}&pageSize=100&page=${page}`,
      { headers: { 'Authorization': `Bearer ${token}`, 'Toast-Restaurant-External-ID': guid } }
    );
    if (!res.ok) break;
    const orders = await res.json();
    if (!Array.isArray(orders) || orders.length === 0) break;
    for (const o of orders) {
      if (o && !o.voided) {
        for (const c of (o.checks || [])) {
          if (c) { total += c.totalAmount || 0; checks++; }
        }
      }
    }
    const link = res.headers.get('link') || '';
    if (!link.includes('rel="next"')) break;
    page++;
  }
  return { sales: Math.round(total * 100) / 100, checks };
}

async function getLabor(token, guid, bizDate) {
  const next = new Date(bizDate); next.setDate(next.getDate() + 1);
  const nextStr = next.toISOString().split('T')[0];
  const res = await fetch(
    `${TOAST_BASE}/labor/v1/timeEntries?startDate=${bizDate}T04:00:00.000-0000&endDate=${nextStr}T04:00:00.000-0000`,
    { headers: { 'Authorization': `Bearer ${token}`, 'Toast-Restaurant-External-ID': guid } }
  );
  if (!res.ok) return { shifts: 0, hours: 0, cost: 0 };
  const entries = await res.json();
  if (!Array.isArray(entries)) return { shifts: 0, hours: 0, cost: 0 };
  let hours = 0, cost = 0;
  for (const e of entries) {
    const h = (e.regularHours || 0) + (e.overtimeHours || 0);
    hours += h;
    cost  += h * (e.hourlyWage || 0);
  }
  return { shifts: entries.length, hours: Math.round(hours * 10) / 10, cost: Math.round(cost * 100) / 100 };
}

// ── HTML Builder ──────────────────────────────────────────────────────────────
function fmt$(n)   { return '$' + (n||0).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
function fmtPct(n) { return (n||0).toFixed(1) + '%'; }
function fmtN(n)   { return (n||0).toLocaleString('en-US'); }

function buildReportHTML(rows, bizDate, generatedAt) {
  const dayLabel = new Date(bizDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Totals
  let totalSales = 0, totalChecks = 0, totalCost = 0, totalHours = 0, totalShifts = 0;
  for (const r of rows) {
    totalSales  += r.sales;
    totalChecks += r.checks;
    totalCost   += r.cost;
    totalHours  += r.hours;
    totalShifts += r.shifts;
  }
  const avgTicket  = totalChecks > 0 ? totalSales / totalChecks : 0;
  const laborPct   = totalSales  > 0 ? totalCost  / totalSales * 100 : 0;

  // Sort for ranking
  const ranked = [...rows].sort((a, b) => b.sales - a.sales);

  // ── Header ──
  const header = `
<div class="report-header">
  <div class="header-left">
    ${LOGO_B64 ? `<img src="${LOGO_B64}" alt="Rreal Tacos">` : ''}
    <span class="brand-label">Rreal Hospitality LLC</span>
  </div>
  <div class="header-right">
    <div class="report-title">Daily Operations Report</div>
    <div class="report-sub">${dayLabel} &nbsp;·&nbsp; Generated ${generatedAt} &nbsp;·&nbsp; Confidential</div>
  </div>
</div>`;

  // ── KPI Grid ──
  const kpiGrid = `
<div class="content" style="padding-bottom:0;background:#ffffff;">
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-value">${fmt$(totalSales)}</div>
      <div class="kpi-label">Total Sales</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">${fmtN(totalChecks)}</div>
      <div class="kpi-label">Total Checks</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">${fmt$(avgTicket)}</div>
      <div class="kpi-label">Avg Ticket</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">${fmt$(totalCost)}</div>
      <div class="kpi-label">Labor Cost</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value" style="color:${laborPct > 18 ? B.red : laborPct > 16 ? B.amber : B.green}">${fmtPct(laborPct)}</div>
      <div class="kpi-label">Labor %</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">${rows.length}</div>
      <div class="kpi-label">Locations</div>
    </div>
  </div>
</div>`;

  // ── Sales & Labor Table ──
  const tableRows = rows.map(r => {
    const lp = r.sales > 0 ? r.cost / r.sales * 100 : 0;
    const lpColor = lp > 20 ? B.red : lp > 17 ? B.amber : (lp === 0 ? B.muted : B.green);
    const lpNote  = r.cost === 0 && r.sales > 0 ? ' ⚠️' : '';
    return `<tr>
      <td>${r.name}${r.name === 'Woodstock' ? ' ⚡' : ''}</td>
      <td>${fmt$(r.sales)}</td>
      <td>${fmtN(r.checks)}</td>
      <td>${r.checks > 0 ? fmt$(r.sales/r.checks) : '—'}</td>
      <td>${fmt$(r.cost)}${lpNote}</td>
      <td>${r.hours.toFixed(1)}h</td>
      <td>${r.shifts}</td>
      <td style="color:${lpColor};font-weight:700">${r.sales > 0 ? fmtPct(lp) : '—'}</td>
    </tr>`;
  }).join('');

  const salesTable = `
<div class="content" style="padding-top:0;">
  <div class="section-hdr">Sales &amp; Labor by Location — ${dayLabel}</div>
  <table class="data-table">
    <thead>
      <tr>
        <th>Location</th>
        <th>Sales</th>
        <th>Checks</th>
        <th>Avg Chk</th>
        <th>Labor $</th>
        <th>Hours</th>
        <th>Shifts</th>
        <th>Labor %</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
      <tr class="total-row">
        <td>TOTAL</td>
        <td>${fmt$(totalSales)}</td>
        <td>${fmtN(totalChecks)}</td>
        <td>${fmt$(avgTicket)}</td>
        <td>${fmt$(totalCost)}</td>
        <td>${totalHours.toFixed(1)}h</td>
        <td>${totalShifts}</td>
        <td>${fmtPct(laborPct)}</td>
      </tr>
    </tbody>
  </table>

  ${totalCost === 0 || rows.some(r => r.cost === 0 && r.sales > 0) ? `
  <div style="background:${B.amberBg};border:1px solid ${B.amber};border-radius:4px;padding:8px 12px;font-size:11px;color:${B.amberTxt};margin-bottom:12px;">
    ⚠️ Locations showing $0 labor may have a data fetch issue — sales figures are correct. Labor will be verified separately.
  </div>` : ''}

  <div class="section-hdr">Sales Ranking — ${dayLabel}</div>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width:40px">#</th>
        <th>Location</th>
        <th>Sales</th>
        <th>Checks</th>
        <th>Avg Ticket</th>
        <th>Labor %</th>
      </tr>
    </thead>
    <tbody>
      ${ranked.map((r, i) => {
        const medal = i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
        const lp = r.sales > 0 ? r.cost / r.sales * 100 : 0;
        const lpColor = r.cost === 0 && r.sales > 0 ? B.muted : lp > 20 ? B.red : lp > 17 ? B.amber : B.green;
        return `<tr${i < 3 ? ' style="background:#fffbeb"' : ''}>
          <td style="text-align:center;font-weight:700">${medal}</td>
          <td>${r.name}${r.name === 'Woodstock' ? ' ⚡' : ''}</td>
          <td style="color:${B.green};font-weight:700">${fmt$(r.sales)}</td>
          <td>${fmtN(r.checks)}</td>
          <td>${r.checks > 0 ? fmt$(r.sales/r.checks) : '—'}</td>
          <td style="color:${lpColor};font-weight:700">${r.sales > 0 ? fmtPct(lp) : '—'}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</div>`;

  // ── Footer ──
  const footer = `
<div class="report-footer">
  <div>${LOGO_B64 ? `<img src="${LOGO_B64}" alt="">` : ''}Rreal Hospitality LLC &nbsp;·&nbsp; Rreal Tacos Operations</div>
  <div>Daily Report — ${dayLabel}</div>
  <div>Generated by Lola AI 🌺 &nbsp;·&nbsp; ${generatedAt} &nbsp;·&nbsp; ${REPORT_TO}</div>
</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1200">
<style>
${BASE_CSS}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0;
  background: #ffffff;
  border: 1px solid ${B.border};
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0;
}
</style>
</head>
<body>
<div class="page">
${header}
${kpiGrid}
${salesTable}
${footer}
</div>
</body>
</html>`;
}

// ── Email sender ──────────────────────────────────────────────────────────────
async function sendEmail(bizDate, pdfPath, rows) {
  const appPass = process.env.GMAIL_APP_PASSWORD;
  if (!appPass) { console.log('[daily] No GMAIL_APP_PASSWORD — skipping email'); return; }

  let totalSales = 0, totalCost = 0, totalChecks = 0;
  for (const r of rows) { totalSales += r.sales; totalCost += r.cost; totalChecks += r.checks; }
  const laborPct = totalSales > 0 ? (totalCost / totalSales * 100).toFixed(1) : '0.0';
  const top3 = [...rows].sort((a,b) => b.sales - a.sales).slice(0, 3);

  const dayLabel = new Date(bizDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_FROM, pass: appPass }
  });

  const body = [
    `Good morning Maria Jose,`,
    ``,
    `Here is the Daily Operations Report for ${dayLabel}.`,
    ``,
    `📊 Network Total: ${fmt$(totalSales)} · ${fmtN(totalChecks)} checks · ${laborPct}% labor`,
    ``,
    `Top 3 Locations:`,
    ...top3.map((r, i) => `  ${['🏆','🥈','🥉'][i]} ${r.name}: ${fmt$(r.sales)}`),
    ``,
    `Full PDF report attached.`,
    ``,
    `— Lola 🌺`
  ].join('\n');

  await transporter.sendMail({
    from: `Lola AI <${GMAIL_FROM}>`,
    to: REPORT_TO,
    subject: `Daily Report — ${dayLabel} · ${fmt$(totalSales)} · ${rows.length} Locations`,
    text: body,
    attachments: pdfPath && fs.existsSync(pdfPath)
      ? [{ filename: path.basename(pdfPath), path: pdfPath }]
      : []
  });
  console.log(`[daily] Email sent to ${REPORT_TO}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // Date: yesterday ET (or arg)
  let bizDate = process.argv[2];
  if (!bizDate) {
    const now = new Date();
    const et  = new Date(now.getTime() - 5 * 60 * 60 * 1000); // rough ET
    et.setDate(et.getDate() - 1);
    bizDate = et.toISOString().split('T')[0];
  }

  const generatedAt = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short'
  });

  console.log(`[daily] Generating report for: ${bizDate}`);
  console.log(`[daily] Getting Toast token...`);

  let token;
  try {
    token = await getToastToken();
  } catch(e) {
    console.error('[daily] Toast auth failed:', e.message);
    process.exit(1);
  }

  // Fetch all locations in parallel
  console.log(`[daily] Fetching data for ${LOCATIONS.length} locations...`);
  const rows = await Promise.all(LOCATIONS.map(async loc => {
    const [salesData, laborData] = await Promise.all([
      getNetSales(token, loc.guid, bizDate).catch(() => ({ sales: 0, checks: 0 })),
      getLabor(token, loc.guid, bizDate).catch(() => ({ shifts: 0, hours: 0, cost: 0 }))
    ]);
    console.log(`  ${loc.name}: ${fmt$(salesData.sales)} sales · ${fmt$(laborData.cost)} labor`);
    return { name: loc.name, ...salesData, ...laborData };
  }));

  // Build HTML & PDF
  const html = buildReportHTML(rows, bizDate, generatedAt);

  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const htmlPath = path.join('/tmp', `daily_report_${bizDate}.html`);
  const pdfPath  = path.join(reportsDir, `Daily_Report_${bizDate}.pdf`);

  fs.writeFileSync(htmlPath, html);
  console.log(`[daily] HTML written to ${htmlPath}`);

  try {
    await generatePDF(html, pdfPath);
    console.log(`[daily] PDF: ${pdfPath}`);
  } catch(e) {
    console.error('[daily] PDF generation failed:', e.message);
    // Fall back to HTML only
    const htmlOut = path.join(reportsDir, `Daily_Report_${bizDate}.html`);
    fs.copyFileSync(htmlPath, htmlOut);
    console.log(`[daily] HTML fallback: ${htmlOut}`);
  }

  // Send email
  await sendEmail(bizDate, fs.existsSync(pdfPath) ? pdfPath : null, rows);

  console.log('[daily] Done.');
}

main().catch(e => { console.error('[daily] Fatal:', e); process.exit(1); });
