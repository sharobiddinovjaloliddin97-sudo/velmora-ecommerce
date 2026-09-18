import uuid

from django.conf import settings
from django.db import models


class Order(models.Model):
    class Status(models.TextChoices):
        NEW = "NEW", "Yangi"
        CONFIRMED = "CONFIRMED", "Tasdiqlangan"
        SHIPPING = "SHIPPING", "Yetkazilmoqda"
        DELIVERED = "DELIVERED", "Yetkazilgan"
        CANCELLED = "CANCELLED", "Bekor qilingan"

    class PaymentStatus(models.TextChoices):
        UNPAID = "UNPAID", "To'lanmagan"
        PAID = "PAID", "To'langan"

    class District(models.TextChoices):
        BEKTEMIR = "BEKTEMIR", "Bektemir"
        CHILONZOR = "CHILONZOR", "Chilonzor"
        MIROBOD = "MIROBOD", "Mirobod"
        MIRZO_ULUGBEK = "MIRZO_ULUGBEK", "Mirzo Ulug'bek"
        OLMAZOR = "OLMAZOR", "Olmazor"
        SERGELI = "SERGELI", "Sergeli"
        SHAYXONTOHUR = "SHAYXONTOHUR", "Shayxontohur"
        UCHTEPA = "UCHTEPA", "Uchtepa"
        YAKKASAROY = "YAKKASAROY", "Yakkasaroy"
        YASHNOBOD = "YASHNOBOD", "Yashnobod"
        YUNUSOBOD = "YUNUSOBOD", "Yunusobod"
        YANGIHAYOT = "YANGIHAYOT", "Yangihayot"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    order_number = models.CharField(
        max_length=30,
        unique=True,
        editable=False,
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="orders",
    )

    recipient_name = models.CharField(
        max_length=150,
    )

    phone = models.CharField(
        max_length=30,
    )

    city = models.CharField(
        max_length=50,
        default="Toshkent",
        editable=False,
    )

    district = models.CharField(
        max_length=30,
        choices=District.choices,
    )

    street = models.CharField(
        max_length=255,
    )

    house = models.CharField(
        max_length=50,
    )

    apartment = models.CharField(
        max_length=50,
        blank=True,
    )

    landmark = models.CharField(
        max_length=255,
        blank=True,
    )

    comment = models.TextField(
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.UNPAID,
    )

    payment_method = models.CharField(
        max_length=30,
        default="CASH_ON_DELIVERY",
        editable=False,
    )

    delivery_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        editable=False,
    )

    total_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    paid_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    paid_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders_marked_paid",
    )

    cancellation_reason = models.TextField(
        blank=True,
    )

    stock_restored = models.BooleanField(
        default=False,
    )

    idempotency_key = models.CharField(
        max_length=100,
        unique=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = (
                f"VEL-{uuid.uuid4().hex[:10].upper()}"
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    variant = models.ForeignKey(
        "catalog.ProductVariant",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_items",
    )

    product_name = models.CharField(
        max_length=200,
    )

    sku = models.CharField(
        max_length=100,
    )

    color = models.CharField(
        max_length=100,
    )

    size = models.CharField(
        max_length=100,
    )

    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    quantity = models.PositiveIntegerField()

    line_total = models.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    def __str__(self):
        return f"{self.order.order_number} - {self.product_name}"


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="status_history",
    )

    old_status = models.CharField(
        max_length=20,
        blank=True,
    )

    new_status = models.CharField(
        max_length=20,
        choices=Order.Status.choices,
    )

    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_status_changes",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return (
            f"{self.order.order_number}: "
            f"{self.old_status} -> {self.new_status}"
        )