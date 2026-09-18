from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    CategoryViewSet,
    FavoriteDeleteView,
    FavoriteListCreateView,
    ProductViewSet,
)


router = DefaultRouter()

router.register(
    "categories",
    CategoryViewSet,
    basename="category",
)

router.register(
    "products",
    ProductViewSet,
    basename="product",
)


urlpatterns = router.urls + [
    path(
        "favorites/",
        FavoriteListCreateView.as_view(),
        name="favorite-list-create",
    ),

    path(
        "favorites/<int:product_id>/",
        FavoriteDeleteView.as_view(),
        name="favorite-delete",
    ),
]