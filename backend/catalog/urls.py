from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    CategoryViewSet,
    FavoriteDeleteView,
    FavoriteListCreateView,
    ProductViewSet,
)
from .views_ai import (
    AIFabricAdvisorView,
    AIGiftAdvisorView,
    AIInteriorAdviceView,
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

    path(
        "ai-interior-advice/",
        AIInteriorAdviceView.as_view(),
        name="ai-interior-advice",
    ),

    path(
        "ai-gift-advisor/",
        AIGiftAdvisorView.as_view(),
        name="ai-gift-advisor",
    ),

    path(
        "ai-fabric-advisor/",
        AIFabricAdvisorView.as_view(),
        name="ai-fabric-advisor",
    ),
]