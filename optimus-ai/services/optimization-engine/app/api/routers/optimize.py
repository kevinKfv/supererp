from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Any
from app.application.tasks import optimize_assignment_task, celery_app
from celery.result import AsyncResult

router = APIRouter()

class AssignmentRequest(BaseModel):
    costs: List[List[float]]

@router.post("/assignment")
async def start_assignment_optimization(req: AssignmentRequest):
    """
    Encola una tarea de optimización de asignación en Celery.
    """
    if not req.costs or not req.costs[0]:
        raise HTTPException(status_code=400, detail="La matriz de costos no puede estar vacía.")
        
    task = optimize_assignment_task.delay(req.costs)
    return {"task_id": task.id, "status": "Queued"}

@router.get("/status/{task_id}")
async def get_optimization_status(task_id: str):
    """
    Consulta el estado y resultado de una tarea de optimización de Celery.
    """
    task_result = AsyncResult(task_id, app=celery_app)
    
    response = {
        "task_id": task_id,
        "status": task_result.status,
    }
    
    if task_result.status == "SUCCESS":
        response["result"] = task_result.result
    elif task_result.status == "FAILURE":
        response["error"] = str(task_result.info)
        
    return response
