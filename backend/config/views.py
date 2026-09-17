from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.defaults import page_not_found


def csrf_failure(request: HttpRequest, reason: str = "") -> JsonResponse:
    """Return CSRF rejections as JSON so API clients can handle them uniformly."""
    return JsonResponse({"detail": "CSRF verification failed."}, status=403)


def not_found(request: HttpRequest, exception=None) -> HttpResponse:
    """JSON 404s under /api/; Django's default response for everything else."""
    if request.path.startswith("/api/"):
        return JsonResponse({"detail": "Not found."}, status=404)
    return page_not_found(request, exception)
