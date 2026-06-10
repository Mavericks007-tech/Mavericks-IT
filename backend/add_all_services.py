import os
import sys

import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_config.settings')
django.setup()

from cms.models import Service

print("Adding all 12 services...")

services_data = [
    (1, "Custom Software Development", "Built specifically for your business workflow", "We build software designed exactly for how YOUR business works — not generic software you have to adjust to.", "Code2"),
    (2, "Website Development", "Custom websites that convert visitors into paying customers", "Your website should bring in customers, not just sit there. We build websites that actually sell.", "Globe"),
    (3, "E-commerce Solutions", "Online stores that sell while you sleep", "Complete online shops where customers can buy 24/7, with payment systems like bKash and Nagad built in.", "ShoppingCart"),
    (4, "Mobile App Development", "Native iOS and Android apps users actually open daily", "Mobile apps for iPhone and Android phones that your customers will keep using.", "Smartphone"),
    (5, "SaaS Development", "Cloud-based software products that scale globally", "Software that businesses pay monthly to use (like Netflix, but for business tools). We build these for entrepreneurs.", "Cloud"),
    (6, "SEO & Digital Marketing", "Rank #1 on Google. Stay there.", "When someone searches Google for your type of business, we make sure YOUR business shows up first.", "TrendingUp"),
    (7, "UI/UX Design", "Designs that work, interfaces that work", "We make your website and apps look beautiful AND easy to use — so customers stay longer and buy more.", "PenTool"),
    (8, "Cybersecurity & Penetration Testing", "We hack you safely. Before criminals do.", "We test your business systems like a hacker would — but legally — to find weaknesses before real hackers steal your data.", "Shield"),
    (9, "Cloud Infrastructure", "AWS, Supabase, Firebase setup and management", "Your business data needs to live somewhere safe online. We set up that digital home and manage it for you.", "Server"),
    (10, "Hardware & POS Systems", "Complete POS bundles for restaurants, shops, and salons", "Modern cash counter systems with touchscreens, printers, and barcode scanners — fully set up and ready to use.", "ShoppingBag"),
    (11, "Domain & Hosting", "Complete management of your online presence", "Your business needs an address on the internet (like yourcompany.com) and a place to store your website. We handle all of it.", "Globe2"),
    (12, "Maintenance & Support", "24/7 monitoring, updates, and emergency support", "After we build your system, we don't disappear. We keep it running smoothly forever.", "Heart"),
]

for order, title, subtitle, explanation, icon in services_data:
    obj, created = Service.objects.update_or_create(
        title=title,
        defaults={
            'subtitle': subtitle,
            'simple_explanation': explanation,
            'icon_name': icon,
            'order': order,
            'is_featured': True,
            'gradient_from': '#00D9FF',
            'gradient_to': '#0066FF'
        }
    )
    print(f"{'✓ Created' if created else '✓ Updated'}: {order}. {title}")

print(f"\n✅ Total services now: {Service.objects.count()}")
print("\nAll services in order:")
for service in Service.objects.all().order_by('order'):
    print(f"  {service.order}. {service.title}")
