from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any
from app.ml_models.sales_predictor import train_sales_model, predict_sales

router = APIRouter()

class TrainRequest(BaseModel):
    data: Optional[List[dict]] = None

class PredictRequest(BaseModel):
    features: List[List[float]]

@router.post("/train")
async def train_model(req: TrainRequest):
    """
    Entrena el modelo de ventas y lo sube a MinIO.
    Si data es nulo, usa datos sintéticos.
    """
    try:
        result = train_sales_model(req.data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict")
async def make_prediction(req: PredictRequest):
    """
    Realiza una predicción bajando el modelo de MinIO.
    """
    try:
        predictions = predict_sales(req.features)
        return {"predictions": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
