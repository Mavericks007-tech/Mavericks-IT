"""Email send service — wraps Django EmailMessage + EmailLog."""
from __future__ import annotations

import logging
from typing import Optional

from django.conf import settings as dj_settings
from django.core.mail import EmailMultiAlternatives, get_connection
from django.urls import reverse
from django.utils import timezone

from .models import EmailLog, EmailSettings, EmailTemplate

logger = logging.getLogger(__name__)

TRACKING_PIXEL_HTML = '<img src="{url}" width="1" height="1" alt="" style="display:none;" />'


def _get_settings() -> Optional[EmailSettings]:
    return EmailSettings.objects.first()


def _build_connection(es: EmailSettings):
    return get_connection(
        backend='django.core.mail.backends.smtp.EmailBackend',
        host=es.smtp_host,
        port=es.smtp_port,
        username=es.smtp_user,
        password=es.smtp_password,
        use_tls=es.use_tls,
        use_ssl=es.use_ssl,
        fail_silently=False,
    )


def _inject_tracking(log: EmailLog, html: str) -> str:
    base = getattr(dj_settings, 'BASE_URL', 'http://localhost:8000').rstrip('/')
    try:
        path = reverse('comms:tracking-pixel', kwargs={'log_id': log.id})
    except Exception:
        path = f'/api/v1/comms/track/{log.id}.gif'
    return html + TRACKING_PIXEL_HTML.format(url=f"{base}{path}")


def send_email(
    *,
    template_key: Optional[str] = None,
    template: Optional[EmailTemplate] = None,
    to_email: str,
    to_name: str = '',
    context: Optional[dict] = None,
    cc: Optional[list[str]] = None,
    bcc: Optional[list[str]] = None,
    related: Optional[dict] = None,
    sent_by=None,
    raw_subject: Optional[str] = None,
    raw_html: Optional[str] = None,
    raw_text: Optional[str] = None,
) -> EmailLog:
    """Send email via template or raw content. Returns EmailLog (sent or failed)."""
    es = _get_settings()
    if not es:
        raise RuntimeError("EmailSettings not configured. Configure in admin first.")

    if template_key and not template:
        template = EmailTemplate.objects.filter(key=template_key, is_active=True).first()
        if not template:
            raise EmailTemplate.DoesNotExist(f"No active template with key={template_key}")

    ctx = context or {}
    if template:
        subject, html, text = template.render(ctx)
    else:
        subject = raw_subject or ''
        html = raw_html or ''
        text = raw_text or ''

    if es.signature_html and '{{signature}}' in html:
        html = html.replace('{{signature}}', es.signature_html)
    elif es.signature_html and not raw_html:
        html = html + es.signature_html

    log = EmailLog.objects.create(
        template=template,
        to_email=to_email,
        to_name=to_name,
        from_email=es.from_email,
        from_name=es.from_name,
        cc=', '.join(cc or []),
        bcc=', '.join(bcc or []),
        reply_to=es.reply_to,
        subject=subject,
        body_html=html,
        body_text=text,
        status='queued',
        sent_by=sent_by,
        **(related or {}),
    )

    html_with_tracking = _inject_tracking(log, html)
    log.body_html = html_with_tracking
    log.save(update_fields=['body_html'])

    try:
        from_addr = f"{es.from_name} <{es.from_email}>"
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text or _strip_html(html),
            from_email=from_addr,
            to=[f"{to_name} <{to_email}>"] if to_name else [to_email],
            cc=cc or None,
            bcc=bcc or None,
            reply_to=[es.reply_to] if es.reply_to else None,
            connection=_build_connection(es) if es.smtp_user else None,
        )
        msg.attach_alternative(html_with_tracking, 'text/html')
        msg.send(fail_silently=False)
        log.status = 'sent'
        log.sent_at = timezone.now()
        log.save(update_fields=['status', 'sent_at'])
    except Exception as exc:
        logger.exception("Email send failed for log=%s", log.id)
        log.status = 'failed'
        log.error_message = str(exc)
        log.save(update_fields=['status', 'error_message'])

    return log


def _strip_html(html: str) -> str:
    import re
    return re.sub(r'<[^>]+>', '', html)


# ─── Convenience wrappers ─────────────────────────────────────────────────────

def send_lead_welcome(lead, sent_by=None) -> EmailLog | None:
    if not lead.email:
        return None
    return send_email(
        template_key='welcome_lead',
        to_email=lead.email,
        to_name=lead.full_name,
        context={
            'name': lead.full_name,
            'company': lead.company_name or '',
            'service': ', '.join(lead.service_interest or []) or 'our services',
        },
        related={'lead': lead},
        sent_by=sent_by,
    )


def send_quote(quote, recipient_email: str, recipient_name: str = '', sent_by=None) -> EmailLog:
    return send_email(
        template_key='quote_sent',
        to_email=recipient_email,
        to_name=recipient_name,
        context={
            'name': recipient_name,
            'quote_number': quote.number,
            'quote_title': quote.title,
            'total': f"{quote.currency} {quote.total:,.2f}",
            'valid_until': quote.valid_until.strftime('%d %b %Y') if quote.valid_until else '',
        },
        related={'quote': quote, 'lead': quote.lead, 'client': quote.client},
        sent_by=sent_by,
    )


def send_invoice(invoice, recipient_email: str, recipient_name: str = '', sent_by=None) -> EmailLog:
    return send_email(
        template_key='invoice_sent',
        to_email=recipient_email,
        to_name=recipient_name,
        context={
            'name': recipient_name,
            'invoice_number': invoice.number,
            'amount': f"{invoice.currency} {invoice.total:,.2f}",
            'due_date': invoice.due_date.strftime('%d %b %Y') if invoice.due_date else '',
            'payment_instructions': invoice.payment_instructions or '',
        },
        related={'invoice': invoice, 'client': invoice.client, 'project': invoice.project},
        sent_by=sent_by,
    )


def send_payment_receipt(payment, recipient_email: str, recipient_name: str = '', sent_by=None) -> EmailLog:
    inv = payment.invoice
    return send_email(
        template_key='payment_received',
        to_email=recipient_email,
        to_name=recipient_name,
        context={
            'name': recipient_name,
            'invoice_number': inv.number,
            'amount': f"{inv.currency} {payment.amount:,.2f}",
            'method': payment.get_method_display(),
            'reference': payment.reference or '',
            'remaining': f"{inv.currency} {inv.amount_due:,.2f}",
        },
        related={'invoice': inv, 'client': inv.client},
        sent_by=sent_by,
    )


def send_payment_reminder(invoice, recipient_email: str, recipient_name: str = '', stage: int = 1, sent_by=None) -> EmailLog:
    template_key = f'payment_reminder_{stage}'
    return send_email(
        template_key=template_key,
        to_email=recipient_email,
        to_name=recipient_name,
        context={
            'name': recipient_name,
            'invoice_number': invoice.number,
            'amount_due': f"{invoice.currency} {invoice.amount_due:,.2f}",
            'due_date': invoice.due_date.strftime('%d %b %Y') if invoice.due_date else '',
            'days_overdue': (timezone.now().date() - invoice.due_date).days if invoice.due_date else 0,
        },
        related={'invoice': invoice, 'client': invoice.client},
        sent_by=sent_by,
    )
