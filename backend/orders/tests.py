from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase

from catalog.models import (
    Category,
    Product,
    ProductVariant,
)

from orders.models import (
    Order,
    OrderItem,
)

from orders.services import (
    change_order_status,
)


User = get_user_model()


class OrderTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="buyer@test.com",
            password="TestPass123!",
            first_name="Buyer",
        )

        self.other_user = User.objects.create_user(
            email="other@test.com",
            password="TestPass123!",
            first_name="Other",
        )

        self.category = Category.objects.create(
            name_uz="Ko'rpalar",
            name_ru="Одеяла",
            slug="korpalar",
        )

        self.product = Product.objects.create(
            category=self.category,
            name_uz="Test ko'rpa",
            name_ru="Тестовое одеяло",
            description_uz="Test mahsulot",
            description_ru="Тестовый товар",
            slug="test-korpa",
        )

        self.variant = ProductVariant.objects.create(
            product=self.product,
            color_code="green",
            color_uz="Yashil",
            color_ru="Зеленый",
            size="200x220",
            sku="TEST-001",
            price=Decimal("450000.00"),
            stock=10,
            is_active=True,
        )

        self.checkout_url = reverse(
            "checkout"
        )

        self.payload = {
            "recipient_name": "Test User",
            "phone": "+998901234567",
            "district": "CHILONZOR",
            "street": "Bunyodkor",
            "house": "10",
            "apartment": "",
            "landmark": "",
            "comment": "",
            "items": [
                {
                    "variant_id": self.variant.id,
                    "quantity": 2,
                }
            ],
        }

    def test_checkout_creates_order_and_reduces_stock(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.post(
            self.checkout_url,
            self.payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="test-checkout-1",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        order = Order.objects.get(
            user=self.user
        )

        self.assertEqual(
            order.total_amount,
            Decimal("900000.00"),
        )

        self.variant.refresh_from_db()

        self.assertEqual(
            self.variant.stock,
            8,
        )

    def test_backend_uses_database_price(self):
        self.client.force_authenticate(
            user=self.user
        )

        payload = self.payload.copy()

        payload["price"] = "1.00"
        payload["total_amount"] = "1.00"

        response = self.client.post(
            self.checkout_url,
            payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="test-checkout-2",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        order = Order.objects.get(
            user=self.user
        )

        self.assertEqual(
            order.total_amount,
            Decimal("900000.00"),
        )

    def test_insufficient_stock_is_rejected(self):
        self.client.force_authenticate(
            user=self.user
        )

        self.payload["items"][0]["quantity"] = 20

        response = self.client.post(
            self.checkout_url,
            self.payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="test-checkout-3",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.variant.refresh_from_db()

        self.assertEqual(
            self.variant.stock,
            10,
        )

        self.assertEqual(
            Order.objects.count(),
            0,
        )

    def test_zero_quantity_is_rejected(self):
        self.client.force_authenticate(
            user=self.user
        )

        self.payload["items"][0]["quantity"] = 0

        response = self.client.post(
            self.checkout_url,
            self.payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="test-checkout-4",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_idempotency_prevents_duplicate_order(self):
        self.client.force_authenticate(
            user=self.user
        )

        first_response = self.client.post(
            self.checkout_url,
            self.payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="same-key",
        )

        second_response = self.client.post(
            self.checkout_url,
            self.payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="same-key",
        )

        self.assertEqual(
            first_response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            second_response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            Order.objects.count(),
            1,
        )

        self.variant.refresh_from_db()

        self.assertEqual(
            self.variant.stock,
            8,
        )

    def test_other_user_cannot_access_order(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.post(
            self.checkout_url,
            self.payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="private-order",
        )

        order_id = response.data[
            "id"
        ]

        self.client.force_authenticate(
            user=self.other_user
        )

        detail_url = reverse(
            "order-detail",
            kwargs={
                "pk": order_id
            },
        )

        response = self.client.get(
            detail_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_invalid_status_transition_is_rejected(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.post(
            self.checkout_url,
            self.payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="status-test-1",
        )

        order = Order.objects.get(
            pk=response.data["id"]
        )

        with self.assertRaises(
            ValidationError
        ):
            change_order_status(
                order=order,
                new_status=Order.Status.DELIVERED,
                changed_by=self.user,
            )

        order.refresh_from_db()

        self.assertEqual(
            order.status,
            Order.Status.NEW,
        )

    def test_cancel_restores_stock_only_once(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.post(
            self.checkout_url,
            self.payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="cancel-test-1",
        )

        order = Order.objects.get(
            pk=response.data["id"]
        )

        self.variant.refresh_from_db()

        self.assertEqual(
            self.variant.stock,
            8,
        )

        order = change_order_status(
            order=order,
            new_status=Order.Status.CONFIRMED,
            changed_by=self.user,
        )

        order = change_order_status(
            order=order,
            new_status=Order.Status.SHIPPING,
            changed_by=self.user,
        )

        order = change_order_status(
            order=order,
            new_status=Order.Status.CANCELLED,
            changed_by=self.user,
            cancellation_reason="Test cancellation",
        )

        self.variant.refresh_from_db()

        self.assertEqual(
            self.variant.stock,
            10,
        )

        change_order_status(
            order=order,
            new_status=Order.Status.CANCELLED,
            changed_by=self.user,
            cancellation_reason="Test cancellation",
        )

        self.variant.refresh_from_db()

        self.assertEqual(
            self.variant.stock,
            10,
        )

    def test_order_snapshot_does_not_change(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.post(
            self.checkout_url,
            self.payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="snapshot-test-1",
        )

        order = Order.objects.get(
            pk=response.data["id"]
        )

        item = OrderItem.objects.get(
            order=order
        )

        self.assertEqual(
            item.product_name,
            "Test ko'rpa",
        )

        self.assertEqual(
            item.unit_price,
            Decimal("450000.00"),
        )

        self.product.name_uz = "Yangi nom"
        self.product.save()

        self.variant.price = Decimal(
            "1000.00"
        )
        self.variant.save()

        item.refresh_from_db()

        self.assertEqual(
            item.product_name,
            "Test ko'rpa",
        )

        self.assertEqual(
            item.unit_price,
            Decimal("450000.00"),
        )

    def test_customer_cannot_modify_protected_order_fields(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.post(
            self.checkout_url,
            self.payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="security-test-1",
        )

        order = Order.objects.get(
            pk=response.data["id"]
        )

        detail_url = reverse(
            "order-detail",
            kwargs={
                "pk": order.id
            },
        )

        response = self.client.patch(
            detail_url,
            {
                "status": "DELIVERED",
                "payment_status": "PAID",
                "total_amount": "1.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )

        order.refresh_from_db()

        self.assertEqual(
            order.status,
            Order.Status.NEW,
        )

        self.assertEqual(
            order.payment_status,
            Order.PaymentStatus.UNPAID,
        )

        self.assertEqual(
            order.total_amount,
            Decimal("900000.00"),
        )

    def test_order_outside_tashkent_is_rejected(self):
        self.client.force_authenticate(
            user=self.user
        )

        self.payload["city"] = "Samarqand"

        response = self.client.post(
            self.checkout_url,
            self.payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="outside-tashkent",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Order.objects.count(),
            0,
        )

        self.variant.refresh_from_db()

        self.assertEqual(
            self.variant.stock,
            10,
        )

    def test_status_history_is_created(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.post(
            self.checkout_url,
            self.payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY="history-test-1",
        )

        order = Order.objects.get(
            pk=response.data["id"]
        )

        # Order yaratilganda NEW history yozilgan bo'lishi kerak
        self.assertEqual(
            order.status_history.count(),
            1,
        )

        first_history = order.status_history.first()

        self.assertEqual(
            first_history.old_status,
            "",
        )

        self.assertEqual(
            first_history.new_status,
            Order.Status.NEW,
        )

        # NEW -> CONFIRMED
        order = change_order_status(
            order=order,
            new_status=Order.Status.CONFIRMED,
            changed_by=self.user,
        )

        self.assertEqual(
            order.status_history.count(),
            2,
        )

        latest_history = order.status_history.last()

        self.assertEqual(
            latest_history.old_status,
            Order.Status.NEW,
        )

        self.assertEqual(
            latest_history.new_status,
            Order.Status.CONFIRMED,
        )

        self.assertEqual(
            latest_history.changed_by,
            self.user,
        )