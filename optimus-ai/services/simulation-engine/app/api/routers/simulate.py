from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.infrastructure.simulators.montecarlo import run_profitability_simulation

router = APIRouter()

class MonteCarloRequest(BaseModel):
    expected_revenue: float = Field(..., description="Ingresos promedio esperados")
    revenue_std: float = Field(..., description="Desviación estándar de los ingresos (incertidumbre)")
    expected_cost: float = Field(..., description="Costos promedio esperados")
    cost_std: float = Field(..., description="Desviación estándar de los costos (incertidumbre)")
    iterations: int = Field(10000, description="Cantidad de escenarios a simular")

@router.post("/montecarlo")
async def simulate_montecarlo(req: MonteCarloRequest):
    """
    Ejecuta una Simulación de Monte Carlo síncrona para evaluar rentabilidad y riesgo.
    """
    results = run_profitability_simulation(
        expected_revenue=req.expected_revenue,
        revenue_std=req.revenue_std,
        expected_cost=req.expected_cost,
        cost_std=req.cost_std,
        iterations=req.iterations
    )
    return {"simulation_results": results}
