from django.urls import path

from .views import (
    CheckoutView,
    CreateTelegramSessionView,
    OrderDetailView,
    OrderListView,
    TelegramWebhookView,
)


urlpatterns = [
    path(
        "",
        OrderListView.as_view(),
        name="order-list",
    ),

    path(
        "<uuid:pk>/",
        OrderDetailView.as_view(),
        name="order-detail",
    ),

    path(
        "checkout/",
        CheckoutView.as_view(),
        name="checkout",
    ),

    path(
        "telegram-session/",
        CreateTelegramSessionView.as_view(),
        name="telegram-session",
    ),

    path(
        "telegram-webhook/",
        TelegramWebhookView.as_view(),
        name="telegram-webhook",
    ),
]