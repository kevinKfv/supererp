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

@app.get("/health")
@app.get("/api/v1/identity/health")
async def health_check():
    return {"status": "ok", "service": "identity-service"}

@app.get("/")
@app.get("/api/v1/identity/")
async def root():
    return {"message": "Bienvenido a OptimusAI Identity Service"}
