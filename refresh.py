#!/usr/bin/env python3
"""
Rreal Tacos Dashboard — Hourly Refresh Script
Pulls fresh Toast sales data, new FoodSync audit emails, updates dashboard + redeploys.
"""
import subprocess, json, time, re, os, sys
from datetime import datetime, timezone
from collections import defaultdict
import pytz

ET = pytz.timezone("America/New_York")
now_et = datetime.now(ET)
today = now_et.strftime("%Y-%m-%d")
today_label = now_et.strftime("%B %-d, %Y")

DASHBOARD_DIR = "/Users/mariajoseduffy/.openclaw/workspace/dashboard"
CREDENTIALS = {
    "clientId": "NGCaheK337HbbBuOJ3DY92JorvDpgTn0",
    "clientSecret": "KpFjzMDvVXpSwiFHZigYp1PAARK9x7kCsEZIjZXKZzePlVqBUnQvvSCdDphjemdT",
    "userAccessType": "TOAST_MACHINE_CLIENT"
}
NAMES = ["Midtown","West Midtown","Chamblee","Sandy Springs","Cumming","Sugar Hill",
         "Buckhead","Decatur","Lawrenceville","Beltline","Duluth","Woodstock"]
GUIDS = ["05507805-dd4a-41fa-b941-1ed125690029","abbbd1c5-773f-48c8-89b8-10a7817a4486",
         "aa75d6ef-f7f8-4758-885f-c0443f6f319c","0e3ef109-aef9-40fc-ac6f-e66248a5cf7d",
         "7a689bf3-b739-41ca-a5a0-2480aa99b28e","8cfa57c2-9f91-41e5-abb8-2c509deb7ef0",
         "d291863f-b651-4061-a0a3-d8420f2484e8","8d062d29-7937-434b-a8ff-0cc8dab3722f",
         "ec1b2c91-2502-4ea0-9059-ffc65709d403","bf33a95f-480d-4797-8c02-e283ce6c71bc",
         "35e9cefe-fd09-40c3-a700-31757d983e2e","fab137f5-90b8-4611-96f1-107b48de7bfb"]

def get_token():
    r = subprocess.run(["curl","-s","-X","POST",
        "https://ws-api.toasttab.com/authentication/v1/authentication/login",
        "-H","Content-Type: application/json",
        "-d", json.dumps(CREDENTIALS)], capture_output=True, text=True)
    return json.loads(r.stdout)["token"]["accessToken"]

def get_sales(token, guid, date):
    all_orders = []
    page = 1
    while True:
        r = subprocess.run(["curl","-s",
            f"https://ws-api.toasttab.com/orders/v2/ordersBulk?startDate={date}T00:00:00.000-0400&endDate={date}T23:59:59.000-0400&pageSize=100&page={page}",
            "-H", f"Authorization: Bearer {token}",
            "-H", f"Toast-Restaurant-External-ID: {guid}"],
            capture_output=True, text=True)
        try:
            batch = json.loads(r.stdout)
            if not isinstance(batch, list) or not batch: break
            all_orders.extend(batch)
            if len(batch) < 100: break
            page += 1
        except: break
        time.sleep(0.1)
    total, count = 0, 0
    for o in all_orders:
        if not isinstance(o, dict) or o.get("voided"): continue
        for chk in o.get("checks", []):
            if isinstance(chk, dict):
                amt = chk.get("totalAmount", 0) or 0
                if amt > 0: total += amt; count += 1
    return round(total, 2), count

def fetch_new_foodsync_emails():
    """Check for new FoodSync audit emails since last run"""
    r = subprocess.run([
        "gog", "gmail", "messages", "search", "foodsync Audit Report",
        "--max", "50", "--include-body", "--json", "--account", "lolasuperbot@gmail.com"
    ], capture_output=True, text=True)
    try:
        data = json.loads(r.stdout)
        messages = data.get("messages", [])
        new_audits = []
        for m in messages:
            if "UNREAD" in m.get("labels", []):
                subj = m.get("subject","")
                body = m.get("body","")
                match = re.search(r'Audit Report (.+?)\s*,\s*(\w+),\s*(\d+)', subj, re.IGNORECASE)
                if match:
                    url_match = re.search(r'https://foodsync\.ai/p/submission/[^\s>]+', body)
                    new_audits.append({
                        "loc": match.group(1).strip(),
                        "month": match.group(2).strip(),
                        "score": int(match.group(3).strip()),
                        "url": url_match.group() if url_match else None,
                        "id": m.get("id")
                    })
        return new_audits
    except:
        return []

def download_pdf(url, name):
    """Download a FoodSync report as PDF"""
    if not url: return None
    from playwright.sync_api import sync_playwright
    pdf_path = f"{DASHBOARD_DIR}/{name}.pdf"
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, wait_until="networkidle", timeout=20000)
            time.sleep(2)
            page.pdf(path=pdf_path, format="A4", print_background=True)
            browser.close()
        return f"{name}.pdf"
    except Exception as e:
        print(f"  PDF error: {e}")
        return None

def update_dashboard_js(html, sales_data, today_label):
    """Update the locations JS array with fresh sales data"""
    colors = ["#c2006e","#6a1b9a","#1565c0","#0277bd","#00838f","#4527a0",
              "#e91e8c","#0288d1","#ad1457","#4a148c","#1976d2","#0097a7"]
    loc_js = "const locations = [\n"
    for i, (name, color) in enumerate(zip(NAMES, colors)):
        s = sales_data.get(name, {"sales":0,"orders":0})
        loc_js += f'  {{ name: "{name}", sales: {s["sales"]}, checks: {s["orders"]}, color: "{color}" }},\n'
    loc_js += "];"

    html = re.sub(r'const locations = \[.*?\];', loc_js, html, flags=re.DOTALL)

    # Update total sales in metric cards
    total = sum(v["sales"] for v in sales_data.values())
    total_checks = sum(v["orders"] for v in sales_data.values())
    avg_ticket = round(total / total_checks, 2) if total_checks > 0 else 0

    # Update "last updated" text and date references
    html = re.sub(r'All 12 locations · \w+ \d+, \d{4}', f'All 12 locations · {today_label}', html)
    html = re.sub(r'March 29, 2026', today_label, html)

    return html, total, total_checks, avg_ticket

def redeploy():
    proc = subprocess.Popen(
        ["surge", ".", "rrealtacos-dashboard.surge.sh", "--no-clipboard"],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, cwd=DASHBOARD_DIR
    )
    time.sleep(2)
    proc.stdin.write("majo@rrealtacos.com\n"); proc.stdin.flush()
    time.sleep(1)
    proc.stdin.write("17deabriL!!\n"); proc.stdin.flush()
    out, _ = proc.communicate(timeout=120)
    return "Success" in out

# ── MAIN ──
print(f"\n{'='*50}")
print(f"🌮 Dashboard Refresh — {now_et.strftime('%Y-%m-%d %H:%M %Z')}")
print(f"{'='*50}")

# 1. Get fresh Toast sales
print("\n📊 Fetching Toast sales...")
token = get_token()
sales_data = {}
for name, guid in zip(NAMES, GUIDS):
    s, c = get_sales(token, guid, today)
    sales_data[name] = {"sales": s, "orders": c}
    print(f"  {name}: ${s:,.2f} ({c} checks)")
    time.sleep(0.1)

total_sales = sum(v["sales"] for v in sales_data.values())
print(f"\n  TOTAL: ${total_sales:,.2f}")

# 2. Check for new FoodSync emails
print("\n📧 Checking for new FoodSync audit emails...")
new_audits = fetch_new_foodsync_emails()
if new_audits:
    print(f"  Found {len(new_audits)} new audits!")
    for a in new_audits:
        print(f"  → {a['loc']} {a['month']} {a['score']}/100")
        safe = f"{a['month']}_{a['loc'].replace(' ','_')}_{a['score']}"
        pdf = download_pdf(a["url"], safe)
        if pdf:
            print(f"    ✅ PDF saved: {pdf}")
        # Add to reports JS (simplified — full implementation would update auditData)
else:
    print("  No new audits.")

# 3. Update dashboard HTML
print("\n🔄 Updating dashboard HTML...")
with open(f"{DASHBOARD_DIR}/index.html","r") as f:
    html = f.read()

html, total, checks, avg = update_dashboard_js(html, sales_data, today_label)

# Update metric card values
html = re.sub(r'>\$[\d,]+</div>\n      <div class="metric-sub">All 12 locations',
              f'>${total:,.0f}</div>\n      <div class="metric-sub">All 12 locations', html)
html = re.sub(r'>[\d,]+</div>\n      <div class="metric-sub">Avg \$[\d.]+ / check',
              f'>{checks:,}</div>\n      <div class="metric-sub">Avg ${avg} / check', html)

with open(f"{DASHBOARD_DIR}/index.html","w") as f:
    f.write(html)
print("  ✅ HTML updated")

# 3.5 Check tunnel URL is still valid
print("\n🌐 Checking tunnel URL...")
try:
    import subprocess as sp2
    current_tunnel = sp2.run(["grep","-o","https://[a-z-]*.trycloudflare.com","/tmp/tunnel.log"],
        capture_output=True, text=True).stdout.strip().split("\n")[-1].strip()
    if current_tunnel:
        with open(f"{DASHBOARD_DIR}/index.html","r") as fi:
            old_html = fi.read()
        # Find existing tunnel URL in html
        import re as _re
        existing = _re.search(r"https://[a-z-]+\.trycloudflare\.com", old_html)
        if existing and existing.group() != current_tunnel:
            print(f"  Tunnel changed! Updating {existing.group()} → {current_tunnel}")
            html = old_html.replace(existing.group(), current_tunnel)
            with open(f"{DASHBOARD_DIR}/index.html","w") as fi:
                fi.write(html)
        else:
            print(f"  Tunnel OK: {current_tunnel}")
except Exception as te:
    print(f"  Tunnel check error: {te}")

# 4. Redeploy
print("\n🚀 Deploying to Surge...")
ok = redeploy()
print(f"  {'✅ Deployed!' if ok else '❌ Deploy failed'}")

# 5. Save refresh log
log = {
    "timestamp": now_et.isoformat(),
    "total_sales": total_sales,
    "total_checks": checks,
    "new_audits": len(new_audits),
    "deployed": ok
}
with open(f"{DASHBOARD_DIR}/refresh_log.json","w") as f:
    json.dump(log, f, indent=2)

print(f"\n✅ Refresh complete! ${total_sales:,.2f} across {checks} checks")
