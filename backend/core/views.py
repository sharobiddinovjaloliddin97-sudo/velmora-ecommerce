import logging

from django.conf import settings

from rest_framework import generics
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.services.email_service import (
    send_brevo_email,
)

from .models import (
    ContactMessage,
    Notification,
)
from .serializers import (
    ContactMessageSerializer,
    NotificationSerializer,
)


logger = logging.getLogger(__name__)


class ContactMessageCreateView(
    generics.CreateAPIView
):
    queryset = ContactMessage.objects.all()

    serializer_class = (
        ContactMessageSerializer
    )

    permission_classes = [
        AllowAny,
    ]

    def perform_create(self, serializer):
        user = (
            self.request.user
            if self.request.user.is_authenticated
            else None
        )

        contact = serializer.save(
            user=user,
        )

        text_content = (
            "Velmora saytida yangi murojaat keldi.\n\n"
            f"Ism: {contact.name}\n"
            f"Email: {contact.email or '-'}\n"
            f"Telefon: {contact.phone or '-'}\n\n"
            "Xabar:\n"
            f"{contact.message}\n\n"
            f"Yuborilgan vaqt: {contact.created_at}"
        )

        try:
            send_brevo_email(
                to_email=(
                    settings.CONTACT_NOTIFICATION_EMAIL
                ),
                subject="Velmora — yangi murojaat",
                text_content=text_content,
            )

        except Exception:
            logger.exception(
                "Contact notification email "
                "could not be sent."
            )


class NotificationListView(
    generics.ListAPIView
):
    serializer_class = (
        NotificationSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        )


class NotificationMarkReadView(
    APIView
):
    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request, pk):
        notification = (
            Notification.objects.filter(
                pk=pk,
                user=request.user,
            ).first()
        )

        if notification is None:
            return Response(
                {
                    "detail": (
                        "Notification topilmadi."
                    )
                },
                status=404,
            )

        if not notification.is_read:
            notification.is_read = True

            notification.save(
                update_fields=[
                    "is_read",
                ]
            )

        return Response(
            {
                "success": True,
            }
        )


class NotificationMarkAllReadView(
    APIView
):
    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request):
        Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).update(
            is_read=True,
        )

        return Response(
            {
                "success": True,
            }
        )
