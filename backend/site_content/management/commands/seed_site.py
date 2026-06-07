from django.core.management.base import BaseCommand
from django.db import transaction

from seo.models import MetaTag, SchemaOrg
from site_content.models import (
    FooterColumn, FooterLink, NavItem, NavMenu, Page, SiteSettings,
)


HEADER_NAV = [
    ('Services', '/services'),
    ('Industries', '/industries'),
    ('Portfolio', '/portfolio'),
    ('About', '/about'),
    ('Process', '/process'),
    ('Pricing', '/pricing'),
    ('Blog', '/blog'),
    ('Contact', '/contact'),
]

FOOTER_COLUMNS = {
    'Company': [
        ('About Us', '/about'),
        ('Our Team', '/about#team'),
        ('Careers', '/careers'),
        ('Contact', '/contact'),
        ('Press & Media', '/press'),
    ],
    'Services': [
        ('Custom Software', '/services/custom-software-development'),
        ('Web Development', '/services/web-development'),
        ('E-commerce', '/services/ecommerce-development'),
        ('Mobile Apps', '/services/mobile-app-development'),
        ('Cybersecurity', '/services/cybersecurity-penetration-testing'),
        ('Cloud Setup', '/services/cloud-infrastructure'),
    ],
    'Industries': [
        ('Corporate', '/industries/corporate'),
        ('E-commerce', '/industries/ecommerce'),
        ('Restaurants', '/industries/restaurants'),
        ('Healthcare', '/industries/healthcare'),
        ('Education', '/industries/education'),
        ('Garments', '/industries/garments-manufacturing'),
    ],
    'Resources': [
        ('Blog', '/blog'),
        ('Case Studies', '/portfolio'),
        ('FAQ', '/faq'),
        ('Free Guides', '/resources'),
    ],
}

STATIC_PAGES = [
    ('About Us', 'about'),
    ('Our Process', 'process'),
    ('Pricing', 'pricing'),
    ('Contact Us', 'contact'),
    ('Get a Quote', 'get-quote'),
    ('Careers', 'careers'),
    ('FAQ', 'faq'),
    ('Resources', 'resources'),
    ('Privacy Policy', 'privacy-policy'),
    ('Terms & Conditions', 'terms-conditions'),
    ('Cookie Policy', 'cookie-policy'),
    ('Refund Policy', 'refund-policy'),
]

META_DEFAULTS = [
    ('/', 'Mavericks Tech | Best Software Company in Bangladesh',
     "Bangladesh's most trusted technology partner. Custom software, websites, e-commerce, cybersecurity & cloud solutions. 250+ projects delivered."),
    ('/about', 'About Mavericks Tech | Bangladesh\'s Premier IT Company',
     "Meet Mavericks Tech Bangladesh — senior engineers building world-class software, websites, and digital solutions since 2020."),
    ('/process', 'Our Process | How Mavericks Tech Delivers Software Projects',
     "Discover the proven 5-step process Mavericks Tech uses to deliver world-class software on time and on budget."),
    ('/services', 'IT Services Bangladesh | Web, Software, Cybersecurity, Cloud',
     "Complete IT services in Bangladesh — custom software, websites, e-commerce, mobile apps, cybersecurity & more."),
    ('/portfolio', 'Our Work | Mavericks Tech Portfolio',
     "Explore 250+ successful projects by Mavericks Tech Bangladesh across 15+ industries."),
    ('/pricing', 'Pricing | Mavericks Tech Bangladesh',
     "Transparent pricing for software, websites, e-commerce, mobile apps in Bangladesh. No hidden costs."),
    ('/contact', 'Contact Mavericks Tech Bangladesh',
     "Contact Mavericks Tech for software, web, mobile app development. Free consultation. Office in Dhaka."),
]


class Command(BaseCommand):
    help = "Seed SiteSettings, NavMenu, FooterColumns, Pages, MetaTags, SchemaOrg defaults."

    @transaction.atomic
    def handle(self, *args, **options):
        self._site_settings()
        self._nav()
        self._footer()
        self._pages()
        self._meta()
        self._schema()
        self.stdout.write(self.style.SUCCESS("Site seeded."))

    def _site_settings(self):
        if SiteSettings.objects.exists():
            self.stdout.write("SiteSettings exists, skip.")
            return
        SiteSettings.objects.create(
            site_name="Mavericks Tech Bangladesh",
            tagline="Bangladesh's Most Trusted Technology Partner",
            contact_email="hello@maverickstech.com.bd",
            contact_phone="+880 1XXX XXX XXX",
            whatsapp_number="+880 1XXX XXX XXX",
            office_address="Dhaka, Bangladesh",
            office_hours="Sun-Thu, 9 AM - 6 PM",
        )
        self.stdout.write("Created SiteSettings.")

    def _nav(self):
        menu, _ = NavMenu.objects.get_or_create(
            location='header', defaults={'name': 'Header Menu'}
        )
        for order, (label, url) in enumerate(HEADER_NAV):
            NavItem.objects.get_or_create(
                menu=menu, label=label, defaults={'url': url, 'order': order}
            )
        self.stdout.write(f"NavMenu header: {menu.items.count()} items.")

    def _footer(self):
        for order, (heading, links) in enumerate(FOOTER_COLUMNS.items()):
            col, _ = FooterColumn.objects.get_or_create(
                heading=heading, defaults={'order': order}
            )
            for link_order, (label, url) in enumerate(links):
                FooterLink.objects.get_or_create(
                    column=col, label=label,
                    defaults={'url': url, 'order': link_order},
                )
        self.stdout.write(f"FooterColumns: {FooterColumn.objects.count()}.")

    def _pages(self):
        for order, (title, slug) in enumerate(STATIC_PAGES):
            Page.objects.get_or_create(
                slug=slug,
                defaults={
                    'title': title,
                    'status': 'draft',
                    'order': order,
                    'body': f"# {title}\n\nContent placeholder for {title}.",
                },
            )
        self.stdout.write(f"Pages: {Page.objects.count()}.")

    def _meta(self):
        for path, title, desc in META_DEFAULTS:
            MetaTag.objects.get_or_create(
                path=path,
                defaults={'title': title, 'description': desc},
            )
        self.stdout.write(f"MetaTags: {MetaTag.objects.count()}.")

    def _schema(self):
        org_data = {
            "@type": "Organization",
            "name": "Mavericks Tech Bangladesh",
            "url": "https://maverickstech.com.bd",
            "logo": "https://maverickstech.com.bd/logo.png",
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+880 1XXX XXX XXX",
                "contactType": "sales",
                "areaServed": "BD",
            },
            "sameAs": [],
        }
        SchemaOrg.objects.get_or_create(
            path='/', schema_type='Organization',
            defaults={'data': org_data, 'is_active': True},
        )
        self.stdout.write(f"SchemaOrg: {SchemaOrg.objects.count()}.")
