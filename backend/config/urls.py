from django.contrib import admin
from django.urls import include, path

# Django serves the API, the admin and health checks only: the frontend app owns
# every user-facing route, so there is no HTML/SPA fallback here.
urlpatterns = [
    path("admin/", admin.site.urls),
    path("up/", include("up.urls")),
    path("api/v1/auth/", include("users.urls")),
]

handler404 = "config.views.not_found"
