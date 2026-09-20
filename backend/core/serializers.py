from rest_framework import serializers

from .models import ContactMessage


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
