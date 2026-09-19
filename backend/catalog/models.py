from django.db import models
from django.db.models import Q
from django.conf import settings
from django.db import models, transaction
from django.db.models import Q

class Category(models.Model):
    name_uz = models.CharField(max_length=150)
    name_ru = models.CharField(max_length=150, blank=True)

    description_uz = models.TextField(blank=True)
    description_ru = models.TextField(blank=True)

    slug = models.SlugField(max_length=160, unique=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name_uz"]

    def __str__(self):
        return self.name_uz


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )

    name_uz = models.CharField(max_length=200)
    name_ru = models.CharField(max_length=200, blank=True)

    description_uz = models.TextField()
    description_ru = models.TextField(blank=True)

    fabric_uz = models.TextField(blank=True)
    fabric_ru = models.TextField(blank=True)

    care_uz = models.TextField(blank=True)
    care_ru = models.TextField(blank=True)

    composition_uz = models.TextField(blank=True)
    composition_ru = models.TextField(blank=True)

    slug = models.SlugField(max_length=220, unique=True)

    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name_uz


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(
        upload_to="products/%Y/%m/"
    )
    is_primary = models.BooleanField(
        default=False
    )

    alt_text_uz = models.CharField(
        max_length=255,
        blank=True,
    )

    alt_text_ru = models.CharField(
        max_length=255,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["product"],
                condition=Q(is_primary=True),
                name="unique_primary_image_per_product",
            )
        ]

    def save(self, *args, **kwargs):
        with transaction.atomic():
            if self.is_primary and self.product_id:
                ProductImage.objects.filter(
                    product_id=self.product_id,
                    is_primary=True,
                ).exclude(
                    pk=self.pk
                ).update(
                    is_primary=False
                )

            super().save(*args, **kwargs)


class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants",
    )

    color_code = models.CharField(
        max_length=50,
        help_text="Internal value, masalan: green, beige, white",
    )

    color_uz = models.CharField(max_length=100)
    color_ru = models.CharField(max_length=100, blank=True)

    size = models.CharField(max_length=100)

    sku = models.CharField(
        max_length=100,
        unique=True,
    )

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    stock = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["product", "color_code", "size"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "product",
                    "color_code",
                    "size",
                ],
                name="unique_product_color_size",
            ),

            models.CheckConstraint(
                condition=Q(price__gte=0),
                name="variant_price_gte_0",
            ),

            models.CheckConstraint(
                condition=Q(stock__gte=0),
                name="variant_stock_gte_0",
            ),
        ]

class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorites",
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="favorited_by",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "product"],
                name="unique_user_favorite_product",
            ),
        ]

        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} - {self.product.name_uz}"
