"""
generate_review_pdf.py
Rreal Hospitality LLC — Weekly Review PDF Generator
Called by generate-review-report.js
Pulls live data from Weekly Resto Reviews sheet and builds 5-page professional PDF.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
    TableStyle, HRFlowable, KeepTogether, PageBreak)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import urllib.request, csv, io, os, sys
from datetime import datetime, timezone, timedelta

# ── CONFIG ──────────────────────────────────────────────────────────────
SHEET_URL = "https://docs.google.com/spreadsheets/d/1kAIFHy7xQggErdAf3Wd70PTRrahgC-gHtW6kWi9ZC3w/gviz/tq?tqx=out:csv&sheet=weekly_KPI"
OUTPUT = os.path.join(os.path.dirname(__file__), "Wk14_Review_Report_Professional.pdf")

LOCS = ["Midtown","West Midtown","Chamblee","Sandy Springs","Cumming",
        "Sugar Hill","Buckhead","Decatur","Lawrenceville","Beltline","Duluth"]

# Marqii 1★/2★ + food/service split (updated weekly from Marqii pull)
STARS = {
    "Midtown":       {"s1":2,"s2":0,"food":0,"service":2},
    "West Midtown":  {"s1":0,"s2":1,"food":1,"service":0},
    "Chamblee":      {"s1":2,"s2":0,"food":1,"service":1},
    "Sandy Springs": {"s1":1,"s2":1,"food":0,"service":1},
    "Cumming":       {"s1":2,"s2":0,"food":2,"service":2},
    "Sugar Hill":    {"s1":0,"s2":1,"food":1,"service":0},
    "Buckhead":      {"s1":0,"s2":0,"food":0,"service":0},
    "Decatur":       {"s1":3,"s2":1,"food":2,"service":2},
    "Lawrenceville": {"s1":2,"s2":0,"food":0,"service":2},
    "Beltline":      {"s1":1,"s2":0,"food":0,"service":1},
    "Duluth":        {"s1":1,"s2":1,"food":1,"service":1},
}

THEMES = {
    "Midtown":       ["Pickup order ignored at bar (Google)", "Server didn't acknowledge table for 25 min"],
    "West Midtown":  ["Food quality declined vs prior year (Yelp)"],
    "Chamblee":      ["Smoky bar + rude ordering experience (Google)", "Cold food + wrong order (Google)"],
    "Sandy Springs": ["Margaritas removed from delivery w/o notice (Google)", "Slow takeout (Google)"],
    "Cumming":       ["🚨 RAW CHICKEN — 2 separate reviewers (Yelp + Google)", "Managers dismissed complaints — escalate NOW"],
    "Sugar Hill":    ["Food too greasy — repeated complaint (Google)"],
    "Buckhead":      [],
    "Decatur":       ["🚨 FOOD POISONING warning posted on Google", "Hair in burrito + wrong order (Google)", "Rude bartender + $20 parking (Google)"],
    "Lawrenceville": ["Server throwing food, rude to guests (Google)", "30+ min wait for tortillas (Google)"],
    "Beltline":      ["Server ignored table for 25 min (Google)"],
    "Duluth":        ["Rude host at door dismissive to family (Google)", "Cold food + overpriced drinks (Google)"],
}

ACTIONS = {
    "Cumming": ["🚨 URGENT: Investigate raw chicken — J.B. (Yelp Apr 3) + Jenny Young (Google Apr 4)",
                "Retrain kitchen on safe cooking temps immediately",
                "Management must publicly respond to both reviews today",
                "Conduct BOH temperature audit this week",
                "Review accountability protocol for guest food safety complaints"],
    "Decatur": ["Respond publicly to Cole Matheson (food poisoning) on Google",
                "Respond to Anquita Mitchell (hair in food) on Google",
                "Conduct kitchen hygiene audit — hair nets, food handling",
                "Follow up: customer contacted health dept — be proactive",
                "Coach bartender team on guest interaction"],
    "Sandy Springs": ["Reply to all 3 unreplied Google reviews this week",
                      "Communicate delivery menu changes proactively to customers",
                      "Coach team on takeout speed and guest communication"],
}

# ── DATA FETCH ──────────────────────────────────────────────────────────
def fetch_sheet():
    with urllib.request.urlopen(SHEET_URL, timeout=15) as r:
        data = r.read().decode("utf-8")
    if data.startswith("<!DOCTYPE"):
        raise RuntimeError("Sheet not publicly accessible")
    rows = list(csv.reader(io.StringIO(data)))
    wk14, wk13 = {}, {}
    for row in rows[1:15]:
        loc = row[0].strip()
        if loc in LOCS:
            wk14[loc] = {"reviews": _int(row[2]), "sales": _float(row[1])}
    for row in rows[16:30]:
        loc = row[0].strip()
        if loc in LOCS:
            wk13[loc] = {"reviews": _int(row[2]), "sales": _float(row[1])}
    return wk14, wk13

def _int(s):
    try: return int(s.strip())
    except: return 0

def _float(s):
    try: return float(s.strip().replace('$','').replace(',','').replace(' ',''))
    except: return 0.0

# ── COLORS ──────────────────────────────────────────────────────────────
navy      = colors.HexColor("#0d1630")
navy2     = colors.HexColor("#112057")
orange    = colors.HexColor("#f97316")
white     = colors.white
gray      = colors.HexColor("#94a3b8")
lgray     = colors.HexColor("#e2e8f0")
darkcard  = colors.HexColor("#1a2340")
darker    = colors.HexColor("#141b30")
red_c     = colors.HexColor("#ef4444")
amber_c   = colors.HexColor("#f59e0b")
green_c   = colors.HexColor("#4ade80")
red_bg    = colors.HexColor("#2d1010")
amber_bg  = colors.HexColor("#2d2010")
green_bg  = colors.HexColor("#0d2d1a")
mid_navy  = colors.HexColor("#2d3748")

def S(name, **kw):
    base = dict(fontName='Helvetica', fontSize=9, textColor=white, spaceAfter=2, leading=12)
    base.update(kw)
    return ParagraphStyle(name, **base)

lbl   = S('lbl', fontSize=7.5, fontName='Helvetica-Bold', textColor=gray, alignment=TA_CENTER)
bigN  = S('bn',  fontSize=30, fontName='Helvetica-Bold', textColor=white, alignment=TA_CENTER, spaceAfter=0)
orN   = S('on',  fontSize=30, fontName='Helvetica-Bold', textColor=orange, alignment=TA_CENTER, spaceAfter=0)
body  = S('body', textColor=lgray)
small = S('small', fontSize=7.5, textColor=gray)

def add_page_num(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(gray)
    canvas.drawRightString(8.0*inch, 0.35*inch, f"Page {canvas.getPageNumber()}")
    canvas.drawString(0.6*inch, 0.35*inch, "Rreal Hospitality LLC  ·  Confidential  ·  Generated by Lola AI 🌺")
    canvas.setStrokeColor(mid_navy)
    canvas.setLineWidth(0.5)
    canvas.line(0.6*inch, 0.48*inch, 8.0*inch, 0.48*inch)
    canvas.restoreState()

def sec_hdr(title, sub=""):
    t = Table([[
        Paragraph(title, S('sh', fontSize=13, fontName='Helvetica-Bold', textColor=white, spaceAfter=0)),
        Paragraph(sub, S('ss', fontSize=8.5, textColor=gray, alignment=TA_RIGHT, spaceAfter=0))
    ]], colWidths=[5*inch, 2.3*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), navy2),
        ('TOPPADDING', (0,0), (-1,-1), 10), ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12), ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEBELOW', (0,0), (-1,-1), 2.5, orange),
    ]))
    return t

def card_row(data, col_w, bg=darkcard, alt=darker):
    t = Table(data, colWidths=col_w)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 10), ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LINEAFTER', (0,0), (-2,-1), 0.5, mid_navy),
        ('BOX', (0,0), (-1,-1), 0.5, mid_navy),
    ]))
    return t

def build_pdf(wk14, wk13):
    total14 = sum(wk14[l]["reviews"] for l in LOCS)
    total13 = sum(wk13[l]["reviews"] for l in LOCS)
    total_s1 = sum(STARS[l]["s1"] for l in LOCS)
    total_s2 = sum(STARS[l]["s2"] for l in LOCS)
    total_food = sum(STARS[l]["food"] for l in LOCS)
    total_svc  = sum(STARS[l]["service"] for l in LOCS)
    total_sales = sum(wk14[l]["sales"] for l in LOCS)
    bad_rate = (total14 / (total_sales/100000)) if total_sales > 0 else 0
    wow = total14 - total13
    worst = max(LOCS, key=lambda l: wk14[l]["reviews"])
    best  = [l for l in LOCS if wk14[l]["reviews"] == 0]
    sorted_locs = sorted(LOCS, key=lambda l: -wk14[l]["reviews"])
    now = datetime.now(tz=timezone(timedelta(hours=-4))).strftime("%B %d, %Y %I:%M %p ET")

    doc = SimpleDocTemplate(OUTPUT, pagesize=letter,
        rightMargin=0.6*inch, leftMargin=0.6*inch,
        topMargin=0.6*inch, bottomMargin=0.65*inch)
    story = []

    # ── PAGE 1: COVER ──
    top = Table([
        [Paragraph("RREAL HOSPITALITY LLC", S('br', fontSize=11, fontName='Helvetica-Bold', textColor=orange, alignment=TA_CENTER, spaceAfter=0))],
        [Spacer(1,18)],
        [Paragraph("Weekly Review Report", S('ct', fontSize=26, fontName='Helvetica-Bold', textColor=white, alignment=TA_CENTER, spaceAfter=6, leading=32))],
        [Paragraph("1 & 2 Star Analysis", S('ct2', fontSize=18, fontName='Helvetica-Bold', textColor=orange, alignment=TA_CENTER, spaceAfter=6))],
        [Spacer(1,8)],
        [Paragraph("Week 14  ·  March 30 – April 5, 2026", S('cs', fontSize=13, fontName='Helvetica-Bold', textColor=orange, alignment=TA_CENTER, spaceAfter=4))],
        [Spacer(1,28)],
        [Paragraph("All 11 Active Locations  ·  Google + Yelp + Weekly Resto Reviews Sheet", S('cb', textColor=gray, alignment=TA_CENTER))],
        [Paragraph(f"Generated {now}  ·  Confidential", S('cg', fontSize=8.5, textColor=gray, alignment=TA_CENTER))],
        [Spacer(1,36)],
    ], colWidths=[7.3*inch])
    top.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), navy),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('BOX', (0,0), (-1,-1), 3, orange),
    ]))
    story.append(top)
    story.append(Spacer(1,18))

    wow_color = red_c if wow > 0 else (green_c if wow < 0 else gray)
    wow_str = f"↑ +{wow}" if wow > 0 else (f"↓ {wow}" if wow < 0 else "→ Same")
    cover_kpi = Table([
        [Paragraph(str(total14), orN), Paragraph(str(total13), S('p13', fontSize=30, fontName='Helvetica-Bold', textColor=lgray, alignment=TA_CENTER, spaceAfter=0)),
         Paragraph(wow_str, S('ww', fontSize=28, fontName='Helvetica-Bold', textColor=wow_color, alignment=TA_CENTER, spaceAfter=0)),
         Paragraph('\n'.join(best) if best else "—", S('bp', fontSize=14, fontName='Helvetica-Bold', textColor=green_c, alignment=TA_CENTER, spaceAfter=0))],
        [Paragraph("Total Bad Reviews\nWeek 14", lbl), Paragraph("Week 13\nPrior Week", lbl),
         Paragraph("Week over\nWeek", lbl), Paragraph("Zero Bad Reviews\nThis Week ✅", lbl)],
    ], colWidths=[1.82*inch]*4)
    cover_kpi.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), darkcard),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 12), ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LINEAFTER', (0,0), (2,1), 0.5, mid_navy),
        ('BOX', (0,0), (-1,-1), 1, mid_navy),
        ('LINEBELOW', (0,0), (-1,0), 2, orange),
    ]))
    story.append(cover_kpi)
    story.append(Spacer(1,18))

    alert = Table([[Paragraph("🚨  PRIORITY ALERT:  Cumming — 2 reviewers report RAW CHICKEN, managers dismissed complaints.  Decatur — food poisoning warning posted on Google + hair in food.  Both require IMMEDIATE management escalation.", S('al', fontSize=8.5, fontName='Helvetica-Bold', textColor=colors.HexColor("#fca5a5"), spaceAfter=0))]], colWidths=[7.3*inch])
    alert.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), red_bg),
        ('TOPPADDING', (0,0), (-1,-1), 10), ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('LINEBEFORE', (0,0), (0,-1), 4, red_c),
        ('LINEBELOW', (0,0), (-1,-1), 1, red_c),
    ]))
    story.append(alert)
    story.append(PageBreak())

    # ── PAGE 2: EXECUTIVE SUMMARY ──
    story.append(sec_hdr("EXECUTIVE SUMMARY", "Week 14 · Mar 30 – Apr 5, 2026"))
    story.append(Spacer(1,10))
    kpi = Table([
        [Paragraph(str(total_s1), orN), Paragraph(str(total_s2), S('s2', fontSize=30, fontName='Helvetica-Bold', textColor=amber_c, alignment=TA_CENTER, spaceAfter=0)),
         Paragraph(str(total14), bigN), Paragraph(f"{bad_rate:.2f}", S('br2', fontSize=30, fontName='Helvetica-Bold', textColor=red_c, alignment=TA_CENTER, spaceAfter=0))],
        [Paragraph("1 Star Reviews", lbl), Paragraph("2 Star Reviews", lbl), Paragraph("Total Bad Reviews", lbl), Paragraph("Per $100K Sales", lbl)],
    ], colWidths=[1.82*inch]*4)
    kpi.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), darkcard),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 12), ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LINEAFTER', (0,0), (2,1), 0.5, mid_navy),
        ('BOX', (0,0), (-1,-1), 0.5, mid_navy),
    ]))
    story.append(kpi)
    story.append(Spacer(1,10))

    row2 = Table([[
        Table([
            [Paragraph("WEEK OVER WEEK", S('wl', fontSize=8, fontName='Helvetica-Bold', textColor=gray, spaceAfter=0))],
            [Paragraph(f"{'↑ +' if wow>0 else '↓ '}{wow} vs Wk13", S('wn', fontSize=20, fontName='Helvetica-Bold', textColor=wow_color, spaceAfter=0))],
            [Paragraph(f"Wk13: {total13} bad reviews  →  Wk14: {total14}", small)],
        ], colWidths=[3.5*inch]),
        Table([
            [Paragraph("FOOD vs SERVICE SPLIT", S('fl', fontSize=8, fontName='Helvetica-Bold', textColor=gray, spaceAfter=0))],
            [Paragraph(f"🍽️ Food Complaints: {total_food}  ({round(total_food/max(total14,1)*100)}%)", body)],
            [Paragraph(f"🙍 Service Complaints: {total_svc}  ({round(total_svc/max(total14,1)*100)}%)", body)],
        ], colWidths=[3.6*inch]),
    ]], colWidths=[3.6*inch, 3.7*inch])
    row2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), darker),
        ('TOPPADDING', (0,0), (-1,-1), 10), ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('LINEAFTER', (0,0), (0,-1), 0.5, mid_navy),
        ('BOX', (0,0), (-1,-1), 0.5, mid_navy),
    ]))
    story.append(row2)
    story.append(Spacer(1,10))

    perf = Table([
        [Paragraph("🔴  WATCH LOCATIONS (most bad reviews)", S('wr', fontSize=9, fontName='Helvetica-Bold', textColor=red_c, spaceAfter=0)),
         Paragraph("🟢  BEST PERFORMERS", S('gr', fontSize=9, fontName='Helvetica-Bold', textColor=green_c, spaceAfter=0))],
        [Paragraph("\n".join([f"• {l} — {wk14[l]['reviews']} bad reviews" for l in sorted_locs[:4]]), body),
         Paragraph("\n".join([f"• {l} — 0 bad reviews ✅" for l in best]) if best else Paragraph("All locations had at least 1", body), body)],
    ], colWidths=[3.6*inch, 3.7*inch])
    perf.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), red_bg), ('BACKGROUND', (1,0), (1,0), green_bg),
        ('BACKGROUND', (0,1), (0,1), darker), ('BACKGROUND', (1,1), (1,1), darker),
        ('TOPPADDING', (0,0), (-1,-1), 8), ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 0.5, mid_navy),
        ('LINEAFTER', (0,0), (0,-1), 0.5, mid_navy),
    ]))
    story.append(perf)
    story.append(PageBreak())

    # ── PAGE 3: LOCATION TABLE ──
    story.append(sec_hdr("FOOD & SERVICE BREAKDOWN BY LOCATION", "Week 14 vs Week 13"))
    story.append(Spacer(1,8))

    rows_t = [["Location","1★","2★","Total","Food","Svc","Food%","Svc%","Wk13","vs Wk13"]]
    for loc in LOCS:
        d, s = wk14[loc], STARS[loc]
        d13 = wk13.get(loc,{}).get("reviews",0)
        diff = d["reviews"] - d13
        ds = f"↑+{diff}" if diff>0 else (f"↓{diff}" if diff<0 else "→0")
        fp = f"{round(s['food']/max(d['reviews'],1)*100)}%" if d['reviews']>0 else "—"
        sp = f"{round(s['service']/max(d['reviews'],1)*100)}%" if d['reviews']>0 else "—"
        rows_t.append([loc,str(s["s1"]),str(s["s2"]),str(d["reviews"]),str(s["food"]),str(s["service"]),fp,sp,str(d13),ds])
    d_tot = total14-total13
    rows_t.append(["TOTAL",str(total_s1),str(total_s2),str(total14),str(total_food),str(total_svc),f"{round(total_food/max(total14,1)*100)}%",f"{round(total_svc/max(total14,1)*100)}%",str(total13),f"↑+{d_tot}" if d_tot>0 else f"↓{d_tot}"])

    cw = [1.35*inch,.38*inch,.38*inch,.48*inch,.5*inch,.5*inch,.48*inch,.48*inch,.45*inch,.65*inch]
    mt = Table(rows_t, colWidths=cw)
    mts = TableStyle([
        ('BACKGROUND',(0,0),(-1,0),navy2),('TEXTCOLOR',(0,0),(-1,0),white),
        ('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTSIZE',(0,0),(-1,-1),8.5),
        ('FONTNAME',(0,1),(-1,-1),'Helvetica'),('TEXTCOLOR',(0,1),(-1,-2),lgray),
        ('ALIGN',(1,0),(-1,-1),'CENTER'),('ALIGN',(0,0),(0,-1),'LEFT'),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
        ('LEFTPADDING',(0,1),(0,-1),8),
        ('ROWBACKGROUNDS',(0,1),(-1,-2),[darkcard,darker]),
        ('BOX',(0,0),(-1,-1),0.5,mid_navy),
        ('LINEBELOW',(0,0),(-1,0),1.5,orange),
        ('LINEAFTER',(0,0),(-2,-1),0.3,mid_navy),
        ('BACKGROUND',(0,-1),(-1,-1),navy2),
        ('FONTNAME',(0,-1),(-1,-1),'Helvetica-Bold'),('TEXTCOLOR',(0,-1),(-1,-1),white),
        ('LINEABOVE',(0,-1),(-1,-1),1,orange),
    ])
    for i,loc in enumerate(LOCS):
        rev = wk14[loc]["reviews"]
        ri = i+1
        bg = green_bg if rev==0 else (amber_bg if rev<=2 else red_bg)
        tc = green_c  if rev==0 else (amber_c  if rev<=2 else red_c)
        mts.add('BACKGROUND',(0,ri),(-1,ri),bg)
        mts.add('TEXTCOLOR',(3,ri),(3,ri),tc)
        if rev>=3: mts.add('FONTNAME',(3,ri),(3,ri),'Helvetica-Bold')
        diff_v = wk14[loc]["reviews"] - wk13.get(loc,{}).get("reviews",0)
        mts.add('TEXTCOLOR',(9,ri),(9,ri), red_c if diff_v>0 else (green_c if diff_v<0 else gray))
    mt.setStyle(mts)
    story.append(mt)
    story.append(Spacer(1,8))
    legend = Table([[
        Paragraph("🟢 0 bad reviews",S('lg',fontSize=8,textColor=green_c,spaceAfter=0)),
        Paragraph("🟡 1–2 bad reviews",S('la',fontSize=8,textColor=amber_c,spaceAfter=0)),
        Paragraph("🔴 3+ bad reviews — Immediate attention required",S('lr',fontSize=8,textColor=red_c,spaceAfter=0)),
    ]], colWidths=[1.8*inch,2.0*inch,3.5*inch])
    legend.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1),darker),
        ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
        ('LEFTPADDING',(0,0),(-1,-1),10),('BOX',(0,0),(-1,-1),0.5,mid_navy),
    ]))
    story.append(legend)
    story.append(PageBreak())

    # ── PAGE 4: LOCATION CARDS ──
    story.append(sec_hdr("LOCATION DETAIL CARDS","Week 14 · Individual Analysis"))
    story.append(Spacer(1,8))
    for i in range(0,len(LOCS),2):
        pair = LOCS[i:i+2]
        cols = []
        for loc in pair:
            d,s = wk14[loc],STARS[loc]
            d13v = wk13.get(loc,{}).get("reviews",0)
            diff = d["reviews"]-d13v
            rev = d["reviews"]
            badge = "✅ CLEAN" if rev==0 else ("⚠️ WATCH" if rev<=2 else "🔴 CRITICAL")
            bc = green_c if rev==0 else (amber_c if rev<=2 else red_c)
            bbg = green_bg if rev==0 else (amber_bg if rev<=2 else red_bg)
            trend = f"↑ +{diff} vs Wk13" if diff>0 else (f"↓ Improved {diff} vs Wk13" if diff<0 else "→ Same as Wk13")
            tc = red_c if diff>0 else (green_c if diff<0 else gray)
            content = [
                [Paragraph(loc,S('ln',fontSize=11,fontName='Helvetica-Bold',textColor=white,spaceAfter=0)),
                 Paragraph(badge,S('bd',fontSize=8,fontName='Helvetica-Bold',textColor=bc,alignment=TA_RIGHT,spaceAfter=0))],
                [Paragraph(f"Bad Reviews: {rev}",S('tb',fontSize=10,fontName='Helvetica-Bold',textColor=orange,spaceAfter=0)),""],
                [Paragraph(f"1★: {s['s1']}   2★: {s['s2']}",S('ss2',fontSize=9,textColor=lgray,spaceAfter=0)),""],
                [Paragraph(f"🍽️ Food: {s['food']}   🙍 Service: {s['service']}",body),""],
                [Paragraph(trend,S('tr',fontSize=8.5,fontName='Helvetica-Bold',textColor=tc,spaceAfter=0)),""],
            ]
            th = THEMES.get(loc,[])
            if th:
                content.append([Paragraph("Review Themes:",S('thl',fontSize=8,fontName='Helvetica-Bold',textColor=gray,spaceAfter=0)),""])
                for t in th[:3]:
                    tc2 = red_c if t.startswith("🚨") else lgray
                    content.append([Paragraph(f"• {t}",S('th2',fontSize=8,textColor=tc2,spaceAfter=0)),""])
            else:
                content.append([Paragraph("• No issues this week — great job! 🎉",S('ok',fontSize=8,textColor=green_c,spaceAfter=0)),""])
            card = Table(content,colWidths=[2.5*inch,.85*inch])
            cts = TableStyle([
                ('BACKGROUND',(0,0),(-1,-1),darkcard),
                ('BACKGROUND',(0,0),(-1,0),bbg),
                ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),4),
                ('LEFTPADDING',(0,0),(-1,-1),8),
                ('SPAN',(0,1),(1,1)),('SPAN',(0,2),(1,2)),('SPAN',(0,3),(1,3)),
                ('SPAN',(0,4),(1,4)),('SPAN',(0,5),(1,5)),
                ('BOX',(0,0),(-1,-1),1,mid_navy),
                ('LINEBELOW',(0,0),(-1,0),2,bc),
            ])
            for ri in range(6,len(content)):
                cts.add('SPAN',(0,ri),(1,ri))
            card.setStyle(cts)
            cols.append(card)
        if len(cols)==1: cols.append(Spacer(1,1))
        rt = Table([cols],colWidths=[3.55*inch,3.75*inch])
        rt.setStyle(TableStyle([
            ('VALIGN',(0,0),(-1,-1),'TOP'),
            ('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),
            ('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),6),
        ]))
        story.append(rt)
    story.append(PageBreak())

    # ── PAGE 5: RECOMMENDATIONS ──
    story.append(sec_hdr("RECOMMENDATIONS & ACTION ITEMS","Auto-generated by Lola AI"))
    story.append(Spacer(1,10))
    story.append(Paragraph("TOP 3 LOCATIONS NEEDING IMMEDIATE ATTENTION", S('h2r',fontSize=11,fontName='Helvetica-Bold',textColor=orange,spaceBefore=0,spaceAfter=6)))

    for loc in sorted_locs[:3]:
        rev = wk14[loc]["reviews"]
        pr = "🔴 CRITICAL" if rev>=3 else "⚠️ WATCH"
        pc = red_c if rev>=3 else amber_c
        pb = red_bg if rev>=3 else amber_bg
        d13v = wk13.get(loc,{}).get("reviews",0)
        diff = rev-d13v
        ht = Table([[
            Paragraph(f"{pr}  —  {loc}",S('ph',fontSize=11,fontName='Helvetica-Bold',textColor=pc,spaceAfter=0)),
            Paragraph(f"{rev} bad reviews  ·  {'↑ worse' if diff>0 else '→'} vs Wk13",S('phs',fontSize=9,textColor=gray,alignment=TA_RIGHT,spaceAfter=0))
        ]],colWidths=[4.5*inch,2.8*inch])
        ht.setStyle(TableStyle([
            ('BACKGROUND',(0,0),(-1,-1),pb),
            ('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),
            ('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),
            ('LINEBELOW',(0,0),(-1,-1),2,pc),
        ]))
        story.append(ht)
        act = ACTIONS.get(loc,["Review and respond to all open reviews","Coach team on identified issues"])
        for item in act:
            ic = red_c if item.startswith("🚨") else lgray
            ar = Table([[Paragraph(f"□  {item}",S('ai',fontSize=8.5,textColor=ic,spaceAfter=0))]],colWidths=[7.3*inch])
            ar.setStyle(TableStyle([
                ('BACKGROUND',(0,0),(-1,-1),darker),
                ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
                ('LEFTPADDING',(0,0),(-1,-1),16),
                ('LINEBELOW',(0,0),(-1,-1),0.3,mid_navy),
            ]))
            story.append(ar)
        story.append(Spacer(1,8))

    story.append(Spacer(1,4))
    story.append(Paragraph("NETWORK TREND SUMMARY", S('h2r',fontSize=11,fontName='Helvetica-Bold',textColor=orange,spaceBefore=4,spaceAfter=6)))
    trends = [
        ("📈 Volume", f"Wk14: {total14} bad reviews vs Wk13: {total13} — {'increase of +'+str(total14-total13) if total14>total13 else 'decrease of '+str(total14-total13)}"),
        ("🍽️ Food", f"{round(total_food/max(total14,1)*100)}% of bad reviews are food-related. Top themes: wrong orders, food safety, temperature issues"),
        ("🙍 Service", f"{round(total_svc/max(total14,1)*100)}% service-related. Key pattern: staff dismissing guest concerns, ignoring tables"),
        ("🚨 Safety", "2 food safety incidents this week (Cumming: raw chicken, Decatur: food poisoning) — both require immediate escalation"),
        ("✅ Bright Spots", f"{'Buckhead' if 'Buckhead' in best else 'N/A'} had zero bad reviews. {', '.join(best)} performing clean this week"),
        ("📋 Response", "Multiple Wk14 Google/Yelp reviews remain unreplied — target same-week response for all 1 & 2 star reviews"),
    ]
    for lab,txt in trends:
        tr = Table([[
            Paragraph(lab,S('tl',fontSize=9,fontName='Helvetica-Bold',textColor=orange,spaceAfter=0)),
            Paragraph(txt,S('tv',fontSize=8.5,textColor=lgray,spaceAfter=0))
        ]],colWidths=[1.1*inch,6.2*inch])
        tr.setStyle(TableStyle([
            ('BACKGROUND',(0,0),(-1,-1),darkcard),
            ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),
            ('LEFTPADDING',(0,0),(-1,-1),10),
            ('LINEAFTER',(0,0),(0,-1),0.5,mid_navy),
            ('LINEBELOW',(0,0),(-1,-1),0.3,mid_navy),
            ('VALIGN',(0,0),(-1,-1),'TOP'),
        ]))
        story.append(tr)

    story.append(Spacer(1,10))
    so = Table([[Paragraph(f"Report generated {now}  ·  Data: Weekly Resto Reviews Sheet + Marqii  ·  Contact: majo@rrealtacos.com",S('so',fontSize=8,textColor=gray,alignment=TA_CENTER,spaceAfter=0))]],colWidths=[7.3*inch])
    so.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1),navy),
        ('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10),
        ('BOX',(0,0),(-1,-1),0.5,mid_navy),
    ]))
    story.append(so)

    doc.build(story, onFirstPage=add_page_num, onLaterPages=add_page_num)
    print(f"✅ PDF built: {OUTPUT}  ({os.path.getsize(OUTPUT):,} bytes)")

if __name__ == "__main__":
    print("📊 Fetching sheet data...")
    wk14, wk13 = fetch_sheet()
    print(f"✅ Week 14: {sum(wk14[l]['reviews'] for l in LOCS)} total reviews across 11 locations")
    build_pdf(wk14, wk13)
