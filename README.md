# Mavericks Tech Bangladesh

Corporate website + CRM + Admin panel for Mavericks Tech Bangladesh — premium IT firm serving 16 industries across BD. Built for #1 Google ranking, Apple/Netguru-grade UX, and full content control via custom admin.

**Tagline**: Bangladesh's Most Trusted Technology Partner
**Domain**: maverickstech.com.bd

---

## What This Is

Three integrated systems:

1. **Public Website** (50 pages) — Next.js 16. SEO-optimized, dark theme, 3D effects. Content 100% DB-driven.
2. **Admin Panel + CRM** — Django. Leads, Clients, Projects, Finance, Communications, Quotes, Blog, Team, Reports.
3. **Client Portal** — Project tracking, documents, invoices, e-signature.

## Services Sold

Custom Software (ERP/CRM/HR/POS/SaaS), Web Development, E-commerce, Mobile Apps, SEO/Marketing, Cybersecurity/Pentesting, Cloud Infrastructure, Domain/DNS/Hosting, POS Hardware bundles.

## Target Industries (16)

Corporate, E-commerce, F-commerce, Insta-commerce, Law firms, Healthcare, Education, Restaurants, Real Estate, Garments/RMG, Logistics, Government, Modeling, Social Platforms, Portfolios, Retail.

---

## Stack

| Layer | Tech |
|-------|------|
| Public site | Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS |
| Admin/CRM | Django 5 admin + custom Next.js front (Phase D) |
| Backend API | Django 5 + DRF + drf-spectacular (OpenAPI 3) |
| Database | SQLite (dev) / PostgreSQL 16 (prod) |
| Cache/Queue | Redis + Celery |
| Auth | Django auth + AWS Cognito MFA |
| Storage | AWS S3 + CloudFront |
| Containers | Docker + docker-compose |
| Reverse proxy | Nginx |
| CI/CD | GitHub Actions |

---

## Build Phases

- **Phase A** (current): CMS content models — SiteSettings, NavMenu, Footer, Page, MetaTag, SchemaOrg, MediaAsset, Redirect, admin polish, audit log
- **Phase B**: CRM core — Lead, Client, Project, Quote, Invoice, Task, Activity
- **Phase C**: Communications + bKash/Nagad/Rocket integration
- **Phase D**: Blog + Reports + RBAC + Settings + Client portal
- **Phase E**: Frontend rewrite — 50 pages consuming APIs

---

## Hard Rules

1. **All content in Postgres via Django ORM** — no hardcoded copy, no static JSON in production
2. **Cache (Redis) is performance only** — never authoritative
3. **SEO database-driven** — meta tags, schema.org, sitemaps all editable from admin
4. **Admin controls 100% of public content** — no code deploy to change a string
5. **No duplication between frontend and backend** — shared types from OpenAPI
6. **BD-specific built in** — bKash/Nagad/Rocket, Pathao/Sundarban/RedX, VAT 15%, Bangla support
7. **RBAC server-side** — DRF permissions on every viewset
8. **Audit log on every admin write** — django-simple-history

---

## Brand

**Colors** — Deep Space `#0A0A0F`, Midnight Navy `#0F172A`, Electric Cyan `#00D9FF`, Plasma Blue `#0066FF`
**Fonts** — Clash Display (display), Satoshi (body), JetBrains Mono (code)
**Voice** — Senior engineer + strategist. Confident, clear, human, bold, honest.

Full brand spec in [CLAUDE.md](CLAUDE.md).

---

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- Git

### Backend Setup
```bash
git clone https://github.com/Mavericks007-tech/Mavericks-IT.git
cd Mavericks-IT

python3 -m venv venv
source venv/bin/activate

cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
Backend → http://localhost:8000
Admin → http://localhost:8000/admin

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend → http://localhost:3000

---

## Repo Structure

```
Mavericks-IT/
├── frontend/              # Next.js 16 public site
│   ├── src/app/          # Pages (App Router)
│   ├── src/components/   # React components
│   ├── src/lib/          # API client + types
│   └── next.config.js
├── backend/              # Django 5 + DRF
│   ├── cms/              # Content models, admin, API
│   ├── core/             # BaseModel (UUID, soft delete)
│   ├── backend_config/   # Django settings, urls
│   └── manage.py
├── infra/nginx/          # Nginx config
├── CLAUDE.md             # AI assistant instructions (read first)
├── README.md             # This file
├── .env.example
└── docker-compose.yml
```

---

## Current Status

**Built**: 10 CMS models, basic admin, 1 API endpoint, 1 homepage with live data
**Phase A in progress**: SiteSettings, NavMenu, Footer, Page, MetaTag, SchemaOrg, MediaAsset, Redirect models + admin polish

See [CLAUDE.md](CLAUDE.md) for detailed phase plan and architecture.

What We're Building
In one sentence
A custom-built corporate website + CRM + admin console + client portal for Mavericks Tech Bangladesh — replacing what would normally be 4 separate SaaS subscriptions (Webflow + Salesforce + HubSpot + ClientPortal) with one self-hosted system you own end-to-end.

The 4 systems
1. Public website (maverickstech.com.bd)
What your customers see. 50+ pages: homepage, services × 12, industries × 16, about, process, pricing, portfolio, blog, contact, get-quote, FAQ, legal pages, careers, resources.

Premium feel — Apple-tier 3D scenes (React Three Fiber), animated backgrounds, smooth scroll, magnetic cursor, page transitions. Mobile-adaptive (low-end phones get CSS fallback, high-end gets full WebGL).

Every word editable from admin. Zero hardcoded copy. Change the hero headline at 3am — site updates within 60 seconds.

2. CRM (sales + delivery operations)
Where you manage everything that happens after a lead arrives. 13 connected models:

Lead → score Hot/Warm/Cold, track status (new → contacted → qualified → proposal sent → won/lost), assign to sales rep
Convert lead → Client (1 click, auto-creates Contact)
Client → company info, contacts, lifetime value, health score, VIP flag
Project → kanban by stage (discovery → design → development → testing → launching → completed), milestones, contract value, team members
Quote → line items, auto VAT calc, status tracking, view counts
Invoice → line items, VAT, payments, status auto-updates (draft → sent → partial → paid)
Payment → record bKash/Nagad/bank, verify → invoice updates → receipt email auto-sends
Task + Activity + Note → linkable to any of above
3. Admin console (/manage/*)
Branded custom UI for staff. 11 pages:

Dashboard — live KPI cards + revenue chart + lead pipeline + sources
Leads — Kanban or table view, status filters, lead detail with inline edit + convert action
Clients — list with VIP, health, lifetime value
Projects — kanban by stage with progress bars
Quotes — list with view tracking
Invoices — summary cards (billed/paid/overdue) + table
Email — templates / logs / stats tabs
Reports — 5 chart panels + team performance
Settings — quick links to deeper config
Auth: Django session cookies. Login at /manage/login → cookie travels with every API call. 9 RBAC roles seeded (Admin/Manager/SalesAgent/Editor/Marketing/Developer/Designer/Support/Viewer).

4. Client portal (/portal/*)
For your clients, not your staff. Magic-link login:

Client requests access at /portal/login w/ email
Backend sends one-time magic link
Click → token saved → access dashboard
Sees only their own data (scoped to their Client row):

Project tracker with milestone progress
Invoices list with paid/due
Quote list with status
Their contact info + company summary
No editing — read-only.

How it all works together
Data flow

Visitor lands on website
    ↓
Submits contact form OR get-quote form
    ↓
POST /api/v1/crm/public/leads/ (anonymous, public endpoint)
    ↓
Backend creates Lead row in Postgres
    ↓
Signal fires → send welcome email via SMTP
    ↓
Email logged in EmailLog table (tracking pixel inside)
    ↓
You see new Lead in /manage/leads Kanban
    ↓
You call/email lead → update status to "contacted"
    ↓
Lead qualifies → click "Convert" → Client + Contact created
    ↓
You create Project + Quote for this client (via Django admin or future custom UI)
    ↓
Quote sent → tracking shows views
    ↓
Client accepts → Invoice generated
    ↓
Client pays via bKash → you record Payment → marked verified
    ↓
Signal fires → invoice status auto → "partial" or "paid"
    ↓
Receipt email auto-sent to primary contact
    ↓
You generate magic link for client → portal access
    ↓
Client logs into /portal → sees project progress + invoices
    ↓
Project marked completed in /manage → notification email
    ↓
Lifetime value updates on Client → visible in /manage/clients
    ↓
Email campaign next month → bulk send to past clients
    ↓
Reports show revenue trend, conversion rates, team performance
Tech stack — actual

Browser
   ↓
Next.js 16 (React 19) — frontend
   ↓ fetch + cookies
Django 5 + DRF — backend API
   ↓ ORM
PostgreSQL 16 — single source of truth
   ↓ file paths
Local filesystem media/ (images + videos via admin upload)
   ↓ SMTP
Email out (currently console, prod = your Gmail/SES)
No Redis right now (planned P4). No Celery (planned P4). No S3 (filesystem). No CDN. All ready to swap in via env without code changes.

What makes it different from existing options
Need	Cheap path	Your path
Marketing site	Webflow $25/mo, locked-in templates	Custom code, 100% ownership, premium 3D
CRM	HubSpot $50-1500/mo per seat	Self-hosted, no per-seat fees
Admin/CMS	WordPress + plugins (hack-prone)	Django admin + custom React UI
Client portal	$30-100/mo per client SaaS	Built-in, magic-link, free
Email	Mailchimp $20-300/mo	Self-hosted SMTP + templates + tracking
Payments	Stripe-only $0.99 per txn	bKash/Nagad/Rocket BD-native + bank
Customization	Limited by SaaS	Unlimited — it's your code
Cost over 5 years	~$30k-100k in subscriptions	~$2k VPS hosting
Data ownership	SaaS owns it	You own every byte
What's done vs not
✅ Done (Phases A-D + P0/P1/P2/P3)
All backend models + APIs (50+ endpoints)
All admin functionality via Django admin + custom /manage/* UI
50+ frontend pages
100% DB-driven content
Email system with templates + tracking + campaigns
Client portal end-to-end
RBAC with 9 roles
Premium polish (3D scenes per service, animations, transitions, magnetic effects)
Reports & analytics
⏳ Not done
Production deploy — security hardening, env config, S3, Celery, Redis, Sentry, Docker prod, CI/CD
SEO completeness — sitemap, robots, OG image, meta per route, analytics wire-up
Content seeding — About body, Privacy body, blog posts, case studies, more service detail
Custom inline admin for everything — currently 50% custom (/manage/*), 50% Django admin links
CRM advanced features — quote builder UI, invoice PDF, calendar, bulk actions, file uploads
Tests — zero written
Optimization — image lazy-load (Next/Image), pagination, search