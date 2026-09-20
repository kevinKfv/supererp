from fastapi import APIRouter, HTTPException
from app.domain.models import EvaluateRequest, EvaluateResponse
from app.infrastructure.evaluator import evaluate_ruleset

router = APIRouter()

@router.post("/", response_model=EvaluateResponse)
async def evaluate_rules(req: EvaluateRequest):
    """
    Evalúa un conjunto de reglas dinámicas contra un conjunto de hechos (datos) enviados.
    Retorna cuáles reglas pasaron y qué acciones deben dispararse.
    """
    try:
        results, triggered = evaluate_ruleset(req.rules, req.facts)
        return EvaluateResponse(
            results=results,
            triggered_actions=triggered
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
