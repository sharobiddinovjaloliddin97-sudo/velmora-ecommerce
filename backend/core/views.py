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

        from django.contrib.auth import get_user_model
        User = get_user_model()

        validated_email = serializer.validated_data.get("email")
        validated_phone = serializer.validated_data.get("phone")

        if not user and validated_email:
            user = User.objects.filter(email__iexact=validated_email).first()
        if not user and validated_phone:
            user = User.objects.filter(phone=validated_phone).first()

        contact = serializer.save(
            user=user,
        )

        # 1. Create notification for the user who submitted the message
        if user:
            try:
                Notification.objects.create(
                    user=user,
                    notification_type=Notification.Type.CONTACT_REPLY,
                    title_uz="Murojaatingiz qabul qilindi",
                    title_ru="Ваше обращение принято",
                    message=(
                        f"Hurmatli {contact.name}, sizning murojaatingiz muvaffaqiyatli qabul qilindi. "
                        "Mutaxassislarimiz tez orada siz bilan bog‘lanishadi."
                    ),
                    link="/contact",
                )
            except Exception as e:
                logger.error(f"Error creating user notification: {e}")

        # 2. Also notify admin / staff users in dashboard
        try:
            for staff in User.objects.filter(is_staff=True):
                if user and staff.id == user.id:
                    continue
                Notification.objects.create(
                    user=staff,
                    notification_type=Notification.Type.CONTACT_REPLY,
                    title_uz=f"Yangi murojaat: {contact.name}",
                    title_ru=f"Новое обращение: {contact.name}",
                    message=(
                        f"{contact.name} ({contact.phone or contact.email or 'Aloqa yo‘q'}): "
                        f"{contact.message[:120]}"
                    ),
                    link="/contact",
                )
        except Exception as e:
            logger.error(f"Error creating staff notifications: {e}")

        # 3. Send notification to Telegram Admin Group if configured
        try:
            from orders.telegram_service import send_message
            import os
            admin_chat_id = os.getenv("TELEGRAM_ADMIN_CHAT_ID", "").strip()
            if admin_chat_id:
                msg = (
                    f"📩 <b>YANGI MUROJAAT (SAYTDAN)</b>\n"
                    f"━━━━━━━━━━━━━━━━━━━\n"
                    f"👤 <b>Ism:</b> {contact.name}\n"
                    f"📞 <b>Telefon:</b> <a href=\"tel:{contact.phone}\">{contact.phone or '-'}</a>\n"
                    f"✉️ <b>Email:</b> {contact.email or '-'}\n"
                    f"━━━━━━━━━━━━━━━━━━━\n"
                    f"💬 <b>Xabar:</b>\n{contact.message}"
                )
                send_message(chat_id=admin_chat_id, text=msg)
        except Exception as e:
            logger.error(f"Error sending contact message to Telegram admin group: {e}")

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
