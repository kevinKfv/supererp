from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users
from app.infrastructure.database import engine, Base
import logging

logger = logging.getLogger("identity")

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    logger.warning(f"Could not auto-create database tables on startup: {e}")

app = FastAPI(
    title="OptimusAI - Identity Service",
    description="Servicio para la gestión de usuarios, roles y autenticación.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gateway prefix /api/v1/identity/...
app.include_router(auth.router, prefix="/api/v1/identity")
app.include_router(users.router, prefix="/api/v1/identity")

# Also include directly at root for direct calls and testing
app.include_router(auth.router)
app.include_router(users.router)

@app.on_event("startup")
def startup_event():
    try:
        from app.infrastructure.database import SessionLocal
        from app.domain.models import User
        from app.infrastructure.security import get_password_hash
        
        db = SessionLocal()
        try:
            admin = db.query(User).filter(User.username == "admin_supererp").first()
            if not admin:
                logger.info("Inicializando usuario administrador predeterminado: admin_supererp...")
                admin_user = User(
                    username="admin_supererp",
                    email="admin@supererp.com",
                    hashed_password=get_password_hash("SuperSecretPassword123")
                )
                db.add(admin_user)
                db.commit()
                logger.info("Usuario admin_supererp creado correctamente.")
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"No se pudo autosembrar usuario admin: {e}")

@app.get("/health")
@app.get("/api/v1/identity/health")
async def health_check():
    return {"status": "ok", "service": "identity-service"}

@app.get("/")
@app.get("/api/v1/identity/")
async def root():
    return {"message": "Bienvenido a OptimusAI Identity Service"}

