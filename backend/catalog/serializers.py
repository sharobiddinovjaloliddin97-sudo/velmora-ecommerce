from django.db.models import Min
from rest_framework import serializers

from .models import (
    Category,
    Favorite,
    Product,
    ProductImage,
    ProductVariant,
)

class LanguageMixin:
    def get_language(self):
        request = self.context.get("request")

        if not request:
            return "uz"

        lang = request.query_params.get("lang")

        if lang in ["uz", "ru"]:
            return lang

        return "uz"

    def translated_value(self, obj, field):
        lang = self.get_language()

        selected = getattr(obj, f"{field}_{lang}", "")

        fallback_lang = "ru" if lang == "uz" else "uz"
        fallback = getattr(obj, f"{field}_{fallback_lang}", "")

        return selected or fallback


class CategorySerializer(LanguageMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "slug",
            "name",
            "description",
        ]

    def get_name(self, obj):
        return self.translated_value(obj, "name")

    def get_description(self, obj):
        return self.translated_value(obj, "description")


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            "id",
            "image",
            "is_primary",
        ]


class ProductVariantSerializer(LanguageMixin, serializers.ModelSerializer):
    color = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "sku",
            "color",
            "color_code",
            "size",
            "price",
            "stock",
            "is_active",
        ]

    def get_color(self, obj):
        return self.translated_value(obj, "color")


class ProductSerializer(LanguageMixin, serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    fabric = serializers.SerializerMethodField()
    care = serializers.SerializerMethodField()
    composition = serializers.SerializerMethodField()

    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = serializers.SerializerMethodField()

    min_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "slug",
            "category",
            "name",
            "description",
            "fabric",
            "care",
            "composition",
            "images",
            "variants",
            "min_price",
            "is_featured",
            "created_at",
        ]

    def get_name(self, obj):
        return self.translated_value(obj, "name")

    def get_description(self, obj):
        return self.translated_value(obj, "description")

    def get_fabric(self, obj):
        return self.translated_value(obj, "fabric")

    def get_care(self, obj):
        return self.translated_value(obj, "care")

    def get_composition(self, obj):
        return self.translated_value(obj, "composition")

    def get_variants(self, obj):
        variants = obj.variants.filter(is_active=True)

        return ProductVariantSerializer(
            variants,
            many=True,
            context=self.context,
        ).data

    def get_min_price(self, obj):
        if hasattr(obj, "min_price"):
            return obj.min_price

        return (
            obj.variants
            .filter(
                is_active=True,
                stock__gt=0,
            )
            .aggregate(min_price=Min("price"))
            ["min_price"]
        )
class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductSerializer(
        read_only=True
    )

    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(
            is_active=True
        ),
        source="product",
        write_only=True,
    )

    class Meta:
        model = Favorite

        fields = [
            "id",
            "product",
            "product_id",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]