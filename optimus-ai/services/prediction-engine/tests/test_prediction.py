import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.ml_models.sales_predictor import train_sales_model, predict_sales

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "prediction-engine"}

@patch("app.ml_models.sales_predictor.upload_model", return_value=True)
def test_train_sales_model_synthetic(mock_upload):
    result = train_sales_model(data=None)
    assert result["status"] == "Trained"
    assert result["model_uploaded_to_minio"] is True
    assert result["features"] == 3

@patch("app.ml_models.sales_predictor.upload_model", return_value=True)
def test_train_sales_model_custom_data(mock_upload):
    custom_data = [
        {"precio": 100, "mkt": 50, "temp": 20, "ventas": 200},
        {"precio": 120, "mkt": 60, "temp": 22, "ventas": 230},
        {"precio": 90, "mkt": 40, "temp": 18, "ventas": 180},
        {"precio": 110, "mkt": 55, "temp": 25, "ventas": 215},
    ]
    result = train_sales_model(data=custom_data)
    assert result["status"] == "Trained"
    assert result["features"] == 3

@patch("app.ml_models.sales_predictor.download_model", return_value=True)
def test_predict_endpoint(mock_download):
    # Train first so local model exists
    with patch("app.ml_models.sales_predictor.upload_model", return_value=True):
        train_sales_model(None)
    
    response = client.post("/api/v1/predict/predict", json={
        "features": [[100.0, 80.0, 25.0]]
    })
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    assert len(data["predictions"]) == 1
    assert isinstance(data["predictions"][0], (int, float))
