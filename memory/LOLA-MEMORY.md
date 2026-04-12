# Lola AI — Permanent Memory
Last updated: April 10, 2026

---

## WHO I AM
- **Name:** Lola AI 🌺
- **Role:** Operations AI for Rreal Hospitality LLC / Rreal Tacos
- **Email:** lolasuperbot@gmail.com
- **GitHub:** lolasuperbot-crypto
- **Repo:** rreal-tacos-dashboard
- **GitHub Pages URL:** https://lolasuperbot-crypto.github.io/rreal-tacos-dashboard/
- **Surge URL:** https://rrealtacos-dashboard.surge.sh

---

## MY BOSS
- **Name:** Maria Jose Duffy
- **Email:** majo@rrealtacos.com
- **ALL reports go to:** majo@rrealtacos.com
- **Communication:** WhatsApp

---

## 12 ACTIVE LOCATIONS — EXACT ORDER — NEVER CHANGE
1. Midtown
2. West Midtown
3. Chamblee
4. Sandy Springs
5. Cumming
6. Sugar Hill
7. Buckhead
8. Decatur
9. Lawrenceville
10. Beltline
11. Duluth
12. Woodstock ← NEW, now active

## REMOVED LOCATIONS — NEVER INCLUDE THESE EVER
- **Ponce** (replaced by Beltline — "Ponce" does NOT exist)
- **Zocalo**
- **Eclipse**

---

## DASHBOARD
- **Main file:** index.html (3,713 lines as of April 9 restore)
- **Last known good commit:** d8cc94702f5b (April 9, 2026 17:39 UTC)
- **Deploy to BOTH URLs after every change**
- **Header:** 'Rreal Hospitality — Operations & Compliance Hub'
- **Subtitle:** 'Rreal Tacos · Sales · Health · FoodSync · Secret Shopper · Reviews · Atlanta Metro'
- **Push command:** `GIT_TERMINAL_PROMPT=0 git push https://ghp_STORED_IN_CREDENTIALS_MD_LOCALLY@github.com/lolasuperbot-crypto/rreal-tacos-dashboard.git main`

## TAB ORDER — EXACT
1. 🏠 Overview
2. 🃏 Scorecards
3. ⭐ Reviews
4. 🏥 Health Audits
5. 📋 FoodSync Audits
6. 🕵️ Secret Shopper
7. 🧑‍💼 Mgmt Hours
8. 💰 Sales
9. 🚨 Alerts
10. 💬 WhatsApp
11. 🌙 EOD Reports

## REMOVED TABS — NEVER ADD BACK
- Revenue & Growth (removed April 10, 2026)
- All Locations (removed April 10, 2026)
- Labor (removed April 10, 2026)

---

## DARK THEME — CRITICAL CSS RULES
- **Dashboard background:** `#0a0f1e`
- **Card background:** `#111827` — NEVER white, NEVER #fff
- **`.kpi-card` background:** `#111827` — NEVER white
- **`.report-tab-btn` background:** `#111827` — NEVER white
- **Orange accent:** `#f97316`
- **Card numbers:** `#c4cde0`
- **PRE-DEPLOY CHECK:** `grep -c 'background: white' index.html` must return **0**

---

## PRE-DEPLOY CHECKLIST — RUN EVERY TIME
1. `grep -c 'background: white' index.html` → must be **0**
2. JS syntax check via node → **0 errors**
3. Verify `scWeeklyData` closes with correct `}}};`
4. Verify `showTab()` function exists
5. Test all tabs are present in nav
6. Deploy to **BOTH** GitHub Pages AND Surge
7. Confirm both URLs live before telling Maria Jose it is done

---

## KNOWN JS BUG — scWeeklyData
- The `scWeeklyData` object had orphaned `},feb:{...},mar:{...}` blocks after Duluth entry
- This caused a SyntaxError that killed ALL JavaScript (tabs stop working)
- **NEVER use sed/bulk replace on Duluth entries in scWeeklyData**
- Correct closing: `'Duluth':{...}}};\nlet scCurrentMonth`  (3 closing braces + semicolon)
- If tabs stop working → check JS syntax first before anything else

---

## TOAST API AUTH
- Client ID: `NGCaheK337HbbBuOJ3DY92JorvDpgTn0`
- Client Secret: `KpFjzMDvVXpSwiFHZigYp1PAARK9x7kCsEZIjZXKZzePlVqBUnQvvSCdDphjemdT`
- Auth endpoint: `https://ws-api.toasttab.com/authentication/v1/authentication/login`
- Management Group GUID: `08639c90-6b43-4a53-89a1-9fad91db37cf`

## TOAST LOCATION GUIDs
| # | Name | GUID |
|---|------|------|
| 01 | Midtown | `05507805-dd4a-41fa-b941-1ed125690029` |
| 02 | West Midtown | `abbbd1c5-773f-48c8-89b8-10a7817a4486` |
| 03 | Chamblee | `aa75d6ef-f7f8-4758-885f-c0443f6f319c` |
| 04 | Sandy Springs | `0e3ef109-aef9-40fc-ac6f-e66248a5cf7d` |
| 05 | Cumming | `7a689bf3-b739-41ca-a5a0-2480aa99b28e` |
| 06 | Sugar Hill | `8cfa57c2-9f91-41e5-abb8-2c509deb7ef0` |
| 07 | Buckhead | `d291863f-b651-4061-a0a3-d8420f2484e8` |
| 08 | Decatur | `8d062d29-7937-434b-a8ff-0cc8dab3722f` |
| 09 | Lawrenceville | `ec1b2c91-2502-4ea0-9059-ffc65709d403` |
| 10 | Beltline | `bf33a95f-480d-4797-8c02-e283ce6c71bc` |
| 11 | Duluth | `35e9cefe-fd09-40c3-a700-31757d983e2e` |
| 12 | Woodstock | `fab137f5-90b8-4611-96f1-107b48de7bfb` |

---

## AUTOMATED SCHEDULES
| Task | Schedule | Destination |
|------|----------|-------------|
| Daily Operations Report | 6am ET daily (10am UTC) | majo@rrealtacos.com |
| EOD Report | 6am ET daily (10am UTC) | majo@rrealtacos.com |
| Weekly Review Report | Every Monday 6pm ET | majo@rrealtacos.com |
| Manager Hours Report | Every Monday 6pm ET | majo@rrealtacos.com |
| GitHub Pages deploy | Every push to main | Live site |
| Keep-alive heartbeat | Daily 12pm UTC | memory/heartbeat.log |

---

## DATA SOURCES
- **Weekly Resto Reviews Sheet:** `1kAIFHy7xQggErdAf3Wd70PTRrahgC-gHtW6kWi9ZC3w`
- **Weekly KPI tab:** `weekly_KPI`
- **EOD emails from:** `reports@operations.rrealtacos.com`
- **Manager Hours Sheet:** `1YTFFTnGD4RLR4uLwHirae4IlirkS82VeeVd8CpAc3SE`
- **Labor Bible:** `1VhRz01BC991VLvUsY57Qv6XWc2D7dTi6zvJhlTSLMPY`
- **AP Report:** `1HLPCXN4gYXGM4_OTDntfrCjqxCjxB2Ql1RHlaLwKHr8`
- **Google account:** lolasuperbot@gmail.com

---

## GOLD STANDARD REPORT FORMAT
**All reports must follow the April 2026 Operations Scorecard style.**
Reference file: `reports/APPROVED_FORMAT_REFERENCE.pdf`

### COVER
- Brand color header bar
- Rreal Tacos logo (`receipt-logo_1680210631_400.jpg`) top left, 40px
- Title · Subtitle · Date · Italic data note

### PAGE 2 — SUMMARY
- 3–4 large KPI numbers at top
- Full rankings/summary table
- Color-coded grades and emoji flags
- Critical alerts at bottom in red

### DETAIL PAGES — per location
- Location number · name · rank · overall score (right-aligned)
- **6 KPI boxes** (2 rows × 3 cols):
  - Sunday Global Score · Bad Review Rate · Ovation Satisfaction
  - Ovation Response Time · Labor % · COG + OP %
- Each KPI: 0–100 score large + raw value below + emoji status flag
- Written narrative analysis paragraph
- 📌 Watch items · 🔧 Fix items · 🚨 Critical items

### GROUPING SECTIONS
- 🏆 Top Performers (A grades)
- 📈 Solid Performers (B+ grades)
- ⚠️ Needs Attention (B grades)
- 🚨 Critical (D grades)

### WRITING STYLE
- Direct and specific — always use real numbers
- Compare to system average and best in system
- End each location with bottom-line summary
- Use Most Improved badges when earned

### FOOTER (every page)
`Rreal Tacos · [Report Name] · [Month Year] · Generated by Lola 🌺`

### FONT SIZES
- Body: minimum 13px
- Headers: 14px
- KPI numbers: 26px bold
- Location titles: 18px bold

---

## REPORT EMAIL RULES
- **Always send to:** majo@rrealtacos.com
- **Never send to:** michelle@rrealtacos.com or any other email
- Always attach PDF
- Always include brief summary in email body

---

## GITHUB SECRETS
| Secret | Purpose |
|--------|---------|
| `GMAIL_APP_PASSWORD` | Gmail IMAP/SMTP for sending reports |
| `GH_PAT` | GitHub PAT with repo+workflow scope |
| `GOOGLE_REFRESH_TOKEN` | Google Sheets/Drive API access |

## GITHUB TOKEN (local)
`ghp_STORED_IN_CREDENTIALS_MD_LOCALLY` — repo+workflow scope, added April 10, 2026

---

## CHANGELOG
- **2026-04-10:** Woodstock added as location #12 — now active in ALL tabs + reports
- **2026-04-10:** Removed Revenue & Growth, All Locations, Labor tabs permanently
- **2026-04-10:** Fixed white card CSS bug — `.kpi-card` must NEVER be white
- **2026-04-10:** Fixed JS syntax error in `scWeeklyData` (orphaned Duluth blocks)
- **2026-04-10:** Scorecards/WhatsApp tab ID swap fixed
- **2026-04-10:** Switched deployment to GitHub Pages (kept Surge as backup)
- **2026-04-10:** April 2026 Scorecard set as gold standard report format
- **2026-04-10:** Daily report generator (`gen_daily_report.js`) built — Style 2 Clean Corporate
- **2026-04-10:** Permanent memory system: LOLA-MEMORY.md + RECONNECT.md + keep-alive
- **2026-04-12:** Woodstock added to Reviews tab · Mac Mini auto-restart configured (launchd com.lola.autostart)
- **2026-04-09:** Last known good commit: `d8cc94702f5b`
- **2026-04-07:** Week 14 review report finalized
- **2026-04-02:** Scorecard payouts added; Ponce replaced by Beltline everywhere
