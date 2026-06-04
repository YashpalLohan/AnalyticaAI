"""
AnalyticaAI — LLM & Embeddings Factory
Centralized place to initialise Groq and embedding models.
Import from here everywhere — never instantiate LLMs directly in agents.
"""

from functools import lru_cache
from langchain_groq import ChatGroq
from langchain_core.embeddings import Embeddings
from app.core.config import settings


# ------------------------------------------------------------------
# Chat / LLM
# ------------------------------------------------------------------

@lru_cache(maxsize=1)
def get_llm(fast: bool = False) -> ChatGroq:
    """
    Returns a ChatGroq instance.

    Args:
        fast: If True, uses the faster lightweight model (llama-3.1-8b-instant).
              If False, uses the full-quality model (llama-3.3-70b-versatile).

    Usage:
        llm = get_llm()           # Full quality — agents, insights, reports
        llm_fast = get_llm(fast=True)  # Fast — intent detection, routing
    """
    model = settings.GROQ_MODEL_FAST if fast else settings.GROQ_MODEL
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=model,
        temperature=settings.GROQ_TEMPERATURE,
        max_tokens=settings.GROQ_MAX_TOKENS,
    )


# ------------------------------------------------------------------
# Embeddings
# Groq does not provide an embeddings API.
# We support two options:
#   - "ollama"     → nomic-embed-text running locally via Ollama (free, no key)
#   - "nomic_api"  → Nomic Atlas cloud API (requires NOMIC_API_KEY)
# ------------------------------------------------------------------

@lru_cache(maxsize=1)
def get_embeddings() -> Embeddings:
    """
    Returns the configured embeddings model.

    To use Ollama (recommended for dev):
        1. Install Ollama: https://ollama.ai
        2. Run: ollama pull nomic-embed-text
        3. Set EMBEDDING_PROVIDER=ollama in .env

    To use Nomic API (recommended for production):
        1. Get API key at: https://atlas.nomic.ai
        2. Set EMBEDDING_PROVIDER=nomic_api in .env
        3. Set NOMIC_API_KEY=your_key in .env
    """
    provider = settings.EMBEDDING_PROVIDER.lower()

    if provider == "ollama":
        from langchain_ollama import OllamaEmbeddings
        return OllamaEmbeddings(
            model=settings.EMBEDDING_MODEL,
            base_url=settings.OLLAMA_BASE_URL,
        )

    elif provider == "nomic_api":
        from langchain_nomic import NomicEmbeddings
        return NomicEmbeddings(
            model=settings.EMBEDDING_MODEL,
            nomic_api_key=settings.NOMIC_API_KEY,
        )

    else:
        raise ValueError(
            f"Unknown EMBEDDING_PROVIDER: '{provider}'. "
            "Valid options: 'ollama', 'nomic_api'"
        )
