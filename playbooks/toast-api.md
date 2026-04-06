# 🌮 Toast API Playbook — Rreal Tacos

## Auth
```
Client ID:     NGCaheK337HbbBuOJ3DY92JorvDpgTn0
Client Secret: KpFjzMDvVXpSwiFHZigYp1PAARK9x7kCsEZIjZXKZzePlVqBUnQvvSCdDphjemdT
Auth URL:      https://ws-api.toasttab.com/authentication/v1/authentication/login
Token type:    TOAST_MACHINE_CLIENT
Token expiry:  24 hours (re-auth on each script run)
Mgmt Group:    08639c90-6b43-4a53-89a1-9fad91db37cf
```

### Auth Request
```bash
curl -s -X POST "https://ws-api.toasttab.com/authentication/v1/authentication/login" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "NGCaheK337HbbBuOJ3DY92JorvDpgTn0",
    "clientSecret": "KpFjzMDvVXpSwiFHZigYp1PAARK9x7kCsEZIjZXKZzePlVqBUnQvvSCdDphjemdT",
    "userAccessType": "TOAST_MACHINE_CLIENT"
  }'
# Response: token.accessToken — use as Bearer token
```

---

## Locations (12 total)

| # | Name | GUID |
|---|------|------|
| 01 | Midtown | 05507805-dd4a-41fa-b941-1ed125690029 |
| 02 | West Midtown | abbbd1c5-773f-48c8-89b8-10a7817a4486 |
| 03 | Chamblee | aa75d6ef-f7f8-4758-885f-c0443f6f319c |
| 04 | Sandy Springs | 0e3ef109-aef9-40fc-ac6f-e66248a5cf7d |
| 05 | Cumming | 7a689bf3-b739-41ca-a5a0-2480aa99b28e |
| 06 | Sugar Hill | 8cfa57c2-9f91-41e5-abb8-2c509deb7ef0 |
| 07 | Buckhead | d291863f-b651-4061-a0a3-d8420f2484e8 |
| 08 | Decatur | 8d062d29-7937-434b-a8ff-0cc8dab3722f |
| 09 | Lawrenceville | ec1b2c91-2502-4ea0-9059-ffc65709d403 |
| 10 | Beltline | bf33a95f-480d-4797-8c02-e283ce6c71bc |
| 11 | Duluth | 35e9cefe-fd09-40c3-a700-31757d983e2e |
| 12 | Woodstock | fab137f5-90b8-4611-96f1-107b48de7bfb | ⚡ NEW LOCATION — low numbers expected |

---

## Key Endpoints

### Labor — Time Entries
```
GET https://ws-api.toasttab.com/labor/v1/timeEntries
Headers:
  Authorization: Bearer {token}
  Toast-Restaurant-External-ID: {restaurantGuid}
Params:
  startDate: 2025-05-01T04:00:00.000-0000  (ISO-8601 UTC)
  endDate:   2025-05-02T04:00:00.000-0000
Fields: inDate, outDate, regularHours, overtimeHours, hourlyWage, employeeReference, jobReference
```

### Orders
```
GET https://ws-api.toasttab.com/orders/v2/orders
Headers:
  Authorization: Bearer {token}
  Toast-Restaurant-External-ID: {restaurantGuid}
Params:
  startDate / endDate (max 1-hour window per call — paginate through the day)
Fields: netAmount, totalAmount, payments, voids, checks
```

### Restaurant Info
```
GET https://ws-api.toasttab.com/restaurants/v1/restaurants/{guid}
Headers:
  Authorization: Bearer {token}
  Toast-Restaurant-External-ID: {guid}
Fields: general.name, location, schedules, timeZone
```

### All Partner Restaurants
```
GET https://ws-api.toasttab.com/partners/v1/restaurants
Headers:
  Authorization: Bearer {token}
Returns: all locations with GUIDs, names, mgmt group
```

---

## Scripts

### Python: Pull Labor for One Location + One Day
```python
import requests, json
from datetime import datetime, timedelta

CLIENT_ID = "NGCaheK337HbbBuOJ3DY92JorvDpgTn0"
CLIENT_SECRET = "KpFjzMDvVXpSwiFHZigYp1PAARK9x7kCsEZIjZXKZzePlVqBUnQvvSCdDphjemdT"
BASE = "https://ws-api.toasttab.com"

def get_token():
    r = requests.post(f"{BASE}/authentication/v1/authentication/login", json={
        "clientId": CLIENT_ID,
        "clientSecret": CLIENT_SECRET,
        "userAccessType": "TOAST_MACHINE_CLIENT"
    })
    return r.json()["token"]["accessToken"]

def get_labor(token, guid, business_date):
    # business_date: "2025-05-01"
    start = f"{business_date}T04:00:00.000-0000"
    next_day = (datetime.strptime(business_date, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
    end = f"{next_day}T04:00:00.000-0000"
    r = requests.get(f"{BASE}/labor/v1/timeEntries",
        headers={"Authorization": f"Bearer {token}", "Toast-Restaurant-External-ID": guid},
        params={"startDate": start, "endDate": end}
    )
    entries = r.json()
    total_hours = sum(e.get("regularHours", 0) + e.get("overtimeHours", 0) for e in entries)
    total_cost = sum((e.get("regularHours", 0) + e.get("overtimeHours", 0)) * e.get("hourlyWage", 0) for e in entries)
    return {"entries": len(entries), "total_hours": round(total_hours, 2), "total_cost": round(total_cost, 2)}
```

### Python: Pull Net Sales using ordersBulk (Paginated)
```python
def get_net_sales(token, guid, business_date):
    """
    business_date: "2026-04-02" → converts to "20260402" for businessDate param
    Paginates ordersBulk 100 orders/page using Link header rel="next"
    Uses check.totalAmount (includes tax); skips voided orders
    """
    biz_date_str = business_date.replace("-", "")  # YYYYMMDD
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
```

---

## Notes
- Token expires every 24h — always re-auth at script start
- Orders API: max 1-hour window per request; loop through the day in 1h chunks
- Business day: 4:00 AM → 4:00 AM next day (closeoutHour = 4, America/New_York)
- All times must be UTC in ISO-8601 format: `yyyy-MM-dd'T'HH:mm:ss.SSSZ`
- Labor entries include: regularHours, overtimeHours, hourlyWage → multiply for labor cost
- Last verified working: 2025-05-01

---

## Reconnect Checklist
1. Run auth POST → get new accessToken
2. Verify locations still present: GET /partners/v1/restaurants
3. Test labor pull on Midtown for yesterday
4. ✅ You're live
