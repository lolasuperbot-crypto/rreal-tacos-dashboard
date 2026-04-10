# Rreal Hospitality — Report Standards
# PERMANENT — Do not change without explicit instruction from Maria Jose Duffy
# Last approved: April 10, 2026

---

## Approved Design: Gold Standard — April 2026 Operations Scorecard Style
Reference file: `reports/APPROVED_FORMAT_REFERENCE.pdf`
Generated via Puppeteer (HTML → PDF). Template: `scripts/report-template.html.js`

---

## Logo
- File: `receipt-logo_1680210631_400.jpg` (in /dashboard/ folder)
- Size: height 36–40px, width auto, max-width 130px
- Position: **TOP LEFT** of header — never centered

---

## Header Layout (Option 1 — side by side)
- **LEFT:** Logo + "RREAL HOSPITALITY LLC" label (9px gray uppercase)
- **RIGHT:** Report title (20px bold #111827) + subtitle (12px #9ca3af)
- **BOTTOM BORDER:** 3px solid `#f97316` (orange) — on header row ONLY
- Subtitle: plain text line, 12px gray, white-space:nowrap

---

## Report Structure — Gold Standard

### COVER PAGE
- Brand/dark header bar with logo
- Report title centered, large
- Subtitle with date range and data note (italic)
- "Data reflects Week X · Weeks Y–Z pending" note

### PAGE 2 — EXECUTIVE SUMMARY
- 4 large KPI numbers at top: System Avg · Top Score · Lowest Score · Locations Scored
- Full rankings table:
  - Columns: # · Location · Score · Grade · Progress · Highlights/Flags
  - Color-coded grades
  - Emoji progress indicators
- Critical alerts block at bottom (red background)
- Most Improved callout

### DETAIL PAGES — one per location (or 2 per page for space)
- Header: `[##] · [LOCATION NAME]   [EMOJI] #[RANK]   [SCORE]` (right-aligned)
- **6 KPI Cards** in 2×3 grid:
  - Row 1: Sunday Global Score · Bad Review Rate · Ovation Satisfaction
  - Row 2: Ovation Response Time · Labor % · COG + OP %
  - Each card: KPI label (small caps, top) · Big score number (0–100) · Raw value + emoji flag (below)
- Narrative paragraph: 2–4 sentences, specific numbers, system comparisons
- Action items:
  - `📌 Keep an eye on:` — yellow/watch
  - `🔧 Priority Fix:` — orange/fix
  - `🚨 CRITICAL:` — red/urgent

### GROUPING HEADERS
- `🏆 TOP PERFORMERS — LOCATION DETAIL` (A grades, score ≥90)
- `📈 SOLID PERFORMERS — FINE-TUNING NEEDED` (B+, score 87–89)
- `⚠️ NEEDS IMMEDIATE ATTENTION` (B grades, score 80–86)
- `🚨 CRITICAL` (D or below, score <80)

---

## Writing Style Rules
- Always use **real numbers** — never vague ("improved" → "improved from 41.83% → 37.16%")
- Always compare to **system average** and **best in system**
- Always end each location with a **bottom-line summary sentence**
- Use **Most Improved** badge when a location shows measurable improvement
- Flag **contradictions** (e.g., "4.8/5 stars but 4.77% bad reviews — explain this")
- Lead with positives, then address gaps specifically
- Action items must be **concrete** ("Pull all negative Google reviews from past 30 days" not "improve reviews")

---

## Font Sizes — MINIMUM (never go smaller)
- Body text: **13px**
- Table cells: **13px**
- Table headers: **11px**
- Section titles: **14px uppercase**
- KPI big numbers: **26–28px bold**
- KPI labels: **11px uppercase**
- Badge text (WATCH/CRITICAL/CLEAN): **11px**
- Location names in tables: **13px bold**
- Location page titles: **18px bold**
- Footer text: **9px**
- Critical section location names: **18px bold**
- Action items: **13px**

---

## Badge Colors
| Status | Background | Text Color |
|--------|-----------|------------|
| CLEAN (0 reviews) | `#dcfce7` | `#166534` |
| WATCH (1–2 reviews) | `#fef3c7` | `#92400e` |
| CRITICAL (3+ reviews) | `#fee2e2` | `#991b1b` |

---

## Table Rules
- Critical rows (top 3 by total bad reviews): `background: #fff0f0`, `border-left: 3px solid #dc2626`
- Tiebreaker for top 3: /100K rate (higher = worse)
- Blank white spacer row (~10px height) after each location group total row
- Location names: bold `#111827` in normal rows; `#991b1b` in critical rows
- Total row: `background: #f3f4f6`, bold, border-top `#e5e7eb`

---

## KPI Score Color Thresholds (0–100 scale)
- ≥90: `#16a34a` (green) — `badge-green`
- 87–89: `#d97706` (amber) — `badge-amber`
- 84–86: `#ea580c` (orange-red)
- <84: `#dc2626` (red) — `badge-red`

---

## Labor % Color Thresholds
- >20%: red `#dc2626`
- >17%: amber `#d97706`
- ≤17%: green `#16a34a`

---

## Active Locations (12 — exact order)
1. Midtown · 2. West Midtown · 3. Chamblee · 4. Sandy Springs · 5. Cumming
6. Sugar Hill · 7. Buckhead · 8. Decatur · 9. Lawrenceville · 10. Beltline
11. Duluth · 12. **Woodstock** ← new, mark with ⚡

## NEVER Include in Any Report
- Ponce (discontinued — use Beltline)
- Zocalo (not Rreal Tacos)
- Eclipse di Luna (different brand)
- Any location not in the 12 above

---

## WOW Improvements Section
- Only include locations where current week reviews < prior week reviews (actual improvement)
- NEVER include locations where both weeks = 0 (no movement)
- Sort by biggest drop in /100K rate (best recovery first)

---

## Manager Hours Report Rules
- Threshold: 45 hours/week — flag anyone under
- MIT section ALWAYS at end
- Spacer row after each location group
- Critical badge: <30h → 🚨 Critical · 30–44h → ⚠️ Under 45 · ≥45h → ✅ OK
- MIT badge: <20h → 🔴 Low Hours · 20–44h → ⚠️ Under 45 · ≥45h → ✅ OK

---

## EOD Report Rules
- Check all 12 locations every night
- MISSING = no report by 2:00 AM ET
- Critical keywords (auto-flag red): health department · injury · fight · theft · police · fire · flood · emergency · ambulance · raw · contamination · poisoning
- Maintenance keywords (auto-flag orange): broken · not working · repair · fix · leak · AC · heat · freezer · cooler · oven · fryer · plumbing · electrical · pest · roach · mouse
- PDF sent daily at 6am ET to majo@rrealtacos.com

---

## Email Rules — ABSOLUTE
- **Always send to:** majo@rrealtacos.com
- **Never send to:** michelle@rrealtacos.com or any other address
- Always attach PDF
- Always include brief summary in body
- From: lolasuperbot@gmail.com

---

## Footer — Every Page
`Rreal Tacos · [Report Name] · [Month Year] · Generated by Lola 🌺`

---

## Report Files
- Main template: `scripts/report-template.html.js`
- Review generator: `scripts/gen_review_report.js`
- Hours generator: `scripts/gen_mgr_hours.js`
- Daily report: `scripts/gen_daily_report.js`
- EOD report: `scripts/eod-report.js`
- Output: `reports/` folder
- Reference PDF: `reports/APPROVED_FORMAT_REFERENCE.pdf`

---

## Automated Schedule (GitHub Actions)
- Daily Operations Report: 6am ET (`0 10 * * *`) → majo@rrealtacos.com
- EOD Report: 6am ET (`0 10 * * *`) → majo@rrealtacos.com
- Weekly Review Report: Monday 6pm ET (`0 23 * * 1`) → majo@rrealtacos.com
- Manager Hours Report: Monday 6pm ET (`0 23 * * 1`) → majo@rrealtacos.com

---

## Food Safety Audit Report Structure — APPROVED April 10, 2026
**This structure is locked. Always use this exact format for food safety reports.**

### Page Layout
1. **Header** — Logo top-left · "RREAL HOSPITALITY LLC" · Report title right · orange bottom border
2. **Summary Bar** — 4 KPI cards: Audits Conducted · F Grades · D Grades · B/B+ Grades
3. **Score Summary Table** — all locations audited: # · Location · Date · Score · Grade · FSM · Primary Issues
4. **Critical Alert Box** — red banner for any integrity concerns or urgent issues
5. **Location Detail Sections** — one section per location (see structure below)
6. **Deadlines Table** — all outstanding action items with due dates and status
7. **Footer** — logo · "Food Safety Audit Report — [Month Year]" · "Generated by Lola AI 🌺 · date · email"

### Per-Location Section Structure
- **Header bar** — location number · name · date · time · FSM on site · SCORE pill (right-aligned, color-coded)
- **Alert box** if critical issues (red) or improvement (green) or concern (amber)
- **Two columns:**
  - LEFT: Temperature readings table (Item · Location · Temp · Pass/Fail)
  - RIGHT: Violations table (Code · Issue · Points) + Action items list
- **Trend chips** (when multiple visits): show score progression e.g. 49 F → 62 D → 81 B

### Score Color Coding
- 90–100: green `#dcfce7 / #166534` — A
- 80–89: amber `#fef3c7 / #92400e` — B / B+
- 70–79: red-light `#fee2e2 / #991b1b` — C
- Below 70: red `#fee2e2 / #991b1b` — D / F

### Rules
- **NEVER label an inspection as "REDO" unless Maria Jose explicitly says so**
- Always show full temperature readings table when available from PDF
- Always list specific violation codes (2-2B, 6-1A, etc.) with point deductions
- Always include action items with specific deadlines
- Always note Reese's direct quotes when provided
- If PDF not yet extracted, note "score/details pending PDF extraction"
- Save all audit data to `memory/food-safety/[location]-audits.md`
