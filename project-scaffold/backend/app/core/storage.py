"""
AnalyticaAI — Storage Factory
Abstracts file storage so the app works identically with
local filesystem (dev) and Supabase Storage (production).

Import from here everywhere — never call storage providers directly.

Usage:
    storage = get_storage()
    url = await storage.upload("datasets/file.csv", file_bytes)
    await storage.delete("datasets/file.csv")
    url = storage.get_url("datasets/file.csv")
"""

from abc import ABC, abstractmethod
from pathlib import Path
from functools import lru_cache
from app.core.config import settings


class StorageBackend(ABC):
    @abstractmethod
    async def upload(self, path: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        """Upload file and return public/signed URL."""

    @abstractmethod
    async def delete(self, path: str) -> None:
        """Delete file at path."""

    @abstractmethod
    def get_url(self, path: str) -> str:
        """Return URL for an existing file."""


# ------------------------------------------------------------------
# Local Filesystem (development / zero-cost)
# ------------------------------------------------------------------

class LocalStorage(StorageBackend):
    """
    Stores files on the local filesystem.
    Use for local development — no credentials needed.
    Set STORAGE_PROVIDER=local in .env
    """

    def __init__(self, base_path: str = "./storage"):
        self.base = Path(base_path)
        self.base.mkdir(parents=True, exist_ok=True)

    async def upload(self, path: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        full_path = self.base / path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_bytes(data)
        # Returns a relative path — the API serves files from /static/
        return f"/static/{path}"

    async def delete(self, path: str) -> None:
        full_path = self.base / path
        if full_path.exists():
            full_path.unlink()

    def get_url(self, path: str) -> str:
        return f"/static/{path}"


# ------------------------------------------------------------------
# Supabase Storage (production — 1GB free tier)
# ------------------------------------------------------------------

class SupabaseStorage(StorageBackend):
    """
    Stores files in Supabase Storage.
    Free tier: 1GB storage, 2GB bandwidth/month.
    Set STORAGE_PROVIDER=supabase in .env

    Setup:
      1. Go to https://supabase.com/dashboard
      2. Create a project (free)
      3. Go to Storage → Create bucket named 'analytica-ai' (public)
      4. Copy Project URL and service_role key to .env
    """

    def __init__(self):
        from supabase import create_client
        self.client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
        self.bucket = settings.SUPABASE_STORAGE_BUCKET

    async def upload(self, path: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        self.client.storage.from_(self.bucket).upload(
            path=path,
            file=data,
            file_options={"content-type": content_type, "upsert": "true"},
        )
        result = self.client.storage.from_(self.bucket).get_public_url(path)
        return result

    async def delete(self, path: str) -> None:
        self.client.storage.from_(self.bucket).remove([path])

    def get_url(self, path: str) -> str:
        return self.client.storage.from_(self.bucket).get_public_url(path)


# ------------------------------------------------------------------
# Factory
# ------------------------------------------------------------------

@lru_cache(maxsize=1)
def get_storage() -> StorageBackend:
    """
    Returns the configured storage backend.

    Development (default):
        STORAGE_PROVIDER=local  →  files stored in ./storage/

    Production (free):
        STORAGE_PROVIDER=supabase  →  files stored in Supabase Storage
    """
    provider = settings.STORAGE_PROVIDER.lower()

    if provider == "local":
        return LocalStorage(base_path=settings.LOCAL_STORAGE_PATH)
    elif provider == "supabase":
        return SupabaseStorage()
    else:
        raise ValueError(
            f"Unknown STORAGE_PROVIDER: '{provider}'. "
            "Valid options: 'local', 'supabase'"
        )
