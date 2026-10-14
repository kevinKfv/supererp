import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.infrastructure.simulators.montecarlo import run_profitability_simulation

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "simulation-engine"}

def test_run_profitability_simulation_logic():
    result = run_profitability_simulation(
        expected_revenue=100000,
        revenue_std=15000,
        expected_cost=70000,
        cost_std=10000,
        iterations=5000
    )
    assert result["iterations_run"] == 5000
    assert 25000 < result["mean_profitability"] < 35000
    assert result["worst_case_p5"] <= result["mean_profitability"]
    assert result["best_case_p95"] >= result["mean_profitability"]
    assert 0 <= result["probability_of_loss_percent"] <= 100

def test_simulate_montecarlo_api_endpoint():
    response = client.post("/api/v1/simulate/montecarlo", json={
        "expected_revenue": 50000,
        "revenue_std": 5000,
        "expected_cost": 30000,
        "cost_std": 3000,
        "iterations": 2000
    })
    assert response.status_code == 200
    data = response.json()
    assert "simulation_results" in data
    res = data["simulation_results"]
    assert res["iterations_run"] == 2000
    assert res["mean_profitability"] > 0
