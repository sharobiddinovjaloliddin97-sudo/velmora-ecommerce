import json
import logging
import os
import urllib.parse
import urllib.request

logger = logging.getLogger(__name__)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8927343513:AAGAV5tv64PGG0ZiBHAeIHfOZS6BEzrf3oY")
TELEGRAM_BOT_USERNAME = os.getenv("TELEGRAM_BOT_USERNAME", "velmora_silkbot")
TELEGRAM_ADMIN_CHAT_ID = os.getenv("TELEGRAM_ADMIN_CHAT_ID", "")


def send_telegram_request(method: str, payload: dict) -> dict:
    """Send HTTP request to Telegram Bot API synchronously."""
    if not TELEGRAM_BOT_TOKEN:
        logger.warning("TELEGRAM_BOT_TOKEN not configured.")
        return {"ok": False, "description": "TELEGRAM_BOT_TOKEN missing"}

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/{method}"
    headers = {"Content-Type": "application/json"}
    data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode("utf-8")
            return json.loads(res_body)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        logger.error(f"Telegram API HTTPError [{e.code}]: {error_body}")
        try:
            return json.loads(error_body)
        except Exception:
            return {"ok": False, "description": error_body}
    except Exception as e:
        logger.error(f"Telegram API request failed: {e}")
        return {"ok": False, "description": str(e)}


def send_message(chat_id: str | int, text: str, reply_markup: dict = None, parse_mode: str = "HTML") -> dict:
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": False,
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    return send_telegram_request("sendMessage", payload)


def get_admin_order_keyboard(order_id: str, current_status: str = "NEW") -> dict:
    """Returns persistent inline keyboard for admin group with all actionable status options."""
    s = (current_status or "NEW").upper()
    return {
        "inline_keyboard": [
            [
                {
                    "text": f"{'🔘 ' if s == 'CONFIRMED' else ''}✅ Qabul qilish",
                    "callback_data": f"adm_st:CONFIRMED:{str(order_id)}"
                },
                {
                    "text": f"{'🔘 ' if s == 'SHIPPING' else ''}🚚 Kuryerga berish",
                    "callback_data": f"adm_st:SHIPPING:{str(order_id)}"
                },
            ],
            [
                {
                    "text": f"{'🔘 ' if s == 'DELIVERED' else ''}🎉 Yetkazildi",
                    "callback_data": f"adm_st:DELIVERED:{str(order_id)}"
                },
                {
                    "text": f"{'🔘 ' if s == 'CANCELLED' else ''}❌ Bekor qilish",
                    "callback_data": f"adm_st:CANCELLED:{str(order_id)}"
                },
            ]
        ]
    }


def send_order_to_admin_group(order) -> dict:
    """
    Sends full order alert to Admin Telegram Group.
    Falls back gracefully if TELEGRAM_ADMIN_CHAT_ID is not yet configured.
    """
    chat_id = os.getenv("TELEGRAM_ADMIN_CHAT_ID", "").strip()
    if not chat_id:
        logger.info("TELEGRAM_ADMIN_CHAT_ID not set. Skipping admin notification.")
        return {"ok": False, "description": "TELEGRAM_ADMIN_CHAT_ID not configured"}

    # Build address / location string
    if order.latitude and order.longitude:
        maps_link = f"https://maps.google.com/?q={order.latitude},{order.longitude}"
        location_line = f"📍 <b>Lokatsiya:</b> <a href=\"{maps_link}\">Google Xaritada ko‘rish</a>"
    elif order.street or order.district:
        location_line = f"📍 <b>Manzil:</b> {order.city}, {order.get_district_display() if hasattr(order, 'get_district_display') else order.district}, {order.street} {order.house}".strip()
    else:
        location_line = "📍 <b>Manzil:</b> Toshkent (kuryer orqali)"

    # Build items list
    items_lines = []
    for item in order.items.all():
        line = f"  • <b>{item.product_name}</b> ({item.size}, {item.color}) — {item.quantity} dona × {int(item.unit_price):,} so‘m".replace(",", " ")
        items_lines.append(line)
    items_text = "\n".join(items_lines) if items_lines else "  • Mahsulotlar mavjud emas"

    customer_info = f"👤 <b>Mijoz:</b> {order.recipient_name}"
    if order.telegram_username:
        customer_info += f" (@{order.telegram_username})"

    total_str = f"{int(order.total_amount):,}".replace(",", " ")

    message_text = (
        f"🔔 <b>YANGI BUYURTMA #{order.order_number}</b>\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"{customer_info}\n"
        f"📞 <b>Telefon:</b> <a href=\"tel:{order.phone}\">{order.phone}</a>\n"
        f"{location_line}\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"🛍 <b>Mahsulotlar:</b>\n"
        f"{items_text}\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"🚚 <b>Yetkazib berish:</b> Bepul (Toshkent)\n"
        f"💰 <b>Jami to‘lov:</b> <b>{total_str} so‘m</b> (Naqd / Click)\n"
    )

    return send_message(
        chat_id=chat_id,
        text=message_text,
        reply_markup=get_admin_order_keyboard(order.id, order.status or "NEW")
    )


def notify_user_status_changed(order, new_status: str):
    """Notify customer in Telegram bot when order status changes."""
    if not order.telegram_user_id:
        return

    status_labels = {
        "CONFIRMED": ("✅ Buyurtmangiz tasdiqlandi!", "Kuryerimiz buyurtmangizni yig‘ishni boshladi."),
        "SHIPPING": ("🚚 Buyurtmangiz yo‘lga chiqdi!", "Kuryerimiz tez orada siz bilan bog‘lanadi."),
        "DELIVERED": ("🎉 Buyurtmangiz yetkazildi!", "Velmora mahsulotlarini tanlaganingiz uchun tashakkur!"),
        "CANCELLED": ("❌ Buyurtmangiz bekor qilindi.", order.cancellation_reason or "Qo‘shimcha ma’lumot uchun operatorimiz bilan bog‘laning."),
    }

    title, desc = status_labels.get(new_status, ("Buyurtma holati yangilandi", ""))

    text = (
        f"<b>{title}</b>\n\n"
        f"📦 Buyurtma raqami: <code>{order.order_number}</code>\n"
        f"{desc}\n\n"
        f"Savollaringiz bo‘lsa: @velmoramahsulotlari yoki +998911652211 (asosiy), +998930791734 (qo‘shimcha)"
    )

    send_message(chat_id=order.telegram_user_id, text=text)


def set_webhook(webhook_url: str) -> dict:
    """Register webhook URL with Telegram Bot API."""
    return send_telegram_request("setWebhook", {
        "url": webhook_url,
        "allowed_updates": ["message", "callback_query"],
        "drop_pending_updates": False,
    })


def get_webhook_info() -> dict:
    """Get current webhook registration status."""
    return send_telegram_request("getWebhookInfo", {})


def send_session_confirmation(chat_id: int | str, session):
    """Sends confirmation summary with inline confirm/cancel buttons."""
    total_str = f"{int(session.total_amount):,}".replace(",", " ")
    address_display = session.address_text or "📍 GPS lokatsiya qabul qilindi"
    if session.latitude and session.longitude:
        address_display += " (Google Maps)"

    confirm_text = (
        f"📋 <b>Buyurtmani tasdiqlash:</b>\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"👤 <b>Qabul qiluvchi:</b> {session.recipient_name}\n"
        f"📞 <b>Telefon:</b> {session.phone}\n"
        f"📍 <b>Manzil:</b> {address_display}\n"
        f"🚚 <b>Yetkazib berish:</b> 0 so‘m (Bepul)\n"
        f"💰 <b>Jami to‘lov:</b> <b>{total_str} so‘m</b>\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"Barcha ma’lumotlar to‘g‘rimi?"
    )

    inline_kb = {
        "inline_keyboard": [
            [
                {"text": "✅ Buyurtmani tasdiqlash", "callback_data": "user_confirm_order"},
                {"text": "❌ Bekor qilish", "callback_data": "user_cancel_order"},
            ]
        ]
    }

    # Hide previous reply keyboard and send inline confirmation
    remove_kb = {"remove_keyboard": True}
    send_telegram_request("sendMessage", {
        "chat_id": chat_id,
        "text": "Ma'lumotlar saqlandi...",
        "reply_markup": remove_kb,
    })

    return send_message(chat_id=chat_id, text=confirm_text, reply_markup=inline_kb)


def create_order_from_session_sync(session):
    """Creates Order and OrderItem in a transaction from TelegramCheckoutSession."""
    import uuid
    from decimal import Decimal
    from django.db import transaction
    from catalog.models import ProductVariant
    from orders.models import Order, OrderItem, OrderStatusHistory

    with transaction.atomic():
        total_amount = Decimal("0.00")
        prepared_items = []

        for it in session.items_data:
            variant_id = it.get("variant_id")
            quantity = int(it.get("quantity", 1))

            variant = None
            if variant_id:
                variant = ProductVariant.objects.select_for_update().filter(id=variant_id).first()

            if variant:
                unit_price = variant.price
                line_total = unit_price * quantity
                total_amount += line_total
                prepared_items.append({
                    "variant": variant,
                    "product_name": variant.product.name_uz,
                    "sku": variant.sku,
                    "color": variant.color_uz,
                    "size": variant.size,
                    "unit_price": unit_price,
                    "quantity": quantity,
                    "line_total": line_total,
                })
            else:
                unit_price = Decimal(str(it.get("unit_price", 0)))
                line_total = unit_price * quantity
                total_amount += line_total
                prepared_items.append({
                    "variant": None,
                    "product_name": it.get("product_name", "Mahsulot"),
                    "sku": it.get("sku", "SKU"),
                    "color": it.get("color", "-"),
                    "size": it.get("size", "-"),
                    "unit_price": unit_price,
                    "quantity": quantity,
                    "line_total": line_total,
                })

        if total_amount == Decimal("0.00") and session.total_amount:
            total_amount = session.total_amount

        location_url = ""
        if session.latitude and session.longitude:
            location_url = f"https://maps.google.com/?q={session.latitude},{session.longitude}"

        target_user = session.user
        if not target_user and session.phone:
            from django.contrib.auth import get_user_model
            UserModel = get_user_model()
            clean_phone = session.phone.strip()
            digits = "".join(filter(str.isdigit, clean_phone))
            if len(digits) >= 9:
                target_user = UserModel.objects.filter(phone__icontains=digits[-9:]).first()

        order = Order.objects.create(
            user=target_user,
            recipient_name=session.recipient_name or "Telegram Mijoz",
            phone=session.phone or "-",
            city="Toshkent",
            district=Order.District.CHILONZOR,
            street=session.address_text or ("GPS lokatsiya orqali" if location_url else "Manzil ko'rsatilmagan"),
            house="",
            comment="Telegram bot orqali buyurtma",
            telegram_user_id=session.telegram_user_id,
            telegram_username=session.telegram_username,
            latitude=session.latitude,
            longitude=session.longitude,
            location_url=location_url,
            total_amount=total_amount,
            delivery_fee=Decimal("0.00"),
            idempotency_key=f"tg_{session.session_code}_{uuid.uuid4().hex[:8]}",
        )

        order_items = []
        for prep in prepared_items:
            order_items.append(
                OrderItem(
                    order=order,
                    variant=prep["variant"],
                    product_name=prep["product_name"],
                    sku=prep["sku"],
                    color=prep["color"],
                    size=prep["size"],
                    unit_price=prep["unit_price"],
                    quantity=prep["quantity"],
                    line_total=prep["line_total"],
                )
            )
            if prep["variant"]:
                prep["variant"].stock = max(0, prep["variant"].stock - prep["quantity"])
                prep["variant"].save(update_fields=["stock", "updated_at"])

        OrderItem.objects.bulk_create(order_items)

        OrderStatusHistory.objects.create(
            order=order,
            old_status="",
            new_status=Order.Status.NEW,
            changed_by=None,
        )

        session.is_completed = True
        session.step = "COMPLETED"
        session.save()

        return order


def handle_telegram_photo(chat_id: int | str, photo_file_id: str):
    """
    Downloads photo sent to Telegram bot, analyzes room style via AI,
    and replies with Velmora interior designer recommendations.
    """
    if not TELEGRAM_BOT_TOKEN:
        return

    # Send initial loading message
    loading_res = send_message(
        chat_id,
        "🎨 <i>AI xonangiz interyeri va ranglarini tahlil qilmoqda...\nIltimos, bir necha soniya kuting...</i>",
    )
    loading_msg_id = loading_res.get("result", {}).get("message_id") if isinstance(loading_res, dict) else None

    try:
        # 1. Fetch file metadata
        file_info = send_telegram_request("getFile", {"file_id": photo_file_id})
        file_path = file_info.get("result", {}).get("file_path")
        if not file_path:
            raise RuntimeError("Telegram faylini olib bo‘lmadi.")

        # 2. Download file bytes
        download_url = f"https://api.telegram.org/file/bot{TELEGRAM_BOT_TOKEN}/{file_path}"
        req = urllib.request.Request(download_url)
        with urllib.request.urlopen(req, timeout=25) as resp:
            photo_bytes = resp.read()

        # Determine MIME
        mime_type = "image/jpeg"
        if file_path.lower().endswith(".png"):
            mime_type = "image/png"
        elif file_path.lower().endswith(".webp"):
            mime_type = "image/webp"

        # 3. Call AI Service
        from catalog.ai_service import get_interior_recommendations
        result = get_interior_recommendations(photo_bytes, mime_type=mime_type)

        # 4. Format stylish designer response
        palette_list = result.get("palette", [])
        palette_str = " ".join([f"<code>{p}</code>" for p in palette_list]) if palette_list else "Iliq tabiiy ranglar"

        lines = [
            "✨ <b>Velmora AI Interyer Maslahatchisi</b>",
            "━━━━━━━━━━━━━━━━━━━",
            f"🏠 <b>Xona uslubi:</b> {result.get('room_style_uz', 'Zamonaviy')}",
            f"💡 <b>Yorug‘lik:</b> {result.get('lighting_uz', 'Iliq tabiiy yorug‘lik')}",
            f"🎨 <b>Ranglar palitrasi:</b> {palette_str}",
            "",
            f"💬 <b>Dizayner maslahati:</b>",
            f"<i>{result.get('designer_advice_uz', 'Ushbu xonaga yumshoq va uyg‘un to‘plamlar mos keladi.')}</i>",
            "",
            "━━━━━━━━━━━━━━━━━━━",
            "🛏 <b>Xonangizga eng mos Velmora to‘plamlari:</b>",
        ]

        recs = result.get("recommendations", [])[:3]
        if not recs:
            lines.append("\nKatalogimizdagi barcha to‘plamlar bilan saytimizda tanishishingiz mumkin.")
        else:
            for idx, rec in enumerate(recs, 1):
                price_fmt = f"{int(rec.get('price', 0)):,}".replace(",", " ")
                name = rec.get("name_uz", "Velmora to‘plami")
                color = rec.get("recommended_color_uz", "")
                why = rec.get("why_matched_uz", "")
                slug = rec.get("slug", "")
                link = f"https://velmora-ecommerce-chi.vercel.app/catalog/{slug}" if slug else "https://velmora-ecommerce-chi.vercel.app/catalog"

                lines.append(
                    f"\n<b>{idx}. {name}</b>\n"
                    f"   💰 Narxi: <b>{price_fmt} so‘m</b>\n"
                    + (f"   🎨 Mos rang: <i>{color}</i>\n" if color else "")
                    + (f"   💡 <i>{why}</i>\n" if why else "")
                    + f"   👉 <a href=\"{link}\">Saytda ko‘rish</a>"
                )

        lines.append("\n━━━━━━━━━━━━━━━━━━━\n🛍 Saytimiz orqali buyurtma berishingiz yoki to‘plam haqida batafsil ma’lumot olishingiz mumkin.")
        final_text = "\n".join(lines)

        reply_kb = {
            "inline_keyboard": [
                [
                    {"text": "🛍 Saytda to‘plamlarni ko‘rish", "url": "https://velmora-ecommerce-chi.vercel.app/catalog"},
                ],
                [
                    {"text": "💬 Dizayner bilan bog‘lanish", "url": "https://t.me/velmoramahsulotlari"},
                ]
            ]
        }

        if loading_msg_id:
            send_telegram_request("editMessageText", {
                "chat_id": chat_id,
                "message_id": loading_msg_id,
                "text": final_text,
                "parse_mode": "HTML",
                "reply_markup": reply_kb,
                "disable_web_page_preview": True,
            })
        else:
            send_message(chat_id, final_text, reply_markup=reply_kb)

    except Exception as e:
        logger.exception(f"Telegram photo AI analysis error: {e}")
        err_text = (
            "😔 Kechirasiz, xona rasmini tahlil qilishda xatolik yuz berdi.\n"
            "Iltimos, boshqa burchakdan olingan sifatliroq rasm yuborib ko‘ring yoki saytimizdagi AI maslahatchisidan foydalaning: "
            "<a href=\"https://velmora-ecommerce-chi.vercel.app\">velmora.uz</a>"
        )
        if loading_msg_id:
            send_telegram_request("editMessageText", {
                "chat_id": chat_id,
                "message_id": loading_msg_id,
                "text": err_text,
                "parse_mode": "HTML",
            })
        else:
            send_message(chat_id, err_text)


def send_gift_menu(chat_id: int | str):
    """Sends AI gift selection inline menu."""
    inline_kb = {
        "inline_keyboard": [
            [
                {"text": "🌹 Onajonim uchun", "callback_data": "gift_preset:Onamga:Tug‘ilgan kun"},
                {"text": "👰 Kelin sarposi / To‘y", "callback_data": "gift_preset:Kelin-kuyovga:To‘y sarposi"},
            ],
            [
                {"text": "🏡 Yangi uy (Novoselye)", "callback_data": "gift_preset:Yaqinimga:Yangi uy to‘yi"},
                {"text": "✨ Qadrdon do‘stimga", "callback_data": "gift_preset:Do‘stimga:Minnatdorchilik"},
            ]
        ]
    }
    text = (
        "🎁 <b>Velmora AI Sovg‘a Tanlovchi & Tabriknoma:</b>\n\n"
        "Kim uchun va qanday sabab bilan sovg‘a qidiryapsiz?\n"
        "Pastdagi variantlardan birini tanlang — AI to‘plamni tanlab, qutiga solish uchun <b>shaxsiy tabriknoma</b> yozib beradi: 👇"
    )
    return send_message(chat_id, text, reply_markup=inline_kb)


def send_fabric_menu(chat_id: int | str):
    """Sends AI fabric guide inline menu."""
    inline_kb = {
        "inline_keyboard": [
            [
                {"text": "❄️ Yozda salqin / Terlamaslik", "callback_data": "fabric_preset:cooling_sweat"},
                {"text": "🧸 Nozik teri & Allergiya", "callback_data": "fabric_preset:sensitive_skin"},
            ],
            [
                {"text": "☕ Qishki issiq shinamlik", "callback_data": "fabric_preset:winter_warmth"},
                {"text": "⚡ Dazmolsiz / G‘ijimlanmas", "callback_data": "fabric_preset:easy_care"},
            ],
            [
                {"text": "👶 Bolalar xonasi uchun", "callback_data": "fabric_preset:kids"},
            ]
        ]
    }
    text = (
        "🌿 <b>Velmora AI Mato & Uyqu Salomatligi Eksperti:</b>\n\n"
        "Siz uchun matoning qaysi xususiyati eng muhim?\n"
        "Tanlang — AI matoning ilmiy afzalliklarini tushuntirib, eng mos to‘plamlarni ko‘rsatadi: 👇"
    )
    return send_message(chat_id, text, reply_markup=inline_kb)


def process_webhook_update(update: dict):
    """Processes incoming Telegram updates via Webhook."""
    # 1. MESSAGE
    message = update.get("message")
    if message:
        chat_id = message["chat"]["id"]
        from_user = message.get("from", {})
        user_id = from_user.get("id")
        username = from_user.get("username", "")
        first_name = from_user.get("first_name", "")
        text = message.get("text", "")

        # Check Photo (AI Interior Recommender)
        photos = message.get("photo")
        if photos:
            best_photo = photos[-1]
            handle_telegram_photo(chat_id, best_photo.get("file_id"))
            return

        # Check /id or /setup command
        if text.startswith("/id") or text.startswith("/setup"):

            chat_type = "Guruh" if message["chat"]["type"] in ["group", "supergroup"] else "Shaxsiy chat"
            os.environ["TELEGRAM_ADMIN_CHAT_ID"] = str(chat_id)
            resp_text = (
                f"🆔 <b>Chat ma'lumotlari:</b>\n"
                f"Turi: {chat_type}\n"
                f"Nomi: {message['chat'].get('title') or first_name}\n"
                f"ID: <code>{chat_id}</code>\n\n"
                f"💡 Ushbu guruhga buyurtmalar tushishi uchun Railwayda <b>TELEGRAM_ADMIN_CHAT_ID={chat_id}</b> qilib saqlang."
            )
            send_message(chat_id, resp_text)
            return

        # Check /sovga and /mato commands
        if text.startswith("/sovga") or text.startswith("/gift"):
            send_gift_menu(chat_id)
            return

        if text.startswith("/mato") or text.startswith("/fabric"):
            send_fabric_menu(chat_id)
            return

        # Check /start cart_<code>
        if text.startswith("/start"):
            parts = text.split()
            if len(parts) > 1 and parts[1].startswith("cart_"):
                session_code = parts[1].replace("cart_", "")
                from orders.models import TelegramCheckoutSession
                session = TelegramCheckoutSession.objects.filter(session_code=session_code, is_completed=False).first()
                if not session:
                    send_message(
                        chat_id,
                        "⚠️ Kechirasiz, buyurtma sessiyasi muddati tugagan yoki topilmadi.\n"
                        "Saytimiz orqali savatni qayta yuboring."
                    )
                    return

                session.telegram_user_id = str(user_id)
                session.telegram_username = username
                session.step = "WAITING_PHONE"
                session.save(update_fields=["telegram_user_id", "telegram_username", "step", "updated_at"])

                items_lines = []
                for it in session.items_data:
                    name = it.get("product_name", "Mahsulot")
                    size = it.get("size", "")
                    color = it.get("color", "")
                    qty = it.get("quantity", 1)
                    price = int(float(it.get("unit_price", 0)))
                    items_lines.append(f"▫️ <b>{name}</b> ({size}, {color})\n    {qty} dona × {price:,} so‘m".replace(",", " "))

                items_str = "\n".join(items_lines) if items_lines else "▫️ Mahsulotlar"
                total_str = f"{int(session.total_amount):,}".replace(",", " ")

                welcome_text = (
                    f"🧺 <b>Sizning savatingiz — Velmora:</b>\n"
                    f"━━━━━━━━━━━━━━━━━━━\n"
                    f"{items_str}\n"
                    f"━━━━━━━━━━━━━━━━━━━\n"
                    f"🚚 <b>Yetkazib berish:</b> Bepul (Toshkent)\n"
                    f"💰 <b>Jami to‘lov:</b> <b>{total_str} so‘m</b>\n\n"
                    f"Buyurtmani rasmiylashtirish uchun pastdagi tugma orqali <b>telefon raqamingizni</b> yuboring: 👇"
                )
                contact_kb = {
                    "keyboard": [[{"text": "📱 Telefon raqamni yuborish", "request_contact": True}]],
                    "resize_keyboard": True,
                    "one_time_keyboard": True,
                }
                send_message(chat_id, welcome_text, reply_markup=contact_kb)
                return

            # General /start
            text_gen = (
                f"Assalomu alaykum, <b>{first_name}</b>!\n\n"
                f"<b>Velmora Uy Tekstili</b> rasmiy botiga xush kelibsiz! ✨\n\n"
                f"Biz tabiiy va premium matolardan tayyorlangan shinam choyshab to‘plamlari, yozgi va qishgi ko‘rpa to‘plamlari hamda matraslarni taqdim etamiz.\n\n"
                f"✨ <b>Velmora AI (3 in 1) imkoniyatlari:</b>\n"
                f"1. 📸 <b>AI Interyer Maslahatchisi:</b> Xonangiz rasmini yuboring, AI eng mos to‘plamlarni tanlaydi.\n"
                f"2. 🎁 <b>AI Sovg‘a Tanlovchi (/sovga):</b> Yaqinlaringiz uchun to‘plam va shaxsiy tabriknoma tayyorlaydi.\n"
                f"3. 🌿 <b>AI Mato Eksperti (/mato):</b> Salomatlik va qulaylik uchun mos matoni tavsiya etadi.\n\n"
                f"🌐 <b>Sayt:</b> <a href=\"https://velmora-ecommerce-chi.vercel.app\">velmora-ecommerce-chi.vercel.app</a>\n"
                f"📞 <b>Aloqa:</b> +998911652211 | +998930791734"
            )
            start_kb = {
                "inline_keyboard": [
                    [
                        {"text": "📸 AI Interyer Tahlili (Rasm)", "callback_data": "hint_send_photo"},
                    ],
                    [
                        {"text": "🎁 AI Sovg‘a & Tabriknoma", "callback_data": "open_gift_menu"},
                        {"text": "🌿 AI Mato & Uyqu Gidi", "callback_data": "open_fabric_menu"},
                    ],
                    [
                        {"text": "🛍 Saytda to‘plamlarni ko‘rish", "url": "https://velmora-ecommerce-chi.vercel.app/catalog"},
                    ],
                    [
                        {"text": "💬 Aloqa: @velmoramahsulotlari", "url": "https://t.me/velmoramahsulotlari"},
                    ]
                ]
            }
            send_message(chat_id, text_gen, reply_markup=start_kb)
            return


        # Contact received
        contact = message.get("contact")
        if contact:
            phone = contact.get("phone_number", "")
            if not phone.startswith("+"):
                phone = "+" + phone
            rec_name = f"{contact.get('first_name', '')} {contact.get('last_name', '')}".strip() or first_name

            from orders.models import TelegramCheckoutSession
            session = TelegramCheckoutSession.objects.filter(
                telegram_user_id=str(user_id),
                is_completed=False,
            ).order_by("-created_at").first()

            if not session:
                send_message(chat_id, "⚠️ Faol buyurtma sessiyasi topilmadi. Saytimiz orqali savatni qayta yuboring.")
                return

            session.phone = phone
            session.recipient_name = rec_name
            session.step = "WAITING_LOCATION"
            session.save(update_fields=["phone", "recipient_name", "step", "updated_at"])

            loc_kb = {
                "keyboard": [[{"text": "📍 Lokatsiyani yuborish (GPS)", "request_location": True}]],
                "resize_keyboard": True,
                "one_time_keyboard": True,
            }
            resp_text = (
                f"✅ <b>Telefon raqamingiz qabul qilindi:</b> {phone}\n\n"
                f"Endi kuryerimiz buyurtmangizni tez va aniq yetkazib berishi uchun pastdagi tugma orqali <b>lokatsiyangizni</b> yuboring: 👇\n\n"
                f"<i>(Yoki ko‘cha va uy raqamingizni matn ko‘rinishida yozib yuborishingiz mumkin)</i>"
            )
            send_message(chat_id, resp_text, reply_markup=loc_kb)
            return

        # Location received
        location = message.get("location")
        if location:
            lat = round(location["latitude"], 6)
            lon = round(location["longitude"], 6)

            from orders.models import TelegramCheckoutSession
            session = TelegramCheckoutSession.objects.filter(
                telegram_user_id=str(user_id),
                is_completed=False,
            ).order_by("-created_at").first()

            if not session:
                send_message(chat_id, "⚠️ Faol buyurtma topilmadi.")
                return

            session.latitude = lat
            session.longitude = lon
            session.step = "CONFIRMATION"
            session.save(update_fields=["latitude", "longitude", "step", "updated_at"])

            send_session_confirmation(chat_id, session)
            return

        # Text address
        if text and not text.startswith("/"):
            from orders.models import TelegramCheckoutSession
            session = TelegramCheckoutSession.objects.filter(
                telegram_user_id=str(user_id),
                is_completed=False,
            ).order_by("-created_at").first()

            if session and session.step in ["WAITING_LOCATION", "WAITING_PHONE"]:
                session.address_text = text.strip()
                session.step = "CONFIRMATION"
                session.save(update_fields=["address_text", "step", "updated_at"])
                send_session_confirmation(chat_id, session)
                return

    # 2. CALLBACK QUERY
    callback_query = update.get("callback_query")
    if callback_query:
        cb_id = callback_query["id"]
        data = callback_query.get("data", "")
        from_user = callback_query.get("from", {})
        user_id = from_user.get("id")
        cb_message = callback_query.get("message", {})
        chat_id = cb_message.get("chat", {}).get("id")
        msg_id = cb_message.get("message_id")

        send_telegram_request("answerCallbackQuery", {"callback_query_id": cb_id})

        # AI CALLBACKS
        if data == "hint_send_photo":
            send_message(
                chat_id,
                "📸 <b>Xonangiz yoki yotoqxonangiz rasmini ushbu chatga yuboring!</b>\n\n"
                "AI bir necha soniyada xonaning rangi, yorug‘ligi va uslubini tahlil qilib, eng uyg‘un Velmora to‘plamlarini tanlab beradi ✨"
            )
            return

        if data == "open_gift_menu":
            send_gift_menu(chat_id)
            return

        if data == "open_fabric_menu":
            send_fabric_menu(chat_id)
            return

        if data.startswith("gift_preset:"):
            parts = data.split(":")
            recipient = parts[1] if len(parts) > 1 else "Yaqinimga"
            occasion = parts[2] if len(parts) > 2 else "Bayram"
            loading_res = send_message(chat_id, "🎁 <i>AI eng mos sovg‘a to‘plami va samimiy tabriknoma tayyorlamoqda...</i>")
            loading_msg_id = loading_res.get("result", {}).get("message_id") if isinstance(loading_res, dict) else None
            try:
                from catalog.ai_service import recommend_gift_package
                res = recommend_gift_package(recipient=recipient, occasion=occasion)
                lines = [
                    f"🎁 <b>{res.get('gift_theme_uz', 'Velmora Sovg‘a To‘plami')}</b>",
                    "━━━━━━━━━━━━━━━━━━━",
                    f"💌 <b>Shaxsiy Tabriknoma (qutiga solish uchun):</b>\n<i>\"{res.get('greeting_card_uz', '')}\"</i>",
                    "",
                    f"🎀 <b>Dizayner maslahati:</b> <i>{res.get('packaging_advice_uz', '')}</i>",
                    "━━━━━━━━━━━━━━━━━━━",
                    "🛏 <b>Tavsiya etilgan to‘plamlar:</b>",
                ]
                for idx, it in enumerate(res.get("recommendations", [])[:2], 1):
                    price_fmt = f"{int(it.get('price', 0)):,}".replace(",", " ")
                    slug = it.get("slug", "")
                    link = f"https://velmora-ecommerce-chi.vercel.app/catalog/{slug}" if slug else "https://velmora-ecommerce-chi.vercel.app/catalog"
                    lines.append(
                        f"\n<b>{idx}. {it.get('name_uz')}</b> ({price_fmt} so‘m)\n"
                        f"   💡 <i>{it.get('why_matched_uz')}</i>\n"
                        f"   👉 <a href=\"{link}\">Saytda ko‘rish</a>"
                    )
                lines.append("\n🛒 Buyurtma berish uchun saytimizga o‘ting.")
                final_text = "\n".join(lines)
                if loading_msg_id:
                    send_telegram_request("editMessageText", {
                        "chat_id": chat_id,
                        "message_id": loading_msg_id,
                        "text": final_text,
                        "parse_mode": "HTML",
                        "disable_web_page_preview": True,
                    })
                else:
                    send_message(chat_id, final_text)
            except Exception as e:
                logger.exception(f"Gift recommendation error: {e}")
                err_text = "Kechirasiz, sovg‘a tanlashda xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring."
                if loading_msg_id:
                    send_telegram_request("editMessageText", {"chat_id": chat_id, "message_id": loading_msg_id, "text": err_text})
                else:
                    send_message(chat_id, err_text)
            return

        if data.startswith("fabric_preset:"):
            concern_type = data.replace("fabric_preset:", "")
            loading_res = send_message(chat_id, "🌿 <i>AI matolar laboratoriyasi tahlil qilmoqda...</i>")
            loading_msg_id = loading_res.get("result", {}).get("message_id") if isinstance(loading_res, dict) else None
            try:
                from catalog.ai_service import recommend_fabric_and_sleep
                res = recommend_fabric_and_sleep(concern_type=concern_type)
                lines = [
                    f"🌿 <b>Tavsiya etilgan mato: {res.get('fabric_title_uz', '100% Paxta')}</b>",
                    "━━━━━━━━━━━━━━━━━━━",
                    f"🔬 <b>Mato afzalligi:</b>\n<i>{res.get('fabric_science_uz', '')}</i>",
                    "",
                    f"🌙 <b>Sog‘lom uyqu qoidasi:</b> <i>{res.get('sleep_tip_uz', '')}</i>",
                    "━━━━━━━━━━━━━━━━━━━",
                    "🛏 <b>Ushbu matodan tikilgan sara to‘plamlar:</b>",
                ]
                for idx, it in enumerate(res.get("recommendations", [])[:2], 1):
                    price_fmt = f"{int(it.get('price', 0)):,}".replace(",", " ")
                    slug = it.get("slug", "")
                    link = f"https://velmora-ecommerce-chi.vercel.app/catalog/{slug}" if slug else "https://velmora-ecommerce-chi.vercel.app/catalog"
                    lines.append(
                        f"\n<b>{idx}. {it.get('name_uz')}</b> ({price_fmt} so‘m)\n"
                        f"   💡 <i>{it.get('why_matched_uz')}</i>\n"
                        f"   👉 <a href=\"{link}\">Saytda ko‘rish</a>"
                    )
                lines.append("\n🛒 Buyurtma berish uchun saytimizga o‘ting.")
                final_text = "\n".join(lines)
                if loading_msg_id:
                    send_telegram_request("editMessageText", {
                        "chat_id": chat_id,
                        "message_id": loading_msg_id,
                        "text": final_text,
                        "parse_mode": "HTML",
                        "disable_web_page_preview": True,
                    })
                else:
                    send_message(chat_id, final_text)
            except Exception as e:
                logger.exception(f"Fabric advice error: {e}")
                err_text = "Kechirasiz, mato tahlilida xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring."
                if loading_msg_id:
                    send_telegram_request("editMessageText", {"chat_id": chat_id, "message_id": loading_msg_id, "text": err_text})
                else:
                    send_message(chat_id, err_text)
            return

        if data == "user_confirm_order":
            from orders.models import TelegramCheckoutSession
            session = TelegramCheckoutSession.objects.filter(
                telegram_user_id=str(user_id),
                is_completed=False,
            ).order_by("-created_at").first()

            if not session:
                send_telegram_request("editMessageText", {
                    "chat_id": chat_id,
                    "message_id": msg_id,
                    "text": "⚠️ Buyurtma sessiyasi topilmadi yoki allaqachon tasdiqlangan.",
                })
                return

            order = create_order_from_session_sync(session)
            try:
                send_order_to_admin_group(order)
            except Exception as e:
                logger.error(f"Error notifying admin group: {e}")

            total_str = f"{int(order.total_amount):,}".replace(",", " ")
            thank_text = (
                f"🎉 <b>Buyurtmangiz muvaffaqiyatli qabul qilindi!</b>\n\n"
                f"📦 Buyurtma raqami: <code>{order.order_number}</code>\n"
                f"💰 To‘lov summasi: <b>{total_str} so‘m</b> (yetkazilganda to‘lanadi)\n\n"
                f"Tez orada kuryerimiz yoki operatorimiz siz bilan bog‘lanadi.\n"
                f"Velmorani tanlaganingiz uchun tashakkur! Shinamlik sizga hamroh bo‘lsin ✨"
            )
            send_telegram_request("editMessageText", {
                "chat_id": chat_id,
                "message_id": msg_id,
                "text": thank_text,
                "parse_mode": "HTML",
            })
            return

        if data == "user_cancel_order":
            from orders.models import TelegramCheckoutSession
            session = TelegramCheckoutSession.objects.filter(
                telegram_user_id=str(user_id),
                is_completed=False,
            ).order_by("-created_at").first()
            if session:
                session.is_completed = True
                session.step = "CANCELLED"
                session.save(update_fields=["is_completed", "step", "updated_at"])

            send_telegram_request("editMessageText", {
                "chat_id": chat_id,
                "message_id": msg_id,
                "text": "❌ Buyurtma bekor qilindi. Saytimiz orqali istalgan vaqtda qayta buyurtma berishingiz mumkin.",
            })
            return

        # ADMIN BUTTONS: adm_st:<STATUS>:<ORDER_ID>
        if data.startswith("adm_st:"):
            parts = data.split(":")
            if len(parts) == 3:
                _, new_status, order_id = parts
                from orders.models import Order, OrderStatusHistory
                order = Order.objects.filter(id=order_id).first()
                if order:
                    old_status = order.status
                    order.status = new_status
                    order.save(update_fields=["status", "updated_at"])
                    OrderStatusHistory.objects.create(
                        order=order,
                        old_status=old_status,
                        new_status=new_status,
                    )
                    try:
                        notify_user_status_changed(order, new_status)
                    except Exception as e:
                        logger.error(f"Error notifying user: {e}")

                    # Also create website notification if order has user
                    if order.user:
                        try:
                            from core.models import Notification
                            st_uz = {
                                "CONFIRMED": "Qabul qilindi",
                                "SHIPPING": "Yetkazilmoqda",
                                "DELIVERED": "Yetkazildi",
                                "CANCELLED": "Bekor qilindi",
                            }.get(new_status, new_status)
                            st_ru = {
                                "CONFIRMED": "Принят",
                                "SHIPPING": "В пути",
                                "DELIVERED": "Доставлен",
                                "CANCELLED": "Отменён",
                            }.get(new_status, new_status)
                            Notification.objects.create(
                                user=order.user,
                                notification_type=Notification.Type.CONTACT_REPLY,
                                title_uz=f"Buyurtma #{order.order_number}: {st_uz}",
                                title_ru=f"Заказ #{order.order_number}: {st_ru}",
                                message=f"Buyurtmangiz holati yangilandi: {st_uz}.",
                                link="/account",
                            )
                        except Exception as e:
                            logger.error(f"Error creating user notification: {e}")

                    status_text = {
                        "CONFIRMED": "✅ QABUL QILINDI",
                        "SHIPPING": "🚚 KURYERGA BERILDI",
                        "DELIVERED": "🎉 YETKAZILDI",
                        "CANCELLED": "❌ BEKOR QILINDI",
                    }.get(new_status, new_status)

                    admin_name = from_user.get("first_name") or from_user.get("username") or "Admin"
                    current_text = cb_message.get("text", "")

                    import re
                    # Remove any previous "Holat:" block so it doesn't keep accumulating
                    base_text = re.split(r"\n*━━━━━━━━━━━━━━━━━━━\n*🔄\s*Holat:", current_text)[0]
                    base_text = re.split(r"\n*🔄\s*Holat:", base_text)[0].strip()

                    new_caption = f"{base_text}\n\n━━━━━━━━━━━━━━━━━━━\n🔄 <b>Holat: {status_text}</b> (Admin: {admin_name})"

                    send_telegram_request("editMessageText", {
                        "chat_id": chat_id,
                        "message_id": msg_id,
                        "text": new_caption,
                        "parse_mode": "HTML",
                        "reply_markup": get_admin_order_keyboard(order.id, new_status),
                    })
