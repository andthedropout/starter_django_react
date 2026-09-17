"""Exercise the built frontend -> Django boundary on disposable local CI data."""

import http.client
import json
import os
import uuid
from html.parser import HTMLParser
from http.cookies import SimpleCookie
from urllib.parse import urlsplit

base = urlsplit(os.environ.get("SMOKE_BASE_URL", "http://127.0.0.1:19000"))
if base.hostname not in {"localhost", "127.0.0.1"}:
    raise SystemExit("Run this account-creating smoke check against a disposable local stack only.")
origin = os.environ.get("SITE_URL", "https://app.example.test")
cookies = {}


def request(path, method="GET", payload=None, token=None):
    connection = http.client.HTTPConnection(base.hostname, base.port, timeout=30)
    headers = {"Host": "app.example.test", "Origin": origin}
    if cookies:
        headers["Cookie"] = "; ".join(f"{key}={value}" for key, value in cookies.items())
    if token:
        headers["X-CSRFToken"] = token
    body = None
    if payload is not None:
        body = json.dumps(payload)
        headers["Content-Type"] = "application/json"
    connection.request(method, path, body=body, headers=headers)
    response = connection.getresponse()
    data = response.read()
    for name, value in response.getheaders():
        if name.lower() == "set-cookie":
            cookie = SimpleCookie()
            cookie.load(value)
            for key, morsel in cookie.items():
                if morsel.value:
                    cookies[key] = morsel.value
                else:
                    cookies.pop(key, None)
    result = response.status, dict(response.getheaders()), data
    connection.close()
    return result


class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.heading = False
        self.heading_text = ""
        self.description = None
        self.canonical = None
        self.stylesheet = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h1":
            self.heading = True
        if tag == "meta" and attrs.get("name") == "description":
            self.description = attrs.get("content")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href")
        if tag == "link" and attrs.get("rel") == "stylesheet":
            self.stylesheet = attrs.get("href")

    def handle_endtag(self, tag):
        if tag == "h1":
            self.heading = False

    def handle_data(self, data):
        if self.heading:
            self.heading_text += data


status, _, body = request("/")
assert status == 200, ("SSR homepage", status)
document = Document()
document.feed(body.decode())
assert document.heading_text.strip(), "Public content must be rendered without JavaScript"
assert document.description, "SSR description missing"
assert document.canonical == f"{origin}/", ("Canonical origin", document.canonical)
assert document.stylesheet, "SSR stylesheet missing"
status, headers, _ = request(urlsplit(document.stylesheet).path)
assert status == 200 and "text/css" in headers.get("Content-Type", ""), "Stylesheet not served"
status, _, _ = request("/assets/missing.js")
assert status == 404, ("Missing asset swallowed by SSR", status)
status, _, body = request("/api/v1/missing/")
assert status == 404 and "detail" in json.loads(body), "API miss must remain a JSON 404"
status, _, _ = request("/up/ready/")
assert status == 200, ("Database readiness", status)

username = f"smoke_{uuid.uuid4().hex[:12]}"
account = {"username": username, "email": f"{username}@example.com", "password": uuid.uuid4().hex}
status, _, _ = request("/api/v1/auth/signup/", "POST", account)
assert status == 403, ("Anonymous signup accepted without CSRF", status)
status, _, body = request("/api/v1/auth/csrf/")
assert status == 200
old_token = json.loads(body)["csrfToken"]
status, _, body = request("/api/v1/auth/signup/", "POST", account, old_token)
assert status == 201, ("Signup through proxy", status, body)
status, _, body = request("/api/v1/auth/session/")
assert status == 200 and json.loads(body)["user"]["username"] == username, "Session cookie lost"
status, _, _ = request("/api/v1/auth/logout/", "POST", {}, old_token)
assert status == 403, ("Rotated CSRF token accepted", status)
_, _, body = request("/api/v1/auth/csrf/")
status, _, _ = request("/api/v1/auth/logout/", "POST", {}, json.loads(body)["csrfToken"])
assert status == 204, ("Logout through proxy", status)
_, _, body = request("/api/v1/auth/session/")
assert json.loads(body) == {"user": None}, "Logout did not clear session"
print(
    "SSR HTML, metadata, CSS, API 404, readiness, CSRF, cookie rotation, signup and logout passed."
)
