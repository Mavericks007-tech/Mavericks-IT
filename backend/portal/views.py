"""Client-facing portal endpoints. Scoped to the authenticated Contact's Client."""
from rest_framework import permissions, viewsets
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from crm.models import Invoice, Milestone, Payment, Project, Quote
from crm.serializers import (
    InvoiceSerializer, MilestoneSerializer, PaymentSerializer,
    ProjectSerializer, QuoteSerializer,
)

from .auth import PortalContact, PortalTokenAuthentication


class IsPortalContact(permissions.BasePermission):
    def has_permission(self, request, view):
        return isinstance(request.user, PortalContact)


class PortalViewSet(viewsets.ReadOnlyModelViewSet):
    """Base for portal viewsets — scopes everything to request.user.client."""
    authentication_classes = [PortalTokenAuthentication]
    permission_classes = [IsPortalContact]

    def get_queryset(self):
        return self.queryset.filter(client=self.request.user.client)


class PortalProjectViewSet(PortalViewSet):
    queryset = Project.objects.all().select_related('client').prefetch_related('milestones')
    serializer_class = ProjectSerializer


class PortalInvoiceViewSet(PortalViewSet):
    queryset = Invoice.objects.all().prefetch_related('line_items', 'payments')
    serializer_class = InvoiceSerializer


class PortalQuoteViewSet(PortalViewSet):
    queryset = Quote.objects.all().prefetch_related('line_items')
    serializer_class = QuoteSerializer


class PortalMilestoneViewSet(viewsets.ReadOnlyModelViewSet):
    """Milestones scoped via project__client."""
    serializer_class = MilestoneSerializer
    authentication_classes = [PortalTokenAuthentication]
    permission_classes = [IsPortalContact]

    def get_queryset(self):
        return Milestone.objects.filter(project__client=self.request.user.client)


class PortalPaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    authentication_classes = [PortalTokenAuthentication]
    permission_classes = [IsPortalContact]

    def get_queryset(self):
        return Payment.objects.filter(invoice__client=self.request.user.client)


@api_view(['GET'])
@authentication_classes([PortalTokenAuthentication])
@permission_classes([IsPortalContact])
def portal_me(request):
    """Return the authenticated contact + their company summary."""
    c = request.user.contact
    client = c.client
    from django.db.models import Count, Sum
    inv_agg = Invoice.objects.filter(client=client).aggregate(
        total_billed=Sum('total'),
        total_paid=Sum('amount_paid'),
        count=Count('id'),
    )
    return Response({
        'contact': {
            'id': str(c.id),
            'full_name': c.full_name,
            'email': c.email,
            'designation': c.designation,
            'is_primary': c.is_primary,
            'is_decision_maker': c.is_decision_maker,
        },
        'client': {
            'id': str(client.id),
            'company_name': client.company_name,
            'industry': client.get_industry_display(),
            'is_vip': client.is_vip,
            'logo': client.logo.url if client.logo else None,
        },
        'summary': {
            'projects': Project.objects.filter(client=client).count(),
            'active_projects': Project.objects.filter(
                client=client,
            ).exclude(stage__in=['completed', 'cancelled']).count(),
            'invoices': inv_agg.get('count') or 0,
            'total_billed': float(inv_agg.get('total_billed') or 0),
            'total_paid': float(inv_agg.get('total_paid') or 0),
            'open_quotes': Quote.objects.filter(
                client=client, status__in=['sent', 'viewed'],
            ).count(),
        },
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def request_portal_access(request):
    """Public endpoint: contact submits email → generate token → email magic link.

    Returns 202 always (no enumeration). Email sent only if a primary
    contact with that address exists.
    """
    from comms.services import send_email
    from crm.models import Contact

    from .models import PortalToken

    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response({'detail': 'Email required.'}, status=400)

    contact = Contact.objects.filter(email__iexact=email).first()
    if contact:
        token = PortalToken.objects.create(contact=contact, label='Magic link')
        portal_url = f"{_base_url(request)}/portal/login?token={token.token}"
        try:
            send_email(
                to_email=contact.email,
                to_name=contact.full_name,
                raw_subject="Your Mavericks Tech portal access link",
                raw_html=(
                    f"<p>Hi {contact.full_name},</p>"
                    f"<p>Click the link below to access your client portal:</p>"
                    f'<p><a href="{portal_url}">{portal_url}</a></p>'
                    "<p>The link grants access for this session. If you did not request it, ignore this email.</p>"
                ),
                related={'client': contact.client, 'contact': contact},
            )
        except Exception:
            pass

    return Response({'detail': 'If that email matches a registered contact, a portal link is on the way.'}, status=202)


def _base_url(request):
    from django.conf import settings
    return getattr(settings, 'BASE_URL', f"{request.scheme}://{request.get_host()}")
