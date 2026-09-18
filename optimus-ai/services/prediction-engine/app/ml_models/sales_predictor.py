import os
import joblib
import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from app.infrastructure.minio_client import upload_model, download_model

MODEL_FILENAME = "sales_xgboost.joblib"
LOCAL_MODEL_PATH = f"/tmp/{MODEL_FILENAME}"

def train_sales_model(data: list) -> dict:
    """
    Entrena un modelo XGBoost básico con datos sintéticos/recibidos.
    """
    if not data:
        # Generar datos sintéticos simples si no se proveen
        np.random.seed(42)
        X = np.random.rand(100, 3) * 100 # 3 features: precio, inversion_mkt, temperatura
        y = X[:, 0] * 2 + X[:, 1] * 1.5 - X[:, 2] * 0.5 + np.random.randn(100) * 10 # target: ventas
    else:
        df = pd.DataFrame(data)
        X = df.drop(columns=["ventas"]).values
        y = df["ventas"].values

    model = XGBRegressor(n_estimators=50, max_depth=3, learning_rate=0.1)
    model.fit(X, y)
    
    # Guardar y subir a MinIO
    joblib.dump(model, LOCAL_MODEL_PATH)
    upload_success = upload_model(LOCAL_MODEL_PATH, MODEL_FILENAME)
    
    return {
        "status": "Trained",
        "model_uploaded_to_minio": upload_success,
        "features": 3 if not data else X.shape[1]
    }

def predict_sales(features: list) -> list:
    """
    Descarga el modelo de MinIO (si no está local) y realiza una predicción.
    """
    if not os.path.exists(LOCAL_MODEL_PATH):
        success = download_model(MODEL_FILENAME, LOCAL_MODEL_PATH)
        if not success:
            raise Exception("Modelo no encontrado en MinIO ni localmente. Debes entrenarlo primero.")
            
    model = joblib.load(LOCAL_MODEL_PATH)
    predictions = model.predict(np.array(features))
    return predictions.tolist()
