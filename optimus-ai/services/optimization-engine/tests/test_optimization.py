import pytest
from app.infrastructure.solvers.assignment_solver import solve_assignment_problem

def test_health_check():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "optimization-engine"}

def test_root_endpoint():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code in (200, 404)

def test_solve_assignment_optimal_2x2():
    # Costs: Worker 0 -> Task 0: 4, Task 1: 1
    #        Worker 1 -> Task 0: 2, Task 1: 3
    # Optimal: Worker 0 -> Task 1 (cost 1), Worker 1 -> Task 0 (cost 2). Total = 3
    costs = [
        [4.0, 1.0],
        [2.0, 3.0]
    ]
    result = solve_assignment_problem(costs)
    assert result["status"] == "OPTIMAL"
    assert result["total_cost"] == 3.0
    assert len(result["assignments"]) == 2

    # Check assignment mapping
    assignments = {a["worker"]: a["task"] for a in result["assignments"]}
    assert assignments[0] == 1
    assert assignments[1] == 0

def test_solve_assignment_with_allowed_restrictions():
    # If Worker 0 is NOT allowed to do Task 1:
    costs = [
        [4.0, 1.0],
        [2.0, 3.0]
    ]
    allowed = [
        [True, False], # Worker 0 can only do Task 0
        [True, True]   # Worker 1 can do Task 0 or Task 1
    ]
    result = solve_assignment_problem(costs, allowed)
    assert result["status"] in ("OPTIMAL", "FEASIBLE")
    # Worker 0 forced to Task 0 (cost 4), Worker 1 must take Task 1 (cost 3). Total = 7
    assert result["total_cost"] == 7.0

def test_solve_assignment_infeasible():
    # Two tasks, but neither worker is allowed to do Task 1
    costs = [
        [1.0, 1.0],
        [1.0, 1.0]
    ]
    allowed = [
        [True, False],
        [True, False]
    ]
    result = solve_assignment_problem(costs, allowed)
    assert result["status"] == "INFEASIBLE"


# ==============================================================================
# PRUEBAS DEL PATRÓN STATE PARA ENTIDAD CENTRAL (EJE B - RÚBRICA CÁTEDRA)
# ==============================================================================
from fastapi.testclient import TestClient
from app.main import app
from app.domain.state_machine import TaskState, transition_task_state
from fastapi import HTTPException

client = TestClient(app)

def test_state_transition_valid_path():
    """Valida transiciones correctas: DRAFT -> QUEUED -> PROCESSING -> COMPLETED -> ARCHIVED"""
    s1 = transition_task_state(TaskState.DRAFT, TaskState.QUEUED)
    assert s1 == TaskState.QUEUED
    s2 = transition_task_state(s1, TaskState.PROCESSING)
    assert s2 == TaskState.PROCESSING
    s3 = transition_task_state(s2, TaskState.COMPLETED)
    assert s3 == TaskState.COMPLETED
    s4 = transition_task_state(s3, TaskState.ARCHIVED)
    assert s4 == TaskState.ARCHIVED

@pytest.mark.parametrize("current_state, invalid_new_state", [
    (TaskState.COMPLETED, TaskState.QUEUED),      # No se puede reencolar una tarea completada
    (TaskState.COMPLETED, TaskState.PROCESSING),  # No se puede volver a procesar
    (TaskState.ARCHIVED, TaskState.DRAFT),        # Estado terminal no puede volver a borrador
    (TaskState.ARCHIVED, TaskState.COMPLETED),    # Estado terminal inmutable
    (TaskState.CANCELLED, TaskState.COMPLETED),   # Cancelada no puede completarse
    (TaskState.DRAFT, TaskState.COMPLETED),       # No puede saltar directamente a completada
    (TaskState.DRAFT, TaskState.ARCHIVED),        # No puede archivarse sin procesar/cancelar
])
def test_state_transition_invalid_returns_409(current_state, invalid_new_state):
    """
    Rúbrica Eje B: 'Toda transición inválida probada y devuelve 409'
    """
    response = client.post("/api/v1/optimize/state/transition", json={
        "current_state": current_state.value,
        "new_state": invalid_new_state.value
    })
    assert response.status_code == 409
    assert "Transición inválida" in response.json()["detail"]
