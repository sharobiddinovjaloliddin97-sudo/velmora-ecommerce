import requests

from django.conf import settings


BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email"


def send_brevo_email(
    *,
    to_email,
    subject,
    text_content,
):
    if not settings.BREVO_API_KEY:
        raise RuntimeError("BREVO_API_KEY is not configured.")

    response = requests.post(
        BREVO_EMAIL_URL,
        headers={
            "accept": "application/json",
            "api-key": settings.BREVO_API_KEY,
            "content-type": "application/json",
        },
        json={
            "sender": {
                "name": settings.BREVO_SENDER_NAME,
                "email": settings.BREVO_SENDER_EMAIL,
            },
            "to": [
                {
                    "email": to_email,
                }
            ],
            "subject": subject,
            "textContent": text_content,
        },
        timeout=15,
    )

    response.raise_for_status()

    return response.json()