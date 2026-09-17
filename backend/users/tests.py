import json

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import Client, TestCase, override_settings
from django.urls import reverse

from users import services

PASSWORD = "correct-horse-battery-7"
User = get_user_model()


@override_settings(SECURE_SSL_REDIRECT=False)  # HTTPS redirection is a production-only concern
class AuthApiTests(TestCase):
    """Exercises the /api/v1/auth/ contract with CSRF checks actually enforced."""

    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)

    def csrf_token(self):
        response = self.client.get(reverse("auth:csrf"))
        self.assertEqual(response.status_code, 200)
        return response.json()["csrfToken"]

    def post(self, name, payload=None, token=None):
        headers = {"x-csrftoken": token} if token else {}
        return self.client.post(
            reverse(name),
            data=json.dumps(payload or {}),
            content_type="application/json",
            headers=headers,
        )

    def test_csrf_endpoint_returns_token_and_sets_paired_cookie(self):
        response = self.client.get(reverse("auth:csrf"))

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["csrfToken"])
        self.assertIn(settings.CSRF_COOKIE_NAME, response.cookies)

    def test_session_is_null_for_anonymous_visitor(self):
        response = self.client.get(reverse("auth:session"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"user": None})

    def test_login_without_csrf_token_is_rejected_as_json(self):
        User.objects.create_user(username="ada", email="ada@example.com", password=PASSWORD)

        response = self.post("auth:login", {"username": "ada", "password": PASSWORD})

        self.assertEqual(response.status_code, 403)
        self.assertIn("application/json", response["Content-Type"])
        self.assertIn("detail", response.json())
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_login_returns_user_and_authenticates_session(self):
        user = User.objects.create_user(username="ada", email="ada@example.com", password=PASSWORD)

        response = self.post(
            "auth:login",
            {"username": "ada", "password": PASSWORD},
            token=self.csrf_token(),
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"user": {"id": user.id, "username": "ada", "email": "ada@example.com"}},
        )
        self.assertEqual(self.client.session["_auth_user_id"], str(user.id))
        self.assertEqual(self.client.get(reverse("auth:session")).json()["user"]["username"], "ada")

    def test_login_rotates_session_key_and_invalidates_the_old_csrf_token(self):
        User.objects.create_user(username="ada", email="ada@example.com", password=PASSWORD)
        session = self.client.session
        session["probe"] = "value"
        session.save()
        self.client.cookies[settings.SESSION_COOKIE_NAME] = session.session_key
        anonymous_key = session.session_key
        token = self.csrf_token()

        login = self.post("auth:login", {"username": "ada", "password": PASSWORD}, token=token)

        self.assertEqual(login.status_code, 200)
        self.assertNotEqual(self.client.session.session_key, anonymous_key)
        # login() rotates the CSRF secret too, so stale tokens must stop working.
        self.assertEqual(self.post("auth:logout", token=token).status_code, 403)
        self.assertEqual(self.post("auth:logout", token=self.csrf_token()).status_code, 204)

    def test_login_with_wrong_password_returns_401(self):
        User.objects.create_user(username="ada", email="ada@example.com", password=PASSWORD)

        response = self.post(
            "auth:login",
            {"username": "ada", "password": "not-the-password"},
            token=self.csrf_token(),
        )

        self.assertEqual(response.status_code, 401)
        self.assertIn("detail", response.json())
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_login_reports_missing_fields_as_field_errors(self):
        response = self.post("auth:login", {"username": "ada"}, token=self.csrf_token())

        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.json())

    def test_signup_creates_account_and_starts_session(self):
        response = self.post(
            "auth:signup",
            {"username": "ada", "email": "ada@example.com", "password": PASSWORD},
            token=self.csrf_token(),
        )

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username="ada")
        self.assertEqual(
            response.json(),
            {"user": {"id": user.id, "username": "ada", "email": "ada@example.com"}},
        )
        self.assertTrue(user.check_password(PASSWORD))
        self.assertEqual(self.client.session["_auth_user_id"], str(user.id))

    def test_signup_rejects_duplicate_username(self):
        User.objects.create_user(username="ada", email="first@example.com", password=PASSWORD)

        response = self.post(
            "auth:signup",
            {"username": "ada", "email": "second@example.com", "password": PASSWORD},
            token=self.csrf_token(),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("username", response.json())
        self.assertEqual(User.objects.filter(username="ada").count(), 1)

    def test_signup_applies_django_password_validators(self):
        response = self.post(
            "auth:signup",
            {"username": "ada", "email": "ada@example.com", "password": "password"},
            token=self.csrf_token(),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.json())
        self.assertFalse(User.objects.exists())

    def test_signup_rejects_invalid_email(self):
        response = self.post(
            "auth:signup",
            {"username": "ada", "email": "not-an-email", "password": PASSWORD},
            token=self.csrf_token(),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.json())
        self.assertFalse(User.objects.exists())

    def test_logout_requires_an_authenticated_session(self):
        response = self.post("auth:logout", token=self.csrf_token())

        self.assertEqual(response.status_code, 403)
        self.assertIn("detail", response.json())

    def test_logout_clears_the_session(self):
        User.objects.create_user(username="ada", email="ada@example.com", password=PASSWORD)
        self.post("auth:login", {"username": "ada", "password": PASSWORD}, token=self.csrf_token())

        response = self.post("auth:logout", token=self.csrf_token())

        self.assertEqual(response.status_code, 204)
        self.assertEqual(response.content, b"")
        self.assertEqual(self.client.get(reverse("auth:session")).json(), {"user": None})


class AccountServiceTests(TestCase):
    def test_create_account_translates_a_uniqueness_race(self):
        User.objects.create_user(username="ada", email="ada@example.com", password=PASSWORD)

        with self.assertRaises(services.UsernameTaken):
            services.create_account(username="ada", email="other@example.com", password=PASSWORD)

        # The failed INSERT was rolled back inside its own atomic block, so the
        # surrounding transaction is still usable.
        self.assertEqual(User.objects.count(), 1)
