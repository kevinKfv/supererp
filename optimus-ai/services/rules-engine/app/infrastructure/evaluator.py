from typing import Any
from app.domain.models import Rule, Condition

def resolve_fact_value(fact_key: str, facts: dict) -> Any:
    """
    Resuelve claves anidadas usando notación de punto (ej. Employee.Skill).
    """
    keys = fact_key.split('.')
    val = facts
    for key in keys:
        if isinstance(val, dict) and key in val:
            val = val[key]
        else:
            return None
    return val

def evaluate_condition(condition: Condition, facts: dict) -> bool:
    fact_val = resolve_fact_value(condition.field, facts)
    if fact_val is None:
        return False
        
    op = condition.operator
    exp_val = condition.value
    
    if op == "==": return fact_val == exp_val
    if op == "!=": return fact_val != exp_val
    if op == ">": return fact_val > exp_val
    if op == "<": return fact_val < exp_val
    if op == ">=": return fact_val >= exp_val
    if op == "<=": return fact_val <= exp_val
    if op == "IN": return fact_val in exp_val if isinstance(exp_val, list) else False
    
    return False

def evaluate_rule(rule: Rule, facts: dict) -> bool:
    if not rule.conditions:
        return False
        
    results = [evaluate_condition(cond, facts) for cond in rule.conditions]
    
    if rule.condition_logic.upper() == "AND":
        return all(results)
    elif rule.condition_logic.upper() == "OR":
        return any(results)
        
    return False

def evaluate_ruleset(rules: list[Rule], facts: dict) -> tuple[list[dict], list[str]]:
    # Ordenar reglas por prioridad (mayor a menor)
    sorted_rules = sorted(rules, key=lambda x: x.priority, reverse=True)
    
    results = []
    triggered_actions = []
    
    for rule in sorted_rules:
        passed = evaluate_rule(rule, facts)
        res = {
            "rule_id": rule.id,
            "passed": passed
        }
        if passed:
            res["action"] = rule.action
            triggered_actions.append(rule.action)
            
        results.append(res)
        
    return results, triggered_actions
