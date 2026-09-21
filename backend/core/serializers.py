from rest_framework import serializers

from .models import (
    ContactMessage,
    Notification,
)


class ContactMessageSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = ContactMessage

        fields = (
            "id",
            "name",
            "email",
            "phone",
            "message",
            "created_at",
        )

        read_only_fields = (
            "id",
            "created_at",
        )

    def validate(self, attrs):
        email = (
            attrs.get("email", "")
            or ""
        ).strip()

        phone = (
            attrs.get("phone", "")
            or ""
        ).strip()

        if not email and not phone:
            raise serializers.ValidationError(
                {
                    "contact": (
                        "Email yoki telefon "
                        "raqamidan kamida bittasini "
                        "kiriting."
                    )
                }
            )

        return attrs


class NotificationSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Notification

        fields = (
            "id",
            "notification_type",
            "title_uz",
            "title_ru",
            "message",
            "link",
            "is_read",
            "created_at",
        )

        read_only_fields = fields
