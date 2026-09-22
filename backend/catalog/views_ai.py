import logging
from django.core.cache import cache
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .ai_service import get_interior_recommendations

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}


class AIInteriorAdviceView(APIView):
    """
    POST /api/v1/catalog/ai-interior-advice/
    Accepts an uploaded bedroom/room photo, runs vision analysis through AI,
    and returns matched Velmora products with interior advice.
    """
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        image_file = request.FILES.get("image")
        if not image_file:
            return Response(
                {"error": "Rasm yuklanmadi. Iltimos, xonangiz rasmini tanlang."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image_file.size > MAX_FILE_SIZE:
            return Response(
                {"error": "Rasm hajmi juda katta. Maksimal hajm: 10 MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        content_type = getattr(image_file, "content_type", "image/jpeg").lower()
        if content_type not in ALLOWED_MIME_TYPES:
            return Response(
                {"error": "Faqat JPG, PNG yoki WebP formatidagi rasmlar qabul qilinadi."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Rate-limiting: max 15 analyses per hour per IP / user
        ip_addr = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip() or request.META.get("REMOTE_ADDR")
        user_key = f"ai_limit_{request.user.id if request.user.is_authenticated else ip_addr}"
        usage_count = cache.get(user_key, 0)
        if usage_count >= 15:
            return Response(
                {"error": "Bir soatlik AI maslahat limiti tugadi. Iltimos, birozdan so‘ng qayta urinib ko‘ring."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        try:
            image_bytes = image_file.read()
            result = get_interior_recommendations(image_bytes, mime_type=content_type)
            cache.set(user_key, usage_count + 1, timeout=3600)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            logger.warning(f"AI configuration error: {e}")
            return Response(
                {"error": "AI xizmati hozirda sozlanmagan. Iltimos, administratorga murojaat qiling."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as e:
            logger.exception(f"AI interior analysis failed: {e}")
            return Response(
                {"error": "Xona rasmini tahlil qilishda xatolik yuz berdi. Iltimos, boshqa rasm yuklab ko‘ring."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
