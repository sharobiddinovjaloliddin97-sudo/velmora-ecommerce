from decimal import Decimal

from django.db import transaction
from rest_framework.exceptions import ValidationError

from catalog.models import ProductVariant
from django.utils import timezone

from .models import (
    Order,
    OrderItem,
    OrderStatusHistory,
)


@transaction.atomic
def create_order(
    *,
    user,
    validated_data,
    idempotency_key,
):
    existing_order = Order.objects.filter(
        idempotency_key=idempotency_key
    ).first()

    if existing_order:
        if existing_order.user_id != user.id:
            raise ValidationError(
                "Idempotency key boshqa buyurtmaga tegishli."
            )

        return existing_order, False

    items_data = validated_data.pop("items")

    variant_ids = sorted(
        item["variant_id"]
        for item in items_data
    )

    variants = (
        ProductVariant.objects
        .select_for_update()
        .select_related(
            "product",
            "product__category",
        )
        .filter(
            id__in=variant_ids
        )
        .order_by("id")
    )

    variants_by_id = {
        variant.id: variant
        for variant in variants
    }

    # Lock olingandan keyin idempotency'ni
    # yana tekshiramiz.
    existing_order = Order.objects.filter(
        idempotency_key=idempotency_key
    ).first()

    if existing_order:
        if existing_order.user_id != user.id:
            raise ValidationError(
                "Idempotency key boshqa buyurtmaga tegishli."
            )

        return existing_order, False

    total_amount = Decimal("0.00")

    prepared_items = []

    for item_data in items_data:
        variant_id = item_data["variant_id"]
        quantity = item_data["quantity"]

        variant = variants_by_id.get(
            variant_id
        )

        if variant is None:
            raise ValidationError({
                "items": (
                    f"Variant {variant_id} topilmadi."
                )
            })

        if not variant.is_active:
            raise ValidationError({
                "items": (
                    f"{variant.sku} varianti faol emas."
                )
            })

        if not variant.product.is_active:
            raise ValidationError({
                "items": (
                    f"{variant.product.name_uz} mahsuloti faol emas."
                )
            })

        if not variant.product.category.is_active:
            raise ValidationError({
                "items": (
                    f"{variant.product.name_uz} kategoriyasi faol emas."
                )
            })

        if quantity > variant.stock:
            raise ValidationError({
                "items": (
                    f"{variant.sku} uchun yetarli qoldiq yo'q. "
                    f"Mavjud: {variant.stock}."
                )
            })

        unit_price = variant.price

        line_total = (
            unit_price * quantity
        )

        total_amount += line_total

        prepared_items.append(
            {
                "variant": variant,
                "quantity": quantity,
                "unit_price": unit_price,
                "line_total": line_total,
            }
        )

    order = Order.objects.create(
        user=user,

        recipient_name=validated_data[
            "recipient_name"
        ],
        phone=validated_data["phone"],

        city="Toshkent",
        district=validated_data[
            "district"
        ],

        street=validated_data[
            "street"
        ],
        house=validated_data[
            "house"
        ],
        apartment=validated_data.get(
            "apartment",
            "",
        ),

        landmark=validated_data.get(
            "landmark",
            "",
        ),

        comment=validated_data.get(
            "comment",
            "",
        ),

        total_amount=total_amount,
        delivery_fee=Decimal("0.00"),

        idempotency_key=idempotency_key,
    )

    order_items = []

    for prepared in prepared_items:
        variant = prepared["variant"]
        quantity = prepared["quantity"]

        order_items.append(
            OrderItem(
                order=order,
                variant=variant,

                product_name=(
                    variant.product.name_uz
                ),

                sku=variant.sku,

                color=variant.color_uz,
                size=variant.size,

                unit_price=prepared[
                    "unit_price"
                ],

                quantity=quantity,

                line_total=prepared[
                    "line_total"
                ],
            )
        )

        variant.stock -= quantity

        variant.save(
            update_fields=[
                "stock",
                "updated_at",
            ]
        )

    OrderItem.objects.bulk_create(
        order_items
    )

    OrderStatusHistory.objects.create(
        order=order,
        old_status="",
        new_status=Order.Status.NEW,
        changed_by=None,
    )

    return order, True


ALLOWED_STATUS_TRANSITIONS = {
    Order.Status.NEW: {
        Order.Status.CONFIRMED,
        Order.Status.CANCELLED,
    },
    Order.Status.CONFIRMED: {
        Order.Status.SHIPPING,
        Order.Status.CANCELLED,
    },
    Order.Status.SHIPPING: {
        Order.Status.DELIVERED,
        Order.Status.CANCELLED,
    },
    Order.Status.DELIVERED: set(),
    Order.Status.CANCELLED: set(),
}


@transaction.atomic
def change_order_status(
    *,
    order,
    new_status,
    changed_by,
    cancellation_reason="",
):
    locked_order = (
        Order.objects
        .select_for_update()
        .get(pk=order.pk)
    )

    old_status = locked_order.status

    if new_status == old_status:
        return locked_order

    allowed = ALLOWED_STATUS_TRANSITIONS.get(
        old_status,
        set(),
    )

    if new_status not in allowed:
        raise ValidationError(
            f"{old_status} holatidan "
            f"{new_status} holatiga o'tish mumkin emas."
        )

    if new_status == Order.Status.CANCELLED:
        if not cancellation_reason.strip():
            raise ValidationError(
                "Bekor qilish sababi majburiy."
            )

        locked_order.cancellation_reason = (
            cancellation_reason.strip()
        )

        if not locked_order.stock_restored:
            items = (
                locked_order.items
                .select_related("variant")
                .all()
            )

            variant_ids = [
                item.variant_id
                for item in items
                if item.variant_id is not None
            ]

            variants = (
                ProductVariant.objects
                .select_for_update()
                .filter(id__in=variant_ids)
            )

            variants_by_id = {
                variant.id: variant
                for variant in variants
            }

            for item in items:
                if item.variant_id is None:
                    continue

                variant = variants_by_id.get(
                    item.variant_id
                )

                if variant is None:
                    continue

                variant.stock += item.quantity

                variant.save(
                    update_fields=[
                        "stock",
                        "updated_at",
                    ]
                )

            locked_order.stock_restored = True

    locked_order.status = new_status

    locked_order.save(
        update_fields=[
            "status",
            "cancellation_reason",
            "stock_restored",
            "updated_at",
        ]
    )

    OrderStatusHistory.objects.create(
        order=locked_order,
        old_status=old_status,
        new_status=new_status,
        changed_by=changed_by,
    )

    return locked_order

@transaction.atomic
def mark_order_paid(*, order, changed_by):
    locked_order = (
        Order.objects
        .select_for_update()
        .get(pk=order.pk)
    )

    if locked_order.payment_status == Order.PaymentStatus.PAID:
        return locked_order

    locked_order.payment_status = Order.PaymentStatus.PAID
    locked_order.paid_at = timezone.now()
    locked_order.paid_by = changed_by

    locked_order.save(
        update_fields=[
            "payment_status",
            "paid_at",
            "paid_by",
            "updated_at",
        ]
    )

    return locked_order