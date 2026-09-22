from drf_spectacular.utils import (
    OpenApiParameter,
    extend_schema,
)
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView

from .serializers import (
    CheckoutSerializer,
    OrderSerializer,
)
from .services import create_order
from .models import Order


class OrderListView(ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        from django.db.models import Q
        user = self.request.user
        q = Q(user=user)
        user_phone = getattr(user, "phone", None)
        if user_phone:
            q |= Q(phone=user_phone)
        return (
            Order.objects
            .filter(q)
            .prefetch_related("items")
            .order_by("-created_at")
        )


class OrderDetailView(RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        from django.db.models import Q
        user = self.request.user
        q = Q(user=user)
        user_phone = getattr(user, "phone", None)
        if user_phone:
            q |= Q(phone=user_phone)
        return (
            Order.objects
            .filter(q)
            .prefetch_related("items")
        )

class CheckoutView(APIView):
    permission_classes = []

    @extend_schema(
        request=CheckoutSerializer,
        responses={
            200: OrderSerializer,
            201: OrderSerializer,
        },
        parameters=[
            OpenApiParameter(
                name="Idempotency-Key",
                location=OpenApiParameter.HEADER,
                required=True,
                type=str,
                description=(
                    "Har yangi checkout uchun unikal qiymat. "
                    "Masalan: checkout-001"
                ),
            ),
        ],
    )
    def post(self, request):
        idempotency_key = (
            request.headers.get("Idempotency-Key")
            or request.headers.get("X-Idempotency-Key")
            or request.META.get("HTTP_IDEMPOTENCY_KEY")
            or request.META.get("HTTP_X_IDEMPOTENCY_KEY")
        )

        if not idempotency_key:
            return Response(
                {
                    "detail": (
                        "Idempotency-Key header majburiy."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(idempotency_key) > 100:
            return Response(
                {
                    "detail": (
                        "Idempotency-Key 100 belgidan "
                        "oshmasligi kerak."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CheckoutSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = request.user if (request.user and request.user.is_authenticated) else None

        order, created = create_order(
            user=user,
            validated_data=dict(
                serializer.validated_data
            ),
            idempotency_key=idempotency_key,
        )

        if created:
            try:
                from .telegram_service import send_order_to_admin_group
                send_order_to_admin_group(order)
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Error sending order notification to admin group: {e}")

        response_serializer = OrderSerializer(
            order,
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


class CreateTelegramSessionView(APIView):
    permission_classes = []

    def post(self, request):
        import os
        import uuid
        from decimal import Decimal
        from catalog.models import ProductVariant
        from .models import TelegramCheckoutSession

        items = request.data.get("items", [])
        if not items:
            return Response(
                {"detail": "Savatchada mahsulotlar mavjud emas."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_amount = Decimal("0.00")
        validated_items = []

        for it in items:
            variant_id = it.get("variant_id")
            quantity = int(it.get("quantity", 1))

            if variant_id:
                try:
                    variant = ProductVariant.objects.select_related("product").get(id=variant_id)
                    unit_price = variant.price
                    line_total = unit_price * quantity
                    total_amount += line_total
                    validated_items.append({
                        "variant_id": variant.id,
                        "product_name": variant.product.name_uz,
                        "sku": variant.sku,
                        "color": variant.color_uz,
                        "size": variant.size,
                        "unit_price": str(unit_price),
                        "quantity": quantity,
                        "line_total": str(line_total),
                    })
                    continue
                except ProductVariant.DoesNotExist:
                    pass

            # Fallback for direct payload
            unit_price = Decimal(str(it.get("unit_price", it.get("price", 0))))
            line_total = unit_price * quantity
            total_amount += line_total
            validated_items.append({
                "variant_id": None,
                "product_name": it.get("product_name", it.get("name", "Mahsulot")),
                "sku": it.get("sku", ""),
                "color": it.get("color", ""),
                "size": it.get("size", ""),
                "unit_price": str(unit_price),
                "quantity": quantity,
                "line_total": str(line_total),
            })

        session_code = uuid.uuid4().hex[:12]
        session_user = request.user if (request.user and request.user.is_authenticated) else None
        session = TelegramCheckoutSession.objects.create(
            session_code=session_code,
            user=session_user,
            items_data=validated_items,
            total_amount=total_amount,
        )

        bot_username = os.getenv("TELEGRAM_BOT_USERNAME", "velmora_silkbot")
        telegram_url = f"https://t.me/{bot_username}?start=cart_{session_code}"

        return Response(
            {
                "session_code": session_code,
                "bot_username": bot_username,
                "telegram_url": telegram_url,
                "total_amount": str(total_amount),
            },
            status=status.HTTP_201_CREATED,
        )


class TelegramWebhookView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        try:
            update = request.data
            from .telegram_service import process_webhook_update
            process_webhook_update(update)
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Telegram webhook error: {e}")
        return Response({"ok": True}, status=status.HTTP_200_OK)