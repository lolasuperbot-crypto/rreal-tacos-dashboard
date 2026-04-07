/**
 * report-template.html.js
 * Rreal Hospitality LLC — HTML Report Template
 * Style 2: Clean Corporate — rendered via Puppeteer for pixel-perfect layout
 *
 * Exports: buildCoverHTML(title, subtitle, week, dateRange, generatedDate)
 *          buildPageHTML(contentHTML, title, week, dateRange)
 *          generatePDF(htmlContent, outputPath)
 */

'use strict';
const path = require('path');
const fs = require('fs');

const LOGO_PATH = path.join(__dirname, '..', 'dashboard', 'receipt-logo_1680210631_400.jpg');
const LOGO_B64 = fs.existsSync(LOGO_PATH)
  ? `data:image/jpeg;base64,${fs.readFileSync(LOGO_PATH).toString('base64')}`
  : '';

// ── BRAND COLORS ──────────────────────────────────────────────────────────────
const B = {
  orange:   '#f97316',
  dark:     '#111827',
  body:     '#374151',
  muted:    '#6b7280',
  light:    '#9ca3af',
  bgPage:   '#f9fafb',
  bgCard:   '#ffffff',
  bgTblHdr: '#f3f4f6',
  bgChip:   '#f3f4f6',
  border:   '#e5e7eb',
  borderLt: '#f3f4f6',
  red:      '#dc2626',
  redBg:    '#fee2e2',
  redTxt:   '#991b1b',
  amber:    '#d97706',
  amberBg:  '#fef3c7',
  amberTxt: '#92400e',
  green:    '#16a34a',
  greenBg:  '#dcfce7',
  greenTxt: '#166534',
};

// ── BASE CSS ──────────────────────────────────────────────────────────────────
const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 13px;
    color: ${B.body};
    background: #ffffff;
    width: 100%;
  }
  .page { width: 100%; padding: 0; }

  /* ── HEADER (Option 1: left logo | right title) ── */
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 40px 16px 40px;
    border-bottom: 3px solid ${B.orange};
    background: #ffffff;
  }
  .header-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
  .header-left img {
    height: 36px !important;
    width: 130px !important;
    max-height: 36px !important;
    max-width: 130px !important;
    object-fit: contain !important;
    display: block;
  }
  .header-left .brand-label {
    font-size: 9px;
    font-weight: 600;
    color: ${B.muted};
    text-transform: uppercase;
    letter-spacing: 0.06em;
    white-space: nowrap;
  }
  .header-right {
    text-align: right;
  }
  .header-right .report-title {
    font-size: 20px;
    font-weight: 700;
    color: ${B.dark};
    margin-bottom: 4px;
    white-space: nowrap;
  }
  .header-right .report-sub {
    font-size: 12px;
    color: ${B.light};
    white-space: nowrap;
  }

  /* ── CHIPS ── */
  .chips-row {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 8px;
    padding: 12px 40px 0 40px;
  }
  .chip {
    background: ${B.bgChip};
    border-radius: 20px;
    padding: 3px 10px;
    font-size: 9px;
    font-weight: 600;
    color: ${B.body};
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* ── CONTENT AREA ── */
  .content {
    padding: 20px 40px;
    background: ${B.bgPage};
  }

  /* ── SECTION HEADER ── */
  .section-hdr {
    font-size: 14px;
    font-weight: 700;
    color: ${B.body};
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 2px solid ${B.orange};
    padding-bottom: 4px;
    margin-bottom: 12px;
    margin-top: 16px;
  }
  .section-hdr:first-child { margin-top: 0; }

  /* ── KPI GRID ── */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    background: #ffffff;
    border: 1px solid ${B.border};
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 12px;
  }
  .kpi-card {
    padding: 14px 12px;
    text-align: center;
    border-right: 1px solid ${B.border};
  }
  .kpi-card:last-child { border-right: none; }
  .kpi-value { font-size: 28px; font-weight: 700; color: ${B.dark}; line-height: 1.1; }
  .kpi-label { font-size: 11px; font-weight: 700; color: ${B.light}; text-transform: uppercase; margin-top: 4px; }

  /* ── TWO-COL ── */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .col-card {
    background: #ffffff;
    border: 1px solid ${B.border};
    border-radius: 6px;
    padding: 14px 16px;
    font-size: 13px;
  }
  .col-title { font-size: 13px; font-weight: 700; color: ${B.light}; text-transform: uppercase; margin-bottom: 8px; }

  /* ── TABLE ── */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    background: #ffffff;
    border: 1px solid ${B.border};
    border-radius: 6px;
    overflow: hidden;
    font-size: 9.5px;
    margin-bottom: 12px;
  }
  .data-table th {
    background: ${B.bgTblHdr};
    color: ${B.body};
    font-weight: 700;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 7px 8px;
    text-align: center;
    border-bottom: 2px solid ${B.orange};
  }
  .data-table th:first-child { text-align: left; }
  .data-table td {
    padding: 6px 8px;
    text-align: center;
    border-bottom: 1px solid ${B.borderLt};
    color: ${B.body};
    font-size: 13px;
  }
  .data-table td:first-child { text-align: left; font-weight: 700; color: ${B.dark}; font-size: 13px; }
  .data-table tr:nth-child(even) td { background: ${B.bgPage}; }
  .data-table .total-row td { background: ${B.bgTblHdr}; font-weight: 700; border-top: 1px solid ${B.border}; }
  .data-table .spacer-row td { height: 10px; background: #ffffff; border: none; }
  .data-table .loc-total-row td { background: ${B.bgTblHdr}; font-weight: 700; font-size: 9px; border-top: 1px solid ${B.border}; border-bottom: 1px solid ${B.border}; }

  /* ── BADGES ── */
  .badge { border-radius: 3px; padding: 2px 8px; font-size: 11px; font-weight: 700; display: inline-block; white-space: nowrap; }
  .badge-green  { background: ${B.greenBg};  color: ${B.greenTxt}; }
  .badge-amber  { background: ${B.amberBg};  color: ${B.amberTxt}; }
  .badge-red    { background: ${B.redBg};    color: ${B.redTxt}; }

  /* ── STATUS COLORS ── */
  .text-red   { color: ${B.red}; font-weight: 700; }
  .text-amber { color: ${B.amber}; font-weight: 700; }
  .text-green { color: ${B.green}; font-weight: 700; }
  .text-muted { color: ${B.muted}; }

  /* ── CRITICAL SECTION ── */
  .critical-hdr {
    background: ${B.redBg};
    border-bottom: 2px solid ${B.red};
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;
  }
  .critical-hdr .loc-name { font-size: 18px; font-weight: 700; color: ${B.dark}; }
  .critical-hdr .loc-meta { font-size: 13px; font-weight: 700; color: ${B.redTxt}; text-align: right; }
  .food-svc-grid { display: grid; grid-template-columns: 1fr 1fr; background: #ffffff; border: 1px solid ${B.border}; border-top: none; }
  .food-col, .svc-col { padding: 10px 12px; }
  .food-col { border-right: 1px solid ${B.border}; }
  .col-lbl { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
  .col-lbl.food { color: ${B.amber}; }
  .col-lbl.svc  { color: ${B.dark}; }
  .actions-block {
    background: ${B.bgPage};
    border: 1px solid ${B.border};
    border-top: none;
    border-left: 3px solid ${B.orange};
    padding: 9px 14px;
    font-size: 13px;
    line-height: 1.9;
    margin-bottom: 12px;
  }

  /* ── FOOTER ── */
  .report-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 40px;
    border-top: 1px solid ${B.border};
    margin-top: 16px;
    font-size: 9px;
    color: ${B.light};
    background: #ffffff;
  }
  .report-footer img {
    height: 14px !important;
    width: auto !important;
    vertical-align: middle;
    margin-right: 6px;
  }

  /* ── WOW / TREND ── */
  .wow-trend-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .wow-item { font-size: 13px; font-weight: 700; color: ${B.greenTxt}; padding: 6px 0; border-bottom: 1px solid ${B.borderLt}; }
  .trend-item { display: grid; grid-template-columns: 80px 1fr; gap: 8px; padding: 6px 0; border-bottom: 1px solid ${B.borderLt}; font-size: 13px; }
  .trend-label { font-weight: 700; color: ${B.body}; }
  .trend-val   { color: ${B.body}; }
`;

function coverHTML(title, subtitle, week, dateRange, generatedDate = 'April 6, 2026') {
  return `
<div class="report-header">
  <div class="header-left">
    ${LOGO_B64 ? `<img src="${LOGO_B64}" alt="Rreal Tacos">` : ''}
    <span class="brand-label">Rreal Hospitality LLC</span>
  </div>
  <div class="header-right">
    <div class="report-title">${title}</div>
    <div class="report-sub">${week}  ·  ${dateRange}  ·  Confidential</div>
  </div>
</div>
<p style="font-size:12px; color:#9ca3af; margin-top:12px; padding:0 40px; white-space:nowrap; overflow:hidden;">${week} &nbsp;·&nbsp; ${dateRange} &nbsp;·&nbsp; Confidential &nbsp;·&nbsp; Generated ${generatedDate}</p>`;
}

function footerHTML() {
  return `
<div class="report-footer">
  <div>${LOGO_B64 ? `<img src="${LOGO_B64}" alt="">` : ''}Rreal Hospitality LLC  ·  Rreal Tacos Operations</div>
  <div>Confidential — Internal Use Only</div>
  <div>Generated by Lola AI 🌺</div>
</div>`;
}

function wrapPage(bodyHTML, title, week, dateRange) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1200">
<style>${BASE_CSS}</style>
</head>
<body>
<div class="page">
${bodyHTML}
${footerHTML()}
</div>
</body>
</html>`;
}

async function generatePDF(htmlContent, outputPath) {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outputPath,
    format: 'Letter',
    landscape: false,
    margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
    printBackground: true,
    scale: 0.8,
  });
  await browser.close();
  console.log(`✅ PDF: ${outputPath}`);
}

module.exports = { coverHTML, footerHTML, wrapPage, generatePDF, BASE_CSS, B, LOGO_B64 };
