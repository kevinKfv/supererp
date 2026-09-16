from ortools.linear_solver import pywraplp
from typing import List, Dict, Any

def solve_assignment_problem(costs: List[List[float]]) -> Dict[str, Any]:
    """
    Resuelve el problema clásico de asignación utilizando OR-Tools (MIP Solver).
    :param costs: Matriz N x M donde costs[i][j] es el costo de asignar el trabajador i a la tarea j.
    :return: Diccionario con el costo total y la lista de asignaciones.
    """
    num_workers = len(costs)
    num_tasks = len(costs[0]) if num_workers > 0 else 0
    
    # Instanciar el solver MIP
    solver = pywraplp.Solver.CreateSolver('SCIP')
    if not solver:
        return {"status": "ERROR", "message": "No se pudo instanciar el solver SCIP"}

    # Variables de decisión: x[i, j] es 1 si el trabajador i es asignado a la tarea j.
    x = {}
    for i in range(num_workers):
        for j in range(num_tasks):
            x[i, j] = solver.IntVar(0, 1, f'worker_{i}_task_{j}')

    # Restricción 1: Cada trabajador es asignado a como máximo una tarea.
    for i in range(num_workers):
        solver.Add(solver.Sum([x[i, j] for j in range(num_tasks)]) <= 1)

    # Restricción 2: Cada tarea es asignada a exactamente un trabajador.
    for j in range(num_tasks):
        solver.Add(solver.Sum([x[i, j] for i in range(num_workers)]) == 1)

    # Función objetivo: Minimizar el costo total.
    objective_terms = []
    for i in range(num_workers):
        for j in range(num_tasks):
            objective_terms.append(costs[i][j] * x[i, j])
    solver.Minimize(solver.Sum(objective_terms))

    # Resolver
    status = solver.Solve()

    if status == pywraplp.Solver.OPTIMAL or status == pywraplp.Solver.FEASIBLE:
        assignments = []
        for i in range(num_workers):
            for j in range(num_tasks):
                if x[i, j].solution_value() > 0.5:
                    assignments.append({
                        "worker": i,
                        "task": j,
                        "cost": costs[i][j]
                    })
        return {
            "status": "OPTIMAL" if status == pywraplp.Solver.OPTIMAL else "FEASIBLE",
            "total_cost": solver.Objective().Value(),
            "assignments": assignments
        }
    else:
        return {
            "status": "INFEASIBLE",
            "message": "No se encontró una solución factible."
        }
