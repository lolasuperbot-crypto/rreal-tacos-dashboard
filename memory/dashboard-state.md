# Rreal Tacos Dashboard — State & Config

## Dashboard URL
- **Public:** https://rrealtacos-dashboard.surge.sh
- **Files:** /Users/mariajoseduffy/.openclaw/workspace/dashboard/
- **PDF Server:** LaunchAgent com.rrealtacos.pdfserver → localhost:8765
- **PDF Tunnel:** LaunchAgent com.rrealtacos.tunnel → trycloudflare.com
- **Tunnel URL file:** /tmp/current_tunnel_url.txt (changes on Mac restart)

## Toast API
- **Endpoint:** https://ws-api.toasttab.com
- **Client ID:** NGCaheK337HbbBuOJ3DY92JorvDpgTn0
- **Credentials file:** memory/credentials.md
- **12 Locations + GUIDs:** memory/credentials.md

## FoodSync Audits (real data from emails)
- **Source account:** lolasuperbot@gmail.com (Gmail OAuth)
- **34 audit emails** parsed from majo@rrealtacos.com forwards
- **PDFs:** /Users/mariajoseduffy/.openclaw/workspace/dashboard/reports/
- **Months covered:** January, February, March 2026
- **Parsed data:** /tmp/foodsync_parsed.json

## Surge Deploy
- **Account:** majo@rrealtacos.com / 17deabriL!!
- **Deploy command:** surge . rrealtacos-dashboard.surge.sh (from dashboard dir)

## Hourly Refresh
- Updates: Toast sales data for all 12 locations (today)
- Redeploys to Surge automatically
- Cron job: set up via OpenClaw cron
