.PHONY: help install runserver migrate makemigrations shell test lint \
        front-install front-dev front-build front-lint \
        up down logs build backup restore collectstatic createsuperuser \
        celery beat redis-cli psql clean \
        prod-up prod-down prod-migrate prod-logs

PYTHON   ?= python
VENV     ?= venv
ACTIVATE ?= source $(VENV)/bin/activate
COMPOSE  ?= docker compose
COMPOSE_PROD ?= docker compose -f docker-compose.prod.yml --env-file .env

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN{FS=":.*?## "}{printf "\033[36m%-22s\033[0m %s\n", $$1, $$2}'

# ----- backend (venv) -----
install:           ## Install backend deps into venv
	$(PYTHON) -m venv $(VENV)
	$(ACTIVATE) && pip install -r backend/requirements.txt

runserver:         ## Django dev server
	$(ACTIVATE) && cd backend && python manage.py runserver

migrate:           ## Apply migrations
	$(ACTIVATE) && cd backend && python manage.py migrate

makemigrations:    ## Create migrations
	$(ACTIVATE) && cd backend && python manage.py makemigrations

shell:             ## Django shell
	$(ACTIVATE) && cd backend && python manage.py shell

createsuperuser:   ## Create superuser
	$(ACTIVATE) && cd backend && python manage.py createsuperuser

collectstatic:     ## Collect static files
	$(ACTIVATE) && cd backend && python manage.py collectstatic --noinput

test:              ## Run pytest
	$(ACTIVATE) && cd backend && pytest

lint:              ## Ruff backend
	$(ACTIVATE) && cd backend && ruff check .

celery:            ## Celery worker
	$(ACTIVATE) && cd backend && celery -A backend_config worker -l info

beat:              ## Celery beat
	$(ACTIVATE) && cd backend && celery -A backend_config beat -l info

# ----- frontend -----
front-install:     ## Install frontend deps
	cd frontend && npm install

front-dev:         ## Next dev
	cd frontend && npm run dev

front-build:       ## Next build
	cd frontend && npm run build

front-lint:        ## Lint frontend
	cd frontend && npm run lint

# ----- docker dev -----
up:                ## Start dev stack
	$(COMPOSE) up -d --build

down:              ## Stop dev stack
	$(COMPOSE) down

logs:              ## Tail logs
	$(COMPOSE) logs -f --tail=100

build:             ## Build images
	$(COMPOSE) build

psql:              ## psql shell
	$(COMPOSE) exec postgres psql -U $${DB_USER:-mavericks} $${DB_NAME:-mavericks_tech}

redis-cli:         ## redis shell
	$(COMPOSE) exec redis redis-cli

# ----- docker prod -----
prod-up:           ## Prod stack up
	$(COMPOSE_PROD) up -d --build

prod-down:         ## Prod stack down
	$(COMPOSE_PROD) down

prod-migrate:      ## Migrate prod DB
	$(COMPOSE_PROD) run --rm backend python manage.py migrate --noinput

prod-logs:         ## Tail prod logs
	$(COMPOSE_PROD) logs -f --tail=200

# ----- backup -----
backup:            ## pg_dump → backups/
	./scripts/backup.sh

restore:           ## Restore dump (FILE=path)
	@test -n "$(FILE)" || (echo "usage: make restore FILE=backups/x.sql.gz" && exit 1)
	./scripts/restore.sh $(FILE)

clean:             ## Remove caches
	find . -name __pycache__ -type d -prune -exec rm -rf {} +
	find . -name "*.pyc" -delete
	rm -rf frontend/.next
