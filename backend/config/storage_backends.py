from urllib.parse import quote

from django.conf import settings
from storages.backends.s3 import S3Storage


class SupabaseMediaStorage(S3Storage):
    def url(
        self,
        name,
        parameters=None,
        expire=None,
        http_method=None,
    ):
        name = name.lstrip("/")

        return (
            f"{settings.SUPABASE_PUBLIC_MEDIA_URL.rstrip('/')}/"
            f"{quote(name, safe='/')}"
        )