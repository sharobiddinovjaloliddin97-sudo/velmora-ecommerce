import os
from datetime import timedelta
from pathlib import Path

from corsheaders.defaults import default_headers
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent / ".env")


SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "unsafe-development-key",
)

DEBUG = os.getenv(
    "DEBUG",
    "True",
).lower() == "true"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        "ALLOWED_HOSTS",
        "127.0.0.1,localhost",
    ).split(",")
    if host.strip()
]


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third party
    "rest_framework",
    "corsheaders",
    "django_filters",
    "drf_spectacular",

    # Local apps
    "accounts",
    "catalog",
    "orders",
    "core",
    "rest_framework_simplejwt.token_blacklist",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = (
    *default_headers,
    "idempotency-key",
    "x-idempotency-key",
)

CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CSRF_TRUSTED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ["DB_NAME"],
        "USER": os.environ["DB_USER"],
        "PASSWORD": os.environ["DB_PASSWORD"],
        "HOST": os.environ["DB_HOST"],
        "PORT": os.environ["DB_PORT"],
    }
}


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

AUTH_USER_MODEL = "accounts.User"

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",

    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],

    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ],

    "DEFAULT_PAGINATION_CLASS":
        "rest_framework.pagination.PageNumberPagination",

    "PAGE_SIZE": 12,

    "DEFAULT_THROTTLE_RATES": {
        "login": "5/min",
        "password_reset": "3/hour",
        "password_reset_confirm": "10/hour",
    },
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Velmora API",
    "DESCRIPTION": "Velmora internet-do'koni REST API",
    "VERSION": "1.0.0",
}

MEDIA_ROOT = BASE_DIR / "media"


# --- Media storage: local filesystem yoki Supabase (S3-compatible) ---

USE_SUPABASE_STORAGE = (
    os.getenv(
        "USE_SUPABASE_STORAGE",
        "False",
    ).lower()
    == "true"
)

SUPABASE_PUBLIC_MEDIA_URL = os.getenv(
    "SUPABASE_PUBLIC_MEDIA_URL",
    "",
)

if USE_SUPABASE_STORAGE:
    STORAGES = {
        "default": {
            "BACKEND": (
                "config.storage_backends."
                "SupabaseMediaStorage"
            ),
            "OPTIONS": {
                "bucket_name": os.environ[
                    "SUPABASE_STORAGE_BUCKET"
                ],
                "access_key": os.environ[
                    "SUPABASE_S3_ACCESS_KEY_ID"
                ],
                "secret_key": os.environ[
                    "SUPABASE_S3_SECRET_ACCESS_KEY"
                ],
                "endpoint_url": os.environ[
                    "SUPABASE_S3_ENDPOINT_URL"
                ],
                "region_name": os.environ[
                    "SUPABASE_S3_REGION"
                ],
                "addressing_style": "path",
                "signature_version": "s3v4",
                "file_overwrite": False,
                "default_acl": None,
                "querystring_auth": False,
            },
        },
        "staticfiles": {
            "BACKEND": (
                "whitenoise.storage."
                "CompressedManifestStaticFilesStorage"
            ),
        },
    }
    MEDIA_URL = f"{SUPABASE_PUBLIC_MEDIA_URL.rstrip('/')}/"
else:
    STORAGES = {
        "default": {
            "BACKEND": (
                "django.core.files.storage."
                "FileSystemStorage"
            ),
        },
        "staticfiles": {
            "BACKEND": (
                "whitenoise.storage."
                "CompressedManifestStaticFilesStorage"
            ),
        },
    }
    MEDIA_URL = "/media/"


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=15
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=7
    ),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
}


JWT_REFRESH_COOKIE_NAME = "velmora_refresh"
JWT_REFRESH_COOKIE_SECURE = (
    os.getenv(
        "JWT_REFRESH_COOKIE_SECURE",
        "False",
    ).lower()
    == "true"
)
JWT_REFRESH_COOKIE_SAMESITE = os.getenv(
    "JWT_REFRESH_COOKIE_SAMESITE",
    "Lax",
)
JWT_REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

PASSWORD_RESET_TIMEOUT = 30 * 60  # 30 minut

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173",
)

DEFAULT_FROM_EMAIL = os.getenv(
    "DEFAULT_FROM_EMAIL",
    "noreply@velmora.local",
)

if DEBUG:
    EMAIL_BACKEND = (
        "django.core.mail.backends.console.EmailBackend"
    )
else:
    EMAIL_BACKEND = os.getenv(
        "EMAIL_BACKEND",
        "django.core.mail.backends.console.EmailBackend",
    )

    EMAIL_HOST = os.getenv("EMAIL_HOST", "")
    EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
    EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")

    EMAIL_USE_TLS = (
            os.getenv("EMAIL_USE_TLS", "True").lower() == "true"
    )

    DEFAULT_FROM_EMAIL = os.getenv(
        "DEFAULT_FROM_EMAIL",
        "no-reply@velmora.local",
    )

SECURE_PROXY_SSL_HEADER = (
    "HTTP_X_FORWARDED_PROTO",
    "https",
)

if not DEBUG:
    SECURE_SSL_REDIRECT = True

    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    SECURE_CONTENT_TYPE_NOSNIFF = True

    X_FRAME_OPTIONS = "DENY"

    # HSTS'ni avval qisqa muddat bilan boshlaymiz
    SECURE_HSTS_SECONDS = 3600

BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")

BREVO_SENDER_EMAIL = os.getenv(
    "BREVO_SENDER_EMAIL",
    "",
)

BREVO_SENDER_NAME = os.getenv(
    "BREVO_SENDER_NAME",
    "Velmora",
)

CONTACT_NOTIFICATION_EMAIL = os.getenv(
    "CONTACT_NOTIFICATION_EMAIL",
    BREVO_SENDER_EMAIL,
)


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,

    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },

    "loggers": {
        "django.request": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}