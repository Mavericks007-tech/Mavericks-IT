from django.core.management.base import BaseCommand
from django.db import transaction

from comms.models import EmailSettings, EmailTemplate

TEMPLATES = [
    {
        'key': 'welcome_lead',
        'name': 'Welcome New Lead',
        'category': 'lead',
        'subject': 'Thanks for reaching out, {{name}}!',
        'available_vars': ['name', 'company', 'service'],
        'description': 'Sent automatically when a new Lead is created with a valid email.',
        'body_html': (
            '<p>Hi {{name}},</p>'
            '<p>Thanks for reaching out to <strong>Mavericks Tech Bangladesh</strong>. '
            "We've received your inquiry about {{service}} and a senior member of our team will be in touch shortly.</p>"
            '<p>In the meantime, feel free to browse our work at '
            '<a href="https://maverickstech.com.bd/portfolio">maverickstech.com.bd/portfolio</a>.</p>'
        ),
    },
    {
        'key': 'lead_followup_1',
        'name': 'Lead Follow-up #1',
        'category': 'lead',
        'subject': 'Quick follow-up, {{name}}',
        'available_vars': ['name', 'company'],
        'description': 'First follow-up — 5 days after no response.',
        'body_html': (
            '<p>Hi {{name}},</p>'
            "<p>Just floating my previous email to the top of your inbox. "
            "Even if it's not the right time to discuss your project, "
            "I'd love to know — is improving your tech stack on your roadmap this year?</p>"
            "<p>If not me, happy to point you toward resources that could help.</p>"
        ),
    },
    {
        'key': 'lead_followup_2',
        'name': 'Lead Follow-up #2 (Close Loop)',
        'category': 'lead',
        'subject': 'Closing the loop',
        'available_vars': ['name'],
        'description': 'Final follow-up — closes the thread.',
        'body_html': (
            '<p>Hi {{name}},</p>'
            "<p>I've reached out a couple of times. Totally understand if it's not a priority right now.</p>"
            "<p>One last question — would you prefer I close this thread, "
            "or would a brief 5-minute call make sense in the future?</p>"
            "<p>Either way, wishing you continued success.</p>"
        ),
    },
    {
        'key': 'quote_sent',
        'name': 'Quote Sent',
        'category': 'quote',
        'subject': 'Quote #{{quote_number}} from Mavericks Tech',
        'available_vars': ['name', 'quote_number', 'quote_title', 'total', 'valid_until'],
        'description': 'Sent when a quote is delivered to a lead or client.',
        'body_html': (
            '<p>Hi {{name}},</p>'
            '<p>Please find attached <strong>Quote #{{quote_number}}</strong> for {{quote_title}}.</p>'
            '<p><strong>Total: {{total}}</strong><br>'
            'Valid until: {{valid_until}}</p>'
            "<p>Happy to walk through it on a call if useful. Just reply to this email.</p>"
        ),
    },
    {
        'key': 'invoice_sent',
        'name': 'Invoice Sent',
        'category': 'invoice',
        'subject': 'Invoice #{{invoice_number}} from Mavericks Tech — Due {{due_date}}',
        'available_vars': ['name', 'invoice_number', 'amount', 'due_date', 'payment_instructions'],
        'description': 'Sent when an invoice is issued.',
        'body_html': (
            '<p>Hi {{name}},</p>'
            '<p>Please find <strong>Invoice #{{invoice_number}}</strong> for <strong>{{amount}}</strong>.</p>'
            '<p>Due: {{due_date}}</p>'
            '<h4>Payment Methods</h4>'
            '<pre style="background:#f5f5f5;padding:12px;border-radius:6px;">{{payment_instructions}}</pre>'
            '<p>Reply with the transaction reference once paid and we will send a receipt.</p>'
        ),
    },
    {
        'key': 'payment_reminder_1',
        'name': 'Payment Reminder #1 (Due Today)',
        'category': 'payment',
        'subject': 'Friendly reminder: Invoice #{{invoice_number}} due',
        'available_vars': ['name', 'invoice_number', 'amount_due', 'due_date'],
        'description': 'Sent on due date.',
        'body_html': (
            '<p>Hi {{name}},</p>'
            '<p>Friendly reminder that <strong>Invoice #{{invoice_number}}</strong> '
            'for {{amount_due}} is due {{due_date}}.</p>'
            "<p>If already paid, please ignore. If not, just reply with the reference once done.</p>"
        ),
    },
    {
        'key': 'payment_reminder_2',
        'name': 'Payment Reminder #2 (Overdue)',
        'category': 'payment',
        'subject': 'Invoice #{{invoice_number}} — Payment Overdue',
        'available_vars': ['name', 'invoice_number', 'amount_due', 'days_overdue'],
        'description': 'Sent 3+ days after due date.',
        'body_html': (
            '<p>Hi {{name}},</p>'
            '<p>Invoice <strong>#{{invoice_number}}</strong> for {{amount_due}} is now '
            '<strong>{{days_overdue}} days overdue</strong>.</p>'
            '<p>Please process payment at your earliest convenience or reply if there is an issue we should know about.</p>'
        ),
    },
    {
        'key': 'payment_received',
        'name': 'Payment Receipt',
        'category': 'payment',
        'subject': 'Payment received — Invoice #{{invoice_number}}',
        'available_vars': ['name', 'invoice_number', 'amount', 'method', 'reference', 'remaining'],
        'description': 'Auto-sent when a Payment is verified.',
        'body_html': (
            '<p>Hi {{name}},</p>'
            '<p>We have received your payment of <strong>{{amount}}</strong> via {{method}} '
            '(ref: {{reference}}) against Invoice #{{invoice_number}}.</p>'
            '<p>Remaining balance: {{remaining}}</p>'
            '<p>Thank you!</p>'
        ),
    },
    {
        'key': 'project_kickoff',
        'name': 'Project Kickoff',
        'category': 'project',
        'subject': 'Welcome to Mavericks Tech — {{project_name}} kickoff',
        'available_vars': ['name', 'project_name', 'pm_name', 'pm_email'],
        'description': 'Sent when a project is created and contract signed.',
        'body_html': (
            '<p>Hi {{name}},</p>'
            '<p>Welcome to the Mavericks family! We are excited to start work on <strong>{{project_name}}</strong>.</p>'
            '<p><strong>Your Project Manager:</strong> {{pm_name}} ({{pm_email}})</p>'
            "<p>You'll hear from us within 1 business day with the discovery call schedule.</p>"
        ),
    },
    {
        'key': 'weekly_progress',
        'name': 'Weekly Progress Update',
        'category': 'project',
        'subject': '{{project_name}} — Weekly progress',
        'available_vars': ['name', 'project_name', 'progress_summary', 'next_steps'],
        'description': 'Weekly status email sent every Friday during a project.',
        'body_html': (
            '<p>Hi {{name}},</p>'
            "<p>Here's this week's progress on <strong>{{project_name}}</strong>:</p>"
            '<p>{{progress_summary}}</p>'
            '<h4>Next Steps</h4>'
            '<p>{{next_steps}}</p>'
        ),
    },
    {
        'key': 'project_completion',
        'name': 'Project Completion',
        'category': 'project',
        'subject': '{{project_name}} delivered',
        'available_vars': ['name', 'project_name'],
        'description': 'Sent when a project is marked completed.',
        'body_html': (
            '<p>Hi {{name}},</p>'
            "<p><strong>{{project_name}}</strong> is officially delivered. It's been a pleasure.</p>"
            "<p>You'll receive credentials, documentation, and training resources in a separate email.</p>"
            "<p>We don't disappear after launch — reach out anytime.</p>"
        ),
    },
    {
        'key': 'thank_you',
        'name': 'Generic Thank You',
        'category': 'other',
        'subject': 'Thank you, {{name}}',
        'available_vars': ['name'],
        'description': 'Generic thank-you template.',
        'body_html': '<p>Hi {{name}},</p><p>Just a quick thank-you. Appreciate your time.</p>',
    },
]


class Command(BaseCommand):
    help = "Seed default EmailSettings + EmailTemplates."

    @transaction.atomic
    def handle(self, *args, **options):
        if not EmailSettings.objects.exists():
            EmailSettings.objects.create()
            self.stdout.write("Created default EmailSettings.")

        created = updated = 0
        for spec in TEMPLATES:
            obj, was_created = EmailTemplate.objects.update_or_create(
                key=spec['key'], defaults=spec,
            )
            created += int(was_created)
            updated += int(not was_created)

        self.stdout.write(self.style.SUCCESS(
            f"Email templates: created={created} updated={updated} total={EmailTemplate.objects.count()}"
        ))
