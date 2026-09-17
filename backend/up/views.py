from django.db import DatabaseError, connection
from django.http import HttpRequest, JsonResponse


def liveness(request: HttpRequest) -> JsonResponse:
    """The process is up and able to serve requests."""
    return JsonResponse({"status": "ok"})


def readiness(request: HttpRequest) -> JsonResponse:
    """The process is up and the database accepts connections."""
    try:
        connection.ensure_connection()
    except DatabaseError:
        connection.close()
        return JsonResponse({"status": "unavailable", "database": False}, status=503)
    return JsonResponse({"status": "ok", "database": True})
