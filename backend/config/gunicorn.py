"""Gunicorn configuration: `gunicorn -c python:config.gunicorn config.wsgi:application`."""

import os

# One worker with a couple of threads keeps memory low on small instances.
# Scale with WEB_CONCURRENCY / WEB_THREADS instead of guessing from cpu_count().
# Dual stack also supports Railway's older IPv6-only private networks.
bind = f"[::]:{os.environ.get('PORT', '8000')}"
workers = int(os.environ.get("WEB_CONCURRENCY", "1"))
threads = int(os.environ.get("WEB_THREADS", "2"))
worker_class = "gthread"

timeout = int(os.environ.get("WEB_TIMEOUT", "60"))
graceful_timeout = int(os.environ.get("WEB_GRACEFUL_TIMEOUT", "30"))
keepalive = int(os.environ.get("WEB_KEEPALIVE", "5"))

# Logs go to the container's stdout/stderr.
accesslog = "-"
errorlog = "-"
loglevel = os.environ.get("LOG_LEVEL", "info").lower()
access_log_format = '%(h)s "%(r)s" %(s)s %(b)s %(M)sms'
