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
