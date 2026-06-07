
# Mavericks Tech BD

Corporate website + CRM + Admin panel for Mavericks Tech BD (IT firm). Built for #1 Google ranking, Apple/Netguru-grade UX, and full content control via custom admin.

---

## ✅ Project Status: Working & Deployable

**Current Working State:**
- ✅ Backend: Django 5 + DRF running on localhost:8000
- ✅ Frontend: Next.js 15 + React 19 running on localhost:3000  
- ✅ API: 7+ REST endpoints working with CORS configured
- ✅ Database: 12 Services, Hero Section, Testimonials, Trust Stats, Industries, Differentiators
- ✅ Admin Panel: Fully configured at /admin
- ✅ CORS: Properly configured for frontend-backend communication

---

## Stack

| Layer | Tech |
|-------|------|
| Public site | Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS |
| Admin / CRM | Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS |
| Backend API | Django 5 + Django REST Framework |
| Database | SQLite (dev) / PostgreSQL 16 (prod) |
| Cache / Queue | Redis + Celery (production) |
| Auth | Django auth (RBAC) + AWS Cognito (SSO / MFA) |
| Storage | AWS S3 (media), CloudFront (CDN) |
| Containers | Docker + docker-compose |
| Reverse proxy | Nginx |
| CI/CD | GitHub Actions |
| API docs | drf-spectacular (OpenAPI 3) |

---

## Hard rules

1. **All data lives in Postgres via Django ORM.** No hardcoded copy, no static JSON fixtures in production.
2. **Cache (Redis) is a performance layer only.** Never authoritative.
3. **SEO is database-driven.** Meta tags, schema.org, sitemaps — all editable from admin.
4. **Admin panel controls 100% of public content.** All CRUD via admin.
5. **No data duplication between frontend and backend.** Shared TS types from OpenAPI.

---

## Quick Start (Local Development)

### Prerequisites
- Python 3.12+
- Node.js 18+
- Git

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/Mavericks007-tech/Mavericks-IT.git
cd Mavericks-IT

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (admin access)
python manage.py createsuperuser

# Start backend server
python manage.py runserver

Mavericks-IT/
├── frontend/              # Next.js public site (WORKING)
│   ├── src/app/          # Pages (page.tsx, layout.tsx, globals.css)
│   ├── src/components/   # React components
│   ├── src/lib/          # API client
│   ├── package.json      # Dependencies
│   └── next.config.js    # Next.js config
├── backend/              # Django + DRF (WORKING)
│   ├── cms/              # Main app with models
│   │   ├── models.py     # 8+ models (12 Services, Testimonials, etc.)
│   │   ├── admin.py      # Admin configuration
│   │   ├── api_views.py  # REST API endpoints
│   │   ├── api_urls.py   # API routing
│   │   └── migrations/   # Database migrations
│   ├── core/             # Base models (BaseModel)
│   ├── backend_config/   # Django settings, urls
│   ├── manage.py
│   └── db.sqlite3        # Development database
├── infra/                # Infrastructure configs
├── CLAUDE.md             # AI assistant instructions
├── .env.example
└── docker-compose.yml

{
  "hero": {
    "headline": "Bangladesh's Most Trusted Technology Partner",
    "subheadline": "We design, develop, and deploy world-class software",
    "primary_cta_text": "Get a Free Consultation"
  },
  "services": [
    {
      "title": "Custom Software Development",
      "subtitle": "Built specifically for your business workflow",
      "order": 1
    }
  ],
  "trust_stats": [
    {"label": "Projects Delivered", "value": "250+"}
  ]
}

