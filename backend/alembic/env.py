from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys

# Add backend root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import Base
import app.models  # noqa: F401 — registers all models with Base

config = context.config

# Override sqlalchemy.url from settings (sync URL for migrations)
sync_url = (
    settings.DATABASE_URL
    .replace("postgresql+asyncpg://", "postgresql://")
    .replace("postgres://", "postgresql://")
)

# Strip ?sslmode from URL — we pass it explicitly via connect_args
if "sslmode" in sync_url:
    sync_url = sync_url.split("?")[0]

config.set_main_option("sqlalchemy.url", sync_url)

# Pass SSL explicitly for production (Neon/Supabase require it)
_is_prod = os.getenv("APP_ENV", "development") == "production"
_connect_args = {"sslmode": "require"} if _is_prod else {}

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"connect_args": _connect_args},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        connect_args=_connect_args,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
