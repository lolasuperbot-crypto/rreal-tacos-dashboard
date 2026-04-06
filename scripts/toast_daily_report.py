#!/usr/bin/env python3
"""
Toast Daily Report — Rreal Tacos
Runs at 6 AM ET every day. Pulls yesterday's sales + labor for all 12 locations.
Sends summary to Maria Jose via Signal/SMS through OpenClaw.
"""

import requests
import json
import subprocess
from datetime import datetime, timedelta

CLIENT_ID = "NGCaheK337HbbBuOJ3DY92JorvDpgTn0"
CLIENT_SECRET = "KpFjzMDvVXpSwiFHZigYp1PAARK9x7kCsEZIjZXKZzePlVqBUnQvvSCdDphjemdT"
BASE = "https://ws-api.toasttab.com"

LOCATIONS = [
    ("01 Midtown",       "05507805-dd4a-41fa-b941-1ed125690029"),
    ("02 West Midtown",  "abbbd1c5-773f-48c8-89b8-10a7817a4486"),
    ("03 Chamblee",      "aa75d6ef-f7f8-4758-885f-c0443f6f319c"),
    ("04 Sandy Springs", "0e3ef109-aef9-40fc-ac6f-e66248a5cf7d"),
    ("05 Cumming",       "7a689bf3-b739-41ca-a5a0-2480aa99b28e"),
    ("06 Sugar Hill",    "8cfa57c2-9f91-41e5-abb8-2c509deb7ef0"),
    ("07 Buckhead",      "d291863f-b651-4061-a0a3-d8420f2484e8"),
    ("08 Decatur",       "8d062d29-7937-434b-a8ff-0cc8dab3722f"),
    ("09 Lawrenceville", "ec1b2c91-2502-4ea0-9059-ffc65709d403"),
    ("10 Beltline",      "bf33a95f-480d-4797-8c02-e283ce6c71bc"),
    ("11 Duluth",        "35e9cefe-fd09-40c3-a700-31757d983e2e"),
    ("12 Woodstock",     "fab137f5-90b8-4611-96f1-107b48de7bfb"),
]

def get_token():
    r = requests.post(f"{BASE}/authentication/v1/authentication/login", json={
        "clientId": CLIENT_ID,
        "clientSecret": CLIENT_SECRET,
        "userAccessType": "TOAST_MACHINE_CLIENT"
    })
    return r.json()["token"]["accessToken"]

def get_labor(token, guid, business_date):
    start = f"{business_date}T04:00:00.000-0000"
    next_day = (datetime.strptime(business_date, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
    end = f"{next_day}T04:00:00.000-0000"
    h = {"Authorization": f"Bearer {token}", "Toast-Restaurant-External-ID": guid}
    r = requests.get(f"{BASE}/labor/v1/timeEntries", headers=h, params={"startDate": start, "endDate": end})
    if r.status_code != 200:
        return {"count": 0, "hours": 0.0, "cost": 0.0}
    entries = r.json() if isinstance(r.json(), list) else []
    total_hours, total_cost = 0.0, 0.0
    for e in entries:
        reg = e.get("regularHours") or 0
        ot = e.get("overtimeHours") or 0
        wage = e.get("hourlyWage") or 0
        total_hours += reg + ot
        total_cost += (reg + ot) * wage
    return {"count": len(entries), "hours": round(total_hours, 2), "cost": round(total_cost, 2)}

def get_net_sales(token, guid, business_date):
    biz_date_str = business_date.replace("-", "")
    h = {"Authorization": f"Bearer {token}", "Toast-Restaurant-External-ID": guid}
    total = 0.0
    order_count = 0
    page = 1
    while True:
        r = requests.get(f"{BASE}/orders/v2/ordersBulk",
            headers=h,
            params={"businessDate": biz_date_str, "pageSize": 100, "page": page}
        )
        if r.status_code != 200:
            break
        orders = r.json() if isinstance(r.json(), list) else []
        if not orders:
            break
        for o in orders:
            if isinstance(o, dict) and not o.get("voided"):
                for c in o.get("checks", []):
                    if isinstance(c, dict):
                        total += c.get("totalAmount") or 0
        order_count += len(orders)
        if 'rel="next"' not in r.headers.get("link", ""):
            break
        page += 1
    return {"orders": order_count, "net_sales": round(total, 2)}

def main():
    token = get_token()
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    day_label = datetime.strptime(yesterday, "%Y-%m-%d").strftime("%A, %B %-d")

    rows = []
    total_hours = total_cost = total_sales = 0.0
    total_shifts = total_orders = 0

    for name, guid in LOCATIONS:
        labor = get_labor(token, guid, yesterday)
        sales = get_net_sales(token, guid, yesterday)
        rows.append((name, labor, sales))
        total_shifts += labor["count"]
        total_hours += labor["hours"]
        total_cost += labor["cost"]
        total_sales += sales["net_sales"]
        total_orders += sales["orders"]

    labor_pct = (total_cost / total_sales * 100) if total_sales > 0 else 0

    # Build message
    lines = [f"🌮 *Rreal Tacos — {day_label}*", ""]
    for name, labor, sales in rows:
        flag = " ⚡" if "Woodstock" in name else ""
        lines.append(f"*{name}*{flag}")
        lines.append(f"  Sales: ${sales['net_sales']:,.2f} | Orders: {sales['orders']}")
        lines.append(f"  Labor: ${labor['cost']:,.2f} ({labor['hours']}h, {labor['count']} shifts)")
        lines.append("")

    lines.append("─────────────────────")
    lines.append(f"*Total Sales:* ${total_sales:,.2f}")
    lines.append(f"*Total Labor:* ${total_cost:,.2f} ({total_hours:.1f}h)")
    lines.append(f"*Labor %:* {labor_pct:.1f}%")
    lines.append(f"*Total Orders:* {total_orders:,}")

    msg = "\n".join(lines)
    print(msg)

    # Save to log
    log_path = f"/tmp/toast_report_{yesterday}.txt"
    with open(log_path, "w") as f:
        f.write(msg)
    print(f"\nSaved to {log_path}")

if __name__ == "__main__":
    main()
