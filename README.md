# Mavericks Tech BD

Corporate website + CRM + Admin panel for Mavericks Tech BD (IT firm). Built for #1 Google ranking, Apple/Netguru-grade UX, and full content control via custom admin.

---

## Stack

| Layer | Tech |
|-------|------|
| Public site | Next.js 14 (App Router) + React + TypeScript + Tailwind CSS |
| Admin / CRM | Next.js 14 (App Router) + React + TypeScript + Tailwind CSS |
| Backend API | Django 5 + Django REST Framework |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis + Celery |
| Auth | Django auth (RBAC) + AWS Cognito (SSO / MFA) |
| Storage | AWS S3 (media), CloudFront (CDN) |
| Containers | Docker + docker-compose |
| Reverse proxy | Nginx |
| CI/CD | GitHub Actions |
| Observability | Sentry + GA4 + Search Console sync |
| API docs | drf-spectacular (OpenAPI 3) |
| Testing | Pytest (BE), Vitest + Playwright (FE) |

---

## Hard rules

1. **All data lives in Postgres via Django ORM.** No hardcoded copy, no static JSON fixtures in production, no cache-only data. Every string the user sees on the public site originates from the DB.
2. **Cache (Redis) is a performance layer only.** Never authoritative. On cache miss, DB is the source of truth.
3. **SEO is database-driven.** Meta tags, schema.org JSON-LD, sitemap entries, robots rules, redirects, canonical URLs — all editable from the admin panel, all stored in Postgres.
4. **Admin panel controls 100% of public content.** Pages, sections, blocks, services, portfolio, blog, careers, testimonials, navigation, footer, SEO — all CRUD via admin.
5. **No data duplication between frontend and backend.** Shared TS types are generated from the OpenAPI schema.

---

## Repository layout

```
mavericks-tech-bd/
├── frontend/        # Next.js public site
├── admin-panel/     # Next.js CRM + admin
├── backend/         # Django + DRF + Postgres
├── infra/           # AWS, Nginx, Terraform, CI
├── shared/          # generated TS types
├── docs/            # architecture, SEO, API contracts
├── tests/           # e2e, integration, load
└── docker-compose.yml
```

Full tree: see `docs/architecture.md`.

---

## Modules

### Public site (`frontend/`)
Home · About · Services · Industries · Portfolio · Case Studies · Blog · Careers · Pricing · Contact · Dynamic sitemap · Dynamic robots · JSON-LD per page.

### Admin / CRM (`admin-panel/`)
- **Dashboard** — KPIs, traffic, leads, deals
- **CRM** — Leads, Clients, Deals, Pipeline (Kanban), Tasks, Invoices, Reports
- **Content** — Pages, Services, Portfolio, Blog, Case Studies, Testimonials, Media library
- **SEO** — Meta tags, Schema.org, Sitemap, Robots, Redirects, Keywords, Analytics, Search Console
- **Users** — Members, Roles, Permissions (RBAC)
- **Careers** — Job posts, Applications
- **Contacts** — Form submissions
- **Newsletter** — Subscribers, Campaigns
- **Settings** — General, Integrations, Email templates, Audit logs

### Backend (`backend/apps/`)
`core` · `accounts` · `cms` · `services` · `portfolio` · `blog` · `careers` · `testimonials` · `industries` · `seo` · `crm` · `invoicing` · `contacts` · `newsletter` · `media` · `notifications` · `audit` · `analytics`

---

## Local development

### Prerequisites
- Docker + docker-compose
- Node 20+
- Python 3.12+
- Make

### First-time setup
```bash
git clone <repo>
cd mavericks-tech-bd
cp .env.example .env
make build
make up
make migrate
make seed          # seeds initial admin user + base pages
make createsuperuser
```

### Services after `make up`
| Service | URL |
|---------|-----|
| Public site | http://localhost:3000 |
| Admin panel | http://localhost:3001 |
| Django API | http://localhost:8000/api/v1/ |
| Django admin | http://localhost:8000/admin/ |
| API docs | http://localhost:8000/api/docs/ |
| Postgres | localhost:5432 |
| Redis | localhost:6379 |

### Common commands
```bash
make up              # start all services
make down            # stop all services
make logs            # tail all logs
make migrate         # run Django migrations
make makemigrations  # generate new migrations
make shell           # Django shell
make test            # run all tests
make lint            # lint FE + BE
make types           # regenerate shared TS types from OpenAPI
```

---

## Environment variables

See `.env.example`. Key groups:
- `POSTGRES_*` — database
- `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`
- `AWS_COGNITO_*` — Cognito user pool
- `AWS_S3_*` — media storage
- `REDIS_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_URL`
- `SENTRY_DSN`
- `GOOGLE_ANALYTICS_ID`, `GOOGLE_SEARCH_CONSOLE_*`

Never commit `.env`. Production secrets live in AWS Secrets Manager.

---

## Deployment

- AWS ECS Fargate for containers
- RDS Postgres
- ElastiCache Redis
- S3 + CloudFront for static/media
- ACM for TLS
- Route 53 for DNS
- GitHub Actions → ECR → ECS rolling deploy

See `docs/deployment.md`.

---

## SEO strategy

Goal: rank #1 for target keywords in Bangladesh IT services vertical.

- DB-driven meta + Open Graph + Twitter Card per page
- DB-driven JSON-LD (Organization, WebSite, Service, Article, BreadcrumbList, FAQPage)
- Dynamic sitemap.xml (Next.js + Django backed)
- Dynamic robots.txt
- 301/302 redirect manager in admin
- Canonical URL field per page
- Auto image alt + lazy load
- Core Web Vitals budget enforced in CI (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- ISR + Edge caching, revalidate webhook fires on admin save
- hreflang ready (en/bn)
- Search Console + GA4 sync into admin dashboard

See `docs/seo-strategy.md`.

---

## Security

- Django auth + AWS Cognito (MFA enforced for admin)
- RBAC roles: SuperAdmin, Admin, Editor, SalesAgent, Viewer
- DRF throttling per scope
- CSRF + CORS locked
- Argon2 password hashing
- Audit log for every admin write
- Rate-limited public forms (Cloudflare Turnstile)
- Dependency scanning (Dependabot + Trivy)

---

## License

Proprietary — Mavericks Tech BD. All rights reserved.
# Mavericks-IT
