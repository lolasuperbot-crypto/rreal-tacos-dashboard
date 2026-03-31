
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
- Token: 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
- Push: cd workspace/dashboard && git add -A && git commit -m "msg" && git push origin main

## Marqii API Auth (added 2026-03-31)
- Cognito UserPool: us-east-1_RvmkA3ZEL
- ClientId: 4af42doicu3r2g2ld0su841m2l
- Username: majo@rrealtacos.com / Password: 17deabriL!
- Library: pycognito (pip3 install pycognito)
