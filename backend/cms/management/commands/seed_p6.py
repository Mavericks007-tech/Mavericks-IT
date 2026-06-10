"""Phase-6 seed: fills Page bodies, MetaTag fanout, SchemaOrg per detail pattern,
CaseStudy + BlogPost rows. Idempotent — re-runnable. Existing rows updated."""
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from cms.models import BlogPost, CaseStudy, Industry, Service
from seo.models import MetaTag, SchemaOrg
from site_content.models import Page

# ---------------------------------------------------------------------------
# Page bodies
# ---------------------------------------------------------------------------
PAGE_BODIES = {
    'about': {
        'title': 'About Mavericks Tech Bangladesh',
        'body': """
<h2>Bangladesh's Most Trusted Technology Partner</h2>
<p>Mavericks Tech Bangladesh was founded on one belief: the country deserves software built to international standards, not corner-cut copies of other people's work. Since 2020 we have shipped production systems for banks, garment exporters, law firms, hospitals, schools, restaurants and government departments — and every line of code has gone through the same review gauntlet.</p>

<h3>What we actually do</h3>
<p>We design, build and operate custom software. ERPs that replace four SaaS subscriptions. E-commerce that takes bKash and Nagad on day one. Pentest engagements that find the bug your last vendor missed. Cloud infrastructure that does not page you at 2am. Mobile apps that ship to both stores on the first submission.</p>

<h3>How we work</h3>
<p>One senior engineer owns your project end-to-end. No handoffs. No "the previous developer left." Weekly demos, fixed milestones, transparent timesheets. You always know what we built last week and what is shipping next week.</p>

<h3>Where we are</h3>
<p>Headquartered in Dhaka. Serving Bangladesh first, exporting elsewhere. We are not the cheapest option in the market — we are the one you call after the cheapest option missed three deadlines.</p>
        """.strip(),
    },
    'privacy-policy': {
        'title': 'Privacy Policy',
        'body': """
<p><em>Last updated: 2026-06-09</em></p>

<h2>1. What we collect</h2>
<p>When you fill out a contact or get-quote form on maverickstech.com.bd we store: your name, email, phone, company, the message you wrote, and the time you sent it. If you become a client we additionally store billing, project, invoice and communication records strictly to deliver the service.</p>

<h2>2. Cookies and analytics</h2>
<p>We use first-party session cookies for login state and CSRF protection. If you accept analytics cookies we also load Google Analytics 4 with IP anonymisation enabled. We do not sell, rent or trade your data with third parties for advertising.</p>

<h2>3. How we use the data</h2>
<ul>
<li>Reply to your enquiry.</li>
<li>Deliver paid services you signed a contract for.</li>
<li>Send transactional email (invoices, receipts, project updates).</li>
<li>Anonymous aggregated analytics to improve the site.</li>
</ul>

<h2>4. Retention</h2>
<p>Leads kept 24 months unless you become a client. Client records kept for the duration of the engagement plus 7 years to satisfy Bangladesh tax and audit law. You can request deletion at any time, subject to those legal retention windows.</p>

<h2>5. Your rights</h2>
<p>Email <a href="mailto:privacy@maverickstech.com.bd">privacy@maverickstech.com.bd</a> to request access, correction or deletion of your data.</p>

<h2>6. Security</h2>
<p>All data is encrypted in transit (TLS 1.2+) and at rest. Production access is restricted to named senior staff, audited via django-simple-history, and revoked at offboarding.</p>
        """.strip(),
    },
    'terms-conditions': {
        'title': 'Terms &amp; Conditions',
        'body': """
<p><em>Last updated: 2026-06-09</em></p>

<h2>1. Who you are contracting with</h2>
<p>"We", "us" and "Mavericks" refer to Mavericks Tech Bangladesh. "You" refers to the visitor or client.</p>

<h2>2. Scope of services</h2>
<p>Every paid engagement is governed by a separate Statement of Work that defines scope, deliverables, milestones, price, payment schedule and acceptance criteria. The SOW prevails over anything stated on this website.</p>

<h2>3. Payment</h2>
<p>Quoted prices exclude 15% VAT unless explicitly stated. Standard terms: 50% on signing, balance in milestones. Invoices are due 7 days from issue. Overdue invoices accrue 2% monthly until cleared.</p>

<h2>4. Intellectual property</h2>
<p>On final payment, all custom code we write for you becomes your property under a perpetual licence. Reusable internal libraries, frameworks and templates remain ours and are licenced to you royalty-free for the duration of use.</p>

<h2>5. Liability</h2>
<p>Our total liability for any claim is capped at fees paid in the 12 months preceding the claim. We are not liable for indirect or consequential losses.</p>

<h2>6. Termination</h2>
<p>Either party may terminate for material breach with 30 days written notice. Work completed up to the termination date is invoiced pro-rata.</p>

<h2>7. Governing law</h2>
<p>These terms are governed by the laws of Bangladesh. Disputes are submitted to the courts of Dhaka.</p>
        """.strip(),
    },
    'cookie-policy': {
        'title': 'Cookie Policy',
        'body': """
<p><em>Last updated: 2026-06-09</em></p>

<h2>1. What is a cookie?</h2>
<p>A small text file your browser stores so a website can remember things between requests — for example whether you are logged in.</p>

<h2>2. Cookies we set</h2>
<table>
<thead><tr><th>Name</th><th>Purpose</th><th>Lifetime</th></tr></thead>
<tbody>
<tr><td><code>sessionid</code></td><td>Logged-in session for the admin / portal</td><td>2 weeks</td></tr>
<tr><td><code>csrftoken</code></td><td>Protects forms from cross-site forgery</td><td>1 year</td></tr>
<tr><td><code>_ga / _ga_*</code></td><td>Google Analytics 4 — anonymised traffic stats (only if you accept analytics)</td><td>2 years</td></tr>
</tbody>
</table>

<h2>3. Managing cookies</h2>
<p>You can clear cookies at any time from your browser settings. Blocking session/CSRF cookies will break login functionality.</p>
        """.strip(),
    },
    'refund-policy': {
        'title': 'Refund Policy',
        'body': """
<p><em>Last updated: 2026-06-09</em></p>

<h2>1. Custom software, web &amp; mobile projects</h2>
<p>Milestone payments are non-refundable once the corresponding milestone is delivered and accepted in writing. If a milestone is rejected within the acceptance window stated in the SOW we will rework the deliverable at no extra cost.</p>

<h2>2. Subscription services (SEO, marketing, retainers)</h2>
<p>Cancellable with 30 days notice. The current month is non-refundable; unused future months are refunded in full.</p>

<h2>3. POS hardware bundles</h2>
<p>Hardware is returnable within 7 days of delivery, unopened, in original packaging. Restocking fee 10%. Software licences activated cannot be refunded.</p>

<h2>4. How to request a refund</h2>
<p>Email <a href="mailto:billing@maverickstech.com.bd">billing@maverickstech.com.bd</a> with your invoice number and reason. We respond within 3 business days.</p>
        """.strip(),
    },
}


# ---------------------------------------------------------------------------
# MetaTag fanout — services × 16, industries × 16, static pages
# ---------------------------------------------------------------------------
STATIC_META = [
    ('/',            'Mavericks Tech | Bangladesh\'s Most Trusted Technology Partner',
        "Custom software, web, mobile, e-commerce, cybersecurity. Senior engineers. Fixed price. Real timelines."),
    ('/about',       'About Mavericks Tech Bangladesh',
        "Premium IT firm building production-grade software since 2020. ERPs, e-commerce, mobile, pentest — all in-house."),
    ('/process',     'How We Work | Mavericks Tech',
        "Discovery → design → build → ship → operate. Weekly demos, fixed milestones, transparent timesheets."),
    ('/services',    'Services | Custom Software, Web, Mobile, Security',
        "9 service lines. Custom ERP/CRM/HR/POS, web, e-commerce, mobile apps, SEO, cybersecurity, cloud, hardware."),
    ('/industries',  'Industries We Serve | 16 sectors',
        "Corporate, e-commerce, F-commerce, law, healthcare, education, restaurants, real estate, RMG, logistics, government."),
    ('/portfolio',   'Portfolio | Software We Built',
        "Case studies from banks, garment exporters, law firms, hospitals, schools and restaurants across Bangladesh."),
    ('/pricing',     'Pricing | Honest, Bangladeshi rates',
        "৳65k web. ৳1.5L e-commerce. ৳3.5L mobile. ৳2L+ ERP. ৳18k/mo SEO. ৳65k+ pentest. Real numbers, no surprises."),
    ('/blog',        'Insights | Mavericks Tech Blog',
        "Articles on building software in Bangladesh — engineering, hiring, security, scaling, BD payment integrations."),
    ('/contact',     'Contact Mavericks Tech Bangladesh',
        "Email, WhatsApp, phone. Dhaka office. Free 30-minute strategy call for qualified projects."),
    ('/get-quote',   'Get a Free Project Quote',
        "Tell us about your project. Detailed quote within 2 business days. Free, no obligation."),
    ('/careers',     'Careers at Mavericks Tech',
        "Senior engineers, designers and PMs. Remote-friendly. We hire for taste, not titles."),
    ('/faq',         'Frequently Asked Questions',
        "Timelines, payments, IP ownership, post-launch support, BD-specific integrations — answered."),
    ('/resources',   'Free Resources | Mavericks Tech',
        "Guides, checklists and templates for Bangladeshi business owners shipping software."),
    ('/legal/privacy',  'Privacy Policy',  "How we collect, use and protect your personal data."),
    ('/legal/terms',    'Terms & Conditions', "Contract terms governing all engagements with Mavericks Tech."),
    ('/legal/cookie',   'Cookie Policy',     "What cookies maverickstech.com.bd sets and how to control them."),
    ('/legal/refund',   'Refund Policy',     "When and how we issue refunds across services and hardware."),
]


def service_meta(service):
    title = f"{service.title} | Mavericks Tech Bangladesh"
    summary = getattr(service, 'subtitle', '') or getattr(service, 'simple_explanation', '') or service.title
    desc = summary[:155]
    return f"/services/{service.slug}", title, desc


def industry_meta(industry):
    name = industry.name
    summary = industry.description or f"Software solutions for the {name} sector in Bangladesh."
    return f"/industries/{industry.slug}", f"{name} Software Solutions | Mavericks Tech", summary[:155]


# ---------------------------------------------------------------------------
# SchemaOrg per detail pattern
# ---------------------------------------------------------------------------
def website_schema(domain='https://maverickstech.com.bd'):
    return {
        'name': 'Mavericks Tech Bangladesh',
        'url': domain,
        'potentialAction': {
            '@type': 'SearchAction',
            'target': {'@type': 'EntryPoint', 'urlTemplate': f'{domain}/blog?q={{search_term_string}}'},
            'query-input': 'required name=search_term_string',
        },
    }


def breadcrumb_schema(items):
    return {
        'itemListElement': [
            {'@type': 'ListItem', 'position': i + 1, 'name': name, 'item': url}
            for i, (name, url) in enumerate(items)
        ],
    }


def service_schema(service, domain='https://maverickstech.com.bd'):
    summary = getattr(service, 'subtitle', '') or getattr(service, 'simple_explanation', '') or service.title
    return {
        'name': service.title,
        'serviceType': service.title,
        'provider': {'@type': 'Organization', 'name': 'Mavericks Tech Bangladesh', 'url': domain},
        'areaServed': {'@type': 'Country', 'name': 'Bangladesh'},
        'description': summary[:300],
        'url': f"{domain}/services/{service.slug}",
    }


def industry_schema(industry, domain='https://maverickstech.com.bd'):
    return {
        'name': f"{industry.name} Software Solutions",
        'provider': {'@type': 'Organization', 'name': 'Mavericks Tech Bangladesh', 'url': domain},
        'areaServed': {'@type': 'Country', 'name': 'Bangladesh'},
        'description': (industry.description or '')[:300],
        'url': f"{domain}/industries/{industry.slug}",
    }


# ---------------------------------------------------------------------------
# CaseStudy + BlogPost samples
# ---------------------------------------------------------------------------
CASE_STUDIES = [
    {
        'title': 'Dhaka Garments ERP — 12 factories, one system',
        'client_name': 'Dhaka Garments Group',
        'industry': 'Garments/RMG',
        'metric': '42%',
        'metric_description': 'reduction in monthly closing time',
        'description': 'End-to-end ERP covering procurement, production, QC, payroll and BSCI compliance across 12 factories.',
        'challenge': 'Six disconnected legacy systems. Manual reconciliation taking 5 days every month-end. No real-time visibility for buyers.',
        'solution': 'Custom Django + Postgres ERP. Biometric attendance via ZKTeco. BSCI-ready audit trails. Buyer portal with live PO status.',
        'results': [
            'Month-end close cut from 5 days to 7 hours',
            'BSCI audit prep time halved',
            'Zero data-entry double-keying across 8 departments',
            'Live PO visibility for top-3 buyers',
        ],
        'image_url': '/og-default.png',
        'logo_url': '',
        'testimonial_quote': "The team understood RMG operations better than vendors three times their size. We close books before our auditors finish their coffee.",
        'testimonial_author': 'Rashed Karim',
        'testimonial_title': 'CFO, Dhaka Garments Group',
        'technologies': ['Django', 'PostgreSQL', 'Celery', 'Redis', 'React', 'ZKTeco SDK'],
        'is_featured': True,
        'order': 1,
    },
    {
        'title': 'Lex Chambers — case management for 40-lawyer firm',
        'client_name': 'Lex Chambers',
        'industry': 'Law',
        'metric': '3x',
        'metric_description': 'faster matter intake',
        'description': 'Practice management replacing Excel + email + paper. Conflict checking, time tracking, trust accounting, BD bar compliance.',
        'challenge': 'New matter intake taking 90 minutes. No firmwide conflict view. Trust account reconciliations done manually each quarter.',
        'solution': 'Custom Django app with role-based access for partners, associates and paralegals. PDF generation for engagement letters. Bangla + English support.',
        'results': [
            'Matter intake down to 30 minutes',
            'Real-time conflict checking across all matters',
            'Trust account reconciliation now automated',
            '100% paperless filings for new matters',
        ],
        'image_url': '/og-default.png',
        'logo_url': '',
        'testimonial_quote': "Replaced four tools and a paper ledger. Compliance audit took two days instead of two weeks.",
        'testimonial_author': 'Barrister Tasneem Haque',
        'testimonial_title': 'Managing Partner, Lex Chambers',
        'technologies': ['Django', 'PostgreSQL', 'WeasyPrint', 'React'],
        'is_featured': True,
        'order': 2,
    },
    {
        'title': 'BongoMart — bKash-first e-commerce at scale',
        'client_name': 'BongoMart',
        'industry': 'E-commerce',
        'metric': '4.2x',
        'metric_description': 'cart-to-checkout conversion',
        'description': 'Headless Next.js storefront on Django/DRF backend with bKash, Nagad, Rocket and COD. Pathao + RedX courier integration.',
        'challenge': 'Shopify costing ৳40k/month with 2% txn fees and no bKash. Mobile conversion stuck at 0.7%.',
        'solution': 'Self-hosted Next.js + Django. Native bKash + Nagad checkout. Server-rendered product pages. Pathao webhook auto-updates buyer.',
        'results': [
            'Mobile conversion 0.7% → 3%',
            'Saved ৳480k/year on SaaS fees',
            '2-second LCP on average product page',
            'Zero failed bKash checkouts in 90 days',
        ],
        'image_url': '/og-default.png',
        'logo_url': '',
        'testimonial_quote': "We tripled revenue without tripling ad spend. The checkout just works.",
        'testimonial_author': 'Faria Ahmed',
        'testimonial_title': 'Founder, BongoMart',
        'technologies': ['Next.js', 'Django', 'PostgreSQL', 'bKash API', 'Nagad API', 'Pathao API'],
        'is_featured': True,
        'order': 3,
    },
]


BLOG_POSTS = [
    {
        'title': 'Integrating bKash into a Next.js + Django stack — the parts the docs skip',
        'slug': 'bkash-nextjs-django-integration',
        'excerpt': 'bKash sandbox vs production differs in three subtle ways. Here is the checklist we wish existed before our first integration.',
        'content': """
<p>bKash is the default payment rail in Bangladesh and yet integrating it remains painful for first-time teams. After shipping it in seven production storefronts, here is the checklist that would have saved us weeks.</p>
<h2>1. Sandbox and production are not the same API</h2>
<p>Sandbox accepts test merchant tokens that production silently rejects with HTTP 200 but <code>statusCode: \"2024\"</code>. Always wrap their response in a status-code check, never in <code>response.ok</code>.</p>
<h2>2. Token TTL is documented as 1 hour. It is closer to 55 minutes.</h2>
<p>Refresh at 50 minutes. Caching with Redis on a 50-minute TTL is the safe default.</p>
<h2>3. The callback fires twice on flaky 3G</h2>
<p>Idempotency on <code>trxID</code> is mandatory. We use a unique constraint on the column and let Postgres reject duplicates.</p>
        """.strip(),
        'featured_image': '/og-default.png',
        'author': 'Forhad Hossain',
        'author_avatar': '',
        'read_time': 6,
        'category': 'Engineering',
        'tags': ['bKash', 'Django', 'Next.js', 'Payments'],
        'is_published': True,
    },
    {
        'title': 'Why we still pick Django over Rails for Bangladeshi clients',
        'slug': 'django-vs-rails-bangladesh',
        'excerpt': 'Hiring market, deployment cost, batteries-included admin. Three reasons Django keeps winning RFPs we run.',
        'content': """
<h2>Hiring</h2>
<p>Dhaka has 6x more deployable Django engineers than Rails engineers in the LinkedIn talent pool we sampled. Hiring is the cost that compounds.</p>
<h2>Admin out of the box</h2>
<p>Every CMS request, every CRM screen, every internal tool — Django admin gets you 70% of the way to a working back-office in a day.</p>
<h2>Deployment</h2>
<p>VPS hosting in Singapore (~৳3k/mo) handles a Django + Postgres + Redis stack for most of our clients. Same workload on Rails ate 50% more memory in our last A/B.</p>
        """.strip(),
        'featured_image': '/og-default.png',
        'author': 'Forhad Hossain',
        'author_avatar': '',
        'read_time': 5,
        'category': 'Engineering',
        'tags': ['Django', 'Hiring', 'Architecture'],
        'is_published': True,
    },
    {
        'title': 'A pentest checklist for your first BD e-commerce launch',
        'slug': 'pentest-checklist-ecommerce-launch',
        'excerpt': 'Twelve checks every Bangladeshi e-commerce should pass before opening the door. From IDOR to bKash replay.',
        'content': """
<p>The cheapest pentest is the one you run on yourself the night before launch. Twelve checks we now run on every BD e-commerce we ship.</p>
<ol>
<li>IDOR on /api/orders/&lt;id&gt; — try another user's order id.</li>
<li>Coupon code race conditions — fire 50 concurrent applies.</li>
<li>bKash callback replay — resend the same trxID twice.</li>
<li>OTP brute force — rate-limit at 5/min/IP and 10/hour/phone.</li>
<li>Admin login over HTTP — must be hard 301 to HTTPS.</li>
<li>CSRF on cart add — token check on every state-changing POST.</li>
<li>XSS in product reviews — strip on input, escape on render.</li>
<li>SQL injection on filters — parameterised queries only.</li>
<li>Upload bypass — verify MIME and extension, both.</li>
<li>SSRF on image proxy — block private IP ranges.</li>
<li>JWT none-alg — explicitly reject <code>alg: none</code>.</li>
<li>Open redirects on <code>?next=</code> — whitelist hostnames.</li>
</ol>
        """.strip(),
        'featured_image': '/og-default.png',
        'author': 'Forhad Hossain',
        'author_avatar': '',
        'read_time': 7,
        'category': 'Security',
        'tags': ['Pentest', 'OWASP', 'E-commerce'],
        'is_published': True,
    },
]


# ---------------------------------------------------------------------------
# Command
# ---------------------------------------------------------------------------
class Command(BaseCommand):
    help = "Seed Phase 6 content: Page bodies, MetaTag fanout, SchemaOrg, CaseStudy + BlogPost samples"

    def add_arguments(self, parser):
        parser.add_argument('--only', choices=['pages', 'meta', 'schema', 'case', 'blog'], help='Limit to one section')

    @transaction.atomic
    def handle(self, *args, only=None, **opts):
        if only in (None, 'pages'):    self._seed_pages()
        if only in (None, 'meta'):     self._seed_meta()
        if only in (None, 'schema'):   self._seed_schema()
        if only in (None, 'case'):     self._seed_case_studies()
        if only in (None, 'blog'):     self._seed_blog()
        self.stdout.write(self.style.SUCCESS('seed_p6: done'))

    # -- pages --
    def _seed_pages(self):
        n = 0
        for slug, payload in PAGE_BODIES.items():
            obj, created = Page.objects.update_or_create(
                slug=slug,
                defaults={
                    'title': payload['title'],
                    'body': payload['body'],
                    'status': 'published',
                    'show_in_sitemap': True,
                },
            )
            n += 1
            self.stdout.write(f"  page {'+' if created else '~'} /{slug}")
        self.stdout.write(self.style.SUCCESS(f"pages: {n}"))

    # -- meta --
    def _seed_meta(self):
        n = 0
        # static
        for path, title, desc in STATIC_META:
            MetaTag.objects.update_or_create(
                path=path,
                defaults={
                    'title': title[:70],
                    'description': desc[:200],
                    'robots': 'index,follow',
                    'og_title': title[:100],
                    'og_description': desc[:300],
                    'twitter_title': title[:100],
                    'twitter_description': desc[:300],
                },
            )
            n += 1
        # services
        for s in Service.objects.all():
            path, title, desc = service_meta(s)
            MetaTag.objects.update_or_create(
                path=path,
                defaults={
                    'title': title[:70],
                    'description': desc[:200],
                    'robots': 'index,follow',
                    'og_title': title[:100],
                    'og_description': desc[:300],
                    'twitter_title': title[:100],
                    'twitter_description': desc[:300],
                },
            )
            n += 1
        # industries
        for i in Industry.objects.all():
            path, title, desc = industry_meta(i)
            MetaTag.objects.update_or_create(
                path=path,
                defaults={
                    'title': title[:70],
                    'description': desc[:200],
                    'robots': 'index,follow',
                    'og_title': title[:100],
                    'og_description': desc[:300],
                    'twitter_title': title[:100],
                    'twitter_description': desc[:300],
                },
            )
            n += 1
        self.stdout.write(self.style.SUCCESS(f"meta: {n}"))

    # -- schema --
    def _seed_schema(self):
        n = 0
        SchemaOrg.objects.update_or_create(
            path='/', schema_type='WebSite',
            defaults={'data': website_schema(), 'is_active': True},
        )
        n += 1
        for s in Service.objects.all():
            SchemaOrg.objects.update_or_create(
                path=f"/services/{s.slug}", schema_type='Service',
                defaults={'data': service_schema(s), 'is_active': True},
            )
            SchemaOrg.objects.update_or_create(
                path=f"/services/{s.slug}", schema_type='BreadcrumbList',
                defaults={
                    'data': breadcrumb_schema([
                        ('Home', 'https://maverickstech.com.bd'),
                        ('Services', 'https://maverickstech.com.bd/services'),
                        (s.title, f"https://maverickstech.com.bd/services/{s.slug}"),
                    ]),
                    'is_active': True,
                },
            )
            n += 2
        for i in Industry.objects.all():
            SchemaOrg.objects.update_or_create(
                path=f"/industries/{i.slug}", schema_type='Service',
                defaults={'data': industry_schema(i), 'is_active': True},
            )
            SchemaOrg.objects.update_or_create(
                path=f"/industries/{i.slug}", schema_type='BreadcrumbList',
                defaults={
                    'data': breadcrumb_schema([
                        ('Home', 'https://maverickstech.com.bd'),
                        ('Industries', 'https://maverickstech.com.bd/industries'),
                        (i.name, f"https://maverickstech.com.bd/industries/{i.slug}"),
                    ]),
                    'is_active': True,
                },
            )
            n += 2
        for b in BlogPost.objects.filter(is_published=True):
            SchemaOrg.objects.update_or_create(
                path=f"/blog/{b.slug}", schema_type='BlogPosting',
                defaults={
                    'data': {
                        'headline': b.title,
                        'description': b.excerpt[:200],
                        'datePublished': b.published_at.isoformat() if b.published_at else None,
                        'author': {'@type': 'Person', 'name': b.author},
                        'publisher': {
                            '@type': 'Organization',
                            'name': 'Mavericks Tech Bangladesh',
                            'logo': {'@type': 'ImageObject', 'url': 'https://maverickstech.com.bd/icons/icon-512.png'},
                        },
                        'mainEntityOfPage': f"https://maverickstech.com.bd/blog/{b.slug}",
                    },
                    'is_active': True,
                },
            )
            n += 1
        self.stdout.write(self.style.SUCCESS(f"schema: {n}"))

    # -- case studies --
    def _seed_case_studies(self):
        n = 0
        for c in CASE_STUDIES:
            CaseStudy.objects.update_or_create(
                client_name=c['client_name'],
                defaults=c,
            )
            n += 1
        self.stdout.write(self.style.SUCCESS(f"case studies: {n}"))

    # -- blog --
    def _seed_blog(self):
        n = 0
        now = timezone.now()
        for idx, post in enumerate(BLOG_POSTS):
            BlogPost.objects.update_or_create(
                slug=post['slug'],
                defaults={**post, 'published_at': now - timedelta(days=idx * 5), 'views': 0},
            )
            n += 1
        self.stdout.write(self.style.SUCCESS(f"blog posts: {n}"))
