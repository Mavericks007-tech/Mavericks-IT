import csv
import io
import re

from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import (
    Activity,
    Client,
    Comment,
    Contact,
    Invoice,
    Lead,
    Milestone,
    Note,
    Payment,
    Project,
    ProjectFile,
    Quote,
    Task,
)
from .pdf import render_invoice_pdf, render_quote_pdf
from .serializers import (
    ActivitySerializer,
    ClientSerializer,
    CommentSerializer,
    ContactSerializer,
    InvoiceSerializer,
    LeadSerializer,
    MilestoneSerializer,
    NoteSerializer,
    PaymentSerializer,
    ProjectFileSerializer,
    ProjectSerializer,
    PublicLeadSerializer,
    QuoteSerializer,
    TaskSerializer,
)

User = get_user_model()
MENTION_RE = re.compile(r'@([A-Za-z0-9_.+-]+)')

LEAD_CSV_FIELDS = [
    'full_name', 'email', 'phone', 'whatsapp', 'company_name', 'industry',
    'source', 'status', 'score', 'priority', 'budget_min', 'budget_max',
    'service_interest', 'notes',
]
CLIENT_CSV_FIELDS = [
    'company_name', 'industry', 'website', 'tin_number', 'is_vip',
    'health_score', 'billing_address', 'notes',
]


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().prefetch_related('contacts')
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['industry', 'is_vip', 'account_manager']
    search_fields = ['company_name', 'website', 'tin_number']
    ordering_fields = ['company_name', 'created_at', 'health_score']

    @action(detail=False, methods=['get'], url_path='export.csv')
    def export_csv(self, request):
        return _csv_export(self.filter_queryset(self.get_queryset()), CLIENT_CSV_FIELDS, 'clients.csv')

    @action(detail=False, methods=['post'], url_path='import-csv',
            parser_classes=[MultiPartParser, FormParser])
    def import_csv(self, request):
        return _csv_import(request, Client, CLIENT_CSV_FIELDS, unique='company_name')


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

    @action(detail=False, methods=['post'], url_path='bulk-action')
    def bulk_action(self, request):
        """Apply one action to a list of lead IDs.

        Body: {ids: ["uuid", …], action: "assign|status|score|delete", value?: …}
          assign → value = user_id
          status → value = "new"|"contacted"|"qualified"|...
          score  → value = "hot"|"warm"|"cold"
          delete → no value
        """
        ids = request.data.get('ids') or []
        act = request.data.get('action')
        value = request.data.get('value')
        if not isinstance(ids, list) or not ids:
            return Response({'detail': 'ids[] required'}, status=400)
        qs = Lead.objects.filter(id__in=ids)
        count = qs.count()

        if act == 'assign':
            qs.update(assigned_to_id=value)
        elif act == 'status':
            if value not in {c[0] for c in Lead._meta.get_field('status').choices}:
                return Response({'detail': f'invalid status {value}'}, status=400)
            qs.update(status=value)
        elif act == 'score':
            if value not in {c[0] for c in Lead._meta.get_field('score').choices}:
                return Response({'detail': f'invalid score {value}'}, status=400)
            qs.update(score=value)
        elif act == 'delete':
            qs.delete()
        else:
            return Response({'detail': f'unknown action {act}'}, status=400)

        return Response({'ok': True, 'affected': count})

    @action(detail=False, methods=['get'], url_path='export.csv')
    def export_csv(self, request):
        return _csv_export(self.filter_queryset(self.get_queryset()), LEAD_CSV_FIELDS, 'leads.csv')

    @action(detail=False, methods=['post'], url_path='import-csv',
            parser_classes=[MultiPartParser, FormParser])
    def import_csv(self, request):
        return _csv_import(request, Lead, LEAD_CSV_FIELDS, unique='email')


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

    @action(detail=True, methods=['get'], url_path='pdf')
    def pdf(self, request, pk=None):
        quote = self.get_object()
        body = render_quote_pdf(quote)
        resp = HttpResponse(body, content_type='application/pdf')
        resp['Content-Disposition'] = f'inline; filename="Quote-{quote.number}.pdf"'
        return resp


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

    @action(detail=True, methods=['get'], url_path='pdf')
    def pdf(self, request, pk=None):
        invoice = self.get_object()
        body = render_invoice_pdf(invoice)
        resp = HttpResponse(body, content_type='application/pdf')
        resp['Content-Disposition'] = f'inline; filename="Invoice-{invoice.number}.pdf"'
        return resp

    @action(detail=True, methods=['post'], url_path='record-payment')
    def record_payment(self, request, pk=None):
        """Quick-record a payment against this invoice.

        Body: {amount, method, reference?, notes?, verified?}
        """
        invoice = self.get_object()
        data = {**request.data, 'invoice': invoice.id}
        ser = PaymentSerializer(data=data)
        ser.is_valid(raise_exception=True)
        payment = ser.save(received_by=request.user if request.user.is_authenticated else None)
        invoice.recalculate()
        return Response(PaymentSerializer(payment).data, status=201)


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


# ---------------------------------------------------------------------------
# Timeline — flat feed of Activity + Note + Task scoped to a parent entity
# ---------------------------------------------------------------------------
class TimelineView(viewsets.ViewSet):
    """GET /api/v1/crm/timeline/?lead=<id>  → flat reverse-chrono feed."""
    permission_classes = [IsAuthenticated]

    def list(self, request):
        kw = {}
        for k in ('lead', 'client', 'project'):
            v = request.query_params.get(k)
            if v:
                kw[k + '_id'] = v
        if not kw:
            return Response({'detail': 'pass one of lead, client, project'}, status=400)

        acts  = [{'kind': 'activity', **ActivitySerializer(a).data} for a in Activity.objects.filter(**kw)]
        notes = [{'kind': 'note',     **NoteSerializer(n).data}     for n in Note.objects.filter(**kw)]
        tasks = [{'kind': 'task',     **TaskSerializer(t).data}     for t in Task.objects.filter(**kw)]

        feed = acts + notes + tasks
        feed.sort(key=lambda x: x.get('occurred_at') or x.get('created_at') or '', reverse=True)
        return Response({'results': feed, 'count': len(feed)})


# ---------------------------------------------------------------------------
# Project files
# ---------------------------------------------------------------------------
class ProjectFileViewSet(viewsets.ModelViewSet):
    queryset = ProjectFile.objects.select_related('project', 'uploaded_by')
    serializer_class = ProjectFileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filterset_fields = ['project', 'source']

    def perform_create(self, serializer):
        serializer.save(
            uploaded_by=self.request.user if self.request.user.is_authenticated else None,
            source='agency',
        )


# ---------------------------------------------------------------------------
# Comments + @mentions (auto-extracted from body, mentioned users emailed)
# ---------------------------------------------------------------------------
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related('author').prefetch_related('mentions')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['lead', 'client', 'project', 'quote', 'invoice', 'author']

    def perform_create(self, serializer):
        comment = serializer.save(
            author=self.request.user if self.request.user.is_authenticated else None,
        )
        self._attach_mentions(comment)

    def perform_update(self, serializer):
        comment = serializer.save()
        self._attach_mentions(comment)

    def _attach_mentions(self, comment):
        usernames = set(MENTION_RE.findall(comment.body or ''))
        if not usernames:
            return
        users = list(User.objects.filter(username__in=usernames))
        comment.mentions.set(users)
        self._notify(comment, users)

    def _notify(self, comment, users):
        from django.conf import settings as dj
        from django.core.mail import send_mail
        author = getattr(comment.author, 'username', 'someone')
        subject = f'[{author}] mentioned you in a comment'
        for u in users:
            if not u.email or u.id == getattr(comment.author, 'id', None):
                continue
            try:
                send_mail(
                    subject=subject,
                    message=f'{author} mentioned you:\n\n{comment.body}\n\n— Mavericks Tech',
                    from_email=getattr(dj, 'DEFAULT_FROM_EMAIL', 'noreply@maverickstech.com.bd'),
                    recipient_list=[u.email],
                    fail_silently=True,
                )
            except Exception:
                pass


# ---------------------------------------------------------------------------
# CSV helpers
# ---------------------------------------------------------------------------
def _csv_export(qs, fields, filename):
    resp = HttpResponse(content_type='text/csv')
    resp['Content-Disposition'] = f'attachment; filename="{filename}"'
    writer = csv.writer(resp)
    writer.writerow(fields)
    for obj in qs:
        row = []
        for f in fields:
            v = getattr(obj, f, '')
            if isinstance(v, list):
                v = ', '.join(map(str, v))
            row.append('' if v is None else str(v))
        writer.writerow(row)
    return resp


def _csv_import(request, model_cls, fields, unique=None):
    f = request.FILES.get('file')
    if not f:
        return Response({'detail': 'file= required (multipart)'}, status=400)
    text = f.read().decode('utf-8-sig', errors='replace')
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        return Response({'detail': 'empty or unreadable CSV'}, status=400)
    unknown = [c for c in reader.fieldnames if c not in fields]
    created, updated, errors = 0, 0, []
    for i, row in enumerate(reader, start=2):
        clean = {k: (v.strip() if isinstance(v, str) else v) for k, v in row.items() if k in fields}
        # Coerce list fields like service_interest
        for list_field in ('service_interest',):
            if list_field in clean and isinstance(clean[list_field], str):
                clean[list_field] = [x.strip() for x in clean[list_field].split(',') if x.strip()]
        try:
            if unique and clean.get(unique):
                obj, was_created = model_cls.objects.update_or_create(
                    **{unique: clean[unique]}, defaults=clean
                )
                created += int(was_created)
                updated += int(not was_created)
            else:
                model_cls.objects.create(**clean)
                created += 1
        except Exception as exc:
            errors.append({'row': i, 'error': str(exc)})
    return Response({
        'created': created, 'updated': updated,
        'errors': errors, 'unknown_columns': unknown,
    })
