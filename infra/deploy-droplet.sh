#!/usr/bin/env bash
# One-shot droplet bootstrap script.
#
# Usage:
#   ssh root@<droplet-ip>
#   curl -fsSL https://raw.githubusercontent.com/Mavericks007-tech/Mavericks-IT/main/infra/deploy-droplet.sh | bash
#
# OR after cloning the repo:
#   cd /opt/mavericks && bash infra/deploy-droplet.sh
#
# Idempotent — safe to re-run.
set -euo pipefail

REPO_URL="https://github.com/Mavericks007-tech/Mavericks-IT.git"
APP_DIR="/opt/mavericks"
DROPLET_IP="${DROPLET_IP:-$(curl -fsSL -4 https://ifconfig.io 2>/dev/null || hostname -I | awk '{print $1}')}"

log() { echo -e "\033[1;36m[deploy]\033[0m $*"; }

# ---------------------------------------------------------------------------
# 1. Prep repo
# ---------------------------------------------------------------------------
if [[ ! -d "$APP_DIR/.git" ]]; then
  log "Cloning repo → $APP_DIR"
  mkdir -p "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
else
  log "Repo present. Pulling latest..."
  git -C "$APP_DIR" fetch --all
  git -C "$APP_DIR" reset --hard origin/main
fi
cd "$APP_DIR"

# ---------------------------------------------------------------------------
# 2. Write .env if missing
# ---------------------------------------------------------------------------
if [[ ! -f .env ]]; then
  log "Generating .env (secrets random, IP-only mode)"
  SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
  DB_PASSWORD=$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-32)

  cat > .env <<EOF
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=${SECRET_KEY}
ALLOWED_HOSTS=${DROPLET_IP},localhost
BASE_URL=http://${DROPLET_IP}
LOG_LEVEL=INFO

DB_ENGINE=postgres
DB_NAME=mavericks_tech
DB_USER=mavericks
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=postgres
DB_PORT=5432
DB_CONN_MAX_AGE=600

CORS_ALLOWED_ORIGINS=http://${DROPLET_IP}
CSRF_TRUSTED_ORIGINS=http://${DROPLET_IP}

SECURE_SSL_REDIRECT=False
SECURE_HSTS_SECONDS=0

THROTTLE_ANON=60/min
THROTTLE_USER=1000/hour
THROTTLE_LOGIN=5/min
THROTTLE_PUBLIC_LEAD=10/hour
THROTTLE_MAGIC_LINK=5/hour

REDIS_URL=redis://redis:6379/1
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

EMAIL_HOST=
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@${DROPLET_IP}

USE_S3=False
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=mavericks-media
AWS_S3_REGION_NAME=sgp1
AWS_S3_ENDPOINT_URL=
AWS_S3_CUSTOM_DOMAIN=

USE_CLOUDINARY=False

SENTRY_DSN=
SENTRY_TRACES_RATE=0.1

GUNICORN_WORKERS=2

NGINX_SITE_CONF=ip-only.conf

NEXT_PUBLIC_API_URL=http://${DROPLET_IP}/api/v1
NEXT_PUBLIC_SITE_URL=http://${DROPLET_IP}
EOF
  chmod 600 .env
  log ".env written (SECRET_KEY + DB_PASSWORD random, file mode 600)"
else
  log ".env exists — leaving alone"
fi

# ---------------------------------------------------------------------------
# 3. Build + boot
# ---------------------------------------------------------------------------
log "Building images (first run takes 5-10 minutes)..."
docker compose -f docker-compose.prod.yml --env-file .env build

log "Starting stack..."
docker compose -f docker-compose.prod.yml --env-file .env up -d

log "Waiting for Postgres..."
until docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U mavericks >/dev/null 2>&1; do
  sleep 2
done
log "Postgres up."

log "Running migrations..."
docker compose -f docker-compose.prod.yml exec -T backend python manage.py migrate --noinput

log "Collecting static..."
docker compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput || true

log "Seeding P6 content (Page bodies, MetaTags, CaseStudies, BlogPosts)..."
docker compose -f docker-compose.prod.yml exec -T backend python manage.py seed_p6 || true

# ---------------------------------------------------------------------------
# 4. Status
# ---------------------------------------------------------------------------
log "---- Container status ----"
docker compose -f docker-compose.prod.yml ps
log "---- Smoke test ----"
sleep 3
curl -sSf -I "http://${DROPLET_IP}/" | head -3 || log "site not responding yet"
echo
log "Site should be live at: http://${DROPLET_IP}"
log "Admin at: http://${DROPLET_IP}/admin"
log ""
log "Next: create superuser:"
log "  docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser"
