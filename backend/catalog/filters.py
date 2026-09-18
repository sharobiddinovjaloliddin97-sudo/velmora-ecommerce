import django_filters

from .models import Product


class ProductFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(
        field_name="category__slug"
    )

    min_price = django_filters.NumberFilter(
        field_name="variants__price",
        lookup_expr="gte",
    )

    max_price = django_filters.NumberFilter(
        field_name="variants__price",
        lookup_expr="lte",
    )

    color = django_filters.CharFilter(
        field_name="variants__color_code",
        lookup_expr="iexact",
    )

    size = django_filters.CharFilter(
        field_name="variants__size",
        lookup_expr="iexact",
    )

    featured = django_filters.BooleanFilter(
        field_name="is_featured",
    )

    class Meta:
        model = Product
        fields = [
            "category",
            "min_price",
            "max_price",
            "color",
            "size",
            "featured",
        ]