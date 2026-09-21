import os
from django.core.management.base import BaseCommand
from orders.telegram_service import (
    TELEGRAM_BOT_TOKEN,
    get_webhook_info,
    send_telegram_request,
    set_webhook,
)


class Command(BaseCommand):
    help = "Configure Telegram Webhook for Velmora Bot on Railway"

    def add_arguments(self, parser):
        parser.add_argument(
            "--url",
            type=str,
            default="https://velmora-ecommerce-production.up.railway.app/api/v1/orders/telegram-webhook/",
            help="Full public HTTPS URL for Telegram webhook",
        )
        parser.add_argument(
            "--info",
            action="store_true",
            help="Show current webhook status from Telegram",
        )
        parser.add_argument(
            "--delete",
            action="store_true",
            help="Delete active webhook (switches bot to polling mode)",
        )

    def handle(self, *args, **options):
        token = os.getenv("TELEGRAM_BOT_TOKEN", TELEGRAM_BOT_TOKEN).strip()
        if not token:
            self.stderr.write(self.style.ERROR("TELEGRAM_BOT_TOKEN is missing!"))
            return

        if options["info"]:
            info = get_webhook_info()
            self.stdout.write(self.style.SUCCESS(f"Webhook Info: {info}"))
            return

        if options["delete"]:
            res = send_telegram_request("deleteWebhook", {"drop_pending_updates": False})
            self.stdout.write(self.style.WARNING(f"Webhook deleted: {res}"))
            return

        url = options["url"].strip()
        self.stdout.write(f"Setting webhook to: {url} ...")
        res = set_webhook(url)

        if res.get("ok"):
            self.stdout.write(self.style.SUCCESS(f"✅ Webhook muvaffaqiyatli o‘rnatildi!\nNatija: {res}"))
        else:
            self.stderr.write(self.style.ERROR(f"❌ Xatolik yuz berdi:\n{res}"))
