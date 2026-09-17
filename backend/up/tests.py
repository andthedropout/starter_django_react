from unittest import mock

from django.db import OperationalError
from django.test import TestCase
from django.urls import reverse


class HealthTests(TestCase):
    def test_liveness_is_ok(self):
        response = self.client.get(reverse("up:liveness"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_readiness_reports_a_reachable_database(self):
        response = self.client.get(reverse("up:readiness"))

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["database"])

    def test_readiness_returns_503_when_the_database_is_unreachable(self):
        with mock.patch("up.views.connection") as database:
            database.ensure_connection.side_effect = OperationalError("connection refused")
            response = self.client.get(reverse("up:readiness"))

        self.assertEqual(response.status_code, 503)
        self.assertFalse(response.json()["database"])
