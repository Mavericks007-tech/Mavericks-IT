"""Aggregate analytics endpoints. Read-only. Auth required."""
from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, F, Q, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from comms.models import EmailCampaign, EmailLog
from crm.models import Client, Invoice, Lead, Project, Task


def _decimal(v):
    return float(v) if isinstance(v, Decimal) else v


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    """Top-line metrics for the home dashboard."""
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    new_leads_week = Lead.objects.filter(created_at__date__gte=week_ago).count()
    leads_open = Lead.objects.exclude(status__in=['won', 'lost']).count()
    active_projects = Project.objects.exclude(stage__in=['completed', 'cancelled']).count()

    invoice_totals = Invoice.objects.aggregate(
        billed=Sum('total'), paid=Sum('amount_paid'),
    )
    overdue = Invoice.objects.exclude(status__in=['paid', 'cancelled']).filter(
        due_date__lt=today,
    ).aggregate(
        amount=Sum(F('total') - F('amount_paid')), count=Count('id'),
    )

    month_revenue = Invoice.objects.filter(
        paid_at__date__gte=month_ago, status='paid',
    ).aggregate(s=Sum('total'))['s'] or Decimal('0')

    return Response({
        'leads': {
            'new_this_week': new_leads_week,
            'open': leads_open,
            'total': Lead.objects.count(),
        },
        'projects': {
            'active': active_projects,
            'completed': Project.objects.filter(stage='completed').count(),
            'total': Project.objects.count(),
        },
        'clients': {
            'total': Client.objects.count(),
            'vip': Client.objects.filter(is_vip=True).count(),
        },
        'revenue': {
            'last_30_days': _decimal(month_revenue),
            'total_billed': _decimal(invoice_totals.get('billed') or 0),
            'total_paid': _decimal(invoice_totals.get('paid') or 0),
            'overdue_amount': _decimal(overdue.get('amount') or 0),
            'overdue_count': overdue.get('count') or 0,
        },
        'tasks': {
            'open': Task.objects.exclude(status__in=['done', 'cancelled']).count(),
            'overdue': Task.objects.exclude(status__in=['done', 'cancelled']).filter(
                due_date__lt=timezone.now(),
            ).count(),
        },
        'as_of': timezone.now().isoformat(),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_funnel(request):
    """Lead pipeline counts per stage."""
    rows = Lead.objects.values('status').annotate(count=Count('id'))
    counts = {r['status']: r['count'] for r in rows}
    statuses = [s for s, _ in Lead._meta.get_field('status').choices]
    return Response({s: counts.get(s, 0) for s in statuses})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lead_sources(request):
    """Conversion rate per lead source."""
    rows = Lead.objects.values('source').annotate(
        total=Count('id'),
        won=Count('id', filter=Q(status='won')),
        lost=Count('id', filter=Q(status='lost')),
    ).order_by('-total')
    out = []
    for r in rows:
        total = r['total']
        conv = (r['won'] / total * 100) if total else 0
        out.append({
            'source': r['source'],
            'total': total,
            'won': r['won'],
            'lost': r['lost'],
            'conversion_rate': round(conv, 1),
        })
    return Response(out)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_by_month(request):
    """Monthly revenue trend (last 12 months) — based on paid invoices."""
    cutoff = timezone.now() - timedelta(days=365)
    rows = Invoice.objects.filter(
        status='paid', paid_at__gte=cutoff,
    ).annotate(month=TruncMonth('paid_at')).values('month').annotate(
        revenue=Sum('total'), count=Count('id'),
    ).order_by('month')
    return Response([
        {'month': r['month'].isoformat() if r['month'] else None,
         'revenue': _decimal(r['revenue'] or 0),
         'invoice_count': r['count']}
        for r in rows
    ])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_by_client(request):
    """Top 20 clients by lifetime paid revenue."""
    rows = Invoice.objects.filter(status='paid').values(
        'client__id', 'client__company_name',
    ).annotate(
        revenue=Sum('total'), invoice_count=Count('id'),
    ).order_by('-revenue')[:20]
    return Response([
        {'client_id': str(r['client__id']),
         'client_name': r['client__company_name'],
         'revenue': _decimal(r['revenue'] or 0),
         'invoice_count': r['invoice_count']}
        for r in rows
    ])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_by_service(request):
    """Revenue split by service_type via Project linkage."""
    rows = Invoice.objects.filter(status='paid').exclude(project__isnull=True).values(
        'project__service_type',
    ).annotate(
        revenue=Sum('total'),
    ).order_by('-revenue')
    return Response([
        {'service': r['project__service_type'], 'revenue': _decimal(r['revenue'] or 0)}
        for r in rows
    ])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_profitability(request):
    """Per-project budget vs spend snapshot."""
    rows = Project.objects.values(
        'id', 'code', 'name', 'stage', 'contract_value', 'budget_spent',
        'client__company_name',
    ).order_by('-contract_value')[:50]
    return Response([
        {
            'id': str(r['id']),
            'code': r['code'],
            'name': r['name'],
            'client': r['client__company_name'],
            'stage': r['stage'],
            'contract_value': _decimal(r['contract_value']),
            'budget_spent': _decimal(r['budget_spent']),
            'margin': _decimal(r['contract_value'] - r['budget_spent']),
        }
        for r in rows
    ])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def team_performance(request):
    """Per-user metrics: assigned leads, won, revenue managed."""
    from django.contrib.auth.models import User
    rows = []
    for u in User.objects.filter(is_staff=True):
        leads = Lead.objects.filter(assigned_to=u)
        projects = Project.objects.filter(project_manager=u)
        clients = Client.objects.filter(account_manager=u)
        rows.append({
            'user_id': u.id,
            'username': u.username,
            'full_name': u.get_full_name() or u.username,
            'leads_assigned': leads.count(),
            'leads_won': leads.filter(status='won').count(),
            'projects_managed': projects.count(),
            'clients_managed': clients.count(),
            'pipeline_value': _decimal(
                projects.aggregate(s=Sum('contract_value'))['s'] or 0,
            ),
        })
    return Response(sorted(rows, key=lambda r: r['pipeline_value'], reverse=True))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def email_stats(request):
    """Email send + open + campaign performance."""
    logs = EmailLog.objects.aggregate(
        total=Count('id'),
        sent=Count('id', filter=Q(status='sent')),
        opened=Count('id', filter=Q(status='opened')),
        failed=Count('id', filter=Q(status='failed')),
    )
    total = logs.get('total') or 0
    opened = logs.get('opened') or 0
    open_rate = round((opened / total * 100), 1) if total else 0
    return Response({
        'logs': logs,
        'open_rate_percent': open_rate,
        'campaigns': {
            'total': EmailCampaign.objects.count(),
            'completed': EmailCampaign.objects.filter(status='completed').count(),
            'sent_count_sum': EmailCampaign.objects.aggregate(s=Sum('sent_count'))['s'] or 0,
        },
    })
