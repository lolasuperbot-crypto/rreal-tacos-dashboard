# Dashboard Data Rules — Rreal Tacos

## Data Sources (ONLY these — no estimates or fabrications)

| Source | Fields | Cadence |
|--------|--------|---------|
| Toast POS | toast_sales, check_count, avg_check | Weekly |
| Labor Sheets (Google Sheets) | total_hours, hourly_pay, tips, salary_cost, total_labor | Weekly (Wk 12 most recent complete) |
| WOW Sheets | wow_sales | Weekly (may be incomplete) |
| Health Audit (Savor) | health_score (0-100) | Monthly (not all locations every month) |
| FoodSync | foodsync_score, submission_date | Multiple per location/month |
| Secret Shopper (A Closer Look LLC) | ss_score, manager_score | Monthly (not all locations visited) |
| Marqii (Reviews) | bad review count by location, food complaints, service complaints | Weekly (may have gaps) |
| Sunday App | weekly ratings (overall, service, food, value, atmosphere) | Weekly (may have gaps) |

## Rules

1. **Missing data → display `—`**. Never `0`, `N/A`, or a fabricated estimate.
2. **Labor %** = total_labor / toast_sales × 100. Only when BOTH exist for the same week. Otherwise `—`.
3. **Color coding** only when real data exists:
   - 🟢 Green: at/above target
   - 🟡 Amber: within 10% below target
   - 🔴 Red: more than 10% below target
   - No color on `—` values
4. **Alerts must cite source** explicitly: e.g., "Source: Secret Shopper, March 2026". No alert without a real data point.
5. **Lola's insights**:
   - "The data shows..." → observation from real data
   - "Consider..." → recommendation/suggestion
6. **No stale data as current**. No health score this month = show `—`, not last month's score.

## Applied as of: 2026-03-31
