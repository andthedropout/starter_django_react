"""Django settings for the Django + React starter.

Everything is configured from the environment (see .env.example). Production
fails closed: a missing SECRET_KEY, DATABASE_URL or ALLOWED_HOSTS raises at
import time instead of booting an insecure app.
"""

from __future__ import annotations

import os
import re
from pathlib import Path
from urllib.parse import quote

import dj_database_url
from django.core.exceptions import ImproperlyConfigured

# Project root ("/app" in containers): the directory holding backend/ and frontend/.
BASE_DIR = Path(__file__).resolve().parents[2]


def env_bool(name: str, default: bool = False) -> bool:
    raw = os.environ.get(name)
    if raw is None or not raw.strip():
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str = "") -> list[str]:
    return [item.strip() for item in os.environ.get(name, default).split(",") if item.strip()]


def required(name: str, value):
    if not value:
        raise ImproperlyConfigured(f"{name} must be set when DEBUG is false.")
    return value


DEBUG = env_bool("DEBUG")

SECRET_KEY = os.environ.get("SECRET_KEY", "")
if DEBUG:
    SECRET_KEY = SECRET_KEY or "django-insecure-development-only-key"
else:
    required("SECRET_KEY", SECRET_KEY)

ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1,[::1],web" if DEBUG else "")
if not DEBUG:
    required("ALLOWED_HOSTS", ALLOWED_HOSTS)

# The Vite dev server proxies /api to Django, so its origin must be trusted in dev.
CSRF_TRUSTED_ORIGINS = env_list(
    "CSRF_TRUSTED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000"
    if DEBUG
    else "",
)

# Only trust the forwarded scheme when a proxy that rewrites it sits in front
# (Railway, nginx). The frontend adapter preserves the original Host.
if env_bool("TRUST_PROXY_HEADERS"):
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# HTTPS policy: redirect everything but the health probes, and advertise HSTS.
SECURE_SSL_REDIRECT = not DEBUG
SECURE_REDIRECT_EXEMPT = [r"^up/"]
SECURE_HSTS_SECONDS = 0 if DEBUG else int(os.environ.get("SECURE_HSTS_SECONDS", "3600"))
# Opt in only when every subdomain is HTTPS; never impose preload on a new owner.
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool("SECURE_HSTS_INCLUDE_SUBDOMAINS")
SECURE_HSTS_PRELOAD = env_bool("SECURE_HSTS_PRELOAD")

# Cookie names are namespaced per project so several local projects can coexist.
PROJECT_NAME = re.sub(r"[^a-z0-9]+", "_", os.environ.get("PROJECT_NAME", "django").lower())
PROJECT_NAME = PROJECT_NAME.strip("_") or "django"

SESSION_ENGINE = "django.contrib.sessions.backends.db"
SESSION_COOKIE_NAME = f"{PROJECT_NAME}_sessionid"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = not DEBUG

# The SPA reads the CSRF token from GET /api/v1/auth/csrf/, never from the cookie.
CSRF_COOKIE_NAME = f"{PROJECT_NAME}_csrftoken"
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = not DEBUG
CSRF_USE_SESSIONS = False
CSRF_FAILURE_VIEW = "config.views.csrf_failure"

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "users",
    "up",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

# JSON-only API: authenticated by default, entry points opt in to AllowAny.
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.SessionAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
}

# Templates are only used by the Django admin: the UI is served by the frontend app.
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

DATABASE_URL = os.environ.get("DATABASE_URL", "")
if not DATABASE_URL:
    if not DEBUG:
        required("DATABASE_URL", DATABASE_URL)
    # Credentials may contain "@" or ":", so percent-encode them into the URL.
    DATABASE_URL = "postgres://{user}:{password}@{host}:{port}/{name}".format(
        user=quote(os.environ.get("POSTGRES_USER", "postgres"), safe=""),
        password=quote(os.environ.get("POSTGRES_PASSWORD", "postgres"), safe=""),
        host=os.environ.get("POSTGRES_HOST", "postgres"),
        port=os.environ.get("POSTGRES_PORT", "5432"),
        name=os.environ.get("POSTGRES_DB", "postgres"),
    )

DATABASES = {
    "default": dj_database_url.parse(
        DATABASE_URL,
        conn_max_age=int(os.environ.get("CONN_MAX_AGE", "60")),
        conn_health_checks=True,
    )
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Django's built-in auth.User is used deliberately: no custom user model.
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files: Django only serves its own assets (admin); the frontend app ships its own.
STATIC_URL = "/static/"
STATIC_ROOT = Path(os.environ.get("STATIC_ROOT", BASE_DIR / "staticfiles"))

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": (
            "django.contrib.staticfiles.storage.StaticFilesStorage"
            if DEBUG
            # Hashed names + precompressed gzip/brotli, cached forever by WhiteNoise.
            else "whitenoise.storage.CompressedManifestStaticFilesStorage"
        )
    },
}
WHITENOISE_MAX_AGE = 60

# Media is configured for future uploads; no route exposes it yet.
MEDIA_URL = "/media/"
MEDIA_ROOT = Path(os.environ.get("MEDIA_ROOT", BASE_DIR / "media"))

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {"simple": {"format": "%(levelname)s %(name)s %(message)s"}},
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "simple"}},
    "root": {"handlers": ["console"], "level": os.environ.get("LOG_LEVEL", "INFO").upper()},
}
