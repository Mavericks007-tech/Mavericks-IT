from django.db.models import Count, Sum
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import (
    Activity, Client, Contact, Invoice, Lead, Milestone, Note,
    Payment, Project, Quote, Task,
)
from .serializers import (
    ActivitySerializer, ClientSerializer, ContactSerializer, InvoiceSerializer,
    LeadSerializer, MilestoneSerializer, NoteSerializer, PaymentSerializer,
    ProjectSerializer, PublicLeadSerializer, QuoteSerializer, TaskSerializer,
)


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().prefetch_related('contacts')
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['industry', 'is_vip', 'account_manager']
    search_fields = ['company_name', 'website', 'tin_number']
    ordering_fields = ['company_name', 'created_at', 'health_score']


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.select_related('client')
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['client', 'is_primary', 'is_decision_maker']
    search_fields = ['full_name', 'email', 'phone']


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'score', 'priority', 'source', 'industry', 'assigned_to']
    search_fields = ['full_name', 'email', 'phone', 'company_name']
    ordering_fields = ['created_at', 'score_value', 'next_follow_up']

    @action(detail=False, methods=['get'])
    def pipeline(self, request):
        counts = Lead.objects.values('status').annotate(count=Count('id'))
        return Response({row['status']: row['count'] for row in counts})

    @action(detail=True, methods=['post'])
    def convert(self, request, pk=None):
        lead = self.get_object()
        client, _ = Client.objects.get_or_create(
            company_name=lead.company_name or lead.full_name,
            defaults={'industry': lead.industry},
        )
        if not lead.company_name:
            Contact.objects.get_or_create(
                client=client, full_name=lead.full_name,
                defaults={
                    'email': lead.email, 'phone': lead.phone,
                    'whatsapp': lead.whatsapp, 'is_primary': True,
                },
            )
        lead.mark_won(client=client)
        return Response({'client_id': str(client.id), 'lead_id': str(lead.id)})


class PublicLeadView(viewsets.GenericViewSet, viewsets.mixins.CreateModelMixin):
    """Public contact-form endpoint — anonymous lead creation."""
    queryset = Lead.objects.none()
    serializer_class = PublicLeadSerializer
    permission_classes = [AllowAny]


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related('client', 'project_manager').prefetch_related('milestones', 'team_members')
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['stage', 'priority', 'service_type', 'project_manager', 'client']
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['created_at', 'due_date', 'progress_percent']

    @action(detail=False, methods=['get'])
    def kanban(self, request):
        data = {}
        for stage, _ in Project._meta.get_field('stage').choices:
            qs = self.queryset.filter(stage=stage)
            data[stage] = self.get_serializer(qs, many=True).data
        return Response(data)


class MilestoneViewSet(viewsets.ModelViewSet):
    queryset = Milestone.objects.select_related('project')
    serializer_class = MilestoneSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['project', 'is_completed']


class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.prefetch_related('line_items')
    serializer_class = QuoteSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'service_type', 'client', 'lead']
    search_fields = ['number', 'title']
    ordering_fields = ['issue_date', 'total', 'created_at']


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related('client', 'project').prefetch_related('line_items', 'payments')
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'client', 'project', 'currency']
    search_fields = ['number', 'client__company_name']
    ordering_fields = ['issue_date', 'due_date', 'total']

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        from django.utils import timezone
        qs = self.queryset.exclude(status__in=['paid', 'cancelled']).filter(due_date__lt=timezone.now().date())
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        totals = self.queryset.aggregate(
            total_billed=Sum('total'),
            total_paid=Sum('amount_paid'),
        )
        return Response(totals)


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('invoice')
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['invoice', 'method', 'verified']
    ordering_fields = ['paid_at', 'amount']


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'priority', 'assigned_to', 'lead', 'client', 'project']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'priority', 'created_at']


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['activity_type', 'lead', 'client', 'project', 'performed_by']
    ordering_fields = ['occurred_at']


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['lead', 'client', 'project', 'author', 'is_pinned']
