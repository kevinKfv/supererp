import os
from celery import Celery
from app.infrastructure.solvers.assignment_solver import solve_assignment_problem

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "optimization_tasks",
    broker=redis_url,
    backend=redis_url
)

@celery_app.task(name="optimize_assignment")
def optimize_assignment_task(costs: list):
    """
    Tarea asíncrona de Celery para resolver el problema de asignación.
    """
    result = solve_assignment_problem(costs)
    return result
