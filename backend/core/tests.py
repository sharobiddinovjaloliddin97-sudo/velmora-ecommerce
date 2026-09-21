from unittest.mock import patch

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.test import RequestFactory
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from .admin import ContactMessageAdmin
from .models import (
    ContactMessage,
    ContactReply,
    Notification,
)


User = get_user_model()


class ContactMessageTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@example.com",
            password="StrongPassword123!",
        )

    @patch("core.views.send_brevo_email")
    def test_guest_can_create_contact_message(
        self,
        mock_send_email,
    ):
        response = self.client.post(
            reverse("contact-create"),
            {
                "name": "Ali",
                "email": "ali@example.com",
                "phone": "",
                "message": "Test message",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        contact = ContactMessage.objects.get(
            email="ali@example.com"
        )

        self.assertIsNone(contact.user)

        mock_send_email.assert_called_once()

    @patch("core.views.send_brevo_email")
    def test_authenticated_user_is_attached_to_contact(
        self,
        mock_send_email,
    ):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.post(
            reverse("contact-create"),
            {
                "name": "Ali",
                "email": "user@example.com",
                "phone": "+998901234567",
                "message": "Logged in user test",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        contact = ContactMessage.objects.get(
            email="user@example.com"
        )

        self.assertEqual(
            contact.user,
            self.user,
        )

        mock_send_email.assert_called_once()

    def test_email_or_phone_is_required(self):
        response = self.client.post(
            reverse("contact-create"),
            {
                "name": "Ali",
                "email": "",
                "phone": "",
                "message": "Test",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "contact",
            response.data,
        )


class NotificationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@example.com",
            password="StrongPassword123!",
        )

        self.other_user = User.objects.create_user(
            email="other@example.com",
            password="StrongPassword123!",
        )

        self.notification = (
            Notification.objects.create(
                user=self.user,
                notification_type=(
                    Notification.Type.CONTACT_REPLY
                ),
                title_uz=(
                    "Murojaatingizga javob berildi"
                ),
                title_ru=(
                    "На ваше обращение ответили"
                ),
                message="Test reply",
                link="/account",
            )
        )

        Notification.objects.create(
            user=self.other_user,
            notification_type=(
                Notification.Type.CONTACT_REPLY
            ),
            title_uz="Other",
            title_ru="Other",
            message="Other user's notification",
            link="/account",
        )

        self.client.force_authenticate(
            user=self.user
        )

    def test_user_sees_only_own_notifications(
        self,
    ):
        response = self.client.get(
            reverse("notification-list")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        data = (
            response.data
            if isinstance(response.data, list)
            else response.data["results"]
        )

        self.assertEqual(
            len(data),
            1,
        )

        self.assertEqual(
            data[0]["message"],
            "Test reply",
        )

    def test_user_can_mark_notification_as_read(
        self,
    ):
        response = self.client.post(
            reverse(
                "notification-read",
                kwargs={
                    "pk": self.notification.pk,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.notification.refresh_from_db()

        self.assertTrue(
            self.notification.is_read
        )

    def test_user_cannot_read_another_users_notification(
        self,
    ):
        other_notification = (
            Notification.objects.get(
                user=self.other_user
            )
        )

        response = self.client.post(
            reverse(
                "notification-read",
                kwargs={
                    "pk": other_notification.pk,
                },
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        other_notification.refresh_from_db()

        self.assertFalse(
            other_notification.is_read
        )

    def test_user_can_mark_all_notifications_as_read(
        self,
    ):
        Notification.objects.create(
            user=self.user,
            notification_type=(
                Notification.Type.CONTACT_REPLY
            ),
            title_uz="Ikkinchi xabar",
            title_ru="Второе сообщение",
            message="Another reply",
            link="/account",
        )

        response = self.client.post(
            reverse(
                "notification-read-all"
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        unread_count = (
            Notification.objects.filter(
                user=self.user,
                is_read=False,
            ).count()
        )

        self.assertEqual(
            unread_count,
            0,
        )


class ContactAdminReplyTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="customer@example.com",
            password="StrongPassword123!",
        )

        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            password="StrongPassword123!",
        )

        self.contact = ContactMessage.objects.create(
            user=self.user,
            name="Ali",
            email="customer@example.com",
            phone="+998901234567",
            message="Mahsulot haqida savolim bor.",
        )

        self.factory = RequestFactory()

    @patch("core.admin.send_brevo_email")
    def test_admin_reply_creates_notification(
        self,
        mock_send_email,
    ):
        reply = ContactReply(
            contact=self.contact,
            message="Mahsulot hozir mavjud.",
        )

        class FakeFormSet:
            deleted_objects = []

            def save(self, commit=False):
                return [reply]

            def save_m2m(self):
                pass

        request = self.factory.post("/admin/")
        request.user = self.admin_user

        model_admin = ContactMessageAdmin(
            ContactMessage,
            admin.site,
        )

        model_admin.save_formset(
            request=request,
            form=None,
            formset=FakeFormSet(),
            change=True,
        )

        reply.refresh_from_db()
        self.contact.refresh_from_db()

        self.assertEqual(
            reply.replied_by,
            self.admin_user,
        )

        self.assertTrue(
            self.contact.is_read
        )

        notification = Notification.objects.get(
            user=self.user
        )

        self.assertEqual(
            notification.message,
            "Mahsulot hozir mavjud.",
        )

        self.assertFalse(
            notification.is_read
        )

        mock_send_email.assert_called_once()
