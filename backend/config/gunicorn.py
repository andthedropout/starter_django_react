# -*- coding: utf-8 -*-

import multiprocessing
import os
from distutils.util import strtobool

bind = f"0.0.0.0:{os.getenv('PORT', '8080')}"
accesslog = "-"
access_log_format = "%(h)s %(l)s %(u)s %(t)s '%(r)s' %(s)s %(b)s '%(f)s' '%(a)s' in %(D)sµs"  # noqa: E501

# Optimized for small Railway instances (512MB-1GB)
# 1 worker + 4 threads uses ~40% less memory than 2 workers + 1 thread
# For larger instances, set WEB_CONCURRENCY=2-4 via environment variable
workers = int(os.getenv("WEB_CONCURRENCY", 1))  # Optimized for cost: 1 worker
threads = int(os.getenv("PYTHON_MAX_THREADS", 4))  # Use threads for concurrency

# Use gthread worker for better async performance
worker_class = os.getenv("WORKER_CLASS", "gthread")

reload = bool(strtobool(os.getenv("WEB_RELOAD", "false")))

timeout = int(os.getenv("WEB_TIMEOUT", 120))
