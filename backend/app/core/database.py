"""
AnalyticaAI — Database Engine & Session
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Convert postgresql:// to postgresql+asyncpg:// for async support
DATABASE_URL = settings.DATABASE_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
).replace(
    "postgres://", "postgresql+asyncpg://"
)

engine = create_async_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    """Dependency — yields a DB session and closes it after use."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all tables on startup (dev only). Use Alembic in production."""
    async with engine.begin() as conn:
        from app.models import user        # noqa: F401
        from app.models import dataset     # noqa: F401
        from app.models import dataset_profile  # noqa: F401
        from app.models import dataset_column   # noqa: F401
        from app.models import chat_session     # noqa: F401
        from app.models import chat_message     # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
