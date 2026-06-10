"""Model-level invariants: recalculate, slug auto, RedirectMiddleware behavior."""
from decimal import Decimal

import pytest

from cms.models import Service
from crm.models import (
    Client,
    Comment,
    Invoice,
    InvoiceLineItem,
    Lead,
    Quote,
    QuoteLineItem,
)


@pytest.mark.django_db
def test_service_slug_autoset_from_title():
    s = Service.objects.create(
        title='Custom ERP Systems', subtitle='x', simple_explanation='x',
        icon_name='Code2',
    )
    assert s.slug == 'custom-erp-systems'


@pytest.mark.django_db
def test_quote_total_recalculates():
    client = Client.objects.create(company_name='ACME', industry='corporate_enterprise')
    q = Quote.objects.create(
        number='Q-TEST-001', title='Test', client=client,
        vat_percent=Decimal('15'),
    )
    QuoteLineItem.objects.create(quote=q, description='A', quantity=2, rate=Decimal('100'))
    QuoteLineItem.objects.create(quote=q, description='B', quantity=1, rate=Decimal('50'))
    q.recalculate()
    q.refresh_from_db()
    assert q.subtotal == Decimal('250.00')
    assert q.vat_amount == Decimal('37.50')
    assert q.total == Decimal('287.50')


@pytest.mark.django_db
def test_invoice_total_recalculates():
    client = Client.objects.create(company_name='ACME', industry='corporate_enterprise')
    inv = Invoice.objects.create(
        number='INV-TEST-001', client=client, vat_percent=Decimal('15'),
    )
    InvoiceLineItem.objects.create(invoice=inv, description='A', quantity=1, rate=Decimal('100'))
    inv.recalculate()
    inv.refresh_from_db()
    assert inv.subtotal == Decimal('100.00')
    assert inv.total == Decimal('115.00')


@pytest.mark.django_db
def test_comment_mentions_extracted(auth_client, admin_user):
    """Posting a comment with @user extracts to mentions M2M."""
    lead = Lead.objects.create(full_name='X', email='x@x.com')
    r = auth_client.post(
        '/api/v1/crm/comments/',
        {'body': f'hey @{admin_user.username} pls check', 'lead': str(lead.id)},
        format='json',
    )
    assert r.status_code == 201, r.content
    body = r.json()
    assert admin_user.username in body['mention_names']
    cmt = Comment.objects.get(pk=body['id'])
    assert admin_user in cmt.mentions.all()


@pytest.mark.django_db
def test_lead_bulk_status_update(auth_client):
    leads = [Lead.objects.create(full_name=f'U{i}', email=f'u{i}@x.com') for i in range(3)]
    ids = [str(l.id) for l in leads]
    r = auth_client.post(
        '/api/v1/crm/leads/bulk-action/',
        {'ids': ids, 'action': 'status', 'value': 'qualified'},
        format='json',
    )
    assert r.status_code == 200
    assert r.json()['affected'] == 3
    for l in leads:
        l.refresh_from_db()
        assert l.status == 'qualified'
