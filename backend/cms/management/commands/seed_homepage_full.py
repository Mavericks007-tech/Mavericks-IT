from django.core.management.base import BaseCommand
from django.db import transaction

from cms.models import (
    CTASection,
    Differentiator,
    HeroSection,
    Industry,
    ProcessStep,
    Testimonial,
)

INDUSTRIES = [
    ('Corporate & Enterprise', 'Briefcase', 'Custom ERPs, internal portals, enterprise software for established corporations.'),
    ('E-commerce', 'ShoppingCart', 'End-to-end online stores with bKash, Nagad, Rocket integration.'),
    ('F-commerce', 'Facebook', 'Graduate from Facebook comments to a real e-commerce business.'),
    ('Insta-commerce', 'Instagram', 'Visual-first e-commerce for Instagram brands.'),
    ('Law Firms', 'Scale', 'Case management, client portals, document automation for legal practices.'),
    ('Healthcare', 'Heart', 'Hospital management, telemedicine, EMR, lab management.'),
    ('Education', 'GraduationCap', 'School management, LMS, coaching center software.'),
    ('Restaurants', 'UtensilsCrossed', 'Complete restaurant tech — POS, online ordering, food delivery apps.'),
    ('Real Estate', 'Building', 'Property listings, real estate CRM, agent portals.'),
    ('Garments / RMG', 'Shirt', 'Industry-specific ERP for Bangladesh garments factories.'),
    ('Logistics', 'Truck', 'Fleet management, route optimization, delivery apps.'),
    ('Government', 'Landmark', 'Citizen service portals, internal government systems.'),
    ('Modeling Agencies', 'Camera', 'Portfolio management, booking, casting systems.'),
    ('Social Platforms', 'Users', 'Custom social networks, content moderation, real-time chat.'),
    ('Personal Portfolios', 'User', 'Personal brands for photographers, designers, doctors, lawyers.'),
    ('Retail Shops', 'Store', 'POS, inventory, multi-location sync for retail.'),
]

DIFFERENTIATORS = [
    ('Engineering Excellence', 'Custom code, never templates. Every project is built from scratch for your specific needs.', 'Award'),
    ('Security First Approach', 'Bank-grade encryption on every project. We protect your business like a fortress.', 'Shield'),
    ('Speed & Performance', 'Sub-2-second load times guaranteed. Faster sites mean more customers and more sales.', 'Zap'),
    ('SEO Built-In', 'Rank on Google from day one. We bake SEO into every page we build.', 'Search'),
    ('Lifetime Support', "We don't disappear after launch. We're partners, not vendors.", 'HeartHandshake'),
    ('Premium Quality', 'Award-worthy design meets enterprise reliability. Nothing less.', 'Crown'),
]

TESTIMONIALS = [
    ("Mavericks Tech didn't just build us a website — they rebuilt our entire business operation. Our orders tripled in the first quarter. They are partners, not vendors.",
     'Tasnim Ahmed', 'CEO', 'GreenLeaf Foods', 'E-commerce + Mobile App'),
    ("As a law firm, security is non-negotiable. Mavericks Tech built us a client portal that's both beautiful and bulletproof. Best technology investment we ever made.",
     'Barrister Adila Khan', 'Senior Partner', 'Khan & Associates', 'Case Management System'),
    ("I had a small Facebook shop. Mavericks Tech turned it into a real e-commerce business. Sales are up 5x and I sleep peacefully knowing the system handles everything.",
     'Sumaiya Akter', 'Founder', 'Aurora Boutique', 'E-commerce Platform'),
    ("Their penetration testing found 14 critical vulnerabilities in our banking system that nobody else caught. They literally saved our business. Worth every taka.",
     'Rafiq Mahmud', 'CTO', 'FinTech Solutions BD', 'Penetration Testing'),
]

PROCESS_STEPS = [
    (1, 'Discovery & Strategy', 'Week 1', 'We listen, we learn, we strategize. Understanding your goals, audience, and competitors before writing a single line of code.', 'Search'),
    (2, 'Design & Prototyping', 'Week 2-3', 'Pixel-perfect designs you approve before we build. No surprises. No regrets.', 'Palette'),
    (3, 'Development & Testing', 'Week 4-12', 'Clean code, rigorous testing, security audits. Weekly progress reports keep you in the loop.', 'Code2'),
    (4, 'Launch & Optimization', 'Week 13-14', 'Smooth deployment, performance tuning, SEO setup. Your launch will be flawless.', 'Rocket'),
    (5, 'Support & Growth', 'Forever', "We don't disappear. Ongoing maintenance, updates, and scaling support for life.", 'HeartHandshake'),
]


class Command(BaseCommand):
    help = 'Seed missing homepage data: Hero, Industries, Differentiators, Testimonials, CTA, ProcessSteps.'

    @transaction.atomic
    def handle(self, *args, **options):
        # Hero — singleton
        hero, hero_created = HeroSection.objects.get_or_create(
            defaults={
                'headline': "Bangladesh's Most Trusted Technology Partner",
                'subheadline': "We design, develop, and deploy world-class software, websites, and digital solutions for ambitious businesses — from neighborhood shops to multinational corporations.",
                'primary_cta_text': 'Get a Free Consultation',
                'primary_cta_link': '/contact',
                'secondary_cta_text': 'View Our Work',
                'secondary_cta_link': '/portfolio',
                'is_active': True,
            },
        )
        # Force update if existed but is_active was off
        if not hero_created:
            HeroSection.objects.filter(pk=hero.pk).update(is_active=True)
        self.stdout.write(f"Hero: {'created' if hero_created else 'exists'} (id={hero.id})")

        # Industries
        for i, (name, icon, desc) in enumerate(INDUSTRIES):
            Industry.objects.update_or_create(
                name=name,
                defaults={'icon_name': icon, 'description': desc, 'order': i, 'is_active': True},
            )
        self.stdout.write(f"Industries: {Industry.objects.count()}")

        # Differentiators
        for i, (title, desc, icon) in enumerate(DIFFERENTIATORS):
            Differentiator.objects.update_or_create(
                title=title,
                defaults={'description': desc, 'icon_name': icon, 'order': i},
            )
        self.stdout.write(f"Differentiators: {Differentiator.objects.count()}")

        # Testimonials
        for i, (content, name, title, company, service) in enumerate(TESTIMONIALS):
            Testimonial.objects.update_or_create(
                name=name, company=company,
                defaults={
                    'content': content, 'title': title, 'service_used': service,
                    'rating': 5, 'is_featured': True, 'order': i,
                },
            )
        self.stdout.write(f"Testimonials: {Testimonial.objects.count()}")

        # CTASection
        cta, cta_created = CTASection.objects.get_or_create(
            defaults={'is_active': True},
        )
        if not cta_created:
            CTASection.objects.filter(pk=cta.pk).update(is_active=True)
        self.stdout.write(f"CTASection: {'created' if cta_created else 'exists'}")

        # Process Steps
        for step_num, title, duration, desc, icon in PROCESS_STEPS:
            ProcessStep.objects.update_or_create(
                step_number=step_num,
                defaults={'title': title, 'duration': duration, 'description': desc, 'icon_name': icon, 'order': step_num},
            )
        self.stdout.write(f"ProcessSteps: {ProcessStep.objects.count()}")

        self.stdout.write(self.style.SUCCESS('Homepage data seeded.'))
