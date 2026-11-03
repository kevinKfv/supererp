import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "mock-external-service"}

def test_soap_normal_response():
    response = client.post("/soap/partner-billing", content="<test>ok</test>")
    assert response.status_code == 200
    assert "PROCESSED" in response.text

def test_soap_business_fault():
    response = client.post("/soap/partner-billing", content="<test><BusinessFaultTrigger>true</BusinessFaultTrigger></test>")
    assert response.status_code == 500
    assert "BusinessFault" in response.text

def test_soap_technical_fault():
    response = client.post("/soap/partner-billing", content="<test><TechnicalFaultTrigger>true</TechnicalFaultTrigger></test>")
    assert response.status_code == 500
    assert "TechnicalFault" in response.text

def test_rest_external_quote():
    response = client.get("/rest/external-quote")
    assert response.status_code == 200
    assert response.json()["status"] == "APPROVED"

