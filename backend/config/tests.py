from django.test import TestCase, override_settings


@override_settings(SECURE_SSL_REDIRECT=False)  # HTTPS redirection is a production-only concern
class RoutingTests(TestCase):
    def test_unknown_api_path_returns_a_json_404(self):
        response = self.client.get("/api/v1/auth/nope/")

        self.assertEqual(response.status_code, 404)
        self.assertIn("application/json", response["Content-Type"])
        self.assertIn("detail", response.json())

    def test_backend_serves_no_html_fallback(self):
        for path in ("/", "/login", "/some/client/route"):
            with self.subTest(path=path):
                self.assertEqual(self.client.get(path).status_code, 404)
