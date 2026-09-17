from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction

# Domain layer: no django.http and no DRF imports. Views own the HTTP session
# calls (login/logout/authenticate) directly; only real writes live here.


class UsernameTaken(Exception):
    """Raised when an account cannot be created because the username exists."""


def create_account(*, username: str, email: str, password: str):
    """Create an account, turning a uniqueness race into UsernameTaken."""
    User = get_user_model()
    try:
        with transaction.atomic():
            return User.objects.create_user(username=username, email=email, password=password)
    except IntegrityError as exc:
        raise UsernameTaken(username) from exc
