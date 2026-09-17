from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from users import services
from users.serializers import LoginSerializer, SignupSerializer, UserSerializer

INVALID_CREDENTIALS = "Invalid username or password."
USERNAME_TAKEN = "A user with that username already exists."

# DRF exempts APIView from CsrfViewMiddleware and only enforces CSRF for
# already-authenticated requests, so every unsafe auth endpoint opts back in.
csrf_protected = method_decorator(csrf_protect, name="dispatch")


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfTokenView(APIView):
    """Hand the SPA a fresh CSRF token (also refreshes the paired cookie)."""

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        return Response({"csrfToken": get_token(request)})


class SessionView(APIView):
    """Report the current session's user, or null when anonymous."""

    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        user = request.user
        payload = UserSerializer(user).data if user.is_authenticated else None
        return Response({"user": payload})


@csrf_protected
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(request, **serializer.validated_data)
        if user is None:
            return Response({"detail": INVALID_CREDENTIALS}, status=status.HTTP_401_UNAUTHORIZED)
        login(request, user)
        return Response({"user": UserSerializer(user).data})


@csrf_protected
class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = services.create_account(**serializer.validated_data)
        except services.UsernameTaken:
            return Response({"username": [USERNAME_TAKEN]}, status=status.HTTP_400_BAD_REQUEST)
        login(request, user)
        return Response({"user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)


@csrf_protected
class LogoutView(APIView):
    """Ends the session; requires an authenticated caller (global default)."""

    def post(self, request: Request) -> Response:
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)
