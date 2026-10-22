import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger("identity.database")

raw_db_url = os.getenv(
    "DATABASE_URL",
    "postgresql://optimus:optimus_password@postgres:5432/optimus_identity"
)
# Normalizar prefijo para SQLAlchemy (Railway provee postgres:// por defecto)
if raw_db_url and raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

DATABASE_URL = raw_db_url

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
except Exception as e:
    logger.warning(f"Could not connect to PostgreSQL, falling back to SQLite in-memory: {e}")
    DATABASE_URL = "sqlite:///:memory:"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
