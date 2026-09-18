from rest_framework import serializers

from .models import Order, OrderItem



class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_name",
            "sku",
            "color",
            "size",
            "unit_price",
            "quantity",
            "line_total",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        many=True,
        read_only=True,
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    payment_status_display = serializers.CharField(
        source="get_payment_status_display",
        read_only=True,
    )

    district_display = serializers.CharField(
        source="get_district_display",
        read_only=True,
    )

    class Meta:
        model = Order

        fields = [
            "id",
            "order_number",
            "recipient_name",
            "phone",
            "city",
            "district",
            "district_display",
            "street",
            "house",
            "apartment",
            "landmark",
            "comment",
            "status",
            "status_display",
            "payment_status",
            "payment_status_display",
            "payment_method",
            "delivery_fee",
            "total_amount",
            "items",
            "created_at",
        ]

        read_only_fields = fields

class CheckoutItemSerializer(serializers.Serializer):
    variant_id = serializers.IntegerField()
    quantity = serializers.IntegerField(
        min_value=1
    )


class CheckoutSerializer(serializers.Serializer):
    recipient_name = serializers.CharField(
        max_length=150
    )

    city = serializers.CharField(
        default="Toshkent",
    )

    phone = serializers.CharField(
        max_length=30
    )

    district = serializers.ChoiceField(
        choices=Order.District.choices
    )

    street = serializers.CharField(
        max_length=255
    )

    house = serializers.CharField(
        max_length=50
    )

    apartment = serializers.CharField(
        max_length=50,
        required=False,
        allow_blank=True,
        default="",
    )

    landmark = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        default="",
    )

    comment = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    items = CheckoutItemSerializer(
        many=True
    )

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError(
                "Buyurtmada kamida bitta mahsulot bo'lishi kerak."
            )

        variant_ids = [
            item["variant_id"]
            for item in items
        ]

        if len(variant_ids) != len(set(variant_ids)):
            raise serializers.ValidationError(
                "Bir xil variant buyurtmada ikki marta yuborilmasin."
            )

        return items

    def validate_city(self, value):
        city = value.strip().lower()

        allowed = [
            "toshkent",
            "tashkent",
        ]

        if city not in allowed:
            raise serializers.ValidationError(
                "Yetkazib berish faqat Toshkent shahri ichida mavjud."
            )

        return "Toshkent"