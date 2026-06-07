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
