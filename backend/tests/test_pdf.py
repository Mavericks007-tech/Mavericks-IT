"""PDF rendering smoke tests — verify bytes start with %PDF and download endpoints serve."""
from decimal import Decimal

import pytest

from crm.models import Client, Invoice, InvoiceLineItem, Quote, QuoteLineItem
from crm.pdf import render_invoice_pdf, render_quote_pdf


@pytest.fixture
def sample_quote(db):
    c = Client.objects.create(company_name='ACME', industry='corporate_enterprise')
    q = Quote.objects.create(
        number='Q-PDF-001', title='Sample', client=c, vat_percent=Decimal('15'),
    )
    QuoteLineItem.objects.create(quote=q, description='Discovery', quantity=1, rate=Decimal('50000'))
    q.recalculate()
    return q


@pytest.fixture
def sample_invoice(db):
    c = Client.objects.create(company_name='ACME', industry='corporate_enterprise')
    i = Invoice.objects.create(
        number='INV-PDF-001', client=c, vat_percent=Decimal('15'),
    )
    InvoiceLineItem.objects.create(invoice=i, description='Sprint 1', quantity=1, rate=Decimal('100000'))
    i.recalculate()
    return i


def test_render_quote_pdf_bytes(sample_quote):
    body = render_quote_pdf(sample_quote)
    assert body.startswith(b'%PDF')
    assert len(body) > 500


def test_render_invoice_pdf_bytes(sample_invoice):
    body = render_invoice_pdf(sample_invoice)
    assert body.startswith(b'%PDF')
    assert len(body) > 500


@pytest.mark.django_db
def test_quote_pdf_endpoint(auth_client, sample_quote):
    r = auth_client.get(f'/api/v1/crm/quotes/{sample_quote.id}/pdf/')
    assert r.status_code == 200
    assert r['Content-Type'] == 'application/pdf'


@pytest.mark.django_db
def test_invoice_pdf_endpoint(auth_client, sample_invoice):
    r = auth_client.get(f'/api/v1/crm/invoices/{sample_invoice.id}/pdf/')
    assert r.status_code == 200
    assert r['Content-Type'] == 'application/pdf'
