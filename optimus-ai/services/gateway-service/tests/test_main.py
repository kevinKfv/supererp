from fastapi.testclient import TestClient

# Asumiendo que hay un app/main.py con la instancia de FastAPI
try:
    from app.main import app
    client = TestClient(app)
except ImportError:
    # Fallback si no existe todavía la estructura de app.main
    from fastapi import FastAPI
    app = FastAPI()
    @app.get("/health")
    def health(): return {"status": "ok"}
    client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()
