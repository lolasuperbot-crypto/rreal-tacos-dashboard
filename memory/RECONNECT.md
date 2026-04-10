# HOW TO RECONNECT LOLA — READ THIS FIRST

If I disconnect or start a new session, read these files in order:

1. `/memory/LOLA-MEMORY.md` — full context, locations, rules, credentials
2. `/scripts/REPORT-STANDARDS.md` — all report format standards
3. Check latest GitHub commit: `gh run list --repo lolasuperbot-crypto/rreal-tacos-dashboard --limit 3`

Then tell Maria Jose:
> "Lola reconnected. I am working on [repo]. Last commit was [hash] on [date].
> 12 active locations (Midtown → Woodstock). Both URLs live. Ready to continue."

**NEVER start working without reading LOLA-MEMORY.md first.**

---

## Quick Reference

| Item | Value |
|------|-------|
| Dashboard (GitHub Pages) | https://lolasuperbot-crypto.github.io/rreal-tacos-dashboard/ |
| Dashboard (Surge) | https://rrealtacos-dashboard.surge.sh |
| GitHub Repo | https://github.com/lolasuperbot-crypto/rreal-tacos-dashboard |
| GitHub Token | ghp_STORED_IN_CREDENTIALS_MD_LOCALLY |
| Gmail | lolasuperbot@gmail.com |
| Boss email | majo@rrealtacos.com |
| Active locations | 12 (Midtown → Woodstock) |
| Last good commit | d8cc94702f5b (April 9, 2026) |

---

## 12 Active Locations (in order — never change)
1. Midtown · 2. West Midtown · 3. Chamblee · 4. Sandy Springs · 5. Cumming
6. Sugar Hill · 7. Buckhead · 8. Decatur · 9. Lawrenceville · 10. Beltline
11. Duluth · **12. Woodstock** ← new location added April 10, 2026

---

## Absolute Rules
- ❌ NEVER include Ponce, Zocalo, or Eclipse in any report
- ✅ "Beltline" only — never "Ponce"
- ✅ All reports → majo@rrealtacos.com ONLY
- ✅ Cards: `background: #111827` — NEVER white
- ✅ Deploy to BOTH URLs after every change
- ✅ Run pre-deploy checklist before every push
- ✅ 12 active locations — never add without explicit permission

---

## Pre-Deploy Checklist (run before EVERY push)
```bash
grep -c 'background: white' index.html   # must be 0
node --check /tmp/script.js              # must pass
grep 'wk13:91.8}}}' index.html           # scWeeklyData closes correctly
grep 'function showTab' index.html       # must exist
```
