from django.conf import settings
from django.db import models


class ContactMessage(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contact_messages",
    )

    name = models.CharField(
        max_length=150,
    )

    email = models.EmailField(
        blank=True,
    )

    phone = models.CharField(
        max_length=30,
        blank=True,
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.name} - "
            f"{self.created_at:%Y-%m-%d %H:%M}"
        )


class ContactReply(models.Model):
    contact = models.ForeignKey(
        ContactMessage,
        on_delete=models.CASCADE,
        related_name="replies",
    )

    message = models.TextField()

    replied_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contact_replies",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Reply to {self.contact_id}"


class Notification(models.Model):
    class Type(models.TextChoices):
        CONTACT_REPLY = (
            "CONTACT_REPLY",
            "Contact reply",
        )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    notification_type = models.CharField(
        max_length=30,
        choices=Type.choices,
        default=Type.CONTACT_REPLY,
    )

    title_uz = models.CharField(
        max_length=200,
    )

    title_ru = models.CharField(
        max_length=200,
    )

    message = models.TextField()

    link = models.CharField(
        max_length=255,
        blank=True,
        default="/account",
    )

    is_read = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.user} - "
            f"{self.notification_type}"
        )
