
## Location Names
- "Ponce" does NOT exist — the correct name is **Beltline** everywhere
- All references to Ponce must be corrected to Beltline

## Daily 6 AM Auto-Update (active)
- Every day at 6:00 AM ET: pull latest data from ALL sheets, update dashboard, send PDF report to majo@rrealtacos.com
- Sheet: MANAGERS HOURS (1YTFFTnGD4RLR4uLwHirae4IlirkS82VeeVd8CpAc3SE)
- Account: lolasuperbot@gmail.com
- Dashboard: /Users/mariajoseduffy/.openclaw/workspace/dashboard/index.html
- PDF script: /tmp/gen_wk13_pdf.py (adapt for current week each day)
- Maria Jose wants me ALWAYS connected to all sheets she gives me and to do daily updates

## Google Drive — Rreal Tacos Files (indexed 2026-03-29)
Maria Jose wants me to regularly review her Google Sheets and Docs and keep info updated.
Full index in: memory/sheets-docs-index.md

**Key sheets to monitor:**
- THE LABOR BIBLE: 1VhRz01BC991VLvUsY57Qv6XWc2D7dTi6zvJhlTSLMPY
- AP REPORT Week 11_2026: 1HLPCXN4gYXGM4_OTDntfrCjqxCjxB2Ql1RHlaLwKHr8
- DATABASE: 1AyOAH-BFMC7m7D2mQ4kjfluuEaY1dNdNmjjHZT6S7-g
- 2026 - Total Payroll Costs Report: 12YAVPzr_p7JZXL7ZwpJHikipf5BRt5NzgOP-pzI9wBA
- Weekly Labor sheets for all 12 locations (numbered 1-12)

**⚠️ Sheets API needs enabling:** 
https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=290066320089
Drive search works; sheet read/write is blocked until she enables it.

**Account:** lolasuperbot@gmail.com (Drive ✅, Gmail ✅, Sheets ⚠️ API disabled)

## GitHub Repository (added 2026-03-31)
- Repo: https://github.com/lolasuperbot-crypto/rreal-tacos-dashboard (private)
- Token: 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 (updated Apr 1 2026 — has repo+workflow scope)
- Push: cd workspace/dashboard && git add -A && git commit -m "msg" && git push origin main

## Toast API Auth (added 2025-05-01)
- Client ID: NGCaheK337HbbBuOJ3DY92JorvDpgTn0
- Client Secret: KpFjzMDvVXpSwiFHZigYp1PAARK9x7kCsEZIjZXKZzePlVqBUnQvvSCdDphjemdT
- Auth endpoint: https://ws-api.toasttab.com/authentication/v1/authentication/login
- Token type: TOAST_MACHINE_CLIENT (24h expiry, re-auth each run)
- Management Group GUID: 08639c90-6b43-4a53-89a1-9fad91db37cf
- 12 locations confirmed:
  - 01 Midtown: 05507805-dd4a-41fa-b941-1ed125690029
  - 02 West Midtown: abbbd1c5-773f-48c8-89b8-10a7817a4486
  - 03 Chamblee: aa75d6ef-f7f8-4758-885f-c0443f6f319c
  - 04 Sandy Springs: 0e3ef109-aef9-40fc-ac6f-e66248a5cf7d
  - 05 Cumming: 7a689bf3-b739-41ca-a5a0-2480aa99b28e
  - 06 Sugar Hill: 8cfa57c2-9f91-41e5-abb8-2c509deb7ef0
  - 07 Buckhead: d291863f-b651-4061-a0a3-d8420f2484e8
  - 08 Decatur: 8d062d29-7937-434b-a8ff-0cc8dab3722f
  - 09 Lawrenceville: ec1b2c91-2502-4ea0-9059-ffc65709d403
  - 10 Beltline: bf33a95f-480d-4797-8c02-e283ce6c71bc
  - 11 Duluth: 35e9cefe-fd09-40c3-a700-31757d983e2e
  - 12 Woodstock: fab137f5-90b8-4611-96f1-107b48de7bfb ⚡ NEW location — low numbers are normal
- Labor API: /labor/v1/timeEntries — working ✅
- Orders API: /orders/v2/orders — working (max 1hr window per call)

## Marqii API Auth (added 2026-03-31)
- Cognito UserPool: us-east-1_RvmkA3ZEL
- ClientId: 4af42doicu3r2g2ld0su841m2l
- Username: majo@rrealtacos.com / Password: 17deabriL!
- Library: pycognito (pip3 install pycognito)
