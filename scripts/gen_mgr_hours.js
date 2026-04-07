'use strict';
const { coverHTML, wrapPage, generatePDF, BASE_CSS, B, LOGO_B64 } = require('./report-template.html.js');
const path = require('path');

const OUTPUT = path.join(__dirname, '..', 'reports', 'Wk14_Manager_Hours_Report.pdf');
const SCREENSHOT = path.join(__dirname, '..', 'reports', 'Wk14_Manager_Hours_Cover.png');

const MANAGERS = [
  {name:'Acosta, Diego',        loc:'Midtown',        hrs:51.81},
  {name:'Estrella, Ariel',      loc:'Midtown',        hrs:60.83},
  {name:'Manzanares, Benito',   loc:'Midtown',        hrs:65.85},
  {name:'Islas, Ramiro',        loc:'Midtown',        hrs:53.14},
  {name:'Williams, Vincent',    loc:'Midtown',        hrs:68.41},
  {name:'Rojas, Sergio',        loc:'Midtown',        hrs:41.99},
  {name:'Bishop, Andrew',       loc:'Midtown',        hrs:44.17},
  {name:'Gil, Sebastian',       loc:'West Midtown',   hrs:68.13},
  {name:'Simms, Bryan',         loc:'West Midtown',   hrs:53.29},
  {name:'Quiñones, Hector',     loc:'West Midtown',   hrs:61.53},
  {name:'Bac Pacay, Miguel',    loc:'West Midtown',   hrs:60.66},
  {name:'Hines, Courtney',      loc:'West Midtown',   hrs:58.77},
  {name:'Scott, Evan',          loc:'West Midtown',   hrs:78.43},
  {name:'Martinez, Guilberto',  loc:'Chamblee',       hrs:20.44},
  {name:'Ortiz Martinez, Irving',loc:'Chamblee',      hrs:63.71},
  {name:'Green, Kimberly',      loc:'Chamblee',       hrs:59.24},
  {name:'Chanco, Erik',         loc:'Chamblee',       hrs:69.07},
  {name:'Fernandez, Andrew A',  loc:'Chamblee',       hrs:59.93},
  {name:'Cruz, Angel',          loc:'Sandy Springs',  hrs:53.25},
  {name:'Cruz, Valentin',       loc:'Sandy Springs',  hrs:59.86},
  {name:'Hernandez, Brian',     loc:'Sandy Springs',  hrs:77.92},
  {name:'Aymerich, John',       loc:'Sandy Springs',  hrs:54.86},
  {name:'Uriostegui-Perez, Ariadna',loc:'Sandy Springs',hrs:56.40},
  {name:'Cardenas, Juan',       loc:'Sandy Springs',  hrs:58.64},
  {name:'Lario, Mario',         loc:'Cumming',        hrs:59.40},
  {name:'Robles, Mario',        loc:'Cumming',        hrs:45.25},
  {name:'Sarabia, Jose',        loc:'Cumming',        hrs:51.20},
  {name:'Suarez Castellanos, Janett',loc:'Cumming',   hrs:47.17},
  {name:'Medina, Marcos',       loc:'Cumming',        hrs:34.70},
  {name:'Almeida, Diego',       loc:'Sugar Hill',     hrs:56.55},
  {name:'Ennis, Duke',          loc:'Sugar Hill',     hrs:55.95},
  {name:'Ambriz, Isbeyde',      loc:'Sugar Hill',     hrs:57.13},
  {name:'Monterroso, Sindi',    loc:'Sugar Hill',     hrs:56.24},
  {name:'Paredes, Simon',       loc:'Sugar Hill',     hrs:62.78},
  {name:'Ostos Rojas, Luis Alberto',loc:'Buckhead',   hrs:58.63},
  {name:'Perez, Cecia',         loc:'Buckhead',       hrs:50.26},
  {name:'Castillo Vasquez, Jose Luis',loc:'Buckhead', hrs:54.65},
  {name:'Escobar, Andy',        loc:'Buckhead',       hrs:51.08},
  {name:'Dole, German',         loc:'Buckhead',       hrs:58.94},
  {name:'Moreno, German',       loc:'Buckhead',       hrs:58.22},
  {name:'Nino, Luis',           loc:'Decatur',        hrs:58.89},
  {name:'Patillo, Lauren',      loc:'Decatur',        hrs:46.71},
  {name:'Lopez, Cristian',      loc:'Decatur',        hrs:76.16},
  {name:'Burling, Lauren',      loc:'Decatur',        hrs:51.63},
  {name:'Castro, Polo',         loc:'Decatur',        hrs:50.33},
  {name:'Weidhaas, Paige',      loc:'Decatur',        hrs:54.52},
  {name:'Mescua Torres, Oliver',loc:'Decatur',        hrs:61.17},
  {name:'Sanchez, David',       loc:'Lawrenceville',  hrs:54.09},
  {name:'Marlow, Carson',       loc:'Lawrenceville',  hrs:54.42},
  {name:'Romero Macedonio, Jean',loc:'Lawrenceville', hrs:57.23},
  {name:'Perez, Miguel',        loc:'Lawrenceville',  hrs:50.56},
  {name:'Arevalo, Felipe',      loc:'Lawrenceville',  hrs:55.48},
  {name:'Flynn, Jonathan',      loc:'Lawrenceville',  hrs:51.57},
  {name:'Perez, John',          loc:'Lawrenceville',  hrs:58.11},
  {name:'Rivera, Jason',        loc:'Lawrenceville',  hrs:50.72},
  {name:'Aguiar, Heivelim',     loc:'Lawrenceville',  hrs:54.68},
  {name:'Martin, Toney',        loc:'Lawrenceville',  hrs:46.22},
  {name:'Cruz, Emilson',        loc:'Beltline',       hrs:58.70},
  {name:'Leedy, Zackary',       loc:'Beltline',       hrs:58.67},
  {name:'Rodriguez, Karina',    loc:'Beltline',       hrs:57.04},
  {name:'Sosa, Carlos',         loc:'Beltline',       hrs:65.76},
  {name:'Miranda, Santiago',    loc:'Beltline',       hrs:59.93},
  {name:'Davila, Alejandro',    loc:'Beltline',       hrs:59.51},
  {name:'Atwater, Oliver',      loc:'Beltline',       hrs:56.57},
  {name:'Barrera, Esteban',     loc:'Beltline',       hrs:69.80},
  {name:'Aguirre, Miguel',      loc:'Duluth',         hrs:69.34},
  {name:'Sanchez, Mario',       loc:'Duluth',         hrs:54.79},
  {name:'Trigueros, Frederick', loc:'Duluth',         hrs:60.25},
  {name:'Cortes, Juan Carlos',  loc:'Duluth',         hrs:57.44},
  {name:'Phillips, Quentin',    loc:'Duluth',         hrs:55.76},
  {name:'Galvan, Raquel',       loc:'Duluth',         hrs:57.80},
  {name:'Smith, Jacob',         loc:'Duluth',         hrs:25.27},
  {name:'Fagundez, Javier',     loc:'Woodstock',      hrs:81.70},
  {name:'Flores, Javier',       loc:'Woodstock',      hrs:76.41},
  {name:'Gomez, Eli',           loc:'Woodstock',      hrs:73.07},
  {name:'Ramirez, Irving',      loc:'Woodstock',      hrs:92.67},
  {name:'Duran, Juan Pablo',    loc:'Woodstock',      hrs:88.10},
  {name:'Alvarez, Jorge',       loc:'Woodstock',      hrs:79.58},
  {name:'Hart, Michael',        loc:'Woodstock',      hrs:62.55},
  {name:'Marotta, Sergio',      loc:'Woodstock',      hrs:27.88},
];

const MITS = [
  {name:'Perez Jr, Luis',             hrs:56.92, locs:'West Midtown · Chamblee'},
  {name:'Morales, Geysa',             hrs:51.63, locs:'Cumming'},
  {name:'Carrillo, Ephraim',          hrs:66.03, locs:'Chamblee'},
  {name:'Avellaneda, John P',         hrs:62.53, locs:'Beltline · Decatur'},
  {name:'Almao, Rafael',              hrs:16.38, locs:'West Midtown'},
  {name:'Dominguez, Emmanuel Felipe', hrs:37.38, locs:'Beltline'},
  {name:'Zacharias, Kasey',           hrs:38.26, locs:'Duluth'},
  {name:'Zamudio, Miguel',            hrs:52.04, locs:'Sugar Hill'},
];

const LOC_ORDER = ['Midtown','West Midtown','Chamblee','Sandy Springs','Cumming',
                   'Sugar Hill','Buckhead','Decatur','Lawrenceville','Beltline','Duluth','Woodstock'];

function badge(hrs) {
  if (hrs < 30)  return `<span class="badge badge-red">🚨 Critical</span>`;
  if (hrs < 45)  return `<span class="badge badge-amber">⚠️ Under 45</span>`;
  return `<span class="badge badge-green">✅ OK</span>`;
}
function hrsColor(hrs) {
  if (hrs < 30)  return 'text-red';
  if (hrs < 45)  return 'text-amber';
  return 'text-green';
}

const totalHrs  = MANAGERS.reduce((s,m) => s+m.hrs, 0);
const avgHrs    = totalHrs / MANAGERS.length;
const flagged   = MANAGERS.filter(m => m.hrs < 45).sort((a,b) => a.hrs - b.hrs);
const mitTotal  = MITS.reduce((s,m) => s+m.hrs, 0);
const mitAvg    = mitTotal / MITS.length;

// Group managers by location
const byLoc = {};
for (const loc of LOC_ORDER) byLoc[loc] = MANAGERS.filter(m => m.loc === loc).sort((a,b) => b.hrs - a.hrs);

function buildHTML() {
  let html = '';

  // ── COVER ──
  html += coverHTML('Manager Hours Report', 'Week 14  ·  All Locations', 'Week 14', '03/30–04/05/2026');
  html += `<div class="content">`;

  // KPI row
  html += `
<div class="kpi-grid">
  <div class="kpi-card">
    <div class="kpi-value">${MANAGERS.length}</div>
    <div class="kpi-label">Total Managers</div>
  </div>
  <div class="kpi-card">
    <div class="kpi-value">${totalHrs.toFixed(0)}</div>
    <div class="kpi-label">Total Hours</div>
  </div>
  <div class="kpi-card">
    <div class="kpi-value" style="color:${B.amber}">${avgHrs.toFixed(1)}</div>
    <div class="kpi-label">Avg Hours / Mgr</div>
  </div>
  <div class="kpi-card">
    <div class="kpi-value" style="color:${B.red}">${flagged.length}</div>
    <div class="kpi-label">Flagged Under 45h</div>
  </div>
</div>`;

  // ── FLAGGED ──
  html += `<div class="section-hdr">⚠️ Flagged — Under 45 Hours (${flagged.length} Managers)</div>`;
  html += `<table class="data-table">
<thead><tr>
  <th style="text-align:left">Manager</th><th>Location</th><th>Hours</th><th>Status</th>
</tr></thead><tbody>`;
  for (const m of flagged) {
    html += `<tr>
      <td>${m.name}</td>
      <td>${m.loc}</td>
      <td class="${hrsColor(m.hrs)}">${m.hrs.toFixed(2)}h</td>
      <td>${badge(m.hrs)}</td>
    </tr>`;
  }
  html += `</tbody></table>`;

  html += `<div style="background:${B.amberBg};border:1px solid ${B.amber};border-left:3px solid ${B.amber};border-radius:4px;padding:10px 12px;font-size:10px;color:${B.amberTxt};margin-bottom:12px;">
⚠️  Threshold: 45 hours/week. Managers below this may indicate scheduling gaps, attendance issues, or incomplete punches. Please review with each location GM.
</div>`;

  // ── ALL LOCATIONS TABLE ──
  html += `<div class="section-hdr">Hours Breakdown by Location — All Managers</div>`;
  html += `<table class="data-table">
<thead><tr>
  <th style="text-align:left">Manager</th><th>Location</th><th>Hours</th><th>Status</th>
</tr></thead><tbody>`;

  for (const loc of LOC_ORDER) {
    const mgrs = byLoc[loc];
    if (!mgrs || mgrs.length === 0) continue;
    const locTotal = mgrs.reduce((s,m) => s+m.hrs, 0);
    const locAvg   = locTotal / mgrs.length;
    for (const m of mgrs) {
      html += `<tr>
        <td>${m.name}</td>
        <td>${m.loc}</td>
        <td class="${hrsColor(m.hrs)}">${m.hrs.toFixed(2)}h</td>
        <td>${badge(m.hrs)}</td>
      </tr>`;
    }
    html += `<tr class="loc-total-row">
      <td>─── ${loc} Total</td>
      <td>${mgrs.length} mgrs</td>
      <td>${locTotal.toFixed(1)}h</td>
      <td>Avg ${locAvg.toFixed(1)}h</td>
    </tr>`;
    html += `<tr class="spacer-row"><td colspan="4"></td></tr>`;
  }
  html += `</tbody></table>`;

  // ── MIT SECTION ──
  html += `<div class="section-hdr">MITs at Rreal Locations — Managers in Training</div>`;
  html += `<table class="data-table">
<thead><tr>
  <th style="text-align:left">Manager</th><th>Hours</th><th style="text-align:left">Location(s)</th><th>Status</th>
</tr></thead><tbody>`;
  for (const m of MITS) {
    let st = m.hrs < 20
      ? `<span class="badge badge-red">🔴 Low Hours</span>`
      : m.hrs < 45
        ? `<span class="badge badge-amber">⚠️ Under 45</span>`
        : `<span class="badge badge-green">✅ OK</span>`;
    html += `<tr>
      <td>${m.name}</td>
      <td class="${hrsColor(m.hrs)}">${m.hrs.toFixed(2)}h</td>
      <td style="text-align:left">${m.locs}</td>
      <td>${st}</td>
    </tr>`;
    html += `<tr class="spacer-row"><td colspan="4"></td></tr>`;
  }
  html += `<tr class="total-row">
    <td>MIT Total — ${MITS.length} MITs</td>
    <td>${mitTotal.toFixed(1)}h</td>
    <td>Avg ${mitAvg.toFixed(1)}h</td>
    <td></td>
  </tr>`;
  html += `</tbody></table>`;
  html += `<p style="font-size:9px;color:${B.muted};font-style:italic;margin-top:4px;">MITs may appear across multiple locations — hours reflect total across all assigned locations.</p>`;

  html += `</div>`; // end content
  return html;
}

async function main() {
  const puppeteer = require('puppeteer');
  const fullHTML = wrapPage(buildHTML(), 'Manager Hours Report', 'Week 14', '03/30–04/05/2026');

  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });
  await page.setContent(fullHTML, { waitUntil: 'networkidle0' });

  // Screenshot first page only
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
