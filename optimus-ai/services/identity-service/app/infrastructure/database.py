import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger("identity.database")

# Si no hay DATABASE_URL o apunta al host docker por defecto inalcanzable, usar SQLite
if not raw_db_url or "postgres:5432" in raw_db_url:
    DATABASE_URL = "sqlite:////tmp/identity.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    if raw_db_url.startswith("postgres://"):
        raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)
    DATABASE_URL = raw_db_url
    try:
        connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
        engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)
        # Probar conexión real
        with engine.connect() as conn:
            pass
    except Exception as e:
        logger.warning(f"Could not connect to configured DB ({DATABASE_URL}), falling back to SQLite: {e}")
        DATABASE_URL = "sqlite:////tmp/identity.db"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
