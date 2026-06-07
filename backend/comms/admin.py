from django.contrib import admin, messages
from django.shortcuts import redirect
from simple_history.admin import SimpleHistoryAdmin

from .models import EmailCampaign, EmailLog, EmailSettings, EmailTemplate
from .services import send_email


@admin.register(EmailSettings)
class EmailSettingsAdmin(SimpleHistoryAdmin):
    list_display = ('from_name', 'from_email', 'smtp_host', 'smtp_port', 'use_tls', 'updated_at')
    fieldsets = (
        ('SMTP', {'fields': ('smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'use_tls', 'use_ssl')}),
        ('Identity', {'fields': ('from_email', 'from_name', 'reply_to')}),
        ('Signature', {'fields': ('signature_html',)}),
    )

    def has_add_permission(self, request):
        return not EmailSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(EmailTemplate)
class EmailTemplateAdmin(SimpleHistoryAdmin):
    list_display = ('key', 'name', 'category', 'is_active', 'updated_at')
    list_filter = ('category', 'is_active')
    search_fields = ('key', 'name', 'subject', 'description')
    list_editable = ('is_active',)
    fieldsets = (
        ('Identity', {'fields': ('key', 'name', 'category', 'is_active', 'description')}),
        ('Content', {'fields': ('subject', 'body_html', 'body_text')}),
        ('Variables', {'fields': ('available_vars',)}),
    )


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ('subject', 'to_email', 'status', 'open_count', 'sent_at', 'related_to')
    list_filter = ('status', 'template')
    search_fields = ('to_email', 'subject', 'body_text')
    readonly_fields = [
        'template', 'to_email', 'to_name', 'from_email', 'from_name',
        'cc', 'bcc', 'reply_to', 'subject', 'body_html', 'body_text',
        'status', 'error_message', 'sent_at', 'opened_at', 'clicked_at', 'open_count',
        'lead', 'client', 'contact', 'project', 'quote', 'invoice', 'sent_by', 'created_at',
    ]
    date_hierarchy = 'created_at'

    def has_add_permission(self, request):
        return False

    @admin.display(description='Related')
    def related_to(self, obj):
        return obj.invoice or obj.quote or obj.project or obj.client or obj.lead or '—'


@admin.register(EmailCampaign)
class EmailCampaignAdmin(SimpleHistoryAdmin):
    list_display = ('name', 'template', 'status', 'sent_count', 'failed_count', 'scheduled_at', 'completed_at')
    list_filter = ('status', 'template')
    search_fields = ('name',)
    autocomplete_fields = ('template', 'created_by')
    filter_horizontal = ('target_leads', 'target_clients')
    readonly_fields = ('started_at', 'completed_at', 'sent_count', 'failed_count')
    actions = ['run_now']

    @admin.action(description='Run selected campaigns now')
    def run_now(self, request, queryset):
        from django.utils import timezone
        for campaign in queryset:
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
                        sent_by=request.user,
                    )
                    sent += 1 if log.status == 'sent' else 0
                    failed += 0 if log.status == 'sent' else 1
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
                        sent_by=request.user,
                    )
                    sent += 1 if log.status == 'sent' else 0
                    failed += 0 if log.status == 'sent' else 1
                except Exception:
                    failed += 1
            campaign.sent_count = sent
            campaign.failed_count = failed
            campaign.status = 'completed'
            campaign.completed_at = timezone.now()
            campaign.save(update_fields=['sent_count', 'failed_count', 'status', 'completed_at'])
        messages.success(request, f"Ran {queryset.count()} campaign(s).")
