#!/usr/bin/env python3
"""
Weekly Review Report Generator
Runs every Monday — generates Wk N review PDF and emails to majo@rrealtacos.com
Source: Marqii API (Google + Yelp only, no Uber)
"""
import json, os, subprocess, sys
from datetime import datetime, timedelta
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')

# ── CONFIG ──
EMAIL_TO = "majo@rrealtacos.com"
EMAIL_ACCOUNT = "lolasuperbot@gmail.com"
REPORTS_DIR = "/Users/mariajoseduffy/.openclaw/workspace/dashboard/reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

FOOD_KW = ['food','taco','meat','cold','hot','order','missing','wrong','taste','quality','portion','dish','meal','item','drink','bar','cook','raw','fresh','stale','kitchen','quesadilla','burrito','salsa','ingredient','microwav','temp','flavor','shorted','menu']
SVC_KW  = ['service','staff','server','host','manager','rude','ignore','wait','slow','attitude','unfriendly','unprofessional','seated','greeting','bartender','cashier','help','attention','table','parking','charge','bill','charged','error','experience','dirty','filthy','training']

def classify(text):
    t = (text or '').lower()
    f = any(k in t for k in FOOD_KW)
    s = any(k in t for k in SVC_KW)
    if f and s: return 'both'
    if f: return 'food'
    if s: return 'service'
    return 'other' if t else 'no_text'

def get_week_range():
    """Last Mon–Sun relative to today"""
    today = datetime.now()
    last_mon = today - timedelta(days=today.weekday() + 7)
    last_sun = last_mon + timedelta(days=6)
    return last_mon.strftime('%Y-%m-%d'), last_sun.strftime('%Y-%m-%d'), last_mon, last_sun

def get_iso_week(date):
    return date.isocalendar()[1]

def pull_reviews(token, start, end):
    import urllib.request
    headers = {'Authorization': f'Bearer {token}', 'User-Agent': 'Mozilla/5.0', 'Origin': 'https://app.marqii.com'}
    all_reviews = []
    page = 1
    while True:
        url = f'https://app.marqii.com/api/v1/reviews?startDate={start}&endDate={end}&per_page=100&page={page}'
        req = urllib.request.Request(url, headers=headers)
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read())
        batch = data.get('reviews', [])
        if not batch: break
        all_reviews.extend(batch)
        if len(batch) < 100: break
        page += 1
    return all_reviews

def normalize_loc(title):
    loc = title.replace('Rreal Tacos - ','').replace('Rreal Tacos ','').strip()
    if 'Beltline' in loc or 'BeltLine' in loc: return 'Ponce/Beltline'
    return loc

def build_html(wk_num, start_date, end_date, loc_data, sales_data):
    label = f"{datetime.strptime(start_date,'%Y-%m-%d').strftime('%b %-d')}–{datetime.strptime(end_date,'%Y-%m-%d').strftime('%b %-d, %Y')}"
    
    # Compute per100k
    results = {}
    for loc, revs in loc_data.items():
        sales = sales_data.get(loc, 0)
        per100k = round(len(revs) / sales * 100000, 2) if sales > 0 else 0
        food_cnt = sum(1 for r in revs if r['cat'] in ['food','both'])
        svc_cnt  = sum(1 for r in revs if r['cat'] in ['service','both'])
        unanswered = sum(1 for r in revs if not r['replied'])
        results[loc] = {'reviews': len(revs), 'per100k': per100k, 'food': food_cnt,
                        'svc': svc_cnt, 'unanswered': unanswered, 'revs': revs, 'sales': sales}
    
    ranked = sorted([(l,d) for l,d in results.items() if d['reviews']>0], key=lambda x: -x[1]['per100k'])
    zeros = [l for l,d in results.items() if d['reviews']==0]
    all_locs = list(results.keys())
    
    total_reviews = sum(d['reviews'] for d in results.values())
    total_food = sum(d['food'] for d in results.values())
    total_svc  = sum(d['svc']  for d in results.values())
    total_unans = sum(d['unanswered'] for d in results.values())
    
    def rev_rows(revs, cat_filter=None):
        rows = []
        for r in revs:
            if cat_filter and r['cat'] not in cat_filter: continue
            icon = '❌' if not r['replied'] else '✅'
            rows.append(f'<li><i>"{r["text"][:200]}{"..." if len(r["text"])>200 else ""}"</i> — <b>{r["reviewer"]}</b> ({r["provider"]}, {r["date"]}) {icon}</li>' if r['text'] else f'<li>[Rating only] — {r["reviewer"]} {icon}</li>')
        return '\n'.join(rows) if rows else '<li>—</li>'
    
    # Build top 3 sections
    impact_sections = ''
    rank_labels = ['#1 HIGHEST IMPACT 🚨','#2 MID-HIGH IMPACT ⚠️','#3 MID-HIGH IMPACT ⚠️']
    for i, (loc, d) in enumerate(ranked[:3]):
        label_str = rank_labels[i] if i < 3 else f'#{i+1}'
        food_rows = rev_rows(d['revs'], ['food','both'])
        svc_rows  = rev_rows(d['revs'], ['service','both'])
        no_txt = [r for r in d['revs'] if r['cat']=='no_text']
        no_txt_str = ' | '.join(f"{r['reviewer']} {'❌' if not r['replied'] else '✅'}" for r in no_txt)
        
        impact_sections += f'''
<div style="margin-bottom:20px;">
<p style="font-size:12pt;font-weight:bold;margin:18px 0 4px;">{i+1}. &nbsp;{loc} — {label_str} &nbsp;( {d["reviews"]} review{"s" if d["reviews"]!=1 else ""} ) &nbsp; Food: {d["food"]} &nbsp;|&nbsp; Service: {d["svc"]} &nbsp;|&nbsp; ❌ Unanswered: {d["unanswered"]}</p>
<p style="font-weight:bold;text-decoration:underline;">{"#1 Highest" if i==0 else "#2 Second highest" if i==1 else "#3 Third highest"} impact ({d["per100k"]:.2f} reviews per $100K) &nbsp; Net Sales: ${d["sales"]:,.0f}</p>
<p style="margin-top:8px;"><b>Food →</b></p><ul style="margin:2px 0 8px 20px;">{food_rows}</ul>
<p><b>Service →</b></p><ul style="margin:2px 0 8px 20px;">{svc_rows}</ul>
{"<p><b>No text (rating only) →</b> "+no_txt_str+"</p>" if no_txt_str else ""}
</div>'''
    
    # Other locations
    other_sections = ''
    for loc, d in ranked[3:]:
        food_rows = rev_rows(d['revs'], ['food','both'])
        svc_rows  = rev_rows(d['revs'], ['service','both'])
        other_sections += f'''
<p style="font-weight:bold;margin:14px 0 3px;">{loc} &nbsp;( {d["reviews"]} review{"s" if d["reviews"]!=1 else ""} ) — {d["per100k"]:.2f}/100K</p>
<ul style="margin:2px 0 6px 20px;">
{"<li><b>Food →</b></li>" + food_rows if d["food"]>0 else ""}
{"<li><b>Service →</b></li>" + svc_rows if d["svc"]>0 else ""}
</ul>'''
    
    # Food vs Service table rows
    table_rows = ''
    for loc, d in results.items():
        food_snippets = ' | '.join(f"{r['reviewer']}: {r['text'][:60]}..." if r['text'] else r['reviewer'] for r in d['revs'] if r['cat'] in ['food','both'])
        svc_snippets  = ' | '.join(f"{r['reviewer']}: {r['text'][:60]}..." if r['text'] else r['reviewer'] for r in d['revs'] if r['cat'] in ['service','both'])
        if d['reviews'] == 0:
            table_rows += f'<tr><td>{loc}</td><td style="color:#38761d;">0 — ✅ Clean</td><td style="color:#38761d;"></td><td style="color:#38761d;">0 — ✅ Clean</td><td style="color:#38761d;"></td></tr>'
        else:
            fc = 'color:#cc0000;font-weight:bold;' if d['food']>0 else 'color:#38761d;'
            sc = 'color:#cc0000;font-weight:bold;' if d['svc']>0 else 'color:#38761d;'
            table_rows += f'<tr><td><b>{loc}</b></td><td style="{fc}">{d["food"]}</td><td style="font-size:9.5pt;">{food_snippets or "—"}</td><td style="{sc}">{d["svc"]}</td><td style="font-size:9.5pt;">{svc_snippets or "—"}</td></tr>'
    
    # Main data table rows
    data_rows = ''
    for loc in ['Midtown','West Midtown','Chamblee','Sandy Springs','Cumming','Sugar Hill','Buckhead','Decatur','Lawrenceville','Ponce/Beltline','Duluth','Woodstock','Zocalo','Eclipse']:
        d = results.get(loc)
        if not d:
            data_rows += f'<tr><td>{loc}</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>'
            continue
        sales_fmt = f'${d["sales"]:,.0f}' if d['sales'] else '—'
        rev_color = 'color:#cc0000;font-weight:bold;' if d['reviews']>=3 else ('color:#b45309;' if d['reviews']>0 else 'color:#38761d;font-weight:bold;')
        data_rows += f'<tr><td>{loc}</td><td>{sales_fmt}</td><td style="{rev_color}">{d["reviews"]}</td><td style="{rev_color}">{d["per100k"]:.2f}</td><td>{"❌ "+str(d["unanswered"]) if d["unanswered"] else "✅"}</td></tr>'
    
    clean_str = ' &nbsp;|&nbsp; '.join(f'<b>{l}</b>' for l in zeros[:5]) if zeros else '—'
    
    return f'''<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
body{{font-family:Arial,sans-serif;font-size:11pt;color:#000;background:#fff;margin:0;padding:52px 72px;line-height:1.6;}}
h1{{font-size:14pt;font-weight:bold;margin:0 0 2px;}}
h2{{font-size:12pt;font-weight:bold;margin:22px 0 4px;}}
p{{margin:4px 0;}}
ul{{margin:2px 0 8px 20px;}}
table{{width:100%;border-collapse:collapse;margin:10px 0;font-size:10.5pt;}}
table th{{background:#cfe2f3;font-weight:bold;padding:6px 10px;border:1px solid #aaa;text-align:left;}}
table td{{padding:6px 10px;border:1px solid #ccc;}}
.wk-hdr td{{background:#fff2cc;font-weight:bold;}}
.grand td{{background:#d9ead3;font-weight:bold;}}
.food-h{{background:#fce5cd;}}.svc-h{{background:#ead1dc;}}
.page-break{{page-break-before:always;}}
.footer{{margin-top:40px;font-size:9pt;color:#666;border-top:1px solid #ccc;padding-top:6px;}}
</style></head><body>

<h1>WEEK {wk_num} — {label} &nbsp; Highest Impact Locations – Review Breakdown</h1>
<p style="font-size:10pt;color:#555;margin-bottom:20px;">Source: Marqii (Google + Yelp only · Uber excluded) · Net Sales: WoW PnL · Lola 🌺</p>

{impact_sections}

{"<h2>Other Impacted Locations</h2>" + other_sections if other_sections else ""}

<h2>WOW — BIGGEST IMPROVEMENTS vs Prior Week</h2>
<p>{"<b>Clean Sheet →</b> " + clean_str if zeros else "No clean sheets this week."}</p>
{"<p>Biggest declines: " + " &nbsp;|&nbsp; ".join(f"<b>{l}</b> ({d['per100k']:.2f}/100K)" for l,d in ranked[:3]) + "</p>" if ranked else ""}

<div class="page-break"></div>
<h1>FOOD vs SERVICE BREAKDOWN — Week {wk_num}</h1>
<table>
<thead><tr><th>Location</th><th class="food-h">🍽️ Food Reviews</th><th class="food-h">Food — What they said</th><th class="svc-h">🙍 Service Reviews</th><th class="svc-h">Service — What they said</th></tr></thead>
<tbody>{table_rows}
<tr class="grand"><td>NETWORK TOTAL</td><td class="food-h">{total_food} food</td><td class="food-h"></td><td class="svc-h">{total_svc} service</td><td class="svc-h">{total_unans} unanswered ❌</td></tr>
</tbody></table>

<div class="page-break"></div>
<h1>FULL DATA TABLE — Week {wk_num}</h1>
<table>
<thead><tr><th>Location</th><th>Net Sales</th><th>Bad Reviews</th><th>Per $100K</th><th>Unanswered</th></tr></thead>
<tbody>
<tr class="wk-hdr"><td colspan="5">Week {wk_num} — {label}</td></tr>
{data_rows}
<tr class="grand"><td>GRAND TOTAL</td><td>${sum(d["sales"] for d in results.values() if d["sales"]):,.0f}</td><td style="color:#cc0000;font-weight:bold;">{total_reviews}</td><td>{total_reviews/max(sum(d["sales"] for d in results.values() if d["sales"]),1)*100000:.2f}</td><td>{'❌ '+str(total_unans) if total_unans else '✅ All responded'}</td></tr>
</tbody></table>

<div class="footer">Rreal Tacos · Week {wk_num} Review Report · {label} · Google + Yelp only (Uber excluded) · Source: Marqii API · Generated by Lola 🌺</div>
</body></html>'''

def main():
    from pycognito import Cognito
    
    # Auth
    u = Cognito('us-east-1_RvmkA3ZEL', '4af42doicu3r2g2ld0su841m2l', username='majo@rrealtacos.com')
    u.authenticate(password='17deabriL!')
    token = u.access_token
    
    # Week range
    start, end, start_dt, end_dt = get_week_range()
    wk_num = get_iso_week(start_dt)
    label = f"{start_dt.strftime('%b %-d')}–{end_dt.strftime('%b %-d, %Y')}"
    
    print(f"Generating Wk{wk_num} report ({start} to {end})...")
    
    # Pull reviews
    all_reviews = pull_reviews(token, start, end)
    bad_gy = [r for r in all_reviews
              if r.get('provider','').lower() in ['google','yelp']
              and r.get('ratings') and r['ratings'][0]['value'] in [1,2]]
    
    print(f"Found {len(bad_gy)} Google+Yelp bad reviews")
    
    # Organize by location
    loc_data = defaultdict(list)
    for r in bad_gy:
        loc = normalize_loc(r['store']['title'])
        text = (r.get('ratings') or [{}])[0].get('comment','') or ''
        loc_data[loc].append({
            'rating': r['ratings'][0]['value'],
            'text': text,
            'reviewer': r.get('reviewerName','Anonymous'),
            'date': r.get('submittedAt','')[:10],
            'provider': r.get('provider',''),
            'replied': len(r.get('replies',[])) > 0,
            'cat': classify(text)
        })
    
    # Pull sales from WoW sheet
    result = subprocess.run(
        ['gog','sheets','get','1NxSjFe_CZqETjaOGKEe1oOOY6qVW-6jfmf8og5_2yw4',
         '2026 - Weekly Review!A1:Z30','--account','lolasuperbot@gmail.com','--json'],
        capture_output=True, text=True)
    sales_data = {}
    try:
        d = json.loads(result.stdout)
        for row in d.get('values',[])[2:]:
            if len(row) > 3 and row[2].strip() and '$' in str(row[3]):
                loc_name = row[2].strip()
                sales_str = str(row[3]).replace('$','').replace(',','').replace(' ','')
                try:
                    sales_data[loc_name] = float(sales_str)
                except: pass
    except: pass
    
    print(f"Sales loaded for {len(sales_data)} locations")
    
    # Ensure all expected locations exist in results
    all_locs = ['Midtown','West Midtown','Chamblee','Sandy Springs','Cumming','Sugar Hill',
                'Buckhead','Decatur','Lawrenceville','Ponce/Beltline','Duluth','Woodstock','Zocalo']
    for l in all_locs:
        if l not in loc_data:
            loc_data[l] = []
    
    # Build HTML & PDF
    html = build_html(wk_num, start, end, dict(loc_data), sales_data)
    html_path = f'/tmp/Wk{wk_num:02d}_report.html'
    pdf_path = f'{REPORTS_DIR}/Wk{wk_num:02d}_Review_Report_{start}_to_{end}.pdf'
    
    with open(html_path, 'w') as f:
        f.write(html)
    
    subprocess.run([
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '--headless=new','--disable-gpu','--no-margins','--print-to-pdf-no-header',
        f'--print-to-pdf={pdf_path}', f'file://{html_path}'
    ], capture_output=True)
    
    if not os.path.exists(pdf_path):
        print("PDF generation failed")
        sys.exit(1)
    
    size_kb = os.path.getsize(pdf_path) // 1024
    print(f"PDF created: {pdf_path} ({size_kb}KB)")
    
    # Send email
    subject = f"📊 Rreal Tacos — Week {wk_num} Review Report ({label})"
    body = f"<p>Hola Maria Jose,</p><p>Aquí está el reporte de reviews de la <b>Semana {wk_num} ({label})</b>.</p><p>— Lola 🌺</p>"
    
    result = subprocess.run([
        'gog','gmail','send',
        '--to', EMAIL_TO,
        '--subject', subject,
        '--body-html', body,
        '--attach', pdf_path,
        '--account', EMAIL_ACCOUNT
    ], capture_output=True, text=True)
    
    if 'message_id' in result.stdout:
        print(f"Email sent to {EMAIL_TO} ✅")
    else:
        print(f"Email error: {result.stderr}")
    
    print(f"Done — Wk{wk_num} report complete.")

if __name__ == '__main__':
    main()
