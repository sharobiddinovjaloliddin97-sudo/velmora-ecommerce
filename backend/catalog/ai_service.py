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


def enrich_product_recommendations(recommended_raw: list) -> list:
    """Enriches raw recommendation IDs with DB product records (slug, image, price, fabrics)."""
    rec_ids = [r.get("product_id") for r in recommended_raw if r.get("product_id")]
    products_map = {
        p.id: p for p in Product.objects.filter(id__in=rec_ids).prefetch_related("images", "variants")
    }

    enriched = []
    for r in recommended_raw:
        pid = r.get("product_id")
        prod = products_map.get(pid)
        if not prod:
            continue

        primary_img = prod.images.filter(is_primary=True).first() or prod.images.first()
        img_url = primary_img.image.url if primary_img and primary_img.image else None

        prices = [v.price for v in prod.variants.all() if v.price > 0]
        min_price = int(min(prices)) if prices else 0

        enriched.append({
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
    return enriched


def call_gemini_json(prompt: str, inline_data: dict = None, api_key: str = None) -> dict:
    """Robust caller for Google Gemini models with JSON mode and markdown fence cleanup."""
    key = api_key or getattr(settings, "GEMINI_API_KEY", "") or ""
    if not key:
        raise ValueError("GEMINI_API_KEY serverda sozlanmagan.")

    models_to_try = [
        "models/gemini-3-flash-preview",
        "models/gemini-3.5-flash",
        "models/gemini-3.1-flash-lite-preview",
    ]

    parts = [{"text": prompt}]
    if inline_data:
        parts.append({"inline_data": inline_data})

    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.4
        }
    }

    last_error = None
    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={key}"
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
                    parts_arr = text.split("```")
                    if len(parts_arr) >= 3:
                        inner = parts_arr[1]
                        if inner.startswith("json"):
                            inner = inner[4:]
                        text = inner.strip()
                return json.loads(text)
        except Exception as e:
            logger.warning(f"Gemini model {model_name} failed: {e}")
            last_error = e

    raise RuntimeError(f"Barcha Gemini modellari javob bermadi: {last_error}")


def analyze_room_with_gemini(image_b64: str, mime_type: str, catalog_items: list) -> dict:
    """Calls Google Gemini Vision API to analyze room interior and pick matching products."""
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
  "designer_advice_uz": "Xona bo'yicha umumiy dizaynerlik maslahati",
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
    return call_gemini_json(prompt, inline_data={"mime_type": mime_type, "data": image_b64})


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
    Mode 1: Analyzes room image and returns enriched recommendations with real DB product data.
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

    ai_result["recommendations"] = enrich_product_recommendations(ai_result.get("recommendations", []))
    return ai_result


def recommend_gift_package(recipient: str, occasion: str, budget: str = "optimal", notes: str = "", lang: str = "uz") -> dict:
    """
    Mode 2: Recommends gifts from catalog and generates a personalized, heartfelt greeting card
    suitable for printing and inserting into the Velmora gift box.
    """
    catalog_items = get_catalog_context()
    catalog_json_str = json.dumps(catalog_items, ensure_ascii=False)

    recipient_clean = recipient.strip() or "Yaqinimga"
    occasion_clean = occasion.strip() or "Bayram / To‘y"

    prompt = f"""
Sen "Velmora Uy Tekstili" premium brendining Bosh Sovg'a Konsyerji va Shaxsiy Tabriknomalar Ustasisan.
Mijoz o'z yaqini uchun ajoyib, unutilmas to'shak to'plami sovg'a qilmoqchi.

Ma'lumotlar:
- Kimga: {recipient_clean}
- Qanday sabab / voqea: {occasion_clean}
- Byudjet darajasi: {budget} (masalan: hamyonbop, optimal, shohona/premium)
- Qo'shimcha xohishlar: {notes or "Yo'q"}

Velmora Mahsulotlar Katalogi:
{catalog_json_str}

Vazifalaring:
1. Ushbu voqea va sovg'a oluvchi shaxs uchun katalogdan eng mos 2 ta yoki 3 ta to'plamni tanlab ber.
2. Eng muhimi: Sovg'a qutisining ichiga nafis zarhalli qog'ozda bosib chiqarib solinadigan, o'ta samimiy, mehrli, yodda qolarli Shaxsiy Tabriknoma (Greeting Card) matnini yaratib ber (ham o'zbek, ham rus tillarida). Tabriknoma yurakdan chiqqan, mehr va shinamlik tilaklari bilan to'la bo'lsin.
3. Sovg'ani bezash va taqdim etish bo'yicha qisqa dizaynerlik maslahatini ber (quti bezagi, lenta, xushbo'y hid).

Javobni FAQAT quyidagi JSON formatida qaytar:
{{
  "gift_theme_uz": "Sovg'a to'plami mavzusi (masalan: Onajonim uchun mehr va shinamlik tuhfasi)",
  "gift_theme_ru": "Тема подарка (например: Уют и забота для любимой мамы)",
  "greeting_card_uz": "Sovg'a qutisiga solinadigan to'liq, samimiy va chiroyli tabriknoma matni (she'riy yoki nasriy, mehrli tilaklar)",
  "greeting_card_ru": "Текст поздравительной открытки на русском языке",
  "packaging_advice_uz": "Sovg'ani chiroyli qadoqlash bo'yicha dizayner maslahati",
  "packaging_advice_ru": "Совет по оформлению и упаковке подарка",
  "recommendations": [
    {{
      "product_id": 1,
      "recommended_color_uz": "Tavsiya qilingan rang",
      "recommended_color_ru": "Рекомендуемый цвет",
      "why_matched_uz": "Nima sababdan ushbu to'plam ushbu sovg'aga ideal mos tushishi haqida izoh",
      "why_matched_ru": "Почему этот комплект идеально подходит для данного подарка"
    }}
  ]
}}
"""
    result = call_gemini_json(prompt)
    result["recommendations"] = enrich_product_recommendations(result.get("recommendations", []))
    return result


def recommend_fabric_and_sleep(concern_type: str, preferences: str = "", season: str = "", lang: str = "uz") -> dict:
    """
    Mode 3: Recommends products and explains textile science based on sleep comfort, skin sensitivity,
    seasonal warmth/cooling, and care preferences.
    """
    catalog_items = get_catalog_context()
    catalog_json_str = json.dumps(catalog_items, ensure_ascii=False)

    concern_labels = {
        "cooling_sweat": "Yozda salqinlik, tunda terlamaslik va nafas oluvchi tabiiy mato",
        "sensitive_skin": "Nozik teri, allergiya va 100% tabiiy gipoallergen matolar",
        "winter_warmth": "Qishki iliqlik, shinam zich to'qilgan issiq matolar",
        "easy_care": "Dazmol talab qilmaydigan, g'ijimlanmaydigan va chidamli mato",
        "kids": "Bolalar xonasi uchun yumshoq, xavfsiz va oson yuviladigan toza paxta matolari",
    }
    concern_text = concern_labels.get(concern_type, concern_type or "Sifatli va qulay uyqu")

    prompt = f"""
Sen "Velmora Uy Tekstili" premium brendining Bosh To'qimachilik Texnologi va Uyqu Salomatligi Ekspertisan.
Mijoz o'z uyqusi va sog'lig'i uchun to'g'ri mato tanlashda maslahat so'ramoqda.

Mijoz ehtiyoji / muammosi:
- Asosiy talab: {concern_text}
- Mavsum: {season or "Barcha fasllar"}
- Qo'shimcha xohish: {preferences or "Yo'q"}

Velmora Mahsulotlar Katalogi:
{catalog_json_str}

Vazifalaring:
1. Mijozning holatiga eng mos keladigan mato turini (masalan: 100% Paxta Satin, Ranfors, Jakard, Striptiz-satin yoki Poplin) ilmiy va sodda tushuntirib ber. Nima sababdan bu mato terlatmaydi/gipoallergen/dazmolsiz turadi?
2. Velmora katalogidan aynan shu matodan tikilgan eng sara 2-3 ta mahsulotni tanlab ber.
3. Sifatli va sog'lom uyqu bo'yicha ekspert tavsiyasini qo'shib ber.

Javobni FAQAT quyidagi JSON formatida qaytar:
{{
  "fabric_title_uz": "Tavsiya etilgan mato nomi (masalan: 100% Premium Paxta Satini)",
  "fabric_title_ru": "Рекомендуемая ткань (например: 100% Премиальный Хлопковый Сатин)",
  "fabric_science_uz": "Matoning to'qilishi, havo o'tkazishi va salomatlikka foydasi haqida professional tushuntirish",
  "fabric_science_ru": "Научное и понятное объяснение преимуществ ткани для сна и здоровья",
  "sleep_tip_uz": "Uyqu sifatini yaxshilash bo'yicha ekspert tavsiyasi",
  "sleep_tip_ru": "Совет эксперта по гигиене и качеству сна",
  "recommendations": [
    {{
      "product_id": 1,
      "recommended_color_uz": "Tavsiya etilgan rang",
      "recommended_color_ru": "Рекомендуемый цвет",
      "why_matched_uz": "Nima sababdan ushbu mato va to'plam mijoz ehtiyojiga ideal tushishi haqida izoh",
      "why_matched_ru": "Почему этот комплект идеально решает проблему клиента"
    }}
  ]
}}
"""
    result = call_gemini_json(prompt)
    result["recommendations"] = enrich_product_recommendations(result.get("recommendations", []))
    return result


def chat_with_velmora_ai(message: str, history: list = None, lang: str = "uz") -> dict:
    """
    Conversational AI Assistant for Velmora customers.
    Answers any questions about bedding sets, fabrics, sizes, delivery, prices,
    and returns relevant product recommendations and follow-up suggested questions.
    """
    catalog = get_catalog_context()
    catalog_json_str = json.dumps(catalog, ensure_ascii=False)

    history_lines = []
    if history and isinstance(history, list):
        for msg in history[-6:]:
            role = "Mijoz" if msg.get("role") in ["user", "mijoz"] else "Velmora AI"
            content = msg.get("content", "").strip()
            if content:
                history_lines.append(f"{role}: {content}")
    history_str = "\n".join(history_lines) if history_lines else "Suhbat yangi boshlandi."

    prompt = f"""
Sen "Velmora Uy Tekstili" rasmiy onlayn do'konining Shaxsiy Aqlli Maslahatchisi va Konsultantisan.
Sening vazifang — xaridor bilan nihoyatda xushmuomala, samimiy, premium va professional tarzda suhbatlashish, ularning savollariga aniq javob berish va zarurat tug'ilganda katalogimizdagi mos mahsulotlarni tavsiya qilish.

Velmora brendi haqida asosiy ma'lumotlar:
- Mahsulotlar: 100% tabiiy paxtadan tayyorlangan yuqori sifatli choyshab to'plamlari (Ranfors, Satin, Jakard), yozgi va qishgi yumshoq ko'rpa to'plamlari, ortopedik qulay matraslar va yostiq jildlari.
- Matolar sifati: 100% paxta, tana bilan bevosita nafas oluvchi, yozda salqin, terlatmaydigan, qishda esa iliq va shinam, gipoallergen (teri uchun xavfsiz), rangi o'chmaydi va yuvilganda siqilmaydi.
- O'lchamlar: 1.5 kishilik (150x215 sm), 2 kishilik (180x215 sm), Evro (200x220 sm), Oila to'plami (2 ta adyol jildli).
- Yetkazib berish: Toshkent shahri bo'ylab yetkazib berish BEPUL! Butun O'zbekiston viloyatlari bo'ylab tezkor yetkazib berish xizmati mavjud.
- To'lov: Xaridor mahsulotni eshik oldida tekshirib olgandan keyin naqd yoki karta (Uzcard/Humo/Click/Payme) orqali to'laydi.
- Aloqa: +998 91 165 22 11 (Asosiy), +998 93 079 17 34, Telegram: @velmoramahsulotlari.

Velmora Mahsulotlar Katalogi:
{catalog_json_str}

Oldingi suhbat tarixi:
{history_str}

Mijozning hozirgi xabari:
"{message}"

Ko'rsatmalar:
1. Mijozning savoliga samimiy, professional va lo'nda javob ber. Agar mijoz to'shak, rang, mato, sovg'a yoki narx haqida so'ragan bo'lsa, katalogdagi mahsulotlarni tahlil qil.
2. Agar mijozning savoliga mos keladigan mahsulotlar bo'lsa, "recommendations" ro'yxatida ularning "product_id" larini (1 tadan 3 tagacha) va nega mos ekanligini qaytar. Agar shunchaki umumiy savol bo'lsa (masalan, salomlashish yoki manzil haqida), "recommendations" bo'sh [] bo'lishi mumkin.
3. Mijoz suhbatni oson davom ettirishi uchun 2-3 ta qisqa va qiziqarli keyingi savollarni (suggested_questions) taklif qil.

Javobni FAQAT quyidagi JSON formatida qaytar:
{{
  "reply_uz": "Mijozga O'zbek tilidagi to'liq, samimiy va chiroyli javob matni",
  "reply_ru": "Полный, вежливый и подробный ответ клиенту на русском языке",
  "recommendations": [
    {{
      "product_id": 1,
      "why_matched_uz": "Nima sababdan ushbu mahsulot mos kelishi haqida qisqa tushuntirish",
      "why_matched_ru": "Краткое объяснение, почему этот комплект подходит клиенту"
    }}
  ],
  "suggested_questions_uz": [
    "Masalan: Ranfors va Satin farqi nima?",
    "Masalan: Toshkentga yetkazib berish qancha vaqt oladi?"
  ],
  "suggested_questions_ru": [
    "Например: В чем разница между сатином и ранфорсом?",
    "Например: Сколько времени занимает доставка?"
  ]
}}
"""
    result = call_gemini_json(prompt)
    result["recommendations"] = enrich_product_recommendations(result.get("recommendations", []))
    return result

