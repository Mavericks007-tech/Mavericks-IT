"""Celery tasks for CRM — payment reminders + abandoned-quote follow-up."""
import logging
from datetime import timedelta

from celery import shared_task
from django.utils import timezone

log = logging.getLogger(__name__)


@shared_task(name='crm.tasks.send_payment_reminders')
def send_payment_reminders():
    """Email primary client contact for every overdue invoice."""
    from django.core.mail import send_mail
    from django.conf import settings
    from .models import Invoice

    today = timezone.now().date()
    overdue = Invoice.objects.exclude(status__in=['paid', 'cancelled']).filter(due_date__lt=today)

    sent = 0
    for inv in overdue:
        primary = inv.client.contacts.filter(is_primary=True).first() if inv.client else None
        if not primary or not primary.email:
            continue
        days_overdue = (today - inv.due_date).days
        try:
            send_mail(
                subject=f'Reminder: invoice {inv.number} is {days_overdue} day(s) overdue',
                message=(
                    f'Hi {primary.full_name.split()[0] if primary.full_name else "there"},\n\n'
                    f'A friendly reminder that invoice {inv.number} for {inv.currency} '
                    f'{float(inv.amount_due):,.2f} is now {days_overdue} day(s) past due (due {inv.due_date}).\n\n'
                    f'View invoice: https://maverickstech.com.bd/portal/invoices/{inv.id}\n\n'
                    f'If you have already paid, please ignore.\n\n'
                    f'— Mavericks Tech Bangladesh'
                ),
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@maverickstech.com.bd'),
                recipient_list=[primary.email],
                fail_silently=True,
            )
            sent += 1
        except Exception as e:
            log.warning('reminder failed inv=%s: %s', inv.id, e)

    log.info('payment reminders sent: %d', sent)
    return sent


@shared_task(name='crm.tasks.followup_abandoned_quotes')
def followup_abandoned_quotes():
    """Quotes sent but not accepted within 7 days → nudge email."""
    from django.core.mail import send_mail
    from django.conf import settings
    from .models import Quote

    cutoff = timezone.now() - timedelta(days=7)
    abandoned = Quote.objects.filter(status='sent', sent_at__lt=cutoff)

    sent = 0
    for q in abandoned:
        primary = q.client.contacts.filter(is_primary=True).first() if q.client else None
        if not primary or not primary.email:
            continue
        try:
            send_mail(
                subject=f'Following up on quote {q.number}',
                message=(
                    f'Hi {primary.full_name.split()[0] if primary.full_name else "there"},\n\n'
                    f'Wanted to check in on quote {q.number} for "{q.title}" '
                    f'({q.currency} {float(q.total):,.2f}) sent last week.\n\n'
                    f'Any questions before you decide? Happy to jump on a call.\n\n'
                    f'View quote: https://maverickstech.com.bd/portal/quotes/{q.id}\n\n'
                    f'— Mavericks Tech Bangladesh'
                ),
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@maverickstech.com.bd'),
                recipient_list=[primary.email],
                fail_silently=True,
            )
            sent += 1
        except Exception as e:
            log.warning('quote followup failed q=%s: %s', q.id, e)

    log.info('abandoned quote followups sent: %d', sent)
    return sent
