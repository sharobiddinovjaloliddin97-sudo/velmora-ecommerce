from django.contrib import admin

from .models import (
    Category,
    Product,
    ProductImage,
    ProductVariant,
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name_uz",
        "name_ru",
        "slug",
        "is_active",
    )

    list_filter = ("is_active",)

    search_fields = (
        "name_uz",
        "name_ru",
        "slug",
    )

    prepopulated_fields = {
        "slug": ("name_uz",),
    }


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name_uz",
        "category",
        "is_active",
        "is_featured",
        "created_at",
    )

    list_filter = (
        "is_active",
        "is_featured",
        "category",
    )

    search_fields = (
        "name_uz",
        "name_ru",
        "slug",
    )

    prepopulated_fields = {
        "slug": ("name_uz",),
    }

    inlines = [
        ProductImageInline,
        ProductVariantInline,
    ]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = (
        "sku",
        "product",
        "color_uz",
        "size",
        "price",
        "stock",
        "is_active",
    )

    list_filter = (
        "is_active",
        "color_code",
        "size",
    )

    search_fields = (
        "sku",
        "product__name_uz",
        "product__name_ru",
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "is_primary",
        "created_at",
    )

    list_filter = ("is_primary",)

    search_fields = (
        "product__name_uz",
        "product__name_ru",
    )