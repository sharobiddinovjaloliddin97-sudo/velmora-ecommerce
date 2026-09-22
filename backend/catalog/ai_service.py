import base64
import json
import logging
import urllib.parse
import urllib.request
from django.conf import settings
from catalog.models import Product

logger = logging.getLogger(__name__)


def get_catalog_context():
    """Builds a lightweight JSON context of active Velmora products for AI matching."""
    products = (
        Product.objects.filter(is_active=True)
        .prefetch_related("variants", "images")
        .select_related("category")
    )
    catalog_items = []
    for p in products:
        colors_uz = list({v.color_uz for v in p.variants.all() if v.color_uz})
        colors_ru = list({v.color_ru for v in p.variants.all() if v.color_ru})
        prices = [v.price for v in p.variants.all() if v.price > 0]
        min_price = int(min(prices)) if prices else 0

        catalog_items.append({
            "id": p.id,
            "slug": p.slug,
            "category": p.category.name_uz if p.category else "",
            "name_uz": p.name_uz,
            "name_ru": p.name_ru or p.name_uz,
            "fabric_uz": p.fabric_uz,
            "fabric_ru": p.fabric_ru,
            "colors_uz": colors_uz,
            "colors_ru": colors_ru,
            "price_som": min_price,
        })
    return catalog_items


def analyze_room_with_gemini(image_b64: str, mime_type: str, catalog_items: list) -> dict:
    """Calls Google Gemini Vision API to analyze room interior and pick matching products."""
    api_key = getattr(settings, "GEMINI_API_KEY", "") or ""
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")

    catalog_json_str = json.dumps(catalog_items, ensure_ascii=False)

    prompt = f"""
Sen "Velmora Uy Tekstili" premium brendining bosh interyer dizaynerisan.
Senga mijoz o'z yotoqxonasi yoki xonasining rasmini yuklamoqda.

Vazifang:
1. Rasmga qarab xonaning asosiy uslubini (modern, scandinavian, classic, minimalism, loft, boho va h.k.), yorug'lik darajasini va devor/pol/mebel ranglar palitrasini aniqla.
2. Quyida keltirilgan Velmora do'koni mahsulotlari katalogidan ushbu xonaga eng mukammal mos tushadigan 2 ta yoki 3 ta mahsulotni tanlab ber.
3. Har bir tanlangan mahsulot uchun nima sababdan xonaning ranglari va atmosferasiga mos kelishini professional, iliq va samimiy ohangda tushuntirib ber (ham o'zbek, ham rus tillarida).

Velmora Mahsulotlar Katalogi:
{catalog_json_str}

Javobni FAQAT quyidagi JSON formatida qaytar:
{{
  "room_style_uz": "Xona uslubi (o'zbekcha, masalan: Zamonaviy Skandinaviya minimalizmi)",
  "room_style_ru": "Стиль комнаты (на русском, например: Современный скандинавский минимализм)",
  "lighting_uz": "Yorug'lik darajasi (masalan: Mo'l tabiiy yorug'lik, iliq atmosfera)",
  "lighting_ru": "Уровень освещения (например: Много естественного света, теплая атмосфера)",
  "palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4"],
  "palette_names_uz": ["Rang nomi 1", "Rang nomi 2", "Rang nomi 3"],
  "palette_names_ru": ["Название цвета 1", "Название цвета 2", "Название цвета 3"],
  "designer_advice_uz": "Xona bo'yicha umumiy dizaynerlik maslahati (masalan: Xonadagi sokin pastel ohanglarni jonlantirish uchun kontrastli to'plam tavsiya etiladi)",
  "designer_advice_ru": "Общий совет дизайнера по интерьеру",
  "recommendations": [
    {{
      "product_id": 1,
      "recommended_color_uz": "Tavsiya qilingan rang",
      "recommended_color_ru": "Рекомендуемый цвет",
      "why_matched_uz": "Nima uchun ushbu to'plam xonaga ideal mos kelishi haqida izoh",
      "why_matched_ru": "Почему этот комплект идеально подходит к интерьеру"
    }}
  ]
}}
"""

    models_to_try = [
        "models/gemini-2.5-flash",
        "models/gemini-flash-latest",
        "models/gemini-3-flash-preview",
    ]

    last_error = None
    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={api_key}"
        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": image_b64
                        }
                    }
                ]
            }],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.4
            }
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=28) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                text = res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
                if text.startswith("```"):
                    parts = text.split("```")
                    if len(parts) >= 3:
                        inner = parts[1]
                        if inner.startswith("json"):
                            inner = inner[4:]
                        text = inner.strip()
                return json.loads(text)
        except Exception as e:
            logger.warning(f"Gemini model {model_name} failed: {e}")
            last_error = e

    raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")


def analyze_room_with_openai(image_b64: str, mime_type: str, catalog_items: list) -> dict:
    """Fallback using OpenAI GPT-4o-mini if configured."""
    api_key = getattr(settings, "OPENAI_API_KEY", "") or ""
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not configured.")

    catalog_json_str = json.dumps(catalog_items, ensure_ascii=False)
    data_url = f"data:{mime_type};base64,{image_b64}"

    prompt = f"""
Sen "Velmora Uy Tekstili" premium brendining bosh interyer dizaynerisan.
Mijoz yuklagan yotoqxona rasmini tahlil qilib, katalogdagi eng mos 2-3 ta to'plamni tanla.

Katalog:
{catalog_json_str}

Javobni FAQAT JSON formatida ber:
{{
  "room_style_uz": "...",
  "room_style_ru": "...",
  "lighting_uz": "...",
  "lighting_ru": "...",
  "palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4"],
  "palette_names_uz": ["..."],
  "palette_names_ru": ["..."],
  "designer_advice_uz": "...",
  "designer_advice_ru": "...",
  "recommendations": [
    {{
      "product_id": 1,
      "recommended_color_uz": "...",
      "recommended_color_ru": "...",
      "why_matched_uz": "...",
      "why_matched_ru": "..."
    }}
  ]
}}
"""

    payload = {
        "model": "gpt-4o-mini",
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": data_url, "detail": "low"}}
                ]
            }
        ],
        "max_tokens": 1200
    }

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        },
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=20) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        content = res_data["choices"][0]["message"]["content"]
        return json.loads(content)


def get_interior_recommendations(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Main entrypoint:
    Analyzes room image and returns enriched recommendations with real DB product data.
    """
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    catalog_items = get_catalog_context()

    ai_result = None
    last_error = None

    # Try Gemini first
    if getattr(settings, "GEMINI_API_KEY", ""):
        try:
            ai_result = analyze_room_with_gemini(image_b64, mime_type, catalog_items)
        except Exception as e:
            logger.error(f"Gemini vision error: {e}")
            last_error = e

    # Fallback to OpenAI if Gemini fails or is absent
    if not ai_result and getattr(settings, "OPENAI_API_KEY", ""):
        try:
            ai_result = analyze_room_with_openai(image_b64, mime_type, catalog_items)
        except Exception as e:
            logger.error(f"OpenAI vision error: {e}")
            last_error = e

    if not ai_result:
        if not getattr(settings, "GEMINI_API_KEY", "") and not getattr(settings, "OPENAI_API_KEY", ""):
            raise ValueError("GEMINI_API_KEY serverda sozlanmagan. Railway 'Variables' bo‘limiga GEMINI_API_KEY qo‘shilishi kerak.")
        raise RuntimeError(f"AI xizmatiga ulanib bo‘lmadi: {last_error}")

    # Enrich recommendations with full product records (images, slug, pricing)
    recommended_raw = ai_result.get("recommendations", [])
    rec_ids = [r.get("product_id") for r in recommended_raw if r.get("product_id")]

    products_map = {
        p.id: p for p in Product.objects.filter(id__in=rec_ids).prefetch_related("images", "variants")
    }

    enriched_recs = []
    for r in recommended_raw:
        pid = r.get("product_id")
        prod = products_map.get(pid)
        if not prod:
            continue

        primary_img = prod.images.filter(is_primary=True).first() or prod.images.first()
        img_url = primary_img.image.url if primary_img and primary_img.image else None

        prices = [v.price for v in prod.variants.all() if v.price > 0]
        min_price = int(min(prices)) if prices else 0

        enriched_recs.append({
            "product_id": prod.id,
            "name_uz": prod.name_uz,
            "name_ru": prod.name_ru or prod.name_uz,
            "slug": prod.slug,
            "price": min_price,
            "fabric_uz": prod.fabric_uz,
            "fabric_ru": prod.fabric_ru,
            "image": img_url,
            "recommended_color_uz": r.get("recommended_color_uz", ""),
            "recommended_color_ru": r.get("recommended_color_ru", ""),
            "why_matched_uz": r.get("why_matched_uz", ""),
            "why_matched_ru": r.get("why_matched_ru", ""),
        })

    ai_result["recommendations"] = enriched_recs
    return ai_result
