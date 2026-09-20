import logging

from django.conf import settings
from django.contrib import admin

from accounts.services.email_service import (
    send_brevo_email,
)

from .models import (
    ContactMessage,
    ContactReply,
    Notification,
)


logger = logging.getLogger(__name__)


class ContactReplyInline(
    admin.TabularInline
):
    model = ContactReply

    extra = 1

    fields = (
        "message",
        "replied_by",
        "created_at",
    )

    readonly_fields = (
        "replied_by",
        "created_at",
    )

    can_delete = False


@admin.register(ContactMessage)
class ContactMessageAdmin(
    admin.ModelAdmin
):
    list_display = (
        "name",
        "email",
        "phone",
        "user",
        "is_read",
        "created_at",
    )

    list_filter = (
        "is_read",
        "created_at",
    )

    search_fields = (
        "name",
        "email",
        "phone",
        "message",
        "user__email",
    )

    readonly_fields = (
        "user",
        "name",
        "email",
        "phone",
        "message",
        "created_at",
    )

    ordering = (
        "-created_at",
    )

    inlines = [
        ContactReplyInline,
    ]

    def save_formset(
        self,
        request,
        form,
        formset,
        change,
    ):
        instances = formset.save(
            commit=False
        )

        for deleted_object in (
            formset.deleted_objects
        ):
            deleted_object.delete()

        for instance in instances:
            is_new = (
                isinstance(
                    instance,
                    ContactReply,
                )
                and instance.pk is None
            )

            if is_new:
                instance.replied_by = (
                    request.user
                )

            instance.save()

            if not is_new:
                continue

            contact = instance.contact

            # Login qilgan user uchun
            # dashboard notification.
            if contact.user_id:
                Notification.objects.create(
                    user=contact.user,
                    notification_type=(
                        Notification.Type.CONTACT_REPLY
                    ),
                    title_uz=(
                        "Murojaatingizga javob berildi"
                    ),
                    title_ru=(
                        "На ваше обращение ответили"
                    ),
                    message=instance.message,
                    link="/account",
                )

            # Email mavjud bo‘lsa,
            # userga email ham yuboramiz.
            if contact.email:
                try:
                    send_brevo_email(
                        to_email=contact.email,
                        subject=(
                            "Velmora — "
                            "murojaatingizga javob"
                        ),
                        text_content=(
                            "Assalomu alaykum, "
                            f"{contact.name}.\n\n"
                            "Velmora jamoasidan "
                            "javob:\n\n"
                            f"{instance.message}\n\n"
                            "Hurmat bilan,\n"
                            "Velmora"
                        ),
                        reply_to=(
                            settings
                            .CONTACT_NOTIFICATION_EMAIL
                        ),
                    )

                except Exception:
                    logger.exception(
                        "Contact reply email "
                        "could not be sent."
                    )

            if not contact.is_read:
                contact.is_read = True

                contact.save(
                    update_fields=[
                        "is_read",
                    ]
                )

        formset.save_m2m()


@admin.register(Notification)
class NotificationAdmin(
    admin.ModelAdmin
):
    list_display = (
        "user",
        "notification_type",
        "is_read",
        "created_at",
    )

    list_filter = (
        "notification_type",
        "is_read",
        "created_at",
    )

    search_fields = (
        "user__email",
        "message",
    )

    readonly_fields = (
        "user",
        "notification_type",
        "title_uz",
        "title_ru",
        "message",
        "link",
        "is_read",
        "created_at",
    )

    def has_add_permission(
        self,
        request,
    ):
        return False
