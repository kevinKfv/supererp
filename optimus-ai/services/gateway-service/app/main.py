import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from prometheus_fastapi_instrumentator import Instrumentator
import httpx

app = FastAPI(
    title="OptimusAI - API Gateway",
    description="Punto de entrada único para todos los servicios de OptimusAI. Autentica y enruta peticiones.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)

# Service mapping dictionary with Railway / Cloud environment variable support
SERVICES = {
    "identity": os.getenv("IDENTITY_SERVICE_URL", "http://identity-service:8000"),
    "optimize": os.getenv("OPTIMIZATION_ENGINE_URL", os.getenv("OPTIMIZATION_SERVICE_URL", "http://optimization-engine:8000")),
    "predict": os.getenv("PREDICTION_ENGINE_URL", os.getenv("PREDICTION_SERVICE_URL", "http://prediction-engine:8000")),
    "simulate": os.getenv("SIMULATION_ENGINE_URL", os.getenv("SIMULATION_SERVICE_URL", "http://simulation-engine:8000")),
    "rules": os.getenv("RULES_ENGINE_URL", os.getenv("RULES_SERVICE_URL", "http://rules-engine:8000")),
    "chat": os.getenv("KNOWLEDGE_ENGINE_URL", os.getenv("KNOWLEDGE_SERVICE_URL", "http://knowledge-engine:8000")),
}

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "gateway-service"}

@app.get("/")
async def root():
    return {"message": "OptimusAI API Gateway. Usa /docs para ver la documentación de la API."}

@app.api_route("/api/v1/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def gateway(request: Request, service: str, path: str):
    if service not in SERVICES:
        raise HTTPException(status_code=404, detail=f"Servicio '{service}' no encontrado en el gateway")

    base_url = SERVICES[service].rstrip("/")
    target_url = f"{base_url}/api/v1/{service}/{path}"
    
    # We create an async client per request here for simplicity. 
    # For production, a shared client pool is recommended.
    async with httpx.AsyncClient() as client:
        try:
            body = await request.body()
            response = await client.request(
                method=request.method,
                url=target_url,
                headers={k: v for k, v in request.headers.items() if k.lower() != 'host'},
                content=body,
                params=request.query_params
            )
            return JSONResponse(
                status_code=response.status_code,
                content=response.json() if response.content else None,
                headers={k: v for k, v in response.headers.items() if k.lower() not in ('content-length', 'content-encoding', 'transfer-encoding')}
            )
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Error conectando con el servicio {service}: {str(exc)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

