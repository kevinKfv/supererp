from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="OptimusAI - Identity Service",
    description="Servicio para la gestión de usuarios, roles y autenticación.",
    version="1.0.0",
)

# Configuración básica de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "identity-service"}

@app.get("/")
async def root():
    return {"message": "Bienvenido a OptimusAI Identity Service"}
