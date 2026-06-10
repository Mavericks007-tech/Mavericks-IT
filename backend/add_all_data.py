import os
import sys

import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_config.settings')
django.setup()

from cms.models import Differentiator, Industry, TrustStat

print("Adding data to database...")

# Trust Stats
trust_stats = [
    ("Projects Delivered", "250+", 250, "+", 1),
    ("Happy Clients", "150+", 150, "+", 2),
    ("Industries Served", "15+", 15, "+", 3),
    ("Client Retention", "98%", 98, "%", 4),
]

for label, value, num, suffix, order in trust_stats:
    obj, created = TrustStat.objects.get_or_create(
        label=label,
        defaults={
            'value': value,
            'numeric_value': num,
            'suffix': suffix,
            'order': order,
            'is_active': True
        }
    )
    print(f"{'Created' if created else 'Exists'}: {label}")

# Industries
industries = [
    ("Corporate & Enterprise", "Building", "Enterprise software solutions"),
    ("E-commerce Businesses", "ShoppingCart", "Complete online stores"),
    ("Restaurants & Food Service", "Coffee", "POS and online ordering"),
    ("Healthcare & Hospitals", "Heart", "Hospital management systems"),
    ("Education & Coaching", "GraduationCap", "School management software"),
    ("Garments & Manufacturing", "Factory", "ERP for RMG industry"),
]

for name, icon, desc in industries:
    obj, created = Industry.objects.get_or_create(
        name=name,
        defaults={
            'icon_name': icon,
            'description': desc,
            'order': 1,
            'is_active': True
        }
    )
    print(f"{'Created' if created else 'Exists'}: {name}")

# Differentiators
differentiators = [
    ("Engineering Excellence", "Custom code, never templates. Every project is built from scratch.", "Cpu"),
    ("Security First Approach", "Bank-grade encryption on every project.", "Shield"),
    ("Speed & Performance", "Sub-2-second load times guaranteed.", "Zap"),
    ("SEO Built-In", "Rank on Google from day one.", "TrendingUp"),
    ("Lifetime Support", "We don't disappear after launch.", "Heart"),
    ("Premium Quality", "Award-worthy design meets enterprise reliability.", "Star"),
]

for title, desc, icon in differentiators:
    obj, created = Differentiator.objects.get_or_create(
        title=title,
        defaults={
            'description': desc,
            'icon_name': icon,
            'order': 1
        }
    )
    print(f"{'Created' if created else 'Exists'}: {title}")

print("\n✅ Done!")
print(f"Trust Stats: {TrustStat.objects.count()}")
print(f"Industries: {Industry.objects.count()}")
print(f"Differentiators: {Differentiator.objects.count()}")
