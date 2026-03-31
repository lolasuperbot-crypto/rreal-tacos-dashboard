#!/bin/bash
# Auto-sync WhatsApp Rreal Tacos chats to local database every 2 hours
python3 << 'PYEOF'
import sqlite3, datetime, json, os

db = "/Users/mariajoseduffy/Library/Group Containers/group.net.whatsapp.WhatsApp.shared/ChatStorage.sqlite"
out_dir = os.path.expanduser("~/Documents/RrealPlatform/database/wa_chats")
os.makedirs(out_dir, exist_ok=True)

conn = sqlite3.connect(db)
c = conn.cursor()

apple_epoch = datetime.datetime(2001, 1, 1)
now = datetime.datetime.now()
two_days_ago = now - datetime.timedelta(days=2)
ts = (two_days_ago - apple_epoch).total_seconds()

# All Rreal Tacos groups
groups = {
    "120363041991867443@g.us": "BAR MANAGERS",
    "120363420395499886@g.us": "Beltline",
    "120363213772715840@g.us": "Buckhead",
    "120363421468366321@g.us": "Beltline Mantenimiento",
    "120363109966494820@g.us": "Chamblee",
    "120363142533646210@g.us": "Cumming",
    "120363169605829674@g.us": "Chamblee Mantenimiento",
    "120363167907456664@g.us": "Cumming Mantenimiento",
    "120363370616397256@g.us": "Decatur",
    "120363422258091055@g.us": "Duluth",
    "120363382181336582@g.us": "Decatur Mantenimiento",
    "120363422153535080@g.us": "Duluth Mantenimiento",
    "120363419694077361@g.us": "Eclipse Beltline",
    "120363404511106505@g.us": "Eclipse Mantenimiento",
    "120363143888576785@g.us": "FOH MANAGERS",
    "120363162423014701@g.us": "KITCHEN MANAGERS",
    "120363422334030680@g.us": "Kitchen Buckhead",
    "120363419811365281@g.us": "Lawrenceville",
    "120363124977412550@g.us": "Midtown",
    "120363169022832256@g.us": "Midtown Mantenimiento",
    "120363425417475223@g.us": "Woodstock",
    "120363143033503226@g.us": "RREAL TACOS General 1",
    "120363159747968882@g.us": "RREAL TACOS General 2",
    "120363175550038991@g.us": "Real Tacos GMs",
    "120363248307508444@g.us": "Rreal Maintenance Office",
    "120363125715471305@g.us": "Sandy Springs",
    "120363183289196667@g.us": "Sugar Hill",
    "120363169215760491@g.us": "Sandy Mantenimiento",
    "120363126047168673@g.us": "West Midtown",
    "120363168280004290@g.us": "West Mantenimiento",
}

all_data = {}
for jid, name in groups.items():
    c.execute("""
        SELECT ZTEXT, ZFROMJID, ZMESSAGEDATE 
        FROM ZWAMESSAGE 
        WHERE ZCHATSESSION IN (SELECT Z_PK FROM ZWACHATSESSION WHERE ZCONTACTJID=?)
        AND ZMESSAGEDATE > ? AND ZTEXT IS NOT NULL
        ORDER BY ZMESSAGEDATE DESC
        LIMIT 100
    """, (jid, ts))
    msgs = c.fetchall()
    if msgs:
        all_data[name] = [
            {
                "time": (apple_epoch + datetime.timedelta(seconds=m[2])).strftime('%Y-%m-%d %H:%M'),
                "sender": m[1].split('@')[0] if m[1] else "me",
                "text": m[0]
            }
            for m in msgs
        ]

conn.close()

# Save to JSON
date_str = now.strftime('%Y-%m-%d')
out_file = f"{out_dir}/wa_snapshot_{now.strftime('%Y%m%d_%H%M')}.json"
with open(out_file, 'w') as f:
    json.dump({"synced_at": now.isoformat(), "groups": all_data}, f, indent=2, ensure_ascii=False)

# Also save latest snapshot (always up to date)
latest_file = f"{out_dir}/latest.json"
with open(latest_file, 'w') as f:
    json.dump({"synced_at": now.isoformat(), "groups": all_data}, f, indent=2, ensure_ascii=False)

total = sum(len(v) for v in all_data.values())
print(f"✅ Synced {total} messages from {len(all_data)} active groups at {now.strftime('%H:%M')}")
PYEOF
