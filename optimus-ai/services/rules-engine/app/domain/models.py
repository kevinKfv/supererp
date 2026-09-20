from pydantic import BaseModel, Field
from typing import List, Union, Any, Optional

class Condition(BaseModel):
    field: str = Field(..., description="El campo del hecho a evaluar (ej. 'Employee.Skill')")
    operator: str = Field(..., description="Operador lógico (==, !=, >, <, >=, <=, IN)")
    value: Any = Field(..., description="El valor esperado para cumplir la condición")

class Rule(BaseModel):
    id: str = Field(..., description="Identificador único de la regla")
    condition_logic: str = Field("AND", description="Lógica para agrupar condiciones (AND, OR)")
    conditions: List[Condition] = Field(..., description="Lista de condiciones a evaluar")
    action: str = Field(..., description="Acción a disparar si la regla se cumple")
    priority: int = Field(0, description="Prioridad de ejecución (mayor número = mayor prioridad)")

class EvaluateRequest(BaseModel):
    rules: List[Rule] = Field(..., description="Reglas dinámicas a evaluar")
    facts: dict = Field(..., description="Diccionario con los hechos/datos actuales a evaluar")

class RuleResult(BaseModel):
    rule_id: str
    passed: bool
    action: Optional[str] = None
    
class EvaluateResponse(BaseModel):
    results: List[RuleResult]
    triggered_actions: List[str]
