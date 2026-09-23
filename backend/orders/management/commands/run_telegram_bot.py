import asyncio
import logging
import os
import uuid
from decimal import Decimal

from asgiref.sync import sync_to_async
from django.core.management.base import BaseCommand
from django.db import transaction
from telegram import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    Update,
)
from telegram.ext import (
    ApplicationBuilder,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

from catalog.models import ProductVariant
from orders.models import Order, OrderItem, OrderStatusHistory, TelegramCheckoutSession
from orders.telegram_service import (
    TELEGRAM_BOT_TOKEN,
    notify_user_status_changed,
    send_order_to_admin_group,
)

logger = logging.getLogger(__name__)


# ==========================================
# ASYNC DB HELPERS
# ==========================================

@sync_to_async
def get_checkout_session(session_code):
    return TelegramCheckoutSession.objects.filter(session_code=session_code, is_completed=False).first()


@sync_to_async
def get_latest_user_session(user_id):
    return TelegramCheckoutSession.objects.filter(
        telegram_user_id=str(user_id),
        is_completed=False,
    ).order_by("-created_at").first()


@sync_to_async
def update_session(session, **kwargs):
    for k, v in kwargs.items():
        setattr(session, k, v)
    session.save()
    return session


@sync_to_async
def complete_order_from_session(session):
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

        order = Order.objects.create(
            user=None,
            recipient_name=session.recipient_name or "Telegram Mijoz",
            phone=session.phone or "-",
            city="Toshkent",
            district=Order.District.CHILONZOR,
            street=session.address_text or ("GPS lokatsiya orqali" if location_url else "Manzil ko'rsatilmagan"),
            house="",
            comment=f"Telegram bot orqali buyurtma",
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


@sync_to_async
def change_order_status_db(order_id, new_status, reason=""):
    order = Order.objects.filter(id=order_id).first()
    if not order:
        return None
    old_status = order.status
    order.status = new_status
    if reason:
        order.cancellation_reason = reason
    order.save(update_fields=["status", "cancellation_reason", "updated_at"])
    OrderStatusHistory.objects.create(
        order=order,
        old_status=old_status,
        new_status=new_status,
    )
    return order


# ==========================================
# BOT HANDLERS
# ==========================================

async def start_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    args = context.args

    # Check if there is a session payload: e.g. /start cart_abc123
    if args and args[0].startswith("cart_"):
        session_code = args[0].replace("cart_", "")
        session = await get_checkout_session(session_code)

        if not session:
            await update.message.reply_text(
                "⚠️ Kechirasiz, buyurtma sessiyasi muddati tugagan yoki topilmadi.\n"
                "Iltimos, saytimiz orqali savatni qayta yuboring."
            )
            return

        # Link session to telegram user
        await update_session(
            session,
            telegram_user_id=str(user.id),
            telegram_username=user.username or "",
            step="WAITING_PHONE",
        )

        # Build cart items text
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

        contact_keyboard = ReplyKeyboardMarkup(
            [[KeyboardButton("📱 Telefon raqamni yuborish", request_contact=True)]],
            resize_keyboard=True,
            one_time_keyboard=True,
        )

        await update.message.reply_text(welcome_text, reply_markup=contact_keyboard, parse_mode="HTML")
        return

    # General /start
        f"✨ <b>Yangi: Velmora AI Hub (3 tasi 1 da)!</b>\n"
        f"1. 🎨 <b>Interyer tahlili:</b> Xonangiz rasmini yuboring — AI mos to‘plamni topadi.\n"
        f"2. 🎁 <b>Sovg‘a & Tabriknoma:</b> /sovga — To‘y yoki yaqinlarga sovg‘a va shaxsiy tabriknoma.\n"
        f"3. 🌿 <b>Mato & Uyqu:</b> /mato — Salomatlik va qulaylik uchun eng to‘g‘ri mato tanlash.\n\n"
        f"🛍 Mahsulotlar bilan tanishish va buyurtma berish uchun saytimizga o‘ting:\n"
        f"🌐 <b>Sayt:</b> <a href=\"https://velmora-ecommerce-chi.vercel.app\">velmora-ecommerce-chi.vercel.app</a>\n"
        f"📞 <b>Aloqa:</b> +998911652211"
    )
    start_kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("📸 Xonamga mosini topish (Rasm yuborish)", callback_data="hint_send_photo")],
        [InlineKeyboardButton("🎁 Sovg‘a tanlash & Tabriknoma", callback_data="open_gift_menu")],
        [InlineKeyboardButton("🌿 Mato & Uyqu maslahati", callback_data="open_fabric_menu")],
        [InlineKeyboardButton("🛍 Saytga o‘tish (velmora.uz)", url="https://velmora-ecommerce-chi.vercel.app/catalog")],
    ])
    await update.message.reply_text(text, reply_markup=start_kb, parse_mode="HTML")


async def id_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat = update.effective_chat
    chat_type = "Guruh" if chat.type in ["group", "supergroup"] else "Shaxsiy chat"
    
    # Auto-register this chat ID in memory / env if group
    if chat.type in ["group", "supergroup"]:
        os.environ["TELEGRAM_ADMIN_CHAT_ID"] = str(chat.id)

    text = (
        f"🆔 <b>Chat ma'lumotlari:</b>\n"
        f"Turi: {chat_type}\n"
        f"Nomi: {chat.title or chat.first_name}\n"
        f"ID: <code>{chat.id}</code>\n\n"
        f"💡 Ushbu guruhga buyurtmalar tushishi uchun <code>.env</code> faylida:\n"
        f"<code>TELEGRAM_ADMIN_CHAT_ID={chat.id}</code> deb yozing."
    )
    await update.message.reply_text(text, parse_mode="HTML")


async def contact_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    contact = update.message.contact

    session = await get_latest_user_session(user.id)
    if not session:
        await update.message.reply_text(
            "⚠️ Faol buyurtma sessiyasi topilmadi. Saytimiz orqali savatni qayta yuboring."
        )
        return

    phone = contact.phone_number
    if not phone.startswith("+"):
        phone = "+" + phone

    name = f"{contact.first_name or ''} {contact.last_name or ''}".strip() or user.first_name

    await update_session(
        session,
        phone=phone,
        recipient_name=name,
        step="WAITING_LOCATION",
    )

    location_keyboard = ReplyKeyboardMarkup(
        [
            [KeyboardButton("📍 Lokatsiyani yuborish (GPS)", request_location=True)],
        ],
        resize_keyboard=True,
        one_time_keyboard=True,
    )

    text = (
        f"✅ <b>Telefon raqamingiz qabul qilindi:</b> {phone}\n\n"
        f"Endi kuryerimiz buyurtmangizni tez va aniq yetkazib berishi uchun pastdagi tugma orqali <b>lokatsiyangizni</b> yuboring: 👇\n\n"
        f"<i>(Yoki ko‘cha va uy raqamingizni matn ko‘rinishida yozib yuborishingiz mumkin)</i>"
    )

    await update.message.reply_text(text, reply_markup=location_keyboard, parse_mode="HTML")


async def location_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    loc = update.message.location

    session = await get_latest_user_session(user.id)
    if not session:
        await update.message.reply_text("⚠️ Faol buyurtma topilmadi.")
        return

    await update_session(
        session,
        latitude=Decimal(str(round(loc.latitude, 6))),
        longitude=Decimal(str(round(loc.longitude, 6))),
        step="CONFIRMATION",
    )

    await send_confirmation_prompt(update, session)


async def text_address_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    text = update.message.text.strip()

    session = await get_latest_user_session(user.id)
    if not session or session.step not in ["WAITING_LOCATION", "WAITING_PHONE"]:
        loading_msg = await update.message.reply_text("💬 <i>Velmora AI maslahatchisi javob yozmoqda...</i>", parse_mode="HTML")
        try:
            from catalog.ai_service import chat_with_velmora_ai
            ai_data = await sync_to_async(chat_with_velmora_ai)(message=text, lang="uz")
            reply_text = ai_data.get("reply_uz", "")
            recs = ai_data.get("recommendations", [])
            lines = [reply_text]
            if recs:
                lines.append("\n━━━━━━━━━━━━━━━━━━━\n🛏 <b>Tavsiya etilgan to‘plamlar:</b>")
                for idx, r in enumerate(recs[:2], 1):
                    price_fmt = f"{int(r.get('price', 0)):,}".replace(",", " ")
                    slug = r.get("slug", "")
                    link = f"https://velmora-ecommerce-chi.vercel.app/catalog/{slug}" if slug else "https://velmora-ecommerce-chi.vercel.app/catalog"
                    lines.append(f"\n<b>{idx}. {r.get('name_uz')}</b> ({price_fmt} so‘m)\n   👉 <a href=\"{link}\">Saytda ko‘rish</a>")
            final_text = "\n".join(lines)
            await loading_msg.edit_text(final_text, parse_mode="HTML", disable_web_page_preview=True)
        except Exception as e:
            logger.exception(f"Telegram polling AI chat error: {e}")
            await loading_msg.edit_text("Kechirasiz, javob tayyorlashda xatolik yuz berdi. Iltimos, qaytadan yozib ko‘ring.")
        return

    await update_session(
        session,
        address_text=text,
        step="CONFIRMATION",
    )

    await send_confirmation_prompt(update, session)


async def send_confirmation_prompt(update: Update, session):
    total_str = f"{int(session.total_amount):,}".replace(",", " ")

    address_display = session.address_text or "📍 GPS lokatsiya qabul qilindi"
    if session.latitude and session.longitude:
        address_display += f" (Google Maps)"

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

    inline_kb = InlineKeyboardMarkup([
        [
            InlineKeyboardButton("✅ Buyurtmani tasdiqlash", callback_data="user_confirm_order"),
            InlineKeyboardButton("❌ Bekor qilish", callback_data="user_cancel_order"),
        ]
    ])

    await update.message.reply_text(
        confirm_text,
        reply_markup=inline_kb,
        parse_mode="HTML",
    )


async def photo_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handles room photo uploads in Telegram and generates AI interior recommendations."""
    if not update.message or not update.message.photo:
        return

    best_photo = update.message.photo[-1]
    loading_msg = await update.message.reply_text(
        "🎨 <i>AI xonangiz interyeri va ranglarini tahlil qilmoqda...\nIltimos, bir necha soniya kuting...</i>",
        parse_mode="HTML",
    )

    try:
        tg_file = await context.bot.get_file(best_photo.file_id)
        photo_bytes = await tg_file.download_as_bytearray()

        from catalog.ai_service import get_interior_recommendations
        result = await sync_to_async(get_interior_recommendations)(bytes(photo_bytes), mime_type="image/jpeg")

        palette_list = result.get("palette", [])
        palette_str = " ".join([f"<code>{p}</code>" for p in palette_list]) if palette_list else "Iliq tabiiy ranglar"

        lines = [
            "✨ <b>Velmora AI Interyer Maslahatchisi</b>",
            "━━━━━━━━━━━━━━━━━━━",
            f"🏠 <b>Xona uslubi:</b> {result.get('room_style_uz', 'Zamonaviy')}",
            f"💡 <b>Yorug‘lik:</b> {result.get('lighting_uz', 'Iliq tabiiy yorug‘lik')}",
            f"🎨 <b>Ranglar palitrasi:</b> {palette_str}",
            "",
            f"💬 <b>Dizayner xulosasi:</b>",
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

        reply_kb = InlineKeyboardMarkup([
            [
                InlineKeyboardButton("🛍 Saytda to‘plamlarni ko‘rish", url="https://velmora-ecommerce-chi.vercel.app/catalog"),
            ],
            [
                InlineKeyboardButton("💬 Dizayner bilan bog‘lanish", url="https://t.me/velmoramahsulotlari"),
            ]
        ])

        await loading_msg.edit_text(
            final_text,
            parse_mode="HTML",
            reply_markup=reply_kb,
            disable_web_page_preview=True,
        )
    except Exception as e:
        logger.exception(f"Bot photo analysis error: {e}")
        err_text = (
            "😔 Kechirasiz, xona rasmini tahlil qilishda xatolik yuz berdi.\n"
            "Iltimos, boshqa burchakdan olingan sifatliroq rasm yuborib ko‘ring yoki saytimizdagi AI maslahatchisidan foydalaning: "
            "<a href=\"https://velmora-ecommerce-chi.vercel.app\">velmora.uz</a>"
        )
        await loading_msg.edit_text(err_text, parse_mode="HTML")


async def sovga_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    kb = InlineKeyboardMarkup([
        [
            InlineKeyboardButton("🌹 Onajonim uchun", callback_data="gift_preset:Onamga:Tug‘ilgan kun"),
            InlineKeyboardButton("👰 Kelin sarposi / To‘y", callback_data="gift_preset:Kelin-kuyovga:To‘y sarposi"),
        ],
        [
            InlineKeyboardButton("🏡 Yangi uy (Novoselye)", callback_data="gift_preset:Yaqinimga:Yangi uy to‘yi"),
            InlineKeyboardButton("✨ Qadrdon do‘stimga", callback_data="gift_preset:Do‘stimga:Minnatdorchilik"),
        ]
    ])
    text = (
        "🎁 <b>Velmora AI Sovg‘a Tanlovchi & Tabriknoma:</b>\n\n"
        "Kim uchun va qanday sabab bilan sovg‘a qidiryapsiz?\n"
        "Pastdagi variantlardan birini tanlang — AI to‘plamni tanlab, qutiga solish uchun <b>shaxsiy tabriknoma</b> yozib beradi: 👇"
    )
    if update.message:
        await update.message.reply_text(text, reply_markup=kb, parse_mode="HTML")
    elif update.callback_query:
        await update.callback_query.message.reply_text(text, reply_markup=kb, parse_mode="HTML")


async def mato_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    kb = InlineKeyboardMarkup([
        [
            InlineKeyboardButton("❄️ Yozda salqin / Terlamaslik", callback_data="fabric_preset:cooling_sweat"),
            InlineKeyboardButton("🧸 Nozik teri & Allergiya", callback_data="fabric_preset:sensitive_skin"),
        ],
        [
            InlineKeyboardButton("☕ Qishki issiq shinamlik", callback_data="fabric_preset:winter_warmth"),
            InlineKeyboardButton("⚡ Dazmolsiz / G‘ijimlanmas", callback_data="fabric_preset:easy_care"),
        ],
        [
            InlineKeyboardButton("👶 Bolalar xonasi uchun", callback_data="fabric_preset:kids"),
        ]
    ])
    text = (
        "🌿 <b>Velmora AI Mato & Uyqu Salomatligi Eksperti:</b>\n\n"
        "Siz uchun matoning qaysi xususiyati eng muhim?\n"
        "Tanlang — AI matoning ilmiy afzalliklarini tushuntirib, eng mos to‘plamlarni ko‘rsatadi: 👇"
    )
    if update.message:
        await update.message.reply_text(text, reply_markup=kb, parse_mode="HTML")
    elif update.callback_query:
        await update.callback_query.message.reply_text(text, reply_markup=kb, parse_mode="HTML")


def build_ptb_admin_keyboard(order_id, current_status):
    s = (current_status or "NEW").upper()
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton(f"{'🔘 ' if s == 'CONFIRMED' else ''}✅ Qabul qilish", callback_data=f"adm_st:CONFIRMED:{str(order_id)}"),
            InlineKeyboardButton(f"{'🔘 ' if s == 'SHIPPING' else ''}🚚 Kuryerga berish", callback_data=f"adm_st:SHIPPING:{str(order_id)}"),
        ],
        [
            InlineKeyboardButton(f"{'🔘 ' if s == 'DELIVERED' else ''}🎉 Yetkazildi", callback_data=f"adm_st:DELIVERED:{str(order_id)}"),
            InlineKeyboardButton(f"{'🔘 ' if s == 'CANCELLED' else ''}❌ Bekor qilish", callback_data=f"adm_st:CANCELLED:{str(order_id)}"),
        ],
    ])


async def callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    data = query.data
    user = update.effective_user

    # AI CALLBACKS
    if data == "hint_send_photo":
        await query.message.reply_text(
            "📸 <b>Xonangiz yoki yotoqxonangiz rasmini ushbu chatga yuboring!</b>\n\n"
            "AI bir necha soniyada xonaning rangi, yorug‘ligi va uslubini tahlil qilib, eng uyg‘un Velmora to‘plamlarini tanlab beradi ✨",
            parse_mode="HTML",
        )
        return

    if data == "open_gift_menu":
        await sovga_command(update, context)
        return

    if data == "open_fabric_menu":
        await mato_command(update, context)
        return

    if data.startswith("gift_preset:"):
        parts = data.split(":")
        recipient = parts[1] if len(parts) > 1 else "Yaqinimga"
        occasion = parts[2] if len(parts) > 2 else "Bayram"

        loading_msg = await query.message.reply_text("🎁 <i>AI eng mos sovg‘a to‘plami va samimiy tabriknoma tayyorlamoqda...</i>", parse_mode="HTML")
        try:
            from catalog.ai_service import recommend_gift_package
            res = await sync_to_async(recommend_gift_package)(recipient=recipient, occasion=occasion)
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
            await loading_msg.edit_text("\n".join(lines), parse_mode="HTML", disable_web_page_preview=True)
        except Exception as e:
            logger.exception(f"Gift recommendation error: {e}")
            await loading_msg.edit_text("Kechirasiz, sovg‘a tanlashda xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.")
        return

    if data.startswith("fabric_preset:"):
        concern_type = data.replace("fabric_preset:", "")
        loading_msg = await query.message.reply_text("🌿 <i>AI matolar laboratoriyasi tahlil qilmoqda...</i>", parse_mode="HTML")
        try:
            from catalog.ai_service import recommend_fabric_and_sleep
            res = await sync_to_async(recommend_fabric_and_sleep)(concern_type=concern_type)
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
            await loading_msg.edit_text("\n".join(lines), parse_mode="HTML", disable_web_page_preview=True)
        except Exception as e:
            logger.exception(f"Fabric advice error: {e}")
            await loading_msg.edit_text("Kechirasiz, mato tahlilida xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.")
        return

    # USER CONFIRM
    if data == "user_confirm_order":
        session = await get_latest_user_session(user.id)
        if not session:
            await query.edit_message_text("⚠️ Buyurtma sessiyasi topilmadi yoki allaqachon yaratilgan.")
            return

        order = await complete_order_from_session(session)

        # Notify admin group
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
        await query.edit_message_text(thank_text, parse_mode="HTML")
        return

    # USER CANCEL
    if data == "user_cancel_order":
        session = await get_latest_user_session(user.id)
        if session:
            await update_session(session, is_completed=True, step="CANCELLED")
        await query.edit_message_text("❌ Buyurtma bekor qilindi. Saytimiz orqali istalgan vaqtda qayta buyurtma berishingiz mumkin.")
        return

    # ADMIN BUTTONS: adm_st:<STATUS>:<ORDER_ID>
    if data.startswith("adm_st:"):
        parts = data.split(":")
        if len(parts) == 3:
            _, new_status, order_id = parts
            order = await change_order_status_db(order_id, new_status)
            if not order:
                await query.answer("Buyurtma topilmadi!", show_alert=True)
                return

            status_text = {
                "CONFIRMED": "✅ QABUL QILINDI",
                "SHIPPING": "🚚 KURYERGA BERILDI",
                "DELIVERED": "🎉 YETKAZILDI",
                "CANCELLED": "❌ BEKOR QILINDI",
            }.get(new_status, new_status)

            admin_name = user.first_name or user.username or "Admin"
            
            # Send user update via bot
            try:
                notify_user_status_changed(order, new_status)
            except Exception as e:
                logger.error(f"Error notifying user: {e}")

            import re
            current_text = query.message.text or ""
            base_text = re.split(r"\n*━━━━━━━━━━━━━━━━━━━\n*🔄\s*Holat:", current_text)[0]
            base_text = re.split(r"\n*🔄\s*Holat:", base_text)[0].strip()

            new_caption = f"{base_text}\n\n━━━━━━━━━━━━━━━━━━━\n🔄 <b>Holat: {status_text}</b> (Admin: {admin_name})"
            try:
                await query.edit_message_text(
                    new_caption,
                    parse_mode="HTML",
                    reply_markup=build_ptb_admin_keyboard(order.id, new_status),
                )
            except Exception as e:
                logger.error(f"Error editing message: {e}")

            await query.answer(f"Buyurtma holati: {status_text} ga o‘zgartirildi!")


# ==========================================
# COMMAND RUNNER
# ==========================================

class Command(BaseCommand):
    help = "Run the Velmora Telegram Bot listener"

    def handle(self, *args, **options):
        token = os.getenv("TELEGRAM_BOT_TOKEN", TELEGRAM_BOT_TOKEN).strip()
        if not token:
            self.stderr.write(self.style.ERROR("TELEGRAM_BOT_TOKEN is not set in environment or .env!"))
            return

        self.stdout.write(self.style.SUCCESS(f"Starting Velmora Telegram Bot (@velmora_silkbot)..."))

        application = ApplicationBuilder().token(token).build()

        application.add_handler(CommandHandler("start", start_handler))
        application.add_handler(CommandHandler("id", id_handler))
        application.add_handler(CommandHandler("setup", id_handler))
        application.add_handler(CommandHandler("sovga", sovga_command))
        application.add_handler(CommandHandler("mato", mato_command))

        application.add_handler(MessageHandler(filters.CONTACT, contact_handler))
        application.add_handler(MessageHandler(filters.LOCATION, location_handler))
        application.add_handler(MessageHandler(filters.PHOTO, photo_handler))
        application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_address_handler))

        application.add_handler(CallbackQueryHandler(callback_handler))

        self.stdout.write(self.style.SUCCESS("Bot is listening for updates. Press Ctrl+C to stop."))
        application.run_polling()
