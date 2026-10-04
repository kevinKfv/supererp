from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "identity-service"}

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_create_user():
    # Este test fallará hasta que se implemente la creación de usuarios
    payload = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "securepassword123"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    # Asegurarse de que la contraseña no se devuelve
    assert "password" not in data

def test_login_and_jwt_generation():
    # Este test fallará hasta que se implemente el login y JWT
    payload = {
        "username": "testuser",
        "password": "securepassword123"
    }
    response = client.post("/auth/login", data=payload) # Form-data for OAuth2
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_protected_route_with_jwt():
    # Fallará hasta que exista validación JWT
    # 1. Login para obtener el token
    login_payload = {
        "username": "testuser",
        "password": "securepassword123"
    }
    login_response = client.post("/auth/login", data=login_payload)
    token = login_response.json().get("access_token", "invalid")
    
    # 2. Acceder a ruta protegida
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"

def test_protected_route_without_jwt():
    # Debería devolver 401
    response = client.get("/users/me")
    assert response.status_code == 401
