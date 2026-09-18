from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import simulate

app = FastAPI(
    title="OptimusAI - Simulation Engine",
    description="Motor de Simulación para What-If Analysis y evaluación de riesgos mediante Monte Carlo.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulate.router, prefix="/api/v1/simulate", tags=["Simulation"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "simulation-engine"}
