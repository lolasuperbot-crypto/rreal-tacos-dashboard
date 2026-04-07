'use strict';
const { coverHTML, wrapPage, generatePDF, BASE_CSS, B } = require('./report-template.html.js');
const path = require('path');

const OUTPUT     = path.join(__dirname, '..', 'reports', 'Wk14_Review_Report_Final_v2.pdf');
const SCREENSHOT = path.join(__dirname, '..', 'reports', 'Wk14_Review_Report_Cover.png');

const TABLE_DATA = [
  {loc:'Midtown',       sales:198, s1:2, s2:0, total:2,  r100k:1.01, wk13:2.16, swing:'↓ -1.15', food:0, svc:2,  status:'WATCH'},
  {loc:'West Midtown',  sales:136, s1:0, s2:1, total:1,  r100k:0.73, wk13:0.74, swing:'↓ -0.01', food:1, svc:0,  status:'WATCH'},
  {loc:'Chamblee',      sales:114, s1:2, s2:0, total:2,  r100k:1.76, wk13:1.63, swing:'↑ +0.13', food:1, svc:1,  status:'WATCH'},
  {loc:'Sandy Springs', sales:143, s1:1, s2:1, total:3,  r100k:2.10, wk13:0.67, swing:'↑ +1.43', food:0, svc:1,  status:'CRITICAL'},
  {loc:'Cumming',       sales:63,  s1:2, s2:0, total:3,  r100k:4.77, wk13:0.00, swing:'↑ +4.77', food:2, svc:2,  status:'CRITICAL'},
  {loc:'Sugar Hill',    sales:85,  s1:0, s2:1, total:1,  r100k:1.17, wk13:1.08, swing:'↑ +0.09', food:1, svc:0,  status:'WATCH'},
  {loc:'Buckhead',      sales:152, s1:0, s2:0, total:0,  r100k:0.00, wk13:0.00, swing:'→ 0',     food:0, svc:0,  status:'CLEAN'},
  {loc:'Decatur',       sales:147, s1:3, s2:1, total:4,  r100k:2.71, wk13:1.99, swing:'↑ +0.72', food:2, svc:2,  status:'CRITICAL'},
  {loc:'Lawrenceville', sales:195, s1:2, s2:0, total:2,  r100k:1.02, wk13:0.96, swing:'↑ +0.06', food:0, svc:2,  status:'WATCH'},
  {loc:'Beltline',      sales:210, s1:1, s2:0, total:2,  r100k:0.95, wk13:1.83, swing:'↓ -0.88', food:0, svc:2,  status:'WATCH'},
  {loc:'Duluth',        sales:127, s1:1, s2:1, total:2,  r100k:1.58, wk13:0.79, swing:'↑ +0.79', food:1, svc:1,  status:'WATCH'},
];

const CRITICAL = [
  {
    loc:'Decatur', reviews:4, r100k:2.71,
    food:['Food poisoning warning posted on Google (Apr 2)','Hair found in burrito + wrong order (Apr 3)'],
    svc: ['Rude bartender — unwelcoming from arrival','Manager dismissive; guest contacted health dept'],
    actions:['Respond to food poisoning review (Cole Matheson) on Google TODAY','Respond to Anquita Mitchell (hair in burrito)','Kitchen hygiene audit — hair nets, food handling','Customer contacted health dept — be proactive','Coach bartender team on hospitality'],
  },
  {
    loc:'Cumming', reviews:3, r100k:4.77,
    food:['🚨 RAW CHICKEN — 2 reviewers (J.B. Yelp Apr 3, Jenny Young Google Apr 4)','Managers dismissed both complaints'],
    svc: ['Managers made excuses — no accountability for guests'],
    actions:['URGENT: Investigate raw chicken — J.B. (Yelp) + Jenny Young (Google Apr 4)','Retrain kitchen on safe cooking temperatures immediately','Publicly respond to both reviews today','Conduct BOH temperature audit this week','Review manager accountability protocol for food safety'],
  },
  {
    loc:'Sandy Springs', reviews:3, r100k:2.10,
    food:[],
    svc: ['Margaritas removed from delivery without any notice','Slow takeout — no guest communication','3 Google reviews currently unreplied'],
    actions:['Reply to all 3 unreplied Google reviews this week','Communicate delivery menu changes proactively','Coach team on takeout speed and guest communication'],
  },
];

function statusBadge(s) {
  if (s==='CLEAN')    return `<span class="badge badge-green">CLEAN</span>`;
  if (s==='WATCH')    return `<span class="badge badge-amber">WATCH</span>`;
  return `<span class="badge badge-red">CRITICAL</span>`;
}
function swingColor(sw) {
  if (sw.startsWith('↑')) return B.red;
  if (sw.startsWith('↓')) return B.green;
  return B.muted;
}

function buildHTML() {
  let html = '';

  // COVER
  html += coverHTML('Weekly Review Report — 1 &amp; 2 Star Analysis', 'Week 14', 'Week 14', '03/30–04/05/2026');
  html += `<div class="content">`;

  // KPIs
  html += `
<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-value" style="color:${B.red}">22</div><div class="kpi-label">Total Bad Reviews</div></div>
  <div class="kpi-card"><div class="kpi-value" style="color:${B.muted}">19</div><div class="kpi-label">Prior Week (Wk13)</div></div>
  <div class="kpi-card"><div class="kpi-value" style="color:${B.red}">+3</div><div class="kpi-label">Week over Week</div></div>
  <div class="kpi-card"><div class="kpi-value" style="color:${B.amber}">1.40</div><div class="kpi-label">Bad Review Rate /100K</div></div>
</div>`;

  // Food vs Service + Critical vs Clean
  html += `<div class="two-col">
  <div class="col-card">
    <div class="col-title">Food vs Service Split</div>
    <p style="font-size:11px;font-weight:700;margin-bottom:6px;">■ Food Complaints: 8 (36%)</p>
    <p style="font-size:11px;font-weight:700;">■ Service Complaints: 12 (55%)</p>
  </div>
  <div class="col-card">
    <div class="col-title">Critical vs Clean</div>
    <p style="color:${B.red};font-weight:700;font-size:11px;margin-bottom:4px;">🔴 Decatur — 4 reviews · 2.71/100K</p>
    <p style="color:${B.red};font-weight:700;font-size:11px;margin-bottom:4px;">🔴 Cumming — 3 reviews · 4.77/100K</p>
    <p style="color:${B.red};font-weight:700;font-size:11px;margin-bottom:8px;">🔴 Sandy Springs — 3 reviews · 2.10/100K</p>
    <p style="color:${B.green};font-weight:700;font-size:11px;">✅ Buckhead · Beltline — 0 bad reviews</p>
  </div>
</div>`;

  // ALL LOCATIONS TABLE
  html += `<div class="section-hdr">All Locations — Week 14 Summary</div>`;
  html += `<table class="data-table">
<thead><tr>
  <th>Location</th><th>Sales</th><th>1★</th><th>2★</th><th>Total</th>
  <th>/100K</th><th>Wk13</th><th>Swing</th><th>Food</th><th>Svc</th><th>Status</th>
</tr></thead><tbody>`;
  // Determine top 3 critical rows by total desc, then /100K desc
  const sorted = [...TABLE_DATA].sort((a,b) => b.total - a.total || b.r100k - a.r100k);
  const top3Locs = new Set(sorted.slice(0,3).filter(r=>r.total>0).map(r=>r.loc));

  for (const r of TABLE_DATA) {
    const sc = swingColor(r.swing);
    const isCrit = top3Locs.has(r.loc);
    const rowStyle = isCrit
      ? 'background:#fff0f0; border-left:3px solid #dc2626;'
      : '';
    const locStyle = isCrit
      ? 'font-weight:700; color:#991b1b;'
      : 'font-weight:700; color:#111827;';
    html += `<tr style="${rowStyle}">
      <td style="${locStyle}">${r.loc}</td>
      <td>$${r.sales}K</td>
      <td>${r.s1}</td><td>${r.s2}</td>
      <td style="color:${r.total===0?B.green:r.total<=2?B.amber:B.red};font-weight:700">${r.total}</td>
      <td>${r.r100k.toFixed(2)}</td>
      <td>${r.wk13.toFixed(2)}</td>
      <td style="color:${sc};font-weight:700">${r.swing}</td>
      <td>${r.food}</td><td>${r.svc}</td>
      <td>${statusBadge(r.status)}</td>
    </tr>`;
  }
  html += `<tr class="total-row">
    <td>TOTAL</td><td>$1,445K</td><td>13</td><td>4</td>
    <td>22</td><td>1.40</td><td>—</td><td>—</td><td>8</td><td>12</td><td>—</td>
  </tr></tbody></table>`;

  // TOP 3
  html += `<div class="section-hdr">Top 3 Critical Locations — Detail &amp; Action Items</div>`;
  for (const c of CRITICAL) {
    html += `<div class="critical-hdr">
      <span class="loc-name">${c.loc}</span>
      <span class="loc-meta">CRITICAL · ${c.reviews} reviews · ${c.r100k.toFixed(2)}/100K · ↑ worse vs Wk13</span>
    </div>`;
    html += `<div class="food-svc-grid">
      <div class="food-col">
        <div class="col-lbl food">Food →</div>
        ${c.food.length ? c.food.map(f=>`<p style="font-size:9px;margin-bottom:3px;color:${f.startsWith('🚨')?B.red:B.body};font-weight:${f.startsWith('🚨')?'700':'400'}">${f}</p>`).join('') : '<p style="font-size:9px;color:'+B.muted+'">n/a</p>'}
      </div>
      <div class="svc-col">
        <div class="col-lbl svc">Service →</div>
        ${c.svc.map(s=>`<p style="font-size:9px;margin-bottom:3px;">${s}</p>`).join('')}
      </div>
    </div>`;
    html += `<div class="actions-block">${c.actions.map((a,i)=>`□ ${i===0&&c.loc==='Cumming'?'<strong>':''}${a}${i===0&&c.loc==='Cumming'?'</strong>':''}`).join('<br>')}</div>`;
  }

  // WOW + TREND
  html += `<div class="section-hdr">WOW — Biggest Improvements &amp; Network Trend Summary</div>`;
  html += `<div class="wow-trend-grid">
  <div class="col-card">
    <div class="col-title">WOW Biggest Improvements</div>
    <div class="wow-item">✅ Midtown · 2.16 → 1.01 · Strongest Recovery 🏆</div>
    <div class="wow-item">✅ Beltline · 1.83 → 0.95 · Improved ↓</div>
    <div class="wow-item">✅ Buckhead · Clean Sheet ✅</div>

  </div>
  <div class="col-card">
    <div class="col-title">Network Trend Summary</div>
    <div class="trend-item"><span class="trend-label">Volume</span><span class="trend-val">22 bad reviews vs Wk13: 19 (+3)</span></div>
    <div class="trend-item"><span class="trend-label">Sales</span><span class="trend-val">$1,445,152 · Rate: 1.40/100K</span></div>
    <div class="trend-item"><span class="trend-label">Food</span><span class="trend-val">36% food-related · Safety, wrong orders, temp</span></div>
    <div class="trend-item"><span class="trend-label">Service</span><span class="trend-val">55% service-related · Staff dismissing guests</span></div>
    <div class="trend-item"><span class="trend-label">Safety</span><span class="trend-val">2 critical incidents — Cumming raw chicken · Decatur food poisoning</span></div>
    <div class="trend-item"><span class="trend-label">Best</span><span class="trend-val">Buckhead — only clean location</span></div>
    <div class="trend-item"><span class="trend-label">Response</span><span class="trend-val">Multiple Wk14 reviews unreplied this week</span></div>
  </div>
</div>`;

  html += `</div>`; // end content
  return html;
}

async function main() {
  const puppeteer = require('puppeteer');
  const fullHTML = wrapPage(buildHTML(), 'Weekly Review Report', 'Week 14', '03/30–04/05/2026');

  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  await page.setContent(fullHTML, { waitUntil: 'networkidle0' });

  await page.screenshot({ path: SCREENSHOT, fullPage: false, clip: { x:0, y:0, width:1200, height:900 } });
  console.log(`📸 Screenshot: ${SCREENSHOT}`);

  await page.pdf({
    path: OUTPUT,
    format: 'Letter',
    landscape: false,
    margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
    printBackground: true,
    scale: 0.8,
  });
  console.log(`✅ PDF: ${OUTPUT}`);
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
