# EOD Reports Data

JSON files named `YYYY-MM-DD.json` are stored here automatically every night at ~2am ET.

## Format

```json
{
  "date": "2026-04-09",
  "generated_at": "2026-04-10T10:00:00Z",
  "locations": {
    "Midtown": {
      "location": "Midtown",
      "date": "2026-04-09",
      "closing_time": "10:45 PM",
      "status": "ON TIME",
      "manager_on_duty": "Jorge",
      "sales_summary": "$4,320 net sales · 142 covers",
      "staff_issues": "None",
      "customer_complaints": "1 complaint - wait time",
      "maintenance_needs": null,
      "critical_incidents": null,
      "notes": "Smooth night overall.",
      "is_critical": false,
      "has_maintenance": false,
      "submitted_at": "2026-04-09T22:45:00"
    }
  }
}
```

## Status Values
- `ON TIME` — EOD submitted before 11pm
- `LATE` — EOD submitted after 11pm
- `MISSING` — No EOD received by 2:00 AM ET
- `CRITICAL` — Contains critical incident keywords

## Critical Keywords (auto-flagged)
health department, injury, fight, theft, police, fire, flood, broken, emergency, ambulance, raw, contamination, poisoning

## Maintenance Keywords (auto-flagged)
broken, not working, repair, fix, leak, AC, heat, freezer, cooler, oven, fryer, plumbing, electrical, pest, roach, mouse
