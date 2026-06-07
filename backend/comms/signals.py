"""Auto-fire emails on CRM events. Toggle via EmailSettings if needed."""
from __future__ import annotations

import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)


@receiver(post_save, sender='crm.Lead')
def lead_welcome_on_create(sender, instance, created, **kwargs):
    """Send welcome email to new leads with valid email."""
    if not created:
        return
    if not instance.email:
        return
    try:
        from .services import send_lead_welcome
        send_lead_welcome(instance)
    except Exception:
        logger.exception("Failed to send lead welcome email for lead=%s", instance.id)


@receiver(post_save, sender='crm.Payment')
def payment_receipt_on_verify(sender, instance, created, **kwargs):
    """Send receipt when payment is verified. Skip if no primary contact."""
    if not instance.verified:
        return
    try:
        contact = instance.invoice.client.contacts.filter(is_primary=True).first()
        if not contact or not contact.email:
            return
        from .services import send_payment_receipt
        send_payment_receipt(instance, contact.email, contact.full_name)
    except Exception:
        logger.exception("Failed to send payment receipt for payment=%s", instance.id)
