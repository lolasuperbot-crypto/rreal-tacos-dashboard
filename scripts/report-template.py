"""
report-template.py
Rreal Hospitality LLC — Permanent Report Template
Style 2: Clean Corporate (white/light background, professional)

Usage:
    from scripts.report_template import RrealReport
    
    report = RrealReport(
        output_path="MyReport.pdf",
        title="Weekly Review Report",
        subtitle="1 & 2 Star Analysis",
        week="Week 14",
        date_range="03/30–04/05/2026",
    )
    report.build(pages_fn)  # pages_fn receives story list to append content
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
    TableStyle, HRFlowable, PageBreak, KeepTogether)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime, timezone, timedelta
import os

# ── BRAND COLORS ──────────────────────────────────────────────────────────────
C = {
    # Backgrounds
    "white":        colors.HexColor("#ffffff"),
    "page_bg":      colors.HexColor("#f9fafb"),
    "card_bg":      colors.HexColor("#ffffff"),
    "row_alt":      colors.HexColor("#f9fafb"),
    "tbl_hdr_bg":   colors.HexColor("#f3f4f6"),
    "chip_bg":      colors.HexColor("#f3f4f6"),

    # Text
    "text_dark":    colors.HexColor("#111827"),
    "text_body":    colors.HexColor("#374151"),
    "text_muted":   colors.HexColor("#6b7280"),
    "text_light":   colors.HexColor("#9ca3af"),

    # Borders
    "border":       colors.HexColor("#e5e7eb"),
    "border_light": colors.HexColor("#f3f4f6"),

    # Brand
    "orange":       colors.HexColor("#f97316"),

    # Status — text colors
    "green":        colors.HexColor("#16a34a"),
    "amber":        colors.HexColor("#d97706"),
    "red":          colors.HexColor("#dc2626"),

    # Status — badge backgrounds
    "badge_green_bg":  colors.HexColor("#dcfce7"),
    "badge_green_txt": colors.HexColor("#166534"),
    "badge_amber_bg":  colors.HexColor("#fef3c7"),
    "badge_amber_txt": colors.HexColor("#92400e"),
    "badge_red_bg":    colors.HexColor("#fee2e2"),
    "badge_red_txt":   colors.HexColor("#991b1b"),
}

MARGINS = 0.75 * inch
PAGE_W = letter[0] - 2 * MARGINS  # usable width = 7.0 inch


# ── STYLES ────────────────────────────────────────────────────────────────────
def style(name, **kwargs):
    defaults = dict(fontName="Helvetica", fontSize=11, textColor=C["text_body"],
                    spaceAfter=4, leading=17)
    defaults.update(kwargs)
    return ParagraphStyle(name, **defaults)

# Pre-built styles
STYLES = {
    # Cover
    "cover_title":   style("cover_title",  fontSize=24, fontName="Helvetica-Bold", textColor=C["text_dark"], spaceAfter=6, leading=30, alignment=TA_LEFT),
    "cover_sub":     style("cover_sub",    fontSize=12, textColor=C["text_muted"], spaceAfter=8, leading=17, alignment=TA_LEFT),
    "chip":          style("chip",         fontSize=10, textColor=C["text_body"],  spaceAfter=0, leading=12, alignment=TA_CENTER),

    # Section headers
    "section_hdr":   style("section_hdr",  fontSize=9, fontName="Helvetica-Bold", textColor=C["text_body"],
                           spaceAfter=6, leading=11, alignment=TA_LEFT),

    # Body
    "body":          style("body",         fontSize=11, textColor=C["text_body"], spaceAfter=4, leading=17),
    "body_sm":       style("body_sm",      fontSize=9,  textColor=C["text_body"], spaceAfter=3, leading=13),
    "body_muted":    style("body_muted",   fontSize=9,  textColor=C["text_muted"],spaceAfter=3, leading=13),

    # KPIs
    "kpi_number":    style("kpi_number",   fontSize=24, fontName="Helvetica-Bold", textColor=C["text_dark"],
                           spaceAfter=2, leading=28, alignment=TA_CENTER),
    "kpi_label":     style("kpi_label",    fontSize=9, fontName="Helvetica-Bold", textColor=C["text_light"],
                           spaceAfter=0, leading=11, alignment=TA_CENTER),

    # Table
    "tbl_hdr":       style("tbl_hdr",      fontSize=9, fontName="Helvetica-Bold", textColor=C["text_body"],
                           spaceAfter=0, leading=11, alignment=TA_CENTER),
    "tbl_cell":      style("tbl_cell",     fontSize=10, textColor=C["text_body"], spaceAfter=0, leading=13),
    "tbl_cell_bold": style("tbl_cell_bold",fontSize=10, fontName="Helvetica-Bold", textColor=C["text_dark"], spaceAfter=0, leading=13),

    # Quote
    "quote":         style("quote",        fontSize=10, fontName="Helvetica-Oblique", textColor=C["text_body"],
                           spaceAfter=4, leading=15, leftIndent=12),

    # Footer
    "footer":        style("footer",       fontSize=8, textColor=C["text_light"], spaceAfter=0, leading=10),
}


# ── TABLE HELPERS ──────────────────────────────────────────────────────────────
def base_table_style(col_count, header=True):
    ts = TableStyle([
        # Header
        ('BACKGROUND', (0,0), (-1,0), C["tbl_hdr_bg"]),
        ('TEXTCOLOR',  (0,0), (-1,0), C["text_body"]),
        ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',   (0,0), (-1,0), 9),
        ('ALIGN',      (0,0), (-1,0), 'CENTER'),
        # Data rows
        ('FONTSIZE',   (0,1), (-1,-1), 10),
        ('FONTNAME',   (0,1), (-1,-1), 'Helvetica'),
        ('TEXTCOLOR',  (0,1), (-1,-1), C["text_body"]),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [C["white"], C["row_alt"]]),
        # Padding
        ('TOPPADDING',    (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING',   (0,0), (-1,-1), 8),
        ('RIGHTPADDING',  (0,0), (-1,-1), 8),
        # Borders
        ('BOX',      (0,0), (-1,-1), 0.5, C["border"]),
        ('LINEBELOW',(0,0), (-1,0),  1.5, C["orange"]),
        ('LINEBELOW',(0,1), (-1,-1), 0.5, C["border_light"]),
        # Alignment
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN',  (1,0), (-1,-1), 'CENTER'),
        ('ALIGN',  (0,0), (0,-1),  'LEFT'),
    ])
    return ts


def status_badge(text):
    """Returns a Paragraph styled as a status badge."""
    if text in ("CLEAN", "0", "✅"):
        bg, tc = C["badge_green_bg"], C["badge_green_txt"]
    elif text in ("WATCH", "⚠️"):
        bg, tc = C["badge_amber_bg"], C["badge_amber_txt"]
    else:
        bg, tc = C["badge_red_bg"], C["badge_red_txt"]
    return Paragraph(text, style("badge", fontSize=8, fontName="Helvetica-Bold",
                                  textColor=tc, spaceAfter=0, leading=10, alignment=TA_CENTER))


def section_header(title, page_width=PAGE_W):
    """Orange-underlined section header card."""
    t = Table([[Paragraph(title.upper(), STYLES["section_hdr"])]],
              colWidths=[page_width])
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), C["white"]),
        ('TOPPADDING',    (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING',   (0,0), (-1,-1), 0),
        ('LINEBELOW',     (0,0), (-1,-1), 2, C["orange"]),
    ]))
    return t


def kpi_card(value, label, value_color=None):
    """Single KPI card with big number + label."""
    vc = value_color or C["text_dark"]
    num_style = style("kn", fontSize=24, fontName="Helvetica-Bold",
                       textColor=vc, spaceAfter=2, leading=28, alignment=TA_CENTER)
    t = Table([
        [Paragraph(str(value), num_style)],
        [Paragraph(label.upper(), STYLES["kpi_label"])],
    ], colWidths=[1.5*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), C["white"]),
        ('ALIGN',         (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING',    (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('BOX',           (0,0), (-1,-1), 0.5, C["border"]),
    ]))
    return t


def kpi_row(kpis, page_width=PAGE_W):
    """Row of KPI cards. kpis = [(value, label, color), ...]"""
    n = len(kpis)
    cw = [page_width / n] * n
    cells = []
    for val, lbl, clr in kpis:
        vc = clr or C["text_dark"]
        num_s = style(f"kn{val}", fontSize=24, fontName="Helvetica-Bold",
                       textColor=vc, spaceAfter=2, leading=28, alignment=TA_CENTER)
        cells.append(Table([
            [Paragraph(str(val), num_s)],
            [Paragraph(lbl.upper(), STYLES["kpi_label"])],
        ], colWidths=[cw[0]-0.1*inch]))
    t = Table([cells], colWidths=cw)
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), C["white"]),
        ('ALIGN',         (0,0), (-1,-1), 'CENTER'),
        ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING',    (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('BOX',           (0,0), (-1,-1), 0.5, C["border"]),
        ('LINEAFTER',     (0,0), (-2,-1), 0.5, C["border"]),
    ]))
    return t


# ── PAGE NUMBERING ─────────────────────────────────────────────────────────────
def _make_page_fn(title, total_pages_ref):
    _logo = os.path.join(os.path.dirname(__file__), "..", "dashboard", "receipt-logo_1680210631_400.jpg")
    def page_fn(canvas, doc):
        canvas.saveState()
        w, h = letter
        y = 0.40 * inch

        # Top border line
        canvas.setStrokeColor(C["border"])
        canvas.setLineWidth(0.5)
        canvas.line(MARGINS, y + 14, w - MARGINS, y + 14)

        # Logo in footer (left side, small)
        if os.path.exists(_logo):
            try:
                canvas.drawImage(_logo, MARGINS, y - 2, width=0.55*inch, height=0.18*inch,
                                 preserveAspectRatio=True, mask="auto")
            except:
                pass

        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(C["text_light"])

        # Left text (after logo)
        canvas.drawString(MARGINS + 0.6*inch, y, "Rreal Hospitality LLC  ·  Rreal Tacos Operations")
        # Center
        canvas.drawCentredString(w / 2, y, "Confidential — Internal Use Only")
        # Right
        pg = canvas.getPageNumber()
        canvas.drawRightString(w - MARGINS, y, f"Page {pg}  ·  Generated by Lola AI")

        canvas.restoreState()
    return page_fn


# ── COVER PAGE ─────────────────────────────────────────────────────────────────
def build_cover(title, subtitle, week, date_range, extra_chips=None, page_width=PAGE_W):
    """
    Option 1 layout — left/right side-by-side:
      LEFT:  Logo (44px) + 'Rreal Hospitality LLC' label
      RIGHT: Report title (bold) + subtitle (muted)
      BOTTOM BORDER: 3px solid orange spanning full width
    Chips row below, no wrapping.
    """
    from reportlab.platypus import Image as RLImage
    story = []
    now = datetime.now(tz=timezone(timedelta(hours=-4))).strftime("%B %d, %Y")
    chips = [week, date_range, "Confidential"] + (extra_chips or [])

    _logo = os.path.join(os.path.dirname(__file__), "..", "dashboard", "receipt-logo_1680210631_400.jpg")

    # ── LEFT COL: Logo + brand label ──
    left_items = []
    if os.path.exists(_logo):
        try:
            left_items.append(RLImage(_logo, width=1.5*inch, height=0.42*inch))  # ~44px at 72dpi
        except:
            pass
    left_items.append(Paragraph(
        "RREAL HOSPITALITY LLC",
        style("brand_lbl", fontSize=9, fontName="Helvetica-Bold",
              textColor=C["text_muted"], spaceAfter=0, leading=11, alignment=TA_LEFT)
    ))
    left_col = Table([[item] for item in left_items], colWidths=[page_width * 0.45])
    left_col.setStyle(TableStyle([
        ("ALIGN",         (0,0), (-1,-1), "LEFT"),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 2),
        ("LEFTPADDING",   (0,0), (-1,-1), 0),
        ("RIGHTPADDING",  (0,0), (-1,-1), 0),
    ]))

    # ── RIGHT COL: Title + subtitle ──
    right_col = Table([
        [Paragraph(title, style("cover_rpt", fontSize=18, fontName="Helvetica-Bold",
                                textColor=C["text_dark"], spaceAfter=2, leading=22, alignment=TA_RIGHT))],
        [Paragraph(f"{week}  ·  {date_range}  ·  Confidential",
                   style("cover_sub", fontSize=10, textColor=C["text_light"],
                         spaceAfter=0, leading=13, alignment=TA_RIGHT))],
    ], colWidths=[page_width * 0.55])
    right_col.setStyle(TableStyle([
        ("ALIGN",         (0,0), (-1,-1), "RIGHT"),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 2),
        ("LEFTPADDING",   (0,0), (-1,-1), 0),
        ("RIGHTPADDING",  (0,0), (-1,-1), 0),
    ]))

    # ── HEADER ROW: left | right — orange bottom border ──
    header_row = Table([[left_col, right_col]], colWidths=[page_width * 0.45, page_width * 0.55])
    header_row.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), C["white"]),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 14),
        ("BOTTOMPADDING", (0,0), (-1,-1), 14),
        ("LEFTPADDING",   (0,0), (-1,-1), 0),
        ("RIGHTPADDING",  (0,0), (-1,-1), 0),
        ("LINEBELOW",     (0,0), (-1,-1), 3, C["orange"]),  # Orange ONLY at bottom of header
    ]))
    story.append(header_row)
    story.append(Spacer(1, 14))

    # ── CHIPS ROW: no wrapping, single line ──
    chip_widths = {
        "Week 14": 0.72*inch, "Week 15": 0.72*inch, "Week 16": 0.72*inch,
    }
    default_chip_w = 1.1*inch
    chip_cells = []
    for chip in chips:
        cw = chip_widths.get(chip, default_chip_w)
        # Estimate width from text length
        cw = max(len(chip) * 0.075 * inch, 0.65*inch)
        ct = Table([[Paragraph(chip, style(
            f"chip_{chip[:4]}", fontSize=9, textColor=C["text_body"],
            spaceAfter=0, leading=11, alignment=TA_CENTER, wordWrap=None
        ))]], colWidths=[cw])
        ct.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (-1,-1), C["chip_bg"]),
            ("TOPPADDING",    (0,0), (-1,-1), 4),
            ("BOTTOMPADDING", (0,0), (-1,-1), 4),
            ("LEFTPADDING",   (0,0), (-1,-1), 8),
            ("RIGHTPADDING",  (0,0), (-1,-1), 8),
        ]))
        chip_cells.append(ct)

    total_chip_w = sum(max(len(c) * 0.075 * inch, 0.65*inch) for c in chips)
    chips_t = Table([chip_cells], colWidths=[max(len(c)*0.075*inch,0.65*inch) for c in chips])
    chips_t.setStyle(TableStyle([
        ("LEFTPADDING",   (0,0), (-1,-1), 3),
        ("RIGHTPADDING",  (0,0), (-1,-1), 3),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(chips_t)

    return story


# ── MAIN REPORT CLASS ──────────────────────────────────────────────────────────
class RrealReport:
    """
    Base class for all Rreal Hospitality reports.
    
    Usage:
        report = RrealReport(
            output_path="report.pdf",
            title="Weekly Review Report",
            subtitle="1 & 2 Star Analysis",
            week="Week 14",
            date_range="03/30–04/05/2026",
        )
        
        story = report.start()          # cover + blank start
        story += my_content_pages()     # add your pages
        report.finish(story)            # build PDF
    """

    def __init__(self, output_path, title, subtitle, week, date_range, extra_chips=None):
        self.output_path = output_path
        self.title = title
        self.subtitle = subtitle
        self.week = week
        self.date_range = date_range
        self.extra_chips = extra_chips or []
        self.page_width = PAGE_W

    def _doc(self):
        return SimpleDocTemplate(
            self.output_path, pagesize=letter,
            rightMargin=MARGINS, leftMargin=MARGINS,
            topMargin=MARGINS, bottomMargin=0.85*inch
        )

    def start(self):
        """Returns story list with cover page."""
        story = build_cover(self.title, self.subtitle, self.week,
                            self.date_range, self.extra_chips, self.page_width)
        story.append(PageBreak())
        return story

    def finish(self, story):
        """Builds and saves the PDF."""
        doc = self._doc()
        page_fn = _make_page_fn(self.title, None)
        doc.build(story, onFirstPage=page_fn, onLaterPages=page_fn)
        size = os.path.getsize(self.output_path)
        print(f"✅ Report saved: {self.output_path} ({size:,} bytes)")
        return self.output_path


# ── CONVENIENCE EXPORTS ────────────────────────────────────────────────────────
__all__ = [
    "C", "STYLES", "MARGINS", "PAGE_W",
    "style", "base_table_style", "status_badge",
    "section_header", "kpi_card", "kpi_row",
    "build_cover", "RrealReport",
    "Paragraph", "Spacer", "Table", "TableStyle",
    "HRFlowable", "PageBreak", "KeepTogether",
    "TA_CENTER", "TA_LEFT", "TA_RIGHT", "colors", "inch",
]
