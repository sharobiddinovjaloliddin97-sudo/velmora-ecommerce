from django.contrib.auth import get_user_model
from django.urls import reverse
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class AuthenticationTests(APITestCase):

    def setUp(self):
        self.register_url = reverse("register")
        self.login_url = reverse("login")
        self.profile_url = reverse("profile")
        self.change_password_url = reverse(
            "change-password"
        )

        self.user = User.objects.create_user(
            email="user@test.com",
            password="TestPass123!",
            first_name="Test",
        )

    def test_register_creates_user(self):
        payload = {
            "first_name": "Elyorbek",
            "email": "NEWUSER@TEST.COM",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        }

        response = self.client.post(
            self.register_url,
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        user = User.objects.get(
            email="newuser@test.com"
        )

        self.assertEqual(
            user.first_name,
            "Elyorbek",
        )

        self.assertTrue(
            user.check_password(
                "StrongPass123!"
            )
        )

        # Password plain text saqlanmasligi kerak
        self.assertNotEqual(
            user.password,
            "StrongPass123!",
        )

    def test_duplicate_email_case_insensitive_is_rejected(self):
        payload = {
            "first_name": "Another",
            "email": "USER@TEST.COM",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        }

        response = self.client.post(
            self.register_url,
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            User.objects.filter(
                email__iexact="user@test.com"
            ).count(),
            1,
        )

    def test_login_returns_access_token_and_refresh_cookie(self):
        payload = {
            "email": "user@test.com",
            "password": "TestPass123!",
        }

        response = self.client.post(
            self.login_url,
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "access",
            response.data,
        )

        self.assertIn(
            "user",
            response.data,
        )

        self.assertIn(
            "velmora_refresh",
            response.cookies,
        )

        refresh_cookie = response.cookies[
            "velmora_refresh"
        ]

        self.assertTrue(
            refresh_cookie["httponly"]
        )

    def test_profile_requires_authentication(self):
        response = self.client.get(
            self.profile_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_view_profile(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.get(
            self.profile_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["email"],
            "user@test.com",
        )

    def test_change_password(self):
        self.client.force_authenticate(
            user=self.user
        )

        payload = {
            "old_password": "TestPass123!",
            "new_password": "NewPass123!",
            "new_password_confirm": "NewPass123!",
        }

        response = self.client.post(
            self.change_password_url,
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.user.refresh_from_db()

        self.assertTrue(
            self.user.check_password(
                "NewPass123!"
            )
        )

    def test_password_reset_request(self):
        url = reverse("password-reset")

        response = self.client.post(
            url,
            {
                "email": "user@test.com"
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    def test_password_reset_confirm_changes_password(self):
        uid = urlsafe_base64_encode(
            force_bytes(self.user.pk)
        )

        token = default_token_generator.make_token(
            self.user
        )

        url = reverse(
            "password-reset-confirm"
        )

        response = self.client.post(
            url,
            {
                "uid": uid,
                "token": token,
                "new_password": "ResetPass123!",
                "new_password_confirm": "ResetPass123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.user.refresh_from_db()

        self.assertTrue(
            self.user.check_password(
                "ResetPass123!"
            )
        )

    def test_password_reset_token_cannot_be_reused(self):
        uid = urlsafe_base64_encode(
            force_bytes(self.user.pk)
        )

        token = default_token_generator.make_token(
            self.user
        )

        url = reverse(
            "password-reset-confirm"
        )

        first_response = self.client.post(
            url,
            {
                "uid": uid,
                "token": token,
                "new_password": "ResetPass123!",
                "new_password_confirm": "ResetPass123!",
            },
            format="json",
        )

        self.assertEqual(
            first_response.status_code,
            status.HTTP_200_OK,
        )

        second_response = self.client.post(
            url,
            {
                "uid": uid,
                "token": token,
                "new_password": "AnotherPass123!",
                "new_password_confirm": "AnotherPass123!",
            },
            format="json",
        )

        self.assertEqual(
            second_response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )