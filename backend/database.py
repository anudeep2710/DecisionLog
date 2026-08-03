from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os


def normalize_database_url(database_url: str) -> str:
    """Normalize provider URLs to a SQLAlchemy URL understood by psycopg2."""
    if database_url.startswith("postgres://"):
        return "postgresql+psycopg2://" + database_url[len("postgres://"):]
    if database_url.startswith("postgresql://"):
        return "postgresql+psycopg2://" + database_url[len("postgresql://"):]
    return database_url


# PostgreSQL is used in production. SQLite remains available for local setup
# when DATABASE_URL is not provided.
SQLALCHEMY_DATABASE_URL = normalize_database_url(
    os.getenv("DATABASE_URL", "sqlite:///./decisionlog.db")
)

# Keep the application pool small because Neon compute may scale to zero.
engine_kwargs = {"pool_pre_ping": True}
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    engine_kwargs.update(
        pool_recycle=int(os.getenv("DB_POOL_RECYCLE_SECONDS", "300")),
        pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
        max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "5")),
    )

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs,
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
