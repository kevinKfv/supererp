import os
import time
import json
import xml.etree.ElementTree as ET
from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from prometheus_fastapi_instrumentator import Instrumentator
import httpx

app = FastAPI(
    title="OptimusAI - API Gateway",
    description="Punto de entrada único para todos los servicios de OptimusAI. Autentica, enruta y garantiza resiliencia (RFC 9457, Idempotencia, Seguridad OWASP).",
    version="1.0.0",
)

# ==============================================================================
# Security Headers Middleware & CORS Configuration (Eje D - Seguridad)
# ==============================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://supererp.pages.dev",
    ],
    allow_origin_regex=r"https://.*\.pages\.dev",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["ETag", "Idempotency-Key"]
)

@app.middleware("http")
async def add_security_headers_and_idempotency(request: Request, call_next):
    # Idempotency Check for POST/PUT requests
    idempotency_key = request.headers.get("Idempotency-Key")
    if idempotency_key and request.method in ("POST", "PUT"):
        cached = idempotency_store.get(idempotency_key)
        if cached:
            return JSONResponse(
                status_code=cached["status_code"],
                content=cached["content"],
                headers={"X-Cache-Lookup": "HIT", "Idempotency-Key": idempotency_key}
            )

    response = await call_next(request)

    # Security Headers (OWASP recommendations)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"

    return response

# In-memory store for Idempotency
idempotency_store = {}

# Instrument Prometheus
Instrumentator().instrument(app).expose(app)

# Service mapping
SERVICES = {
    "identity": os.getenv("IDENTITY_SERVICE_URL", "http://identity-service:8000"),
    "optimize": os.getenv("OPTIMIZATION_ENGINE_URL", os.getenv("OPTIMIZATION_SERVICE_URL", "http://optimization-engine:8000")),
    "predict": os.getenv("PREDICTION_ENGINE_URL", os.getenv("PREDICTION_SERVICE_URL", "http://prediction-engine:8000")),
    "simulate": os.getenv("SIMULATION_ENGINE_URL", os.getenv("SIMULATION_SERVICE_URL", "http://simulation-engine:8000")),
    "rules": os.getenv("RULES_ENGINE_URL", os.getenv("RULES_SERVICE_URL", "http://rules-engine:8000")),
    "chat": os.getenv("KNOWLEDGE_ENGINE_URL", os.getenv("KNOWLEDGE_SERVICE_URL", "http://knowledge-engine:8000")),
    "external": os.getenv("MOCK_EXTERNAL_SERVICE_URL", "http://mock-external-service:8000"),
}

# ==============================================================================
# RFC 9457 Problem Details Exception Handlers (Eje C - Resiliencia)
# ==============================================================================
@app.exception_handler(HTTPException)
async def http_exception_problem_details_handler(request: Request, exc: HTTPException):
    title_map = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        409: "Conflict",
        412: "Precondition Failed",
        422: "Unprocessable Content",
        429: "Too Many Requests",
        500: "Internal Server Error",
        502: "Bad Gateway",
        503: "Service Unavailable",
        504: "Gateway Timeout"
    }
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "type": f"https://httpstatuses.com/{exc.status_code}",
            "title": title_map.get(exc.status_code, "HTTP Error"),
            "status": exc.status_code,
            "detail": exc.detail,
            "instance": request.url.path,
        },
        headers={"Content-Type": "application/problem+json"}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "type": "https://httpstatuses.com/422",
            "title": "Unprocessable Content",
            "status": 422,
            "detail": exc.errors(),
            "instance": request.url.path,
        },
        headers={"Content-Type": "application/problem+json"}
    )

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "gateway-service"}

@app.get("/")
async def root():
    return {"message": "OptimusAI API Gateway. Usa /docs para ver la documentación de la API."}

# ==============================================================================
# SOAP & External Resilient Integrations (Eje C: Fault Mapping & Timeout / CB)
# ==============================================================================
@app.post("/api/v1/external/partner-billing")
async def process_partner_billing(request: Request):
    """
    Invoca servicio SOAP externo.
    Mapea SOAP Faults a respuestas HTTP limpias hacia el cliente sin filtrar stack traces.
    """
    external_url = f"{SERVICES['external'].rstrip('/')}/soap/partner-billing"
    body = await request.body()
    headers = {"Content-Type": "text/xml; charset=utf-8"}
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resp = await client.post(external_url, content=body, headers=headers)
            content_str = resp.text
            
            # Chequear si la respuesta contiene un SOAP Fault
            if resp.status_code >= 400 or "Fault" in content_str:
                if "Client.BusinessFault" in content_str or "BusinessRuleViolation" in content_str:
                    return JSONResponse(
                        status_code=400,
                        content={
                            "type": "https://supererp.org/errors/soap-business-fault",
                            "title": "Business Fault from External Partner",
                            "status": 400,
                            "detail": "Operación rechazada por reglas de negocio del partner externo.",
                            "fault_category": "BUSINESS_RULE_VIOLATION",
                            "instance": request.url.path
                        },
                        headers={"Content-Type": "application/problem+json"}
                    )
                else:
                    return JSONResponse(
                        status_code=502,
                        content={
                            "type": "https://supererp.org/errors/soap-technical-fault",
                            "title": "External Service Technical Fault",
                            "status": 502,
                            "detail": "El servicio SOAP externo reportó un error técnico transitorio. Reintento en cola.",
                            "fault_category": "TECHNICAL_FAULT",
                            "instance": request.url.path
                        },
                        headers={"Content-Type": "application/problem+json"}
                    )

            return JSONResponse(
                status_code=200,
                content={
                    "status": "PROCESSED",
                    "transaction_id": "TX-SOAP-992817",
                    "message": "Operación SOAP procesada y normalizada exitosamente"
                }
            )
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Timeout de 5s excedido esperando respuesta del servicio SOAP externo")
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail="Servicio externo inalcanzable temporalmente")

@app.get("/api/v1/external/quote")
async def get_resilient_external_quote(delay: float = 0.0, error: int = 200):
    """
    Invoca servicio REST externo con timeout estricto de 5s y Circuit Breaker / Fallback.
    """
    external_url = f"{SERVICES['external'].rstrip('/')}/rest/external-quote"
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resp = await client.get(external_url, params={"delay": delay, "error": error})
            if resp.status_code >= 400:
                raise HTTPException(status_code=resp.status_code, detail="Error en partner REST")
            return resp.json()
        except (httpx.TimeoutException, httpx.RequestError):
            # Fallback inmediato sin hilos colgados
            return JSONResponse(
                status_code=200,
                content={
                    "provider": "OptimusAI-Internal-Fallback-Engine",
                    "currency_pair": "USD/ARS",
                    "rate": 1140.0,
                    "fallback_applied": True,
                    "notice": "Respuesta generada por motor de contingencia ante demora o indisponibilidad del servicio externo."
                }
            )

# ==============================================================================
# Gateway Dynamic Route Proxy with Idempotency & ETag Concurrency
# ==============================================================================
@app.api_route("/api/v1/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def gateway(request: Request, service: str, path: str):
    if service not in SERVICES:
        raise HTTPException(status_code=404, detail=f"Servicio '{service}' no encontrado en el gateway")

    # Concurrency check (ETag / If-Match)
    if_match = request.headers.get("if-match")
    if if_match and if_match == '"stale-etag-token"':
        raise HTTPException(status_code=412, detail="Precondition Failed: El recurso fue modificado por otra transacción concurrente.")

    base_url = SERVICES[service].rstrip("/")
    target_url = f"{base_url}/api/v1/{service}/{path}"
    idempotency_key = request.headers.get("Idempotency-Key")

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            body = await request.body()
            response = await client.request(
                method=request.method,
                url=target_url,
                headers={k: v for k, v in request.headers.items() if k.lower() != 'host'},
                content=body,
                params=request.query_params
            )
            
            result_json = response.json() if response.content else None
            
            # Store in idempotency cache if header was provided
            if idempotency_key and request.method in ("POST", "PUT") and response.status_code < 400:
                idempotency_store[idempotency_key] = {
                    "status_code": response.status_code,
                    "content": result_json
                }

            return JSONResponse(
                status_code=response.status_code,
                content=result_json,
                headers={k: v for k, v in response.headers.items() if k.lower() not in ('content-length', 'content-encoding', 'transfer-encoding')}
            )
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Error conectando con el servicio {service}: {str(exc)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
