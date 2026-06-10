from decimal import Decimal

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from crm.models import (
    Client,
    Contact,
    Invoice,
    InvoiceLineItem,
    Lead,
    Milestone,
    Payment,
    Project,
    Quote,
    QuoteLineItem,
)


class Command(BaseCommand):
    help = "Seed sample CRM data — clients, leads, projects, quotes, invoices."

    @transaction.atomic
    def handle(self, *args, **options):
        admin = User.objects.filter(is_superuser=True).first()

        # Clients
        green, _ = Client.objects.get_or_create(
            company_name="GreenLeaf Foods",
            defaults={
                'industry': 'ecommerce', 'website': 'https://greenleaf.com.bd',
                'account_manager': admin, 'health_score': 9, 'is_vip': True,
            },
        )
        apex, _ = Client.objects.get_or_create(
            company_name="Apex Garments Ltd.",
            defaults={
                'industry': 'garments', 'account_manager': admin,
                'health_score': 8, 'is_vip': True,
            },
        )
        khan, _ = Client.objects.get_or_create(
            company_name="Khan & Associates Law",
            defaults={'industry': 'law', 'account_manager': admin, 'health_score': 9},
        )

        Contact.objects.get_or_create(
            client=green, full_name="Tasnim Ahmed",
            defaults={'designation': 'CEO', 'email': 'tasnim@greenleaf.com.bd', 'is_primary': True, 'is_decision_maker': True},
        )
        Contact.objects.get_or_create(
            client=apex, full_name="Rashid Mahmud",
            defaults={'designation': 'Operations Director', 'email': 'rashid@apex.com.bd', 'is_primary': True},
        )

        # Leads
        Lead.objects.get_or_create(
            email="owner@bismillahrestaurant.bd",
            defaults={
                'full_name': 'Mohammad Bismillah', 'phone': '+8801711111111',
                'company_name': 'Bismillah Restaurant Chain', 'industry': 'restaurant',
                'source': 'website', 'service_interest': ['pos', 'web'],
                'budget_min': Decimal('300000'), 'budget_max': Decimal('500000'),
                'status': 'qualified', 'score': 'hot', 'score_value': 85,
                'priority': 'high', 'assigned_to': admin,
            },
        )
        Lead.objects.get_or_create(
            email="aurora@boutique.bd",
            defaults={
                'full_name': 'Sumaiya Akter', 'phone': '+8801722222222',
                'company_name': 'Aurora Boutique', 'industry': 'fcommerce',
                'source': 'facebook', 'service_interest': ['ecommerce'],
                'budget_min': Decimal('150000'), 'budget_max': Decimal('300000'),
                'status': 'contacted', 'score': 'warm', 'score_value': 60,
                'priority': 'medium', 'assigned_to': admin,
            },
        )

        # Project
        proj, created = Project.objects.get_or_create(
            code='PRJ-2026-001',
            defaults={
                'name': 'GreenLeaf E-commerce Platform v2',
                'client': green, 'service_type': 'ecommerce',
                'description': 'Next-gen e-commerce platform with mobile apps.',
                'stage': 'development', 'priority': 'high',
                'progress_percent': 45, 'contract_value': Decimal('450000'),
                'budget_spent': Decimal('180000'),
                'start_date': timezone.now().date(),
                'project_manager': admin,
            },
        )
        if created:
            for i, (title, days) in enumerate([
                ('Discovery & Strategy', 7),
                ('Design Approval', 21),
                ('Backend Development', 60),
                ('Frontend Development', 60),
                ('Testing & QA', 14),
                ('Launch', 7),
            ]):
                Milestone.objects.create(
                    project=proj, title=title, order=i,
                    due_date=timezone.now().date() + timezone.timedelta(days=days),
                )

        # Quote
        quote, q_created = Quote.objects.get_or_create(
            number='Q-2026-001',
            defaults={
                'client': apex, 'title': 'Garments ERP — Phase 2 Modules',
                'service_type': 'erp', 'status': 'sent',
                'valid_until': timezone.now().date() + timezone.timedelta(days=30),
                'created_by': admin,
            },
        )
        if q_created:
            QuoteLineItem.objects.create(
                quote=quote, description='Compliance reporting module', quantity=1, rate=Decimal('180000'), order=0,
            )
            QuoteLineItem.objects.create(
                quote=quote, description='Production planning v2', quantity=1, rate=Decimal('250000'), order=1,
            )
            QuoteLineItem.objects.create(
                quote=quote, description='Mobile app for floor supervisors', quantity=1, rate=Decimal('180000'), order=2,
            )
            quote.recalculate()

        # Invoice
        inv, i_created = Invoice.objects.get_or_create(
            number='INV-2026-001',
            defaults={
                'client': green, 'project': proj,
                'due_date': timezone.now().date() + timezone.timedelta(days=14),
                'payment_instructions': 'Bank: City Bank A/C 1234567890\nbKash Merchant: +8801XXXXXXXXX',
                'status': 'sent',
            },
        )
        if i_created:
            InvoiceLineItem.objects.create(
                invoice=inv, description='Project kickoff payment — 40%', quantity=1, rate=Decimal('180000'), order=0,
            )
            inv.recalculate()
            Payment.objects.create(
                invoice=inv, amount=Decimal('100000'), method='bkash',
                reference='TRX98765', verified=True, received_by=admin,
            )
            inv.recalculate()

        self.stdout.write(self.style.SUCCESS(
            f"CRM seeded: Clients={Client.objects.count()} Leads={Lead.objects.count()} "
            f"Projects={Project.objects.count()} Quotes={Quote.objects.count()} Invoices={Invoice.objects.count()}"
        ))
