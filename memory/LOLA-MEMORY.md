# Lola AI — Permanent Memory
Last updated: April 10, 2026

---

## Identity
- **Name:** Lola AI 🌺
- **Role:** Operations AI for Rreal Hospitality LLC / Rreal Tacos
- **Email:** lolasuperbot@gmail.com
- **GitHub:** lolasuperbot-crypto
- **Repo:** rreal-tacos-dashboard
- **Dashboard URL:** https://lolasuperbot-crypto.github.io/rreal-tacos-dashboard/

---

## Owner
- **Name:** Maria Jose Duffy
- **Title:** VP Field Support & Compliance · Manager Partner · Rreal Hospitality LLC
- **Email:** majo@rrealtacos.com
- **Phone:** 7703317127
- **All reports go to:** majo@rrealtacos.com

---

## Active Locations (11 only — NEVER add or remove without explicit permission)
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

## Removed Locations (NEVER include these in any report, tab, or data)
- ~~Ponce~~ (renamed/removed — always use "Beltline" instead)
- ~~Zocalo~~
- ~~Woodstock~~ (was Location 12 — now inactive for reporting)
- ~~Eclipse~~
- ~~Beltline (old)~~

> ⚠️ "Ponce" does NOT exist. The correct name is **Beltline** everywhere.

---

## Dashboard Structure
- **Repo:** https://github.com/lolasuperbot-crypto/rreal-tacos-dashboard
- **Main file:** index.html (root of repo)
- **Live URL:** https://lolasuperbot-crypto.github.io/rreal-tacos-dashboard/
- **Deploy:** GitHub Pages via Actions (switched from Surge on April 10, 2026)
- **Workflow:** `.github/workflows/deploy.yml`

## Tab Order (exact — do not reorder)
1. 🏠 Overview
2. 🃏 Scorecards
3. ⭐ Reviews
4. 🏥 Health Audits
5. 📋 FoodSync Audits
6. 🕵️ Secret Shopper
7. 🧑‍💼 Mgmt Hours
8. 💰 Sales
9. 📈 Revenue & Growth
10. 📍 All Locations
11. 👥 Labor
12. 🚨 Alerts
13. 💬 WhatsApp
14. 🌙 EOD Reports

---

## Design Standards
- **Dashboard theme:** dark · background `#0a0f1e` · accent orange `#f97316`
- **Card backgrounds:** `#111827`
- **Card numbers:** `#c4cde0`
- **All PDF reports:** Style 2 Clean Corporate
- **Report logo:** `receipt-logo_1680210631_400.jpg` · 40px · top left
- **Report fonts:** minimum 13px body · 14px headers · 26px KPIs
- **Critical rows:** pink `#fff0f0` + red left border
- **Top 3 critical always highlighted**
- **WOW improvements:** only real improvements (not 0→0)
- **Never include removed locations in any report**

---

## Automated Schedules (GitHub Actions)
| Task | Schedule | Destination |
|------|----------|-------------|
| GitHub Pages deploy | On every push to main | Live site auto-update |
| EOD Report | Daily 6am ET (10am UTC) | majo@rrealtacos.com + dashboard JSON |
| Weekly Review Report | Every Monday 6pm ET | majo@rrealtacos.com |
| Manager Hours Report | Every Monday 6pm ET | majo@rrealtacos.com |
| Keep Alive heartbeat | Daily 12pm UTC | heartbeat.log in repo |

---

## Data Sources
- **Weekly Resto Reviews Sheet:** `1kAIFHy7xQggErdAf3Wd70PTRrahgC-gHtW6kWi9ZC3w`
- **Weekly KPI tab:** `weekly_KPI`
- **EOD emails from:** `reports@operations.rrealtacos.com`
- **Manager Hours:** Google Sheets via `gog` auth `lolasuperbot@gmail.com`
- **Labor Bible:** `1VhRz01BC991VLvUsY57Qv6XWc2D7dTi6zvJhlTSLMPY`
- **AP Report:** `1HLPCXN4gYXGM4_OTDntfrCjqxCjxB2Ql1RHlaLwKHr8`
- **Database:** `1AyOAH-BFMC7m7D2mQ4kjfluuEaY1dNdNmjjHZT6S7-g`
- **Payroll Costs:** `12YAVPzr_p7JZXL7ZwpJHikipf5BRt5NzgOP-pzI9wBA`
- **Toast API:** Auth via `https://ws-api.toasttab.com/authentication/v1/authentication/login`
- **Toast Management Group GUID:** `08639c90-6b43-4a53-89a1-9fad91db37cf`

## Toast Location GUIDs
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

---

## Report Standards
- All reports: **Style 2 Clean Corporate**
- Logo: `receipt-logo_1680210631_400.jpg` top left, 40px
- Critical rows: pink `#fff0f0` + red left border
- Top 3 critical always highlighted
- MIT section always at end of hours report
- Spacer rows between location groups
- WOW improvements: only real improvements (not 0→0)
- Never include removed locations in any report

---

## GitHub Secrets (stored in repo)
| Secret | Purpose |
|--------|---------|
| `GMAIL_APP_PASSWORD` | Gmail IMAP/SMTP for sending reports |
| `GH_PAT` | GitHub PAT with repo+workflow scope (added Apr 10 2026) |
| `SURGE_TOKEN` | Old — replaced by GitHub Pages |
| `GOOGLE_REFRESH_TOKEN` | Google Sheets/Drive API access |

---

## How to Reconnect After Disconnect
1. **Read this file first:** `memory/LOLA-MEMORY.md`
2. **Read report standards:** `scripts/REPORT-STANDARDS.md`
3. **Check latest commit** on GitHub to see last action
4. **Confirm live dashboard** at https://lolasuperbot-crypto.github.io/rreal-tacos-dashboard/
5. **Tell Maria Jose** you are reconnected and ready

---

## Changelog
- **2026-04-10:** EOD Reports tab (🌙) added to dashboard
- **2026-04-10:** Switched deployment from Surge → GitHub Pages
- **2026-04-10:** GH_PAT secret added to repo
- **2026-04-10:** Repo made public (required for free GitHub Pages)
- **2026-04-10:** LOLA-MEMORY.md + RECONNECT.md + keep-alive workflow created
- **2026-04-07:** Week 14 review report finalized and sent
- **2026-04-06:** Manager Hours Wk13 PDF report generated
- **2026-04-02:** Scorecard payouts (Abril 2026 Week 1) added
- **2026-03-31:** GitHub repo connected, dashboard deployed to Surge
- **2026-03-29:** Sheets API enabled, Labor Bible + AP Report connected
