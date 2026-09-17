from django.urls import path

from up import views

app_name = "up"

urlpatterns = [
    path("", views.liveness, name="liveness"),
    path("ready/", views.readiness, name="readiness"),
]
