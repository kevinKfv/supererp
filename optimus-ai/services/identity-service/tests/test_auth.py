import pytest
from datetime import datetime, timedelta
from jose import jwt
from fastapi.testclient import TestClient
from app.main import app
from app.infrastructure.security import SECRET_KEY, ALGORITHM

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
    payload = {
        "username": "qa_user_1",
        "email": "qa1@example.com",
        "password": "securepassword123"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code in (201, 400)
    if response.status_code == 201:
        data = response.json()
        assert "id" in data
        assert data["username"] == "qa_user_1"
        assert "password" not in data

def test_login_and_jwt_generation():
    # Asegurar usuario creado
    client.post("/auth/register", json={
        "username": "login_user",
        "email": "login@example.com",
        "password": "securepassword123"
    })
    
    response = client.post("/auth/login", data={
        "username": "login_user",
        "password": "securepassword123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_protected_route_with_jwt():
    client.post("/auth/register", json={
        "username": "jwt_user",
        "email": "jwt@example.com",
        "password": "securepassword123"
    })
    login_resp = client.post("/auth/login", data={"username": "jwt_user", "password": "securepassword123"})
    token = login_resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/users/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["username"] == "jwt_user"

def test_protected_route_without_jwt():
    response = client.get("/users/me")
    assert response.status_code == 401

# ==============================================================================
# PRUEBAS DE SEGURIDAD EXIGIDAS POR CÁTEDRA (EJE D)
# ==============================================================================

def test_security_jwt_expired():
    """JWT vencido debe devolver 401 (Eje D)"""
    expired_token = jwt.encode(
        {"sub": "jwt_user", "exp": datetime.utcnow() - timedelta(minutes=10)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    response = client.get("/users/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert response.status_code == 401

def test_security_jwt_tampered_signature():
    """JWT con firma alterada debe devolver 401 (Eje D)"""
    valid_token = jwt.encode(
        {"sub": "jwt_user", "exp": datetime.utcnow() + timedelta(minutes=10)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    tampered_token = valid_token[:-4] + "abcd"
    response = client.get("/users/me", headers={"Authorization": f"Bearer {tampered_token}"})
    assert response.status_code == 401

def test_security_jwt_alg_none_attack():
    """Ataque alg=none debe ser rechazado con 401 (Eje D)"""
    none_token = jwt.encode(
        {"sub": "jwt_user", "exp": datetime.utcnow() + timedelta(minutes=10)},
        key="",
        algorithm="none"
    )
    response = client.get("/users/me", headers={"Authorization": f"Bearer {none_token}"})
    assert response.status_code == 401

def test_security_jwt_wrong_secret():
    """Token firmado con otra clave debe devolver 401 (Eje D)"""
    wrong_token = jwt.encode(
        {"sub": "jwt_user", "exp": datetime.utcnow() + timedelta(minutes=10)},
        "wrong-secret-key-123",
        algorithm=ALGORITHM
    )
    response = client.get("/users/me", headers={"Authorization": f"Bearer {wrong_token}"})
    assert response.status_code == 401

def test_security_bola_idor_forbidden():
    """Usuario A intentando consultar recurso de Usuario B debe retornar 403 (Eje D)"""
    # Generar token de usuario estándar con id=99
    user_token = jwt.encode(
        {"sub": "user_a", "id": 99, "role": "user", "exp": datetime.utcnow() + timedelta(minutes=10)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    # Usuario A consulta datos de usuario con id=100
    response = client.get("/users/100", headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 403
    assert "BOLA/IDOR" in response.json()["detail"]

def test_security_bfla_forbidden_for_standard_user():
    """Rol de usuario común invocando endpoint de administración debe retornar 403 (Eje D)"""
    client_token = jwt.encode(
        {"sub": "client_user", "role": "client", "exp": datetime.utcnow() + timedelta(minutes=10)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    response = client.get("/users/admin/metrics", headers={"Authorization": f"Bearer {client_token}"})
    assert response.status_code == 403
    assert "BFLA" in response.json()["detail"]

def test_security_bfla_allowed_for_admin():
    """Rol admin puede invocar endpoint administrativo exitosamente (Eje D)"""
    admin_token = jwt.encode(
        {"sub": "admin_supererp", "role": "admin", "exp": datetime.utcnow() + timedelta(minutes=10)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    response = client.get("/users/admin/metrics", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    assert response.json()["status"] == "authorized"

def test_security_mass_assignment_protection():
    """Campos no permitidos (role: 'admin', is_superuser: True) no deben ser aceptados en registro (Eje D)"""
    payload = {
        "username": "hacker_user",
        "email": "hacker@example.com",
        "password": "Password123!",
        "role": "admin",
        "is_superuser": True,
        "is_admin": True
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code in (201, 400)
    if response.status_code == 201:
        # El rol asignado no debe ser admin
        assert response.json().get("role") != "admin"

def test_security_brute_force_rate_limiting():
    """5 intentos de login fallidos consecutivos disparan HTTP 429 Too Many Requests (Eje D)"""
    target_user = "brute_force_victim"
    for _ in range(5):
        client.post("/auth/login", data={"username": target_user, "password": "wrong_password"})
    
    # El 6to intento debe ser bloqueado con 429
    blocked_resp = client.post("/auth/login", data={"username": target_user, "password": "wrong_password"})
    assert blocked_resp.status_code == 429
    assert "Fuerza bruta" in blocked_resp.json()["detail"]
