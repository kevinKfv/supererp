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

# Service mapping dictionary
SERVICES = {
    "identity": "http://identity-service:8000",
    "optimize": "http://optimization-engine:8000",
    "predict": "http://prediction-engine:8000",
    "simulate": "http://simulation-engine:8000",
    "rules": "http://rules-engine:8000",
    "chat": "http://knowledge-engine:8000",
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

    target_url = f"{SERVICES[service]}/api/v1/{service}/{path}"
    
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

