import logging

from django.conf import settings
from rest_framework import generics
from rest_framework.permissions import AllowAny

from accounts.services.email_service import send_brevo_email

from .models import ContactMessage
from .serializers import ContactMessageSerializer


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
        contact = serializer.save()

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
            # Email yuborilmasa ham contact
            # database'da saqlanib qoladi.
            logger.exception(
                "Contact notification email "
                "could not be sent."
            )
