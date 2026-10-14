"""
Tests reales para el motor de reglas dinámicas (JSON AST evaluator).
Cubre: evaluate_condition, evaluate_rule, evaluate_ruleset y el endpoint HTTP.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.domain.models import Rule, Condition
from app.infrastructure.evaluator import (
    evaluate_condition,
    evaluate_rule,
    evaluate_ruleset,
    resolve_fact_value,
)

client = TestClient(app)

# ──────────────────────────────────────────────
# 1. Health
# ──────────────────────────────────────────────
def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "rules-engine"}


# ──────────────────────────────────────────────
# 2. resolve_fact_value  (claves anidadas)
# ──────────────────────────────────────────────
def test_resolve_flat_key():
    assert resolve_fact_value("monto", {"monto": 1500}) == 1500

def test_resolve_nested_key():
    assert resolve_fact_value("Employee.Skill", {"Employee": {"Skill": "Python"}}) == "Python"

def test_resolve_missing_key():
    assert resolve_fact_value("precio", {"monto": 100}) is None


# ──────────────────────────────────────────────
# 3. evaluate_condition — todos los operadores
# ──────────────────────────────────────────────
@pytest.mark.parametrize("op,fact_val,exp_val,expected", [
    ("==", 100, 100, True),
    ("==", 100, 200, False),
    ("!=", 100, 200, True),
    ("!=", 100, 100, False),
    (">",  200, 100, True),
    (">",  100, 200, False),
    ("<",  100, 200, True),
    ("<",  200, 100, False),
    (">=", 100, 100, True),
    (">=",  99, 100, False),
    ("<=", 100, 100, True),
    ("<=", 101, 100, False),
    ("IN", "A", ["A", "B"], True),
    ("IN", "C", ["A", "B"], False),
])
def test_evaluate_condition_operators(op, fact_val, exp_val, expected):
    cond = Condition(field="x", operator=op, value=exp_val)
    assert evaluate_condition(cond, {"x": fact_val}) == expected

def test_evaluate_condition_missing_fact_returns_false():
    cond = Condition(field="missing", operator="==", value=1)
    assert evaluate_condition(cond, {}) is False


# ──────────────────────────────────────────────
# 4. evaluate_rule — lógica AND / OR
# ──────────────────────────────────────────────
def _make_rule(logic="AND", conditions=None, action="ACCIÓN", priority=0):
    conditions = conditions or []
    return Rule(id="R1", condition_logic=logic, conditions=conditions, action=action, priority=priority)

def test_evaluate_rule_and_all_pass():
    rule = _make_rule("AND", [
        Condition(field="a", operator=">", value=10),
        Condition(field="b", operator="==", value="ok"),
    ])
    assert evaluate_rule(rule, {"a": 20, "b": "ok"}) is True

def test_evaluate_rule_and_one_fails():
    rule = _make_rule("AND", [
        Condition(field="a", operator=">", value=10),
        Condition(field="b", operator="==", value="ok"),
    ])
    assert evaluate_rule(rule, {"a": 5, "b": "ok"}) is False

def test_evaluate_rule_or_one_passes():
    rule = _make_rule("OR", [
        Condition(field="a", operator=">", value=100),
        Condition(field="b", operator="==", value="si"),
    ])
    assert evaluate_rule(rule, {"a": 5, "b": "si"}) is True

def test_evaluate_rule_or_all_fail():
    rule = _make_rule("OR", [
        Condition(field="a", operator=">", value=100),
        Condition(field="b", operator="==", value="si"),
    ])
    assert evaluate_rule(rule, {"a": 5, "b": "no"}) is False

def test_evaluate_rule_empty_conditions_returns_false():
    rule = _make_rule("AND", [])
    assert evaluate_rule(rule, {"x": 1}) is False


# ──────────────────────────────────────────────
# 5. evaluate_ruleset — prioridad y acciones
# ──────────────────────────────────────────────
def test_evaluate_ruleset_priority_order():
    """Las reglas de mayor prioridad aparecen primero en el resultado."""
    rules = [
        Rule(id="LOW",  conditions=[Condition(field="x", operator=">", value=0)], action="A", priority=1,  condition_logic="AND"),
        Rule(id="HIGH", conditions=[Condition(field="x", operator=">", value=0)], action="B", priority=10, condition_logic="AND"),
    ]
    results, triggered = evaluate_ruleset(rules, {"x": 5})
    assert results[0]["rule_id"] == "HIGH"
    assert results[1]["rule_id"] == "LOW"
    assert set(triggered) == {"A", "B"}

def test_evaluate_ruleset_only_matching_actions():
    rules = [
        Rule(id="PASS", conditions=[Condition(field="monto", operator=">", value=1000)], action="DESCUENTO", priority=1, condition_logic="AND"),
        Rule(id="FAIL", conditions=[Condition(field="monto", operator=">", value=9000)], action="BLOQUEO",   priority=0, condition_logic="AND"),
    ]
    results, triggered = evaluate_ruleset(rules, {"monto": 1500})
    assert triggered == ["DESCUENTO"]
    passing = [r for r in results if r["rule_id"] == "PASS"]
    failing = [r for r in results if r["rule_id"] == "FAIL"]
    assert passing[0]["passed"] is True
    assert failing[0]["passed"] is False


# ──────────────────────────────────────────────
# 6. Endpoint HTTP POST /api/v1/rules/evaluate/
# ──────────────────────────────────────────────
def test_evaluate_endpoint_basic():
    payload = {
        "rules": [
            {
                "id": "R1",
                "conditions": [{"field": "monto", "operator": ">", "value": 1000}],
                "condition_logic": "AND",
                "action": "DESCUENTO",
                "priority": 1,
            }
        ],
        "facts": {"monto": 1500},
    }
    response = client.post("/api/v1/rules/evaluate/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "triggered_actions" in data
    assert "DESCUENTO" in data["triggered_actions"]

def test_evaluate_endpoint_no_match():
    payload = {
        "rules": [
            {
                "id": "R2",
                "conditions": [{"field": "score", "operator": ">=", "value": 90}],
                "condition_logic": "AND",
                "action": "PREMIUM",
                "priority": 0,
            }
        ],
        "facts": {"score": 50},
    }
    response = client.post("/api/v1/rules/evaluate/", json=payload)
    assert response.status_code == 200
    assert response.json()["triggered_actions"] == []

def test_evaluate_endpoint_fraud_scenario():
    """Escenario: prevención de fraude con lógica OR."""
    payload = {
        "rules": [
            {
                "id": "FRAUD",
                "conditions": [
                    {"field": "pais", "operator": "IN", "value": ["NG", "KP"]},
                    {"field": "monto", "operator": ">",   "value": 50000},
                ],
                "condition_logic": "OR",
                "action": "BLOQUEAR_TRANSACCION",
                "priority": 10,
            }
        ],
        "facts": {"pais": "NG", "monto": 100},
    }
    response = client.post("/api/v1/rules/evaluate/", json=payload)
    assert response.status_code == 200
    assert "BLOQUEAR_TRANSACCION" in response.json()["triggered_actions"]
