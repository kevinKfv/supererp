from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import evaluate

app = FastAPI(
    title="OptimusAI - Rules Engine",
    description="Motor de reglas dinámicas basadas en JSON.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(evaluate.router, prefix="/api/v1/rules/evaluate", tags=["Rules"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "rules-engine"}
