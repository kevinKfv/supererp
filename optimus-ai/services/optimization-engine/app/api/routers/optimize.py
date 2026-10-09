from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import math
import json
from uuid import uuid4
from app.application.tasks import optimize_assignment_task, celery_app
from celery.result import AsyncResult

router = APIRouter()

class AssignmentContext(BaseModel):
    workerNames: List[str]
    taskNames: List[str]
    unit: str
    currentAssignment: List[int] | None = None

class AssignmentRequest(BaseModel):
    costs: List[List[float]]
    allowed: List[List[bool]] | None = None
    context: AssignmentContext | None = None

@router.post("/assignment")
async def start_assignment_optimization(req: AssignmentRequest):
    """
    Encola una tarea de optimización de asignación en Celery.
    """
    if not req.costs or not req.costs[0]:
        raise HTTPException(status_code=400, detail="La matriz de costos no puede estar vacía.")
    width = len(req.costs[0])
    if any(len(row) != width or any(not math.isfinite(cost) for cost in row) for row in req.costs):
        raise HTTPException(status_code=400, detail="La matriz debe ser rectangular y contener números finitos.")
    if len(req.costs) < width:
        raise HTTPException(status_code=400, detail="Se necesita al menos un trabajador por tarea.")
    if req.allowed is not None and (len(req.allowed) != len(req.costs) or any(len(row) != width for row in req.allowed)):
        raise HTTPException(status_code=400, detail="Las restricciones deben tener las mismas dimensiones que los costos.")

    if req.context is not None:
        context = req.context
        if (len(context.workerNames) != len(req.costs) or len(context.taskNames) != width or
            any(not name.strip() or len(name) > 80 for name in context.workerNames + context.taskNames) or
            len(set(context.workerNames)) != len(context.workerNames) or
            len(set(context.taskNames)) != len(context.taskNames) or
            not context.unit.strip() or len(context.unit) > 30):
            raise HTTPException(status_code=400, detail="El contexto de la ejecución no coincide con la matriz.")
        assignment = context.currentAssignment
        if assignment is not None and (len(assignment) != width or len(set(assignment)) != width or
            any(worker < 0 or worker >= len(req.costs) or
                (req.allowed is not None and not req.allowed[worker][task])
                for task, worker in enumerate(assignment))):
            raise HTTPException(status_code=400, detail="La asignación actual no es válida.")

    task_id = str(uuid4())
    if req.context is not None:
        saved_context = req.context.model_dump()
        saved_context["costs"] = req.costs
        saved_context["allowed"] = req.allowed or [[True] * width for _ in req.costs]
        celery_app.backend.client.setex(f"optimization-context:{task_id}", 24 * 60 * 60, json.dumps(saved_context))
    task = optimize_assignment_task.apply_async(args=(req.costs, req.allowed), task_id=task_id)
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
    context = celery_app.backend.client.get(f"optimization-context:{task_id}")
    if context:
        response["context"] = json.loads(context)
        
    return response
