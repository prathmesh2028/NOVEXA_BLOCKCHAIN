"""KavachTrust Backend — SQLAlchemy database engine and session management."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session
from app.core.config import get_settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


def _build_engine():
    settings = get_settings()
    url = settings.database_url

    # SQLite requires special connect_args
    if url.startswith("sqlite"):
        # Convert async URL to sync for standard SQLAlchemy
        sync_url = url.replace("sqlite+aiosqlite", "sqlite")
        return create_engine(
            sync_url,
            connect_args={"check_same_thread": False},
            echo=settings.is_development,
        )
    else:
        return create_engine(url, echo=settings.is_development, pool_pre_ping=True)


engine = _build_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency: yields a database session and ensures cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
