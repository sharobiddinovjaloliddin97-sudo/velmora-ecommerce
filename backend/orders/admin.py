from django import forms
from django.contrib import admin
from django.core.exceptions import ValidationError

from .models import (
    Order,
    OrderItem,
    OrderStatusHistory,
)
from .services import (
    ALLOWED_STATUS_TRANSITIONS,
    change_order_status,
    mark_order_paid,
)


class OrderAdminForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = "__all__"

    def clean_status(self):
        requested_status = self.cleaned_data.get(
            "status"
        )

        if not self.instance.pk:
            return requested_status

        old_status = (
            Order.objects
            .only("status")
            .get(pk=self.instance.pk)
            .status
        )

        if requested_status == old_status:
            return requested_status

        allowed = ALLOWED_STATUS_TRANSITIONS.get(
            old_status,
            set(),
        )

        if requested_status not in allowed:
            raise forms.ValidationError(
                f"{old_status} holatidan "
                f"{requested_status} holatiga "
                "o‘tish mumkin emas."
            )

        return requested_status

    def clean(self):
        cleaned_data = super().clean()

        requested_status = cleaned_data.get(
            "status"
        )

        cancellation_reason = (
            cleaned_data.get(
                "cancellation_reason",
                "",
            )
            or ""
        )

        if (
            requested_status
            == Order.Status.CANCELLED
            and not cancellation_reason.strip()
        ):
            self.add_error(
                "cancellation_reason",
                "Bekor qilish sababi majburiy.",
            )

        return cleaned_data


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

    readonly_fields = (
        "product_name",
        "sku",
        "color",
        "size",
        "unit_price",
        "quantity",
        "line_total",
    )

    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0

    readonly_fields = (
        "old_status",
        "new_status",
        "changed_by",
        "created_at",
    )

    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    form = OrderAdminForm
    list_display = (
        "order_number",
        "recipient_name",
        "phone",
        "status",
        "payment_status",
        "total_amount",
        "created_at",
    )

    list_filter = (
        "status",
        "payment_status",
        "created_at",
    )

    search_fields = (
        "order_number",
        "recipient_name",
        "phone",
        "user__email",
    )

    readonly_fields = (
        "id",
        "order_number",
        "user",
        "city",
        "payment_method",
        "delivery_fee",
        "total_amount",
        "stock_restored",
        "idempotency_key",
        "paid_at",
        "paid_by",
        "created_at",
        "updated_at",
    )

    inlines = [
        OrderItemInline,
        OrderStatusHistoryInline,
    ]

    def save_model(
        self,
        request,
        obj,
        form,
        change,
    ):
        if not change:
            super().save_model(
                request,
                obj,
                form,
                change,
            )
            return

        old_order = Order.objects.get(
            pk=obj.pk
        )

        old_status = old_order.status
        requested_status = obj.status

        old_payment_status = (
            old_order.payment_status
        )
        requested_payment_status = (
            obj.payment_status
        )

        # Status va payment statusni oddiy save
        # orqali chetlab o'tishga yo'l qo'ymaymiz.
        obj.status = old_status
        obj.payment_status = old_payment_status

        super().save_model(
            request,
            obj,
            form,
            change,
        )

        if requested_status != old_status:
            try:
                change_order_status(
                    order=obj,
                    new_status=requested_status,
                    changed_by=request.user,
                    cancellation_reason=(
                        obj.cancellation_reason
                    ),
                )

            except ValidationError as exc:
                raise ValidationError(
                    exc.messages
                )

        if (
            requested_payment_status
            == Order.PaymentStatus.PAID
            and old_payment_status
            == Order.PaymentStatus.UNPAID
        ):
            mark_order_paid(
                order=obj,
                changed_by=request.user,
            )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "order",
        "product_name",
        "sku",
        "quantity",
        "unit_price",
        "line_total",
    )

    search_fields = (
        "order__order_number",
        "product_name",
        "sku",
    )

    readonly_fields = (
        "order",
        "variant",
        "product_name",
        "sku",
        "color",
        "size",
        "unit_price",
        "quantity",
        "line_total",
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(
        self,
        request,
        obj=None,
    ):
        return False


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "order",
        "old_status",
        "new_status",
        "changed_by",
        "created_at",
    )

    list_filter = (
        "new_status",
        "created_at",
    )

    search_fields = (
        "order__order_number",
        "changed_by__email",
    )

    readonly_fields = (
        "order",
        "old_status",
        "new_status",
        "changed_by",
        "created_at",
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(
        self,
        request,
        obj=None,
    ):
        return False