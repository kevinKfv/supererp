from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
import httpx

app = FastAPI(
    title="OptimusAI - API Gateway",
    description="Punto de entrada único para todos los servicios de OptimusAI. Autentica y enruta peticiones.",
    version="1.0.0",
)

# Inicializar Instrumentación de Prometheus para monitorear métricas HTTP
Instrumentator().instrument(app).expose(app)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "gateway-service"}

@app.get("/")
async def root():
    return {"message": "OptimusAI API Gateway. Usa /docs para ver la documentación de la API."}

# Ejemplo básico de enrutamiento transparente usando httpx
# En una implementación real, se usaría un middleware o dependencias para validar el JWT
# y reenviar la petición al servicio correspondiente.
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def catch_all(request: Request, path: str):
    # Aquí iría la lógica de enrutamiento, por ejemplo:
    # if path.startswith("identity"):
    #     target_url = f"http://identity-service:8000/{path}"
    # ...
    return JSONResponse(status_code=501, content={"message": f"Ruta /{path} no implementada en el gateway aún."})
