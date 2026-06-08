import secrets

from django.db import models
from django.utils import timezone

from core.models import BaseModel


def _generate_token():
    return secrets.token_urlsafe(32)


class PortalToken(BaseModel):
    """Magic-link / API token for a Contact to access their company's portal."""
    contact = models.ForeignKey(
        'crm.Contact', on_delete=models.CASCADE, related_name='portal_tokens',
    )
    token = models.CharField(max_length=80, unique=True, default=_generate_token)
    expires_at = models.DateTimeField(null=True, blank=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    is_revoked = models.BooleanField(default=False)
    label = models.CharField(max_length=100, blank=True, help_text="e.g. 'Mobile App' or 'Browser'")

    class Meta:
        db_table = 'portal_token'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.contact.full_name} ({self.token[:8]}…)"

    @property
    def is_valid(self):
        if self.is_revoked:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return True
