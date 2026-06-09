"""PDF rendering for Quote + Invoice. Uses ReportLab (pure Python, no system libs).

Layout: A4, header w/ brand + invoice/quote number, client block, line-items
table, totals box, payment terms / instructions footer.
"""
from io import BytesIO

from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
)


BRAND_PRIMARY = colors.HexColor('#0066FF')
BRAND_DARK = colors.HexColor('#0F172A')
BRAND_GRAY = colors.HexColor('#94A3B8')
BRAND_BG = colors.HexColor('#F8FAFC')


def _styles():
    ss = getSampleStyleSheet()
    return {
        'title':     ParagraphStyle('Title', parent=ss['Title'], fontSize=24, leading=28,
                                    textColor=BRAND_DARK, alignment=TA_LEFT, spaceAfter=4),
        'h2':        ParagraphStyle('H2', parent=ss['Heading2'], fontSize=12,
                                    textColor=BRAND_PRIMARY, spaceAfter=4),
        'body':      ParagraphStyle('Body', parent=ss['BodyText'], fontSize=10,
                                    leading=14, textColor=BRAND_DARK),
        'meta':      ParagraphStyle('Meta', parent=ss['BodyText'], fontSize=9,
                                    textColor=BRAND_GRAY),
        'amount':    ParagraphStyle('Amount', parent=ss['BodyText'], fontSize=14,
                                    leading=18, textColor=BRAND_DARK, alignment=TA_RIGHT,
                                    fontName='Helvetica-Bold'),
        'amountlbl': ParagraphStyle('AmountLbl', parent=ss['BodyText'], fontSize=10,
                                    textColor=BRAND_GRAY, alignment=TA_RIGHT),
    }


def _header(s, doc_kind, doc_number, issue_date, due_or_valid_label, due_or_valid_value, site_name='Mavericks Tech Bangladesh'):
    return [
        Table([[
            Paragraph(f'<b>{site_name}</b><br/>'
                      'maverickstech.com.bd<br/>'
                      'hello@maverickstech.com.bd', s['meta']),
            Paragraph(f'<b>{doc_kind}</b><br/>'
                      f'<font size=11>{doc_number}</font><br/>'
                      f'<font color="#94A3B8">Issued {issue_date}</font><br/>'
                      f'<font color="#94A3B8">{due_or_valid_label} {due_or_valid_value}</font>',
                      ParagraphStyle('hdrR', parent=s['body'], alignment=TA_RIGHT)),
        ]], colWidths=[110*mm, 70*mm], style=TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 16),
        ])),
        Spacer(1, 8),
    ]


def _client_block(s, client_name, contact_name='', contact_email='', address=''):
    body = f'<b>Billed to</b><br/><font size=11>{client_name}</font>'
    if contact_name:
        body += f'<br/>{contact_name}'
    if contact_email:
        body += f'<br/><font color="#94A3B8">{contact_email}</font>'
    if address:
        body += f'<br/><font color="#94A3B8">{address}</font>'
    return [Paragraph(body, s['body']), Spacer(1, 14)]


def _line_items_table(s, items, currency='BDT'):
    head = [['#', 'Description', 'Qty', f'Rate ({currency})', f'Amount ({currency})']]
    rows = []
    for i, it in enumerate(items, 1):
        rows.append([
            str(i),
            Paragraph(it.description, s['body']),
            f'{float(it.quantity):g}',
            f'{float(it.rate):,.2f}',
            f'{float(it.amount):,.2f}',
        ])
    if not rows:
        rows.append(['—', Paragraph('<i>No line items yet</i>', s['meta']), '', '', ''])

    tbl = Table(head + rows, colWidths=[10*mm, 90*mm, 18*mm, 30*mm, 32*mm], repeatRows=1)
    tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_DARK),
        ('TEXTCOLOR',  (0, 0), (-1, 0), colors.white),
        ('FONTNAME',   (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE',   (0, 0), (-1, 0), 9),
        ('ALIGN',      (2, 0), (-1, -1), 'RIGHT'),
        ('ALIGN',      (0, 0), (0, -1),  'CENTER'),
        ('VALIGN',     (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BRAND_BG]),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#E2E8F0')),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))
    return [tbl, Spacer(1, 10)]


def _totals_box(s, subtotal, discount, vat_percent, vat_amount, total, amount_paid=None, amount_due=None, currency='BDT'):
    rows = [
        [Paragraph('Subtotal', s['amountlbl']),  Paragraph(f'{currency} {float(subtotal):,.2f}', s['body'])],
        [Paragraph('Discount', s['amountlbl']),  Paragraph(f'− {currency} {float(discount or 0):,.2f}', s['body'])],
        [Paragraph(f'VAT ({float(vat_percent):g}%)', s['amountlbl']),
         Paragraph(f'{currency} {float(vat_amount):,.2f}', s['body'])],
        [Paragraph('<b>Total</b>', s['amountlbl']),
         Paragraph(f'<b>{currency} {float(total):,.2f}</b>', s['amount'])],
    ]
    if amount_paid is not None:
        rows.append([Paragraph('Amount paid', s['amountlbl']),
                     Paragraph(f'− {currency} {float(amount_paid):,.2f}', s['body'])])
        rows.append([Paragraph('<b>Amount due</b>', s['amountlbl']),
                     Paragraph(f'<b>{currency} {float(amount_due):,.2f}</b>', s['amount'])])

    tbl = Table(rows, colWidths=[55*mm, 50*mm], hAlign='RIGHT')
    tbl.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LINEABOVE', (0, 3), (-1, 3), 0.6, BRAND_DARK),
    ]))
    return [tbl, Spacer(1, 14)]


def _footer(s, *blocks):
    out = []
    for label, text in blocks:
        if not text:
            continue
        out.append(Paragraph(f'<b>{label}</b>', s['h2']))
        out.append(Paragraph(text.replace('\n', '<br/>'), s['body']))
        out.append(Spacer(1, 8))
    return out


def render_quote_pdf(quote) -> bytes:
    s = _styles()
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=15*mm, rightMargin=15*mm,
                            topMargin=15*mm, bottomMargin=15*mm,
                            title=f'Quote {quote.number}')

    story = []
    story += _header(s, 'QUOTE', quote.number,
                     quote.issue_date.strftime('%d %b %Y') if quote.issue_date else '—',
                     'Valid until',
                     quote.valid_until.strftime('%d %b %Y') if quote.valid_until else '—')
    story.append(Paragraph(quote.title or '', s['title']))
    story.append(Spacer(1, 8))

    client = quote.client
    primary = client.contacts.filter(is_primary=True).first() if client else None
    story += _client_block(s,
                           client_name=getattr(client, 'company_name', '') or '—',
                           contact_name=getattr(primary, 'full_name', '') if primary else '',
                           contact_email=getattr(primary, 'email', '') if primary else '',
                           address=getattr(client, 'billing_address', '') if client else '')

    if quote.description:
        story.append(Paragraph(quote.description, s['body']))
        story.append(Spacer(1, 10))

    story += _line_items_table(s, list(quote.line_items.all()), currency=quote.currency)
    story += _totals_box(s, quote.subtotal, quote.discount, quote.vat_percent,
                         quote.vat_amount, quote.total, currency=quote.currency)
    story += _footer(s,
                     ('Inclusions', quote.inclusions),
                     ('Exclusions', quote.exclusions),
                     ('Payment terms', quote.payment_terms),
                     ('Cover letter', quote.cover_letter))

    story.append(Spacer(1, 18))
    story.append(Paragraph(f'<font color="#94A3B8" size=8>'
                           f'Generated {timezone.now().strftime("%d %b %Y, %H:%M %Z")} · '
                           f'maverickstech.com.bd</font>', s['meta']))

    doc.build(story)
    return buf.getvalue()


def render_invoice_pdf(invoice) -> bytes:
    s = _styles()
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=15*mm, rightMargin=15*mm,
                            topMargin=15*mm, bottomMargin=15*mm,
                            title=f'Invoice {invoice.number}')

    story = []
    story += _header(s, 'INVOICE', invoice.number,
                     invoice.issue_date.strftime('%d %b %Y') if invoice.issue_date else '—',
                     'Due',
                     invoice.due_date.strftime('%d %b %Y') if invoice.due_date else '—')
    story.append(Paragraph(f'Status: <font color="{ "#FF3366" if invoice.is_overdue else "#0066FF" }"><b>{invoice.get_status_display() if hasattr(invoice, "get_status_display") else invoice.status}</b></font>', s['body']))
    story.append(Spacer(1, 8))

    client = invoice.client
    primary = client.contacts.filter(is_primary=True).first() if client else None
    story += _client_block(s,
                           client_name=getattr(client, 'company_name', '') or '—',
                           contact_name=getattr(primary, 'full_name', '') if primary else '',
                           contact_email=getattr(primary, 'email', '') if primary else '',
                           address=getattr(client, 'billing_address', '') if client else '')

    story += _line_items_table(s, list(invoice.line_items.all()), currency=invoice.currency)
    story += _totals_box(s, invoice.subtotal, invoice.discount, invoice.vat_percent,
                         invoice.vat_amount, invoice.total,
                         amount_paid=invoice.amount_paid,
                         amount_due=invoice.amount_due,
                         currency=invoice.currency)

    story += _footer(s,
                     ('Notes', invoice.notes),
                     ('Payment instructions', invoice.payment_instructions))

    story.append(Spacer(1, 18))
    story.append(Paragraph(f'<font color="#94A3B8" size=8>'
                           f'Generated {timezone.now().strftime("%d %b %Y, %H:%M %Z")} · '
                           f'maverickstech.com.bd</font>', s['meta']))

    doc.build(story)
    return buf.getvalue()
