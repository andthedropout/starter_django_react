from django.conf import settings
from django.db import connection
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

# Only import and connect to Redis if REDIS_URL is configured
if settings.REDIS_URL:
    from redis import Redis
    redis = Redis.from_url(settings.REDIS_URL)
else:
    redis = None


@csrf_exempt
def index(request):
    return HttpResponse("")


@csrf_exempt
def databases(request):
    # Check Redis connection if available
    if redis:
        redis.ping()

    # Always check database connection
    connection.ensure_connection()

    return HttpResponse("")
