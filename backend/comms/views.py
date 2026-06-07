import base64

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import EmailCampaign, EmailLog, EmailTemplate
from .serializers import (
    EmailCampaignSerializer, EmailLogSerializer,
    EmailSendSerializer, EmailTemplateSerializer,
)
from .services import send_email

# 1x1 transparent GIF
PIXEL = base64.b64decode(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
)


def tracking_pixel(request, log_id):
    """Return 1x1 GIF + mark EmailLog as opened."""
    log = EmailLog.objects.filter(id=log_id).first()
    if log:
        log.mark_opened()
    return HttpResponse(PIXEL, content_type='image/gif')


class EmailTemplateViewSet(viewsets.ModelViewSet):
    queryset = EmailTemplate.objects.all()
    serializer_class = EmailTemplateSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['category', 'is_active']
    search_fields = ['key', 'name', 'subject']
    lookup_field = 'key'


class EmailLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EmailLog.objects.all()
    serializer_class = EmailLogSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'template', 'lead', 'client', 'invoice', 'quote']
    search_fields = ['to_email', 'subject']

    @action(detail=False, methods=['post'])
    def send(self, request):
        """Send an ad-hoc email via template + context."""
        ser = EmailSendSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        log = send_email(
            template_key=data['template_key'],
            to_email=data['to_email'],
            to_name=data.get('to_name', ''),
            context=data.get('context', {}),
            cc=data.get('cc'),
            bcc=data.get('bcc'),
            related=data.get('related', {}),
            sent_by=request.user if request.user.is_authenticated else None,
        )
        return Response(EmailLogSerializer(log).data, status=status.HTTP_201_CREATED)


class EmailCampaignViewSet(viewsets.ModelViewSet):
    queryset = EmailCampaign.objects.all()
    serializer_class = EmailCampaignSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'template']

    @action(detail=True, methods=['post'])
    def run(self, request, pk=None):
        """Trigger campaign send to all targets now."""
        from django.utils import timezone
        campaign = self.get_object()
        campaign.status = 'sending'
        campaign.started_at = timezone.now()
        campaign.save(update_fields=['status', 'started_at'])

        sent = failed = 0

        for lead in campaign.target_leads.all():
            if not lead.email:
                continue
            try:
                log = send_email(
                    template_key=campaign.template.key,
                    to_email=lead.email,
                    to_name=lead.full_name,
                    context={'name': lead.full_name, 'company': lead.company_name or ''},
                    related={'lead': lead},
                    sent_by=request.user if request.user.is_authenticated else None,
                )
                if log.status == 'sent':
                    sent += 1
                else:
                    failed += 1
            except Exception:
                failed += 1

        for client in campaign.target_clients.all():
            contact = client.contacts.filter(is_primary=True).first()
            if not contact or not contact.email:
                continue
            try:
                log = send_email(
                    template_key=campaign.template.key,
                    to_email=contact.email,
                    to_name=contact.full_name,
                    context={'name': contact.full_name, 'company': client.company_name},
                    related={'client': client, 'contact': contact},
                    sent_by=request.user if request.user.is_authenticated else None,
                )
                if log.status == 'sent':
                    sent += 1
                else:
                    failed += 1
            except Exception:
                failed += 1

        campaign.sent_count = sent
        campaign.failed_count = failed
        campaign.status = 'completed'
        campaign.completed_at = timezone.now()
        campaign.save(update_fields=['sent_count', 'failed_count', 'status', 'completed_at'])

        return Response({'sent': sent, 'failed': failed})
