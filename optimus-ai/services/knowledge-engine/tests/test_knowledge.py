import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.infrastructure.nlp_client import nlp_client

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "knowledge-engine"}

def test_extract_intent_optimize_costs():
    result = nlp_client.extract_intent("Necesito reducir los costos de producción un 15%")
    assert result.intent == "OPTIMIZE"
    assert result.target == "COSTS"
    assert result.parameters.get("percentage") == 15

def test_extract_intent_simulate():
    result = nlp_client.extract_intent("Quiero simular el riesgo y rentabilidad")
    assert result.intent == "SIMULATE"
    assert result.target in ("RISK", "REVENUE", "UNKNOWN")

def test_extract_intent_assign():
    result = nlp_client.extract_intent("Asignar empleados a las sucursales")
    assert result.intent == "ASSIGN"

def test_generate_explanation():
    intent = nlp_client.extract_intent("Reducir costos en un 20%")
    explanation = nlp_client.generate_explanation(intent)
    assert "20%" in explanation
    assert "Optimization Engine" in explanation

def test_chat_intent_api_endpoint():
    response = client.post("/api/v1/chat/intent", json={
        "user_input": "Bajar gastos operativos en un 10%"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["extracted_intent"]["intent"] == "OPTIMIZE"
    assert data["extracted_intent"]["target"] == "COSTS"
    assert data["extracted_intent"]["parameters"]["percentage"] == 10
    assert "explanation" in data
