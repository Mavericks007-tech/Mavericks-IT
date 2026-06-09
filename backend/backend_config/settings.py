from pathlib import Path
import os
import sys

from decouple import Csv, config

BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# Core
# ---------------------------------------------------------------------------
SECRET_KEY = config('SECRET_KEY', default='django-insecure-dev-key-DO-NOT-USE-IN-PRODUCTION')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

ENVIRONMENT = config('ENVIRONMENT', default='development')  # development | staging | production
IS_PROD = ENVIRONMENT == 'production'

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'django_filters',
    'drf_spectacular',
    'simple_history',
    'core',
    'cms',
    'site_content',
    'seo',
    'crm',
    'comms',
    'rbac',
    'reports',
    'portal',
    'accounts',
    'django_ckeditor_5',
    'django_celery_beat',
    'django_celery_results',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'simple_history.middleware.HistoryRequestMiddleware',
    'core.middleware.RedirectMiddleware',
]

ROOT_URLCONF = 'backend_config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend_config.wsgi.application'

# ---------------------------------------------------------------------------
# Database — Postgres in prod, SQLite optional for dev via DB_ENGINE=sqlite
# ---------------------------------------------------------------------------
if config('DB_ENGINE', default='postgres') == 'sqlite':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='mavericks_tech'),
            'USER': config('DB_USER', default=os.environ.get('USER', 'postgres')),
            'PASSWORD': config('DB_PASSWORD', default=''),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
            'CONN_MAX_AGE': config('DB_CONN_MAX_AGE', default=600, cast=int),
            'CONN_HEALTH_CHECKS': True,
        }
    }

# Upload limits
DATA_UPLOAD_MAX_MEMORY_SIZE = None
FILE_UPLOAD_MAX_MEMORY_SIZE = 25 * 1024 * 1024
DATA_UPLOAD_MAX_NUMBER_FIELDS = 10000

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 10}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Dhaka'
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------------------------
# Static + media — WhiteNoise for static, S3 optional for media
# ---------------------------------------------------------------------------
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

USE_S3 = config('USE_S3', default=False, cast=bool)
if USE_S3:
    AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='ap-southeast-1')
    AWS_S3_CUSTOM_DOMAIN = config('AWS_S3_CUSTOM_DOMAIN', default=f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com')
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}
    AWS_DEFAULT_ACL = None
    AWS_QUERYSTRING_AUTH = False
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
else:
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------------------------------------------------------------------------
# DRF — auth + throttling
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 25,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': config('THROTTLE_ANON', default='60/min'),
        'user': config('THROTTLE_USER', default='1000/hour'),
        'login': config('THROTTLE_LOGIN', default='5/min'),
        'public_lead': config('THROTTLE_PUBLIC_LEAD', default='10/hour'),
        'magic_link': config('THROTTLE_MAGIC_LINK', default='5/hour'),
    },
}

# ---------------------------------------------------------------------------
# CORS / CSRF
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=Csv(),
)
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=Csv(),
)
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'

# ---------------------------------------------------------------------------
# Security hardening — applied when not DEBUG
# ---------------------------------------------------------------------------
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = config('SECURE_HSTS_SECONDS', default=31536000, cast=int)  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = 'same-origin'
    X_FRAME_OPTIONS = 'DENY'
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_HTTPONLY = False  # Next.js needs to read for X-CSRFToken header

# ---------------------------------------------------------------------------
# Cache + sessions — Redis when REDIS_URL set, locmem fallback for dev
# ---------------------------------------------------------------------------
REDIS_URL = config('REDIS_URL', default='')
if REDIS_URL:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': REDIS_URL,
            'TIMEOUT': 300,
        }
    }
    SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'
    SESSION_CACHE_ALIAS = 'default'
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'mavericks-locmem',
        }
    }

# ---------------------------------------------------------------------------
# Celery
# ---------------------------------------------------------------------------
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default=REDIS_URL or 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default=REDIS_URL or 'redis://localhost:6379/0')
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 5 * 60
CELERY_TASK_SOFT_TIME_LIMIT = 4 * 60
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# ---------------------------------------------------------------------------
# Email — SMTP in prod, console in dev unless EMAIL_HOST set
# ---------------------------------------------------------------------------
EMAIL_HOST = config('EMAIL_HOST', default='')
if EMAIL_HOST:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
    EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
    EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
    EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
    DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@maverickstech.com.bd')
else:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

BASE_URL = config('BASE_URL', default='http://localhost:8000')

# ---------------------------------------------------------------------------
# CKEditor
# ---------------------------------------------------------------------------
CKEDITOR_5_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
CKEDITOR_5_UPLOAD_FILE_TYPES = ['jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg']
CKEDITOR_5_CONFIGS = {
    'default': {
        'toolbar': ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList',
                    'blockQuote', 'imageUpload'],
    },
    'extends': {
        'blockToolbar': [
            'paragraph', 'heading1', 'heading2', 'heading3',
            '|', 'bulletedList', 'numberedList', '|', 'blockQuote',
        ],
        'toolbar': [
            'heading', '|',
            'outdent', 'indent', '|',
            'bold', 'italic', 'link', 'underline', 'strikethrough',
            'code', 'subscript', 'superscript', 'highlight', '|',
            'codeBlock', 'sourceEditing', 'insertImage',
            'bulletedList', 'numberedList', 'todoList', '|',
            'blockQuote', 'imageUpload', '|',
            'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
            'mediaEmbed', 'removeFormat', 'insertTable',
        ],
        'image': {
            'toolbar': ['imageTextAlternative', '|', 'imageStyle:alignLeft', 'imageStyle:alignRight',
                        'imageStyle:alignCenter', 'imageStyle:side', '|'],
            'styles': ['full', 'side', 'alignLeft', 'alignRight', 'alignCenter'],
        },
        'table': {
            'contentToolbar': ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'],
        },
        'heading': {
            'options': [
                {'model': 'paragraph', 'title': 'Paragraph', 'class': 'ck-heading_paragraph'},
                {'model': 'heading1', 'view': 'h1', 'title': 'Heading 1', 'class': 'ck-heading_heading1'},
                {'model': 'heading2', 'view': 'h2', 'title': 'Heading 2', 'class': 'ck-heading_heading2'},
                {'model': 'heading3', 'view': 'h3', 'title': 'Heading 3', 'class': 'ck-heading_heading3'},
            ],
        },
    },
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Mavericks Tech API',
    'DESCRIPTION': 'Mavericks Tech Bangladesh — public + admin API',
    'VERSION': '0.1.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

LOGOUT_REDIRECT_URL = '/admin/login/'

# ---------------------------------------------------------------------------
# Structured JSON logging
# ---------------------------------------------------------------------------
LOG_LEVEL = config('LOG_LEVEL', default='INFO')
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(levelname)s %(name)s %(message)s',
        },
        'plain': {
            'format': '[{asctime}] {levelname} {name}: {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json' if IS_PROD else 'plain',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': LOG_LEVEL,
    },
    'loggers': {
        'django': {'handlers': ['console'], 'level': LOG_LEVEL, 'propagate': False},
        'django.db.backends': {'level': 'WARNING'},
        'celery': {'handlers': ['console'], 'level': LOG_LEVEL, 'propagate': False},
    },
}

# ---------------------------------------------------------------------------
# Sentry — init when SENTRY_DSN set
# ---------------------------------------------------------------------------
SENTRY_DSN = config('SENTRY_DSN', default='')
if SENTRY_DSN and 'test' not in sys.argv:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.django import DjangoIntegration
        from sentry_sdk.integrations.celery import CeleryIntegration
        from sentry_sdk.integrations.logging import LoggingIntegration

        sentry_sdk.init(
            dsn=SENTRY_DSN,
            environment=ENVIRONMENT,
            integrations=[
                DjangoIntegration(),
                CeleryIntegration(),
                LoggingIntegration(level=None, event_level=None),
            ],
            traces_sample_rate=config('SENTRY_TRACES_RATE', default=0.1, cast=float),
            send_default_pii=False,
        )
    except ImportError:
        pass
