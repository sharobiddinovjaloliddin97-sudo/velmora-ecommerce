from django.conf import settings
from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    ProfileSerializer,
    RegisterSerializer,
)
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from rest_framework.throttling import ScopedRateThrottle

from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    LoginSerializer,
    ProfileSerializer,
    RegisterSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
)
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from accounts.services.email_service import send_brevo_email
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
User = get_user_model()

def set_refresh_cookie(response, refresh_token):
    response.set_cookie(
        key=settings.JWT_REFRESH_COOKIE_NAME,
        value=str(refresh_token),
        httponly=True,
        secure=settings.JWT_REFRESH_COOKIE_SECURE,
        samesite=settings.JWT_REFRESH_COOKIE_SAMESITE,
        max_age=settings.JWT_REFRESH_COOKIE_MAX_AGE,
        path="/api/v1/auth/",
    )


class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(
        request=RegisterSerializer,
        responses={201: ProfileSerializer},
    )
    def post(self, request):
        serializer = RegisterSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        return Response(
            ProfileSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )

class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    @extend_schema(
        request=LoginSerializer,
    )
    def post(self, request):
        serializer = LoginSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        response = Response(
            {
                "access": str(refresh.access_token),
                "user": ProfileSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )

        set_refresh_cookie(
            response,
            refresh,
        )

        return response

class RefreshView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        refresh_token = request.COOKIES.get(
            settings.JWT_REFRESH_COOKIE_NAME
        )

        if not refresh_token:
            return Response(
                {
                    "detail": "Refresh token topilmadi."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(
                refresh_token
            )

            access_token = str(
                refresh.access_token
            )

        except Exception:
            return Response(
                {
                    "detail": "Refresh token yaroqsiz."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response(
            {
                "access": access_token
            }
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get(
            settings.JWT_REFRESH_COOKIE_NAME
        )

        if refresh_token:
            try:
                token = RefreshToken(
                    refresh_token
                )

                token.blacklist()

            except Exception:
                pass

        response = Response(
            {
                "detail": "Logout muvaffaqiyatli."
            }
        )

        response.delete_cookie(
            settings.JWT_REFRESH_COOKIE_NAME,
            path="/api/v1/auth/",
        )

        return response


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses=ProfileSerializer,
    )
    def get(self, request):
        serializer = ProfileSerializer(
            request.user
        )

        return Response(serializer.data)

    @extend_schema(
        request=ProfileSerializer,
        responses=ProfileSerializer,
    )
    def patch(self, request):
        serializer = ProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(serializer.data)
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=ChangePasswordSerializer,
        responses={200: None},
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            {
                "detail": "Parol muvaffaqiyatli o'zgartirildi."
            },
            status=status.HTTP_200_OK,
        )
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    @extend_schema(
        request=PasswordResetRequestSerializer,
        responses={200: None},
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data[
            "email"
        ].strip().lower()

        user = User.objects.filter(
            email__iexact=email,
            is_active=True,
        ).first()

        if user:
            uid = urlsafe_base64_encode(
                force_bytes(user.pk)
            )

            token = default_token_generator.make_token(
                user
            )

            reset_url = (
                f"{settings.FRONTEND_URL}"
                f"/reset-password"
                f"?uid={uid}"
                f"&token={token}"
            )

            send_brevo_email(
                to_email=user.email,
                subject="Velmora — parolni tiklash",
                text_content=(
                    "Velmora hisobingiz parolini tiklash uchun "
                    "quyidagi havolani oching:\n\n"
                    f"{reset_url}\n\n"
                    "Agar bu so‘rovni siz yubormagan bo‘lsangiz, "
                    "ushbu xabarni e’tiborsiz qoldiring."
                ),
            )

        # User mavjud yoki yo'qligini tashqariga oshkor qilmaymiz
        return Response(
            {
                "detail": (
                    "Agar ushbu email ro'yxatdan o'tgan bo'lsa, "
                    "password reset ko'rsatmasi yuborildi."
                )
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset_confirm"

    @extend_schema(
        request=PasswordResetConfirmSerializer,
        responses={200: None},
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            {
                "detail": "Parol muvaffaqiyatli tiklandi."
            },
            status=status.HTTP_200_OK,
        )