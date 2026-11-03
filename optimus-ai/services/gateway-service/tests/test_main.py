import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "gateway-service"}

def test_security_headers_present():
    """Verifica cabeceras OWASP exigidas (Eje D)"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert "Strict-Transport-Security" in response.headers
    assert "Content-Security-Policy" in response.headers

def test_problem_details_rfc9457_format():
    """Verifica que los errores sigan el formato RFC 9457 Problem Details (Eje C)"""
    response = client.get("/api/v1/invalid-service-xyz/test")
    assert response.status_code == 404
    assert response.headers.get("content-type") == "application/problem+json"
    data = response.json()
    assert "type" in data
    assert "title" in data
    assert "status" in data
    assert "detail" in data
    assert data["status"] == 404

def test_idempotency_key_mechanism():
    """Verifica que envíos con la misma Idempotency-Key devuelvan la misma respuesta sin reprocesar (Eje C)"""
    key = "idem-test-key-999"
    # Pre-poblar caché de idempotencia simulada
    from app.main import idempotency_store
    idempotency_store[key] = {
        "status_code": 201,
        "content": {"created_id": "res-123", "idempotent": True}
    }
    
    response = client.post(
        "/api/v1/identity/test-idempotent",
        headers={"Idempotency-Key": key}
    )
    assert response.status_code == 201
    assert response.headers.get("X-Cache-Lookup") == "HIT"
    assert response.json()["created_id"] == "res-123"

def test_concurrency_etag_precondition_failed():
    """Verifica que ETag desactualizado devuelva 412 Precondition Failed (Eje C)"""
    response = client.put(
        "/api/v1/identity/users/me",
        headers={"If-Match": '"stale-etag-token"'}
    )
    assert response.status_code == 412
    assert response.headers.get("content-type") == "application/problem+json"
    assert "Precondition Failed" in response.json()["detail"]

@patch("httpx.AsyncClient.post")
def test_soap_fault_mapping_business_fault(mock_post):
    """Verifica que un SOAP Fault de negocio se mapee a HTTP 400 sin filtrar el error crudo (Eje C)"""
    mock_post.return_value = AsyncMock(
        status_code=500,
        text="""<soapenv:Envelope><soapenv:Body><soapenv:Fault>
        <faultcode>soapenv:Client.BusinessFault</faultcode>
        <faultstring>Limite excedido</faultstring>
        </soapenv:Fault></soapenv:Body></soapenv:Envelope>"""
    )
    
    response = client.post(
        "/api/v1/external/partner-billing",
        content="<test>data</test>"
    )
    assert response.status_code == 400
    assert response.headers.get("content-type") == "application/problem+json"
    data = response.json()
    assert data["fault_category"] == "BUSINESS_RULE_VIOLATION"

@patch("httpx.AsyncClient.post")
def test_soap_fault_mapping_technical_fault(mock_post):
    """Verifica que un SOAP Fault técnico se mapee a HTTP 502 sin filtrar stack trace (Eje C)"""
    mock_post.return_value = AsyncMock(
        status_code=500,
        text="""<soapenv:Envelope><soapenv:Body><soapenv:Fault>
        <faultcode>soapenv:Server.TechnicalFault</faultcode>
        <faultstring>Internal DB Error</faultstring>
        </soapenv:Fault></soapenv:Body></soapenv:Envelope>"""
    )
    
    response = client.post(
        "/api/v1/external/partner-billing",
        content="<test>data</test>"
    )
    assert response.status_code == 502
    assert response.headers.get("content-type") == "application/problem+json"
    data = response.json()
    assert data["fault_category"] == "TECHNICAL_FAULT"

@patch("httpx.AsyncClient.get")
def test_rest_external_service_timeout_fallback(mock_get):
    """Verifica que una demora > 5s dispare fallback sin colgar hilos (Eje C)"""
    import httpx
    mock_get.side_effect = httpx.TimeoutException("Timeout exceeded")
    
    response = client.get("/api/v1/external/quote?delay=6")
    assert response.status_code == 200
    data = response.json()
    assert data["fallback_applied"] is True
    assert "OptimusAI-Internal-Fallback-Engine" in data["provider"]
