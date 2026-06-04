"""
AnalyticaAI — Application Configuration
Loads and validates all environment variables.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):

    # Application
    APP_NAME: str = "AnalyticaAI"
    APP_ENV: str = "development"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 10

    # Redis
    REDIS_URL: str
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Groq — LLM inference
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"   # 128k context, best quality
    GROQ_MODEL_FAST: str = "llama-3.1-8b-instant"  # For low-latency tasks
    GROQ_MAX_TOKENS: int = 4096
    GROQ_TEMPERATURE: float = 0.2

    # Embeddings — Nomic (Groq has no embedding support)
    # Set EMBEDDING_PROVIDER=ollama for local, or nomic_api for cloud
    EMBEDDING_PROVIDER: str = "ollama"             # ollama | nomic_api
    EMBEDDING_MODEL: str = "nomic-embed-text"
    NOMIC_API_KEY: str = ""                        # Only needed for nomic_api provider
    OLLAMA_BASE_URL: str = "http://localhost:11434" # Only needed for ollama provider

    # ChromaDB
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8001
    CHROMA_PERSIST_PATH: str = "./chroma_db"

    # Storage — Supabase Storage (free tier: 1GB)
    STORAGE_PROVIDER: str = "local"            # local | supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = "analytica-ai"

    # Storage
    LOCAL_STORAGE_PATH: str = "./storage"
    MAX_UPLOAD_SIZE_MB: int = 100

    # Security
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    RATE_LIMIT_PER_MINUTE: int = 100
    BCRYPT_ROUNDS: int = 12

    # Feature Flags
    ENABLE_AUTOML: bool = False
    ENABLE_FORECASTING: bool = False
    ENABLE_ANOMALY_DETECTION: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
