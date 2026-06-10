from django.contrib import admin
from django.utils.html import format_html
from simple_history.admin import SimpleHistoryAdmin

from .models import (
    Activity,
    Client,
    Contact,
    Invoice,
    InvoiceLineItem,
    Lead,
    Milestone,
    Note,
    Payment,
    Project,
    Quote,
    QuoteLineItem,
    Task,
)

# ─── Inlines ──────────────────────────────────────────────────────────────────

class ContactInline(admin.TabularInline):
    model = Contact
    extra = 0
    fields = ('full_name', 'designation', 'email', 'phone', 'whatsapp', 'is_primary', 'is_decision_maker')


class NoteInline(admin.TabularInline):
    model = Note
    extra = 0
    fields = ('body', 'is_pinned', 'author', 'created_at')
    readonly_fields = ('created_at',)


class ActivityInline(admin.TabularInline):
    model = Activity
    extra = 0
    fields = ('activity_type', 'subject', 'occurred_at', 'performed_by')
    readonly_fields = ('occurred_at',)
    ordering = ('-occurred_at',)


class TaskInline(admin.TabularInline):
    model = Task
    extra = 0
    fk_name = 'project'
    fields = ('title', 'status', 'priority', 'assigned_to', 'due_date')


class MilestoneInline(admin.TabularInline):
    model = Milestone
    extra = 0
    fields = ('title', 'due_date', 'is_completed', 'completed_at', 'order')


class QuoteLineItemInline(admin.TabularInline):
    model = QuoteLineItem
    extra = 1
    fields = ('description', 'quantity', 'rate', 'amount', 'order')
    readonly_fields = ('amount',)


class InvoiceLineItemInline(admin.TabularInline):
    model = InvoiceLineItem
    extra = 1
    fields = ('description', 'quantity', 'rate', 'amount', 'order')
    readonly_fields = ('amount',)


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    fields = ('amount', 'method', 'reference', 'paid_at', 'verified', 'received_by')


# ─── Client ───────────────────────────────────────────────────────────────────

@admin.register(Client)
class ClientAdmin(SimpleHistoryAdmin):
    list_display = (
        'company_name', 'industry', 'account_manager', 'is_vip',
        'health_score', 'lifetime_value_display', 'updated_at',
    )
    list_filter = ('industry', 'is_vip', 'account_manager')
    search_fields = ('company_name', 'website', 'tin_number', 'vat_number')
    autocomplete_fields = ('account_manager',)
    inlines = [ContactInline, NoteInline, ActivityInline]
    fieldsets = (
        ('Identity', {'fields': ('company_name', 'industry', 'website', 'logo')}),
        ('Billing', {'fields': ('billing_address', 'tin_number', 'vat_number')}),
        ('Relationship', {'fields': ('account_manager', 'health_score', 'is_vip', 'notes')}),
    )

    @admin.display(description='Lifetime Value')
    def lifetime_value_display(self, obj):
        return f"৳{obj.lifetime_value:,.0f}"


@admin.register(Contact)
class ContactAdmin(SimpleHistoryAdmin):
    list_display = ('full_name', 'client', 'designation', 'email', 'phone', 'is_primary', 'is_decision_maker')
    list_filter = ('is_primary', 'is_decision_maker', 'client__industry')
    search_fields = ('full_name', 'email', 'phone', 'client__company_name')
    autocomplete_fields = ('client',)


# ─── Lead ─────────────────────────────────────────────────────────────────────

@admin.register(Lead)
class LeadAdmin(SimpleHistoryAdmin):
    list_display = (
        'full_name', 'company_name', 'source', 'status', 'score_badge',
        'priority', 'assigned_to', 'next_follow_up', 'created_at',
    )
    list_filter = ('status', 'score', 'priority', 'source', 'industry', 'assigned_to')
    search_fields = ('full_name', 'email', 'phone', 'company_name')
    list_editable = ('status', 'priority')
    autocomplete_fields = ('assigned_to', 'converted_to_client')
    date_hierarchy = 'created_at'
    inlines = [NoteInline, ActivityInline]
    fieldsets = (
        ('Person', {'fields': ('full_name', 'email', 'phone', 'whatsapp', 'designation')}),
        ('Company', {'fields': ('company_name', 'industry')}),
        ('Lead Info', {'fields': ('source', 'source_detail', 'service_interest', 'budget_min', 'budget_max', 'timeline')}),
        ('Pipeline', {'fields': ('status', 'score', 'score_value', 'priority', 'assigned_to', 'next_follow_up', 'last_contacted_at')}),
        ('Conversion', {'fields': ('converted_to_client', 'converted_at')}),
        ('Notes', {'fields': ('notes',)}),
    )

    @admin.display(description='Score', ordering='score')
    def score_badge(self, obj):
        colors = {'hot': '#FF3366', 'warm': '#FF6B35', 'cold': '#94A3B8'}
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">{}</span>',
            colors.get(obj.score, '#94A3B8'), obj.get_score_display(),
        )


# ─── Project ──────────────────────────────────────────────────────────────────

@admin.register(Project)
class ProjectAdmin(SimpleHistoryAdmin):
    list_display = (
        'code', 'name', 'client', 'stage', 'priority',
        'progress_percent', 'contract_value', 'due_date', 'project_manager',
    )
    list_filter = ('stage', 'priority', 'service_type', 'project_manager')
    search_fields = ('code', 'name', 'description', 'client__company_name')
    autocomplete_fields = ('client', 'project_manager')
    filter_horizontal = ('team_members',)
    list_editable = ('stage', 'priority', 'progress_percent')
    date_hierarchy = 'start_date'
    inlines = [MilestoneInline, TaskInline, NoteInline, ActivityInline]
    fieldsets = (
        ('Basics', {'fields': ('name', 'code', 'client', 'service_type', 'description')}),
        ('Pipeline', {'fields': ('stage', 'priority', 'progress_percent')}),
        ('Dates', {'fields': ('start_date', 'due_date', 'completed_at')}),
        ('Financials', {'fields': ('contract_value', 'budget_spent')}),
        ('Team', {'fields': ('project_manager', 'team_members')}),
    )


@admin.register(Milestone)
class MilestoneAdmin(SimpleHistoryAdmin):
    list_display = ('title', 'project', 'due_date', 'is_completed', 'order')
    list_filter = ('is_completed',)
    search_fields = ('title', 'project__code', 'project__name')
    autocomplete_fields = ('project',)
    list_editable = ('is_completed', 'order')


# ─── Quote ────────────────────────────────────────────────────────────────────

@admin.register(Quote)
class QuoteAdmin(SimpleHistoryAdmin):
    list_display = (
        'number', 'title', 'client_or_lead', 'total_display',
        'status', 'issue_date', 'valid_until', 'view_count',
    )
    list_filter = ('status', 'service_type', 'currency')
    search_fields = ('number', 'title', 'client__company_name', 'lead__full_name')
    autocomplete_fields = ('client', 'lead', 'created_by')
    readonly_fields = ('subtotal', 'vat_amount', 'total', 'sent_at', 'viewed_at', 'view_count', 'accepted_at')
    date_hierarchy = 'issue_date'
    inlines = [QuoteLineItemInline]
    fieldsets = (
        ('Identity', {'fields': ('number', 'title', 'description', 'service_type', 'created_by')}),
        ('Recipient', {'fields': ('lead', 'client')}),
        ('Dates', {'fields': ('issue_date', 'valid_until')}),
        ('Pricing', {'fields': ('currency', 'discount', 'vat_percent', 'subtotal', 'vat_amount', 'total')}),
        ('Status', {'fields': ('status', 'sent_at', 'viewed_at', 'view_count', 'accepted_at')}),
        ('Content', {'fields': ('cover_letter', 'payment_terms', 'inclusions', 'exclusions')}),
    )

    @admin.display(description='Recipient')
    def client_or_lead(self, obj):
        return obj.client or obj.lead or '—'

    @admin.display(description='Total')
    def total_display(self, obj):
        return f"{obj.currency} {obj.total:,.2f}"

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        form.instance.recalculate()


@admin.register(QuoteLineItem)
class QuoteLineItemAdmin(admin.ModelAdmin):
    list_display = ('quote', 'description', 'quantity', 'rate', 'amount', 'order')
    search_fields = ('description', 'quote__number')
    autocomplete_fields = ('quote',)


# ─── Invoice ──────────────────────────────────────────────────────────────────

@admin.register(Invoice)
class InvoiceAdmin(SimpleHistoryAdmin):
    list_display = (
        'number', 'client', 'total_display', 'amount_paid_display',
        'amount_due_display', 'status', 'issue_date', 'due_date', 'overdue_badge',
    )
    list_filter = ('status', 'currency', 'issue_date')
    search_fields = ('number', 'client__company_name', 'notes')
    autocomplete_fields = ('client', 'project', 'quote')
    readonly_fields = ('subtotal', 'vat_amount', 'total', 'amount_paid', 'sent_at', 'viewed_at', 'paid_at')
    date_hierarchy = 'issue_date'
    inlines = [InvoiceLineItemInline, PaymentInline]
    fieldsets = (
        ('Identity', {'fields': ('number', 'client', 'project', 'quote')}),
        ('Dates', {'fields': ('issue_date', 'due_date')}),
        ('Pricing', {'fields': ('currency', 'discount', 'vat_percent', 'subtotal', 'vat_amount', 'total', 'amount_paid')}),
        ('Status', {'fields': ('status', 'sent_at', 'viewed_at', 'paid_at')}),
        ('Content', {'fields': ('notes', 'payment_instructions')}),
    )

    @admin.display(description='Total')
    def total_display(self, obj):
        return f"{obj.currency} {obj.total:,.2f}"

    @admin.display(description='Paid')
    def amount_paid_display(self, obj):
        return f"{obj.currency} {obj.amount_paid:,.2f}"

    @admin.display(description='Due')
    def amount_due_display(self, obj):
        return f"{obj.currency} {obj.amount_due:,.2f}"

    @admin.display(description='Overdue', boolean=True)
    def overdue_badge(self, obj):
        return obj.is_overdue

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        form.instance.recalculate()


@admin.register(InvoiceLineItem)
class InvoiceLineItemAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'description', 'quantity', 'rate', 'amount', 'order')
    search_fields = ('description', 'invoice__number')
    autocomplete_fields = ('invoice',)


@admin.register(Payment)
class PaymentAdmin(SimpleHistoryAdmin):
    list_display = ('invoice', 'amount', 'method', 'reference', 'paid_at', 'verified', 'received_by')
    list_filter = ('method', 'verified', 'paid_at')
    search_fields = ('invoice__number', 'reference')
    autocomplete_fields = ('invoice', 'received_by')
    list_editable = ('verified',)
    date_hierarchy = 'paid_at'

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        obj.invoice.recalculate()


# ─── Task ─────────────────────────────────────────────────────────────────────

@admin.register(Task)
class TaskAdmin(SimpleHistoryAdmin):
    list_display = ('title', 'status', 'priority', 'assigned_to', 'due_date', 'related_to')
    list_filter = ('status', 'priority', 'assigned_to')
    search_fields = ('title', 'description')
    autocomplete_fields = ('assigned_to', 'created_by', 'lead', 'client', 'project')
    list_editable = ('status', 'priority')
    date_hierarchy = 'due_date'

    @admin.display(description='Related')
    def related_to(self, obj):
        return obj.project or obj.client or obj.lead or '—'


# ─── Activity ─────────────────────────────────────────────────────────────────

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('activity_type', 'subject', 'occurred_at', 'performed_by', 'related_to')
    list_filter = ('activity_type', 'performed_by')
    search_fields = ('subject', 'content')
    autocomplete_fields = ('lead', 'client', 'project', 'contact', 'performed_by')
    date_hierarchy = 'occurred_at'

    @admin.display(description='Related')
    def related_to(self, obj):
        return obj.project or obj.client or obj.lead or '—'


# ─── Note ─────────────────────────────────────────────────────────────────────

@admin.register(Note)
class NoteAdmin(SimpleHistoryAdmin):
    list_display = ('body_preview', 'is_pinned', 'author', 'related_to', 'created_at')
    list_filter = ('is_pinned', 'author')
    search_fields = ('body',)
    autocomplete_fields = ('author', 'lead', 'client', 'project')
    list_editable = ('is_pinned',)

    @admin.display(description='Body')
    def body_preview(self, obj):
        return obj.body[:80] + ('…' if len(obj.body) > 80 else '')

    @admin.display(description='Related')
    def related_to(self, obj):
        return obj.project or obj.client or obj.lead or '—'
