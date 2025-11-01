"""Database configuration and session management."""

from typing import Generator

from sqlmodel import SQLModel, create_engine, Session
from settings import settings

# Create engine using settings
engine = create_engine(settings.DATABASE_URL, echo=True)


def init_db() -> None:
    """Initialize database tables."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependency for getting database session."""
    with Session(engine) as session:
        yield session
