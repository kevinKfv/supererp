from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import optimize

app = FastAPI(
    title="OptimusAI - Optimization Engine",
    description="Motor matemático para cálculos intensivos (MIP, CP, LP).",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(optimize.router, prefix="/api/v1/optimize", tags=["Optimization"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "optimization-engine"}
