"""Custom DRF auth: `Authorization: Bearer <portal-token>` resolves to a Contact."""
from django.utils import timezone
from rest_framework import authentication, exceptions

from .models import PortalToken


class PortalContact:
    """Pseudo-user wrapping a Contact for DRF request.user."""
    is_authenticated = True
    is_anonymous = False
    is_active = True
    is_staff = False
    is_superuser = False

    def __init__(self, contact):
        self.contact = contact
        self.client = contact.client
        self.id = contact.id
        self.pk = contact.id
        self.username = contact.email or str(contact.id)

    def __str__(self):
        return f"PortalContact({self.contact.full_name})"


class PortalTokenAuthentication(authentication.BaseAuthentication):
    keyword = 'Bearer'

    def authenticate(self, request):
        header = authentication.get_authorization_header(request).decode('utf-8', errors='ignore')
        if not header or not header.lower().startswith(self.keyword.lower() + ' '):
            return None
        token_str = header[len(self.keyword) + 1:].strip()
        if not token_str:
            return None
        try:
            token = PortalToken.objects.select_related('contact__client').get(token=token_str)
        except PortalToken.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid portal token.')
        if not token.is_valid:
            raise exceptions.AuthenticationFailed('Token revoked or expired.')
        token.last_used_at = timezone.now()
        token.save(update_fields=['last_used_at'])
        return (PortalContact(token.contact), token)

    def authenticate_header(self, request):
        return self.keyword
