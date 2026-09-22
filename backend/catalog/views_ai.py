import logging
from django.core.cache import cache
from rest_framework import status
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .ai_service import (
    get_interior_recommendations,
    recommend_gift_package,
    recommend_fabric_and_sleep,
)

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}


def check_rate_limit(request, prefix="ai_limit", max_count=20, timeout=3600):
    ip_addr = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip() or request.META.get("REMOTE_ADDR")
    user_key = f"{prefix}_{request.user.id if request.user.is_authenticated else ip_addr}"
    usage_count = cache.get(user_key, 0)
    if usage_count >= max_count:
        return False, user_key, usage_count
    return True, user_key, usage_count


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

        allowed, user_key, usage_count = check_rate_limit(request, prefix="ai_interior_limit", max_count=15)
        if not allowed:
            return Response(
                {"error": "Bir soatlik AI maslahat limiti tugadi. Iltimos, birozdan so‘ng qayta urinib ko‘ring."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        lang = (request.query_params.get("lang") or request.data.get("lang") or "uz").lower()

        try:
            image_bytes = image_file.read()
            result = get_interior_recommendations(image_bytes, mime_type=content_type)
            cache.set(user_key, usage_count + 1, timeout=3600)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            logger.warning(f"AI configuration error: {e}")
            msg = (
                "Сервис AI временно не настроен. Обратитесь к администратору."
                if lang == "ru"
                else "AI xizmati hozirda sozlanmagan. Iltimos, administratorga murojaat qiling."
            )
            return Response({"error": msg}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except RuntimeError as e:
            logger.warning(f"AI runtime error: {e}")
            msg = (
                "Не удалось подключиться к сервису AI. Пожалуйста, попробуйте через минуту."
                if lang == "ru"
                else f"AI xizmatiga ulanishda xatolik: {e}"
            )
            return Response({"error": msg}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            logger.exception(f"AI interior analysis failed: {e}")
            msg = (
                "Произошла ошибка при анализе фото комнаты. Пожалуйста, попробуйте другое фото."
                if lang == "ru"
                else "Xona rasmini tahlil qilishda xatolik yuz berdi. Iltimos, boshqa rasm yuklab ko‘ring."
            )
            return Response({"error": msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIGiftAdvisorView(APIView):
    """
    POST /api/v1/catalog/ai-gift-advisor/
    Accepts recipient, occasion, budget, and personal notes.
    Returns matched bedding gifts and an AI-composed personalized greeting card.
    """
    permission_classes = [AllowAny]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def post(self, request):
        allowed, user_key, usage_count = check_rate_limit(request, prefix="ai_gift_limit", max_count=20)
        if not allowed:
            return Response(
                {"error": "Bir soatlik AI so‘rovlar limiti tugadi. Iltimos, birozdan so‘ng qayta urinib ko‘ring."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        recipient = request.data.get("recipient", "").strip() or "Yaqinimga"
        occasion = request.data.get("occasion", "").strip() or "Bayram"
        budget = request.data.get("budget", "optimal")
        notes = request.data.get("notes", "").strip()
        lang = (request.query_params.get("lang") or request.data.get("lang") or "uz").lower()

        try:
            result = recommend_gift_package(
                recipient=recipient,
                occasion=occasion,
                budget=budget,
                notes=notes,
                lang=lang,
            )
            cache.set(user_key, usage_count + 1, timeout=3600)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            logger.warning(f"Gift advisor config error: {e}")
            msg = (
                "Сервис AI подарков временно не настроен."
                if lang == "ru"
                else "AI sovg‘a xizmati hozirda sozlanmagan."
            )
            return Response({"error": msg}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            logger.exception(f"Gift advisor error: {e}")
            msg = (
                "Не удалось подобрать подарок. Пожалуйста, попробуйте еще раз."
                if lang == "ru"
                else "Sovg‘a to‘plamini tanlashda xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring."
            )
            return Response({"error": msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIFabricAdvisorView(APIView):
    """
    POST /api/v1/catalog/ai-fabric-advisor/
    Accepts concern_type, preferences, season.
    Returns expert textile analysis and recommended bedding sets.
    """
    permission_classes = [AllowAny]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def post(self, request):
        allowed, user_key, usage_count = check_rate_limit(request, prefix="ai_fabric_limit", max_count=20)
        if not allowed:
            return Response(
                {"error": "Bir soatlik AI so‘rovlar limiti tugadi. Iltimos, birozdan so‘ng qayta urinib ko‘ring."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        concern_type = request.data.get("concern_type", "cooling_sweat")
        preferences = request.data.get("preferences", "").strip()
        season = request.data.get("season", "").strip()
        lang = (request.query_params.get("lang") or request.data.get("lang") or "uz").lower()

        try:
            result = recommend_fabric_and_sleep(
                concern_type=concern_type,
                preferences=preferences,
                season=season,
                lang=lang,
            )
            cache.set(user_key, usage_count + 1, timeout=3600)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            logger.warning(f"Fabric advisor config error: {e}")
            msg = (
                "Сервис AI консультанта по тканям временно не настроен."
                if lang == "ru"
                else "AI mato maslahatchisi hozirda sozlanmagan."
            )
            return Response({"error": msg}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            logger.exception(f"Fabric advisor error: {e}")
            msg = (
                "Не удалось подобрать ткань. Пожалуйста, попробуйте еще раз."
                if lang == "ru"
                else "Mato bo‘yicha maslahat olishda xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring."
            )
            return Response({"error": msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
