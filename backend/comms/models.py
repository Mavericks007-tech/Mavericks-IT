from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from simple_history.models import HistoricalRecords

from core.models import BaseModel

TEMPLATE_CATEGORY = [
    ('lead', 'Lead'),
    ('quote', 'Quote'),
    ('invoice', 'Invoice'),
    ('payment', 'Payment'),
    ('project', 'Project'),
    ('marketing', 'Marketing'),
    ('transactional', 'Transactional'),
    ('other', 'Other'),
]

EMAIL_STATUS = [
    ('queued', 'Queued'),
    ('sent', 'Sent'),
    ('failed', 'Failed'),
    ('opened', 'Opened'),
    ('clicked', 'Clicked'),
    ('bounced', 'Bounced'),
]

CAMPAIGN_STATUS = [
    ('draft', 'Draft'),
    ('scheduled', 'Scheduled'),
    ('sending', 'Sending'),
    ('completed', 'Completed'),
    ('cancelled', 'Cancelled'),
]


class EmailSettings(BaseModel):
    """SMTP configuration — singleton."""
    smtp_host = models.CharField(max_length=200, default='smtp.gmail.com')
    smtp_port = models.IntegerField(default=587)
    smtp_user = models.CharField(max_length=200, blank=True)
    smtp_password = models.CharField(max_length=200, blank=True, help_text="App password, stored plaintext — move to secrets in prod")
    use_tls = models.BooleanField(default=True)
    use_ssl = models.BooleanField(default=False)
    from_email = models.EmailField(default='hello@maverickstech.com.bd')
    from_name = models.CharField(max_length=100, default='Mavericks Tech Bangladesh')
    reply_to = models.EmailField(blank=True)
    signature_html = models.TextField(blank=True, default=(
        '<br><br>—<br><strong>Mavericks Tech Bangladesh</strong><br>'
        "Bangladesh's Most Trusted Technology Partner<br>"
        'hello@maverickstech.com.bd · +880 1XXX XXX XXX'
    ))
    history = HistoricalRecords()

    class Meta:
        db_table = 'comms_email_settings'
        verbose_name_plural = 'Email Settings'

    def __str__(self):
        return f"{self.from_name} <{self.from_email}>"

    def save(self, *args, **kwargs):
        if not self.pk and EmailSettings.objects.exists():
            raise ValidationError("Only one EmailSettings instance allowed.")
        super().save(*args, **kwargs)


class EmailTemplate(BaseModel):
    """Reusable email template with {{var}} placeholders."""
    key = models.SlugField(max_length=100, unique=True, help_text="Code-referenced key, e.g. welcome_lead")
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=TEMPLATE_CATEGORY, default='other')
    subject = models.CharField(max_length=300, help_text="Supports {{var}} placeholders")
    body_html = models.TextField(help_text="HTML body. Use {{var}} placeholders.")
    body_text = models.TextField(blank=True, help_text="Plain-text fallback (optional)")
    is_active = models.BooleanField(default=True)
    description = models.CharField(max_length=300, blank=True, help_text="What this template is for")
    available_vars = models.JSONField(
        default=list, blank=True,
        help_text="List of placeholder names available, e.g. ['name', 'company', 'amount']",
    )
    history = HistoricalRecords()

    class Meta:
        db_table = 'comms_email_template'
        ordering = ['category', 'key']

    def __str__(self):
        return f"[{self.category}] {self.name}"

    def render(self, context: dict) -> tuple[str, str, str]:
        """Render subject + html + text using simple {{var}} substitution."""
        subject, html, text = self.subject, self.body_html, self.body_text or ''
        for key, val in context.items():
            token = '{{' + str(key) + '}}'
            val_str = str(val) if val is not None else ''
            subject = subject.replace(token, val_str)
            html = html.replace(token, val_str)
            text = text.replace(token, val_str)
        return subject, html, text


class EmailLog(BaseModel):
    """Every email sent — for audit and tracking."""
    template = models.ForeignKey(
        EmailTemplate, on_delete=models.SET_NULL, null=True, blank=True, related_name='logs',
    )
    to_email = models.EmailField()
    to_name = models.CharField(max_length=200, blank=True)
    from_email = models.EmailField()
    from_name = models.CharField(max_length=200, blank=True)
    cc = models.CharField(max_length=500, blank=True)
    bcc = models.CharField(max_length=500, blank=True)
    reply_to = models.EmailField(blank=True)
    subject = models.CharField(max_length=300)
    body_html = models.TextField()
    body_text = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=EMAIL_STATUS, default='queued')
    error_message = models.TextField(blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)
    open_count = models.IntegerField(default=0)

    # Related entities (any one)
    lead = models.ForeignKey('crm.Lead', on_delete=models.SET_NULL, null=True, blank=True, related_name='email_logs')
    client = models.ForeignKey('crm.Client', on_delete=models.SET_NULL, null=True, blank=True, related_name='email_logs')
    contact = models.ForeignKey('crm.Contact', on_delete=models.SET_NULL, null=True, blank=True, related_name='email_logs')
    project = models.ForeignKey('crm.Project', on_delete=models.SET_NULL, null=True, blank=True, related_name='email_logs')
    quote = models.ForeignKey('crm.Quote', on_delete=models.SET_NULL, null=True, blank=True, related_name='email_logs')
    invoice = models.ForeignKey('crm.Invoice', on_delete=models.SET_NULL, null=True, blank=True, related_name='email_logs')

    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='emails_sent',
    )

    class Meta:
        db_table = 'comms_email_log'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['to_email']),
        ]

    def __str__(self):
        return f"[{self.status}] {self.to_email}: {self.subject[:60]}"

    def mark_opened(self):
        self.open_count += 1
        if not self.opened_at:
            self.opened_at = timezone.now()
            if self.status == 'sent':
                self.status = 'opened'
        self.save(update_fields=['open_count', 'opened_at', 'status'])


class EmailCampaign(BaseModel):
    """Bulk send to a set of leads/clients via template."""
    name = models.CharField(max_length=200)
    template = models.ForeignKey(EmailTemplate, on_delete=models.PROTECT, related_name='campaigns')
    status = models.CharField(max_length=20, choices=CAMPAIGN_STATUS, default='draft')
    scheduled_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    target_leads = models.ManyToManyField('crm.Lead', blank=True, related_name='campaigns')
    target_clients = models.ManyToManyField('crm.Client', blank=True, related_name='campaigns')

    sent_count = models.IntegerField(default=0)
    failed_count = models.IntegerField(default=0)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='campaigns_created',
    )
    history = HistoricalRecords()

    class Meta:
        db_table = 'comms_email_campaign'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
