from rest_framework import serializers

from .models import (
    Activity, Client, Comment, Contact, Invoice, InvoiceLineItem, Lead,
    Milestone, Note, Payment, Project, ProjectFile, Quote, QuoteLineItem, Task,
)


# ─── Client / Contact ─────────────────────────────────────────────────────────

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = [
            'id', 'client', 'full_name', 'designation', 'email', 'phone',
            'whatsapp', 'is_primary', 'is_decision_maker', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ClientSerializer(serializers.ModelSerializer):
    contacts = ContactSerializer(many=True, read_only=True)
    lifetime_value = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = Client
        fields = [
            'id', 'company_name', 'industry', 'website', 'logo',
            'billing_address', 'tin_number', 'vat_number',
            'account_manager', 'health_score', 'is_vip', 'notes',
            'lifetime_value', 'contacts', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'lifetime_value']


# ─── Lead ─────────────────────────────────────────────────────────────────────

class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = [
            'id', 'full_name', 'email', 'phone', 'whatsapp',
            'company_name', 'designation', 'industry',
            'source', 'source_detail', 'service_interest',
            'budget_min', 'budget_max', 'timeline',
            'status', 'score', 'score_value', 'priority',
            'assigned_to', 'next_follow_up', 'last_contacted_at',
            'converted_to_client', 'converted_at',
            'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'converted_at', 'created_at', 'updated_at']


class PublicLeadSerializer(serializers.ModelSerializer):
    """Restricted fields for public contact-form submissions."""

    class Meta:
        model = Lead
        fields = [
            'full_name', 'email', 'phone', 'whatsapp',
            'company_name', 'industry',
            'service_interest', 'budget_min', 'budget_max', 'timeline', 'notes',
        ]

    def create(self, validated_data):
        validated_data.setdefault('source', 'website')
        validated_data.setdefault('status', 'new')
        return super().create(validated_data)


# ─── Project ──────────────────────────────────────────────────────────────────

class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = [
            'id', 'project', 'title', 'description', 'due_date',
            'is_completed', 'completed_at', 'order',
        ]
        read_only_fields = ['id']


class ProjectSerializer(serializers.ModelSerializer):
    milestones = MilestoneSerializer(many=True, read_only=True)
    client_name = serializers.CharField(source='client.company_name', read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'code', 'client', 'client_name', 'description', 'service_type',
            'stage', 'priority', 'progress_percent',
            'start_date', 'due_date', 'completed_at',
            'contract_value', 'budget_spent',
            'project_manager', 'team_members',
            'milestones', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ─── Quote ────────────────────────────────────────────────────────────────────

class QuoteLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteLineItem
        fields = ['id', 'description', 'quantity', 'rate', 'amount', 'order']
        read_only_fields = ['id', 'amount']


class QuoteSerializer(serializers.ModelSerializer):
    line_items = QuoteLineItemSerializer(many=True, required=False)

    class Meta:
        model = Quote
        fields = [
            'id', 'number', 'lead', 'client',
            'title', 'description', 'service_type',
            'issue_date', 'valid_until',
            'subtotal', 'discount', 'vat_percent', 'vat_amount', 'total', 'currency',
            'status', 'sent_at', 'viewed_at', 'view_count', 'accepted_at',
            'payment_terms', 'inclusions', 'exclusions', 'cover_letter',
            'created_by', 'line_items', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'subtotal', 'vat_amount', 'total',
            'sent_at', 'viewed_at', 'view_count', 'accepted_at',
            'created_at', 'updated_at',
        ]

    def create(self, validated_data):
        items = validated_data.pop('line_items', [])
        quote = super().create(validated_data)
        for item in items:
            QuoteLineItem.objects.create(quote=quote, **item)
        quote.recalculate()
        return quote

    def update(self, instance, validated_data):
        items = validated_data.pop('line_items', None)
        instance = super().update(instance, validated_data)
        if items is not None:
            instance.line_items.all().delete()
            for item in items:
                QuoteLineItem.objects.create(quote=instance, **item)
        instance.recalculate()
        return instance


# ─── Invoice ──────────────────────────────────────────────────────────────────

class InvoiceLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLineItem
        fields = ['id', 'description', 'quantity', 'rate', 'amount', 'order']
        read_only_fields = ['id', 'amount']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'invoice', 'amount', 'method', 'reference',
            'paid_at', 'verified', 'notes', 'received_by', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class InvoiceSerializer(serializers.ModelSerializer):
    line_items = InvoiceLineItemSerializer(many=True, required=False)
    payments = PaymentSerializer(many=True, read_only=True)
    amount_due = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'number', 'client', 'project', 'quote',
            'issue_date', 'due_date',
            'subtotal', 'discount', 'vat_percent', 'vat_amount', 'total',
            'amount_paid', 'amount_due', 'is_overdue', 'currency',
            'status', 'sent_at', 'viewed_at', 'paid_at',
            'notes', 'payment_instructions',
            'line_items', 'payments', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'subtotal', 'vat_amount', 'total', 'amount_paid',
            'sent_at', 'viewed_at', 'paid_at', 'created_at', 'updated_at',
        ]

    def create(self, validated_data):
        items = validated_data.pop('line_items', [])
        invoice = super().create(validated_data)
        for item in items:
            InvoiceLineItem.objects.create(invoice=invoice, **item)
        invoice.recalculate()
        return invoice

    def update(self, instance, validated_data):
        items = validated_data.pop('line_items', None)
        instance = super().update(instance, validated_data)
        if items is not None:
            instance.line_items.all().delete()
            for item in items:
                InvoiceLineItem.objects.create(invoice=instance, **item)
        instance.recalculate()
        return instance


# ─── Task / Activity / Note ───────────────────────────────────────────────────

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority',
            'assigned_to', 'created_by',
            'lead', 'client', 'project',
            'due_date', 'completed_at', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = [
            'id', 'activity_type', 'subject', 'content', 'occurred_at',
            'lead', 'client', 'project', 'contact', 'performed_by',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = [
            'id', 'body', 'is_pinned',
            'lead', 'client', 'project', 'author',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = ProjectFile
        fields = [
            'id', 'project', 'file', 'file_url', 'filename',
            'size_bytes', 'content_type', 'source',
            'uploaded_by', 'uploaded_by_name', 'note',
            'created_at',
        ]
        read_only_fields = ['id', 'filename', 'size_bytes', 'created_at', 'uploaded_by_name']

    def get_file_url(self, obj):
        try:
            request = self.context.get('request')
            url = obj.file.url
            return request.build_absolute_uri(url) if request else url
        except Exception:
            return ''


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    mentions = serializers.PrimaryKeyRelatedField(many=True, queryset=Comment._meta.get_field('mentions').related_model.objects.all(), required=False)
    mention_names = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'body',
            'lead', 'client', 'project', 'quote', 'invoice',
            'author', 'author_name', 'mentions', 'mention_names',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'author_name', 'mention_names']

    def get_mention_names(self, obj):
        return list(obj.mentions.values_list('username', flat=True))
