from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import predict

app = FastAPI(
    title="OptimusAI - Prediction Engine",
    description="Motor de Machine Learning para proyecciones y predicciones.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="/api/v1/predict", tags=["Prediction"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "prediction-engine"}
