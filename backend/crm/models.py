from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone
from simple_history.models import HistoricalRecords

from core.models import BaseModel

# ─── Choices ──────────────────────────────────────────────────────────────────

LEAD_SOURCE = [
    ('website', 'Website'),
    ('linkedin', 'LinkedIn'),
    ('facebook', 'Facebook'),
    ('instagram', 'Instagram'),
    ('whatsapp', 'WhatsApp'),
    ('referral', 'Referral'),
    ('cold_email', 'Cold Email'),
    ('cold_call', 'Cold Call'),
    ('walk_in', 'Walk-in'),
    ('event', 'Event'),
    ('other', 'Other'),
]

LEAD_STATUS = [
    ('new', 'New'),
    ('contacted', 'Contacted'),
    ('qualified', 'Qualified'),
    ('proposal_sent', 'Proposal Sent'),
    ('negotiating', 'Negotiating'),
    ('won', 'Won'),
    ('lost', 'Lost'),
]

LEAD_SCORE = [
    ('hot', 'Hot'),
    ('warm', 'Warm'),
    ('cold', 'Cold'),
]

PRIORITY = [
    ('low', 'Low'),
    ('medium', 'Medium'),
    ('high', 'High'),
    ('urgent', 'Urgent'),
]

INDUSTRY = [
    ('corporate', 'Corporate'),
    ('ecommerce', 'E-commerce'),
    ('fcommerce', 'F-commerce'),
    ('instacommerce', 'Insta-commerce'),
    ('law', 'Law Firm'),
    ('healthcare', 'Healthcare'),
    ('education', 'Education'),
    ('restaurant', 'Restaurant'),
    ('real_estate', 'Real Estate'),
    ('garments', 'Garments / RMG'),
    ('logistics', 'Logistics'),
    ('government', 'Government'),
    ('modeling', 'Modeling / Creative'),
    ('social', 'Social Platform'),
    ('portfolio', 'Personal Portfolio'),
    ('retail', 'Retail / Shop'),
    ('other', 'Other'),
]

SERVICE_INTEREST = [
    ('custom_software', 'Custom Software'),
    ('web', 'Website'),
    ('ecommerce', 'E-commerce'),
    ('mobile', 'Mobile App'),
    ('saas', 'SaaS'),
    ('erp', 'ERP'),
    ('crm', 'CRM'),
    ('hr', 'HR & Payroll'),
    ('pos', 'POS / Hardware'),
    ('seo', 'SEO / Marketing'),
    ('design', 'UI/UX Design'),
    ('cybersecurity', 'Cybersecurity / Pentest'),
    ('cloud', 'Cloud Infrastructure'),
    ('hosting', 'Domain / Hosting'),
    ('other', 'Other'),
]

PROJECT_STAGE = [
    ('discovery', 'Discovery'),
    ('design', 'Design'),
    ('development', 'Development'),
    ('testing', 'Testing'),
    ('launching', 'Launching'),
    ('completed', 'Completed'),
    ('on_hold', 'On Hold'),
    ('cancelled', 'Cancelled'),
]

QUOTE_STATUS = [
    ('draft', 'Draft'),
    ('sent', 'Sent'),
    ('viewed', 'Viewed'),
    ('accepted', 'Accepted'),
    ('rejected', 'Rejected'),
    ('expired', 'Expired'),
]

INVOICE_STATUS = [
    ('draft', 'Draft'),
    ('sent', 'Sent'),
    ('viewed', 'Viewed'),
    ('partial', 'Partially Paid'),
    ('paid', 'Paid'),
    ('overdue', 'Overdue'),
    ('cancelled', 'Cancelled'),
]

PAYMENT_METHOD = [
    ('bkash', 'bKash'),
    ('nagad', 'Nagad'),
    ('rocket', 'Rocket'),
    ('bank', 'Bank Transfer'),
    ('cash', 'Cash'),
    ('stripe', 'Stripe'),
    ('paypal', 'PayPal'),
    ('cheque', 'Cheque'),
    ('other', 'Other'),
]

TASK_STATUS = [
    ('todo', 'To Do'),
    ('in_progress', 'In Progress'),
    ('blocked', 'Blocked'),
    ('done', 'Done'),
    ('cancelled', 'Cancelled'),
]

ACTIVITY_TYPE = [
    ('call', 'Call'),
    ('email', 'Email'),
    ('whatsapp', 'WhatsApp'),
    ('sms', 'SMS'),
    ('meeting', 'Meeting'),
    ('note', 'Note'),
    ('status_change', 'Status Change'),
    ('quote_sent', 'Quote Sent'),
    ('payment', 'Payment'),
    ('other', 'Other'),
]


# ─── Client / Contact ─────────────────────────────────────────────────────────

class Client(BaseModel):
    """Company / organization we serve."""
    company_name = models.CharField(max_length=200)
    industry = models.CharField(max_length=30, choices=INDUSTRY, default='other')
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='clients/', blank=True, null=True)
    billing_address = models.TextField(blank=True)
    tin_number = models.CharField(max_length=50, blank=True, help_text="Tax Identification Number")
    vat_number = models.CharField(max_length=50, blank=True)
    account_manager = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='managed_clients',
    )
    health_score = models.IntegerField(default=5, help_text="1-10")
    is_vip = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    history = HistoricalRecords()

    class Meta:
        db_table = 'crm_client'
        ordering = ['company_name']

    def __str__(self):
        return self.company_name

    @property
    def lifetime_value(self):
        total = self.invoices.filter(status='paid').aggregate(s=models.Sum('total'))['s']
        return total or Decimal('0')


class Contact(BaseModel):
    """Person at a client company."""
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='contacts')
    full_name = models.CharField(max_length=200)
    designation = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    whatsapp = models.CharField(max_length=30, blank=True)
    is_primary = models.BooleanField(default=False)
    is_decision_maker = models.BooleanField(default=False)
    history = HistoricalRecords()

    class Meta:
        db_table = 'crm_contact'
        ordering = ['-is_primary', 'full_name']

    def __str__(self):
        return f"{self.full_name} ({self.client.company_name})"


# ─── Lead ─────────────────────────────────────────────────────────────────────

class Lead(BaseModel):
    """Prospect — pre-conversion to Client."""
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    whatsapp = models.CharField(max_length=30, blank=True)
    company_name = models.CharField(max_length=200, blank=True)
    designation = models.CharField(max_length=200, blank=True)
    industry = models.CharField(max_length=30, choices=INDUSTRY, default='other')

    source = models.CharField(max_length=20, choices=LEAD_SOURCE)
    source_detail = models.CharField(max_length=300, blank=True, help_text="Referrer name, campaign, etc.")
    service_interest = models.JSONField(default=list, blank=True, help_text="List of SERVICE_INTEREST keys")

    budget_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    timeline = models.CharField(max_length=200, blank=True)

    status = models.CharField(max_length=20, choices=LEAD_STATUS, default='new')
    score = models.CharField(max_length=10, choices=LEAD_SCORE, default='cold')
    score_value = models.IntegerField(default=0, help_text="0-100 auto-calculated")
    priority = models.CharField(max_length=10, choices=PRIORITY, default='medium')

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='leads',
    )
    next_follow_up = models.DateTimeField(null=True, blank=True)
    last_contacted_at = models.DateTimeField(null=True, blank=True)

    converted_to_client = models.ForeignKey(
        Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='source_leads',
    )
    converted_at = models.DateTimeField(null=True, blank=True)

    notes = models.TextField(blank=True)
    history = HistoricalRecords()

    class Meta:
        db_table = 'crm_lead'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['score']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.get_status_display()})"

    def mark_won(self, client=None):
        self.status = 'won'
        if client:
            self.converted_to_client = client
            self.converted_at = timezone.now()
        self.save()


# ─── Project ──────────────────────────────────────────────────────────────────

class Project(BaseModel):
    """Engagement after a deal closes."""
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=30, unique=True, help_text="e.g. PRJ-2026-001")
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name='projects')
    description = models.TextField(blank=True)
    service_type = models.CharField(max_length=30, choices=SERVICE_INTEREST, default='custom_software')

    stage = models.CharField(max_length=20, choices=PROJECT_STAGE, default='discovery')
    priority = models.CharField(max_length=10, choices=PRIORITY, default='medium')
    progress_percent = models.IntegerField(default=0)

    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateField(null=True, blank=True)

    contract_value = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    budget_spent = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))

    project_manager = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='managed_projects',
    )
    team_members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True, related_name='projects',
    )
    history = HistoricalRecords()

    class Meta:
        db_table = 'crm_project'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['stage']),
            models.Index(fields=['client']),
        ]

    def __str__(self):
        return f"{self.code} — {self.name}"


class Milestone(BaseModel):
    """Project milestone / phase deliverable."""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateField(null=True, blank=True)
    order = models.IntegerField(default=0)
    history = HistoricalRecords()

    class Meta:
        db_table = 'crm_milestone'
        ordering = ['order', 'due_date']

    def __str__(self):
        return f"{self.project.code} → {self.title}"


# ─── Quote ────────────────────────────────────────────────────────────────────

class Quote(BaseModel):
    """Proposal sent to a Lead or Client."""
    number = models.CharField(max_length=30, unique=True, help_text="e.g. Q-2026-001")
    lead = models.ForeignKey(
        Lead, on_delete=models.SET_NULL, null=True, blank=True, related_name='quotes',
    )
    client = models.ForeignKey(
        Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='quotes',
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    service_type = models.CharField(max_length=30, choices=SERVICE_INTEREST, default='custom_software')

    issue_date = models.DateField(default=timezone.now)
    valid_until = models.DateField(null=True, blank=True)

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    vat_percent = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('15'))
    vat_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    currency = models.CharField(max_length=10, default='BDT')

    status = models.CharField(max_length=20, choices=QUOTE_STATUS, default='draft')
    sent_at = models.DateTimeField(null=True, blank=True)
    viewed_at = models.DateTimeField(null=True, blank=True)
    view_count = models.IntegerField(default=0)
    accepted_at = models.DateTimeField(null=True, blank=True)

    payment_terms = models.TextField(blank=True, default="40% upfront, 30% midway, 30% on delivery.")
    inclusions = models.TextField(blank=True)
    exclusions = models.TextField(blank=True)
    cover_letter = models.TextField(blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='quotes_created',
    )
    history = HistoricalRecords()

    class Meta:
        db_table = 'crm_quote'
        ordering = ['-issue_date', '-created_at']

    def __str__(self):
        return f"{self.number} — {self.title}"

    def recalculate(self):
        items_total = sum((i.amount for i in self.line_items.all()), Decimal('0'))
        self.subtotal = items_total
        taxable = max(self.subtotal - self.discount, Decimal('0'))
        self.vat_amount = (taxable * self.vat_percent / Decimal('100')).quantize(Decimal('0.01'))
        self.total = taxable + self.vat_amount
        self.save(update_fields=['subtotal', 'vat_amount', 'total'])


class QuoteLineItem(BaseModel):
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name='line_items')
    description = models.CharField(max_length=500)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('1'))
    rate = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    order = models.IntegerField(default=0)

    class Meta:
        db_table = 'crm_quote_line_item'
        ordering = ['order']

    def save(self, *args, **kwargs):
        self.amount = (self.quantity * self.rate).quantize(Decimal('0.01'))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quote.number} → {self.description[:40]}"


# ─── Invoice ──────────────────────────────────────────────────────────────────

class Invoice(BaseModel):
    """Bill issued to a Client."""
    number = models.CharField(max_length=30, unique=True, help_text="e.g. INV-2026-001")
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name='invoices')
    project = models.ForeignKey(
        Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices',
    )
    quote = models.ForeignKey(
        Quote, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices',
    )

    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField(null=True, blank=True)

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    vat_percent = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('15'))
    vat_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    currency = models.CharField(max_length=10, default='BDT')

    status = models.CharField(max_length=20, choices=INVOICE_STATUS, default='draft')
    sent_at = models.DateTimeField(null=True, blank=True)
    viewed_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    notes = models.TextField(blank=True)
    payment_instructions = models.TextField(blank=True)
    history = HistoricalRecords()

    class Meta:
        db_table = 'crm_invoice'
        ordering = ['-issue_date', '-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['client']),
        ]

    def __str__(self):
        return f"{self.number} — {self.client.company_name}"

    @property
    def amount_due(self):
        return self.total - self.amount_paid

    @property
    def is_overdue(self):
        if self.status in ('paid', 'cancelled') or not self.due_date:
            return False
        return self.due_date < timezone.now().date()

    def recalculate(self):
        items_total = sum((i.amount for i in self.line_items.all()), Decimal('0'))
        self.subtotal = items_total
        taxable = max(self.subtotal - self.discount, Decimal('0'))
        self.vat_amount = (taxable * self.vat_percent / Decimal('100')).quantize(Decimal('0.01'))
        self.total = taxable + self.vat_amount
        paid = self.payments.filter(verified=True).aggregate(s=models.Sum('amount'))['s'] or Decimal('0')
        self.amount_paid = paid
        if self.amount_paid >= self.total and self.total > 0:
            self.status = 'paid'
            if not self.paid_at:
                self.paid_at = timezone.now()
        elif self.amount_paid > 0:
            self.status = 'partial'
        self.save()


class InvoiceLineItem(BaseModel):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='line_items')
    description = models.CharField(max_length=500)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('1'))
    rate = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0'))
    order = models.IntegerField(default=0)

    class Meta:
        db_table = 'crm_invoice_line_item'
        ordering = ['order']

    def save(self, *args, **kwargs):
        self.amount = (self.quantity * self.rate).quantize(Decimal('0.01'))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice.number} → {self.description[:40]}"


# ─── Payment ──────────────────────────────────────────────────────────────────

class Payment(BaseModel):
    """Payment received against an Invoice."""
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, choices=PAYMENT_METHOD)
    reference = models.CharField(max_length=200, blank=True, help_text="TrxID, bank ref, etc.")
    paid_at = models.DateTimeField(default=timezone.now)
    verified = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='payments_received',
    )
    history = HistoricalRecords()

    class Meta:
        db_table = 'crm_payment'
        ordering = ['-paid_at']

    def __str__(self):
        return f"{self.invoice.number} — ৳{self.amount} via {self.get_method_display()}"


# ─── Task ─────────────────────────────────────────────────────────────────────

class Task(BaseModel):
    """Generic task linked to lead/client/project."""
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=TASK_STATUS, default='todo')
    priority = models.CharField(max_length=10, choices=PRIORITY, default='medium')

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='tasks',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='tasks_created',
    )

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, null=True, blank=True, related_name='tasks')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True, related_name='tasks')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='tasks')

    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    history = HistoricalRecords()

    class Meta:
        db_table = 'crm_task'
        ordering = ['-priority', 'due_date']

    def __str__(self):
        return self.title


# ─── Activity ─────────────────────────────────────────────────────────────────

class Activity(BaseModel):
    """Timeline event on a lead/client/project."""
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPE)
    subject = models.CharField(max_length=300)
    content = models.TextField(blank=True)
    occurred_at = models.DateTimeField(default=timezone.now)

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    contact = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, blank=True, related_name='activities')

    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='activities',
    )

    class Meta:
        db_table = 'crm_activity'
        ordering = ['-occurred_at']
        verbose_name_plural = 'Activities'

    def __str__(self):
        return f"{self.get_activity_type_display()}: {self.subject[:60]}"


# ─── Note ─────────────────────────────────────────────────────────────────────

class Note(BaseModel):
    """Free-form pinned note on any entity."""
    body = models.TextField()
    is_pinned = models.BooleanField(default=False)

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, null=True, blank=True, related_name='note_set')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True, related_name='note_set')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='note_set')

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='authored_notes',
    )
    history = HistoricalRecords()

    class Meta:
        db_table = 'crm_note'
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return self.body[:60]


# ---------------------------------------------------------------------------
# Project file uploads (agency↔client via portal)
# ---------------------------------------------------------------------------
class ProjectFile(BaseModel):
    SOURCE_CHOICES = [
        ('agency', 'From agency'),
        ('client', 'From client'),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='project-files/%Y/%m/')
    filename = models.CharField(max_length=300)
    size_bytes = models.BigIntegerField(default=0)
    content_type = models.CharField(max_length=100, blank=True)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='agency')
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='uploaded_project_files',
    )
    note = models.CharField(max_length=300, blank=True)
    history = HistoricalRecords()

    class Meta:
        db_table = 'crm_project_file'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.filename} ({self.project_id})'

    def save(self, *args, **kwargs):
        if self.file and not self.filename:
            self.filename = self.file.name.rsplit('/', 1)[-1]
        if self.file and not self.size_bytes:
            try:
                self.size_bytes = self.file.size
            except (OSError, ValueError):
                self.size_bytes = 0
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# Internal comments + @mentions
# ---------------------------------------------------------------------------
class Comment(BaseModel):
    body = models.TextField()
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, null=True, blank=True, related_name='comments')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True, related_name='comments')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='comments')
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, null=True, blank=True, related_name='comments')
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, null=True, blank=True, related_name='comments')

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='authored_comments',
    )
    mentions = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True, related_name='mentioned_in_comments',
    )
    history = HistoricalRecords()

    class Meta:
        db_table = 'crm_comment'
        ordering = ['-created_at']

    def __str__(self):
        return self.body[:60]
