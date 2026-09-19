from django.db import migrations, models


def clean_duplicate_primary_images(apps, schema_editor):
    ProductImage = apps.get_model("catalog", "ProductImage")

    product_ids = (
        ProductImage.objects
        .filter(is_primary=True)
        .values_list("product_id", flat=True)
        .distinct()
    )

    for product_id in product_ids:
        primary_images = (
            ProductImage.objects
            .filter(
                product_id=product_id,
                is_primary=True,
            )
            .order_by("id")
        )

        first = primary_images.first()

        if first:
            primary_images.exclude(
                pk=first.pk
            ).update(is_primary=False)


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0002_favorite"),
    ]

    operations = [
        migrations.AlterField(
            model_name="productimage",
            name="alt_text_ru",
            field=models.CharField(
                blank=True,
                max_length=255,
            ),
        ),
        migrations.AlterField(
            model_name="productimage",
            name="alt_text_uz",
            field=models.CharField(
                blank=True,
                max_length=255,
            ),
        ),

        migrations.RunPython(
            clean_duplicate_primary_images,
            migrations.RunPython.noop,
        ),

        migrations.AddConstraint(
            model_name="productimage",
            constraint=models.UniqueConstraint(
                condition=models.Q(
                    ("is_primary", True)
                ),
                fields=("product",),
                name=(
                    "unique_primary_image_"
                    "per_product"
                ),
            ),
        ),
    ]