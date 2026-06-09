"""Celery tasks for comms — weekly client digest + abandoned-quote follow-up."""
import logging
from datetime import timedelta

from celery import shared_task
from django.utils import timezone

log = logging.getLogger(__name__)


@shared_task(name='comms.tasks.send_weekly_client_digest')
def send_weekly_client_digest():
    """Email each active client a summary of their projects + invoices.

    Sent every Monday 8 AM via Celery Beat (config in backend_config/celery.py).
    """
    from crm.models import Client, Invoice, Milestone, Project
    from django.core.mail import send_mail
    from django.conf import settings

    sent = 0
    week_ago = timezone.now() - timedelta(days=7)

    for client in Client.objects.filter(is_active=True) if hasattr(Client, 'is_active') else Client.objects.all():
        primary = client.contacts.filter(is_primary=True).first()
        if not primary or not primary.email:
            continue

        active_projects = Project.objects.filter(client=client).exclude(stage='completed')
        if not active_projects.exists():
            continue

        recent_milestones = Milestone.objects.filter(
            project__in=active_projects,
            updated_at__gte=week_ago,
        )
        outstanding = Invoice.objects.filter(client=client).exclude(status__in=['paid', 'cancelled'])

        lines = [
            f'Hi {primary.full_name.split()[0] if primary.full_name else "there"},',
            '',
            f'Weekly update on your projects with Mavericks Tech ({timezone.now():%d %b %Y}).',
            '',
            'Active projects:',
        ]
        for p in active_projects:
            lines.append(f'  - {p.name} — stage {p.get_stage_display() if hasattr(p, "get_stage_display") else p.stage} ({p.progress_percent or 0}%)')
        if recent_milestones.exists():
            lines += ['', 'Milestones moved this week:']
            for m in recent_milestones:
                lines.append(f'  - {m.title} ({"done" if m.is_completed else "in progress"})')
        if outstanding.exists():
            lines += ['', 'Open invoices:']
            for inv in outstanding:
                lines.append(f'  - {inv.number} · {inv.currency} {float(inv.total):,.2f} · due {inv.due_date}')
        lines += [
            '',
            'View everything in your portal: https://maverickstech.com.bd/portal',
            '',
            '— Mavericks Tech Bangladesh',
        ]

        try:
            send_mail(
                subject=f'Weekly project update — {timezone.now():%d %b %Y}',
                message='\n'.join(lines),
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@maverickstech.com.bd'),
                recipient_list=[primary.email],
                fail_silently=True,
            )
            sent += 1
        except Exception as e:
            log.warning('digest failed for client=%s: %s', client.id, e)

    log.info('weekly client digest sent to %d clients', sent)
    return sent
