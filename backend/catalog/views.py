from django.db.models import Min, Q
from rest_framework import filters, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .filters import ProductFilter
from .models import Category, Favorite, Product
from drf_spectacular.utils import extend_schema
from .serializers import (
    CategorySerializer,
    FavoriteSerializer,
    ProductSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    queryset = Category.objects.filter(
        is_active=True
    ).order_by("name_uz")


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_class = ProductFilter

    search_fields = [
        "name_uz",
        "name_ru",
        "description_uz",
        "description_ru",
        "variants__sku",
    ]

    ordering_fields = [
        "created_at",
        "name_uz",
        "min_price",
    ]

    ordering = ["-created_at"]

    def get_queryset(self):
        return (
            Product.objects
            .filter(
                is_active=True,
                category__is_active=True,
            )
            .select_related("category")
            .prefetch_related(
                "images",
                "variants",
            )
            .annotate(
                min_price=Min(
                    "variants__price",
                    filter=Q(
                        variants__is_active=True,
                        variants__stock__gt=0,
                    ),
                )
            )
            .distinct()
        )

class FavoriteListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses=FavoriteSerializer(many=True),
    )
    def get(self, request):
        favorites = (
            Favorite.objects
            .filter(user=request.user)
            .select_related(
                "product",
                "product__category",
            )
            .prefetch_related(
                "product__images",
                "product__variants",
            )
        )

        serializer = FavoriteSerializer(
            favorites,
            many=True,
            context={"request": request},
        )

        return Response(serializer.data)

    @extend_schema(
        request=FavoriteSerializer,
        responses={
            200: FavoriteSerializer,
            201: FavoriteSerializer,
        },
    )
    def post(self, request):
        serializer = FavoriteSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(
            raise_exception=True
        )

        product = serializer.validated_data["product"]

        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            product=product,
        )

        response_serializer = FavoriteSerializer(
            favorite,
            context={"request": request},
        )

        return Response(
            response_serializer.data,
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )

class FavoriteDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        favorite = Favorite.objects.filter(
            user=request.user,
            product_id=product_id,
        ).first()

        if not favorite:
            return Response(
                {
                    "detail": "Sevimli mahsulot topilmadi."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        favorite.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )