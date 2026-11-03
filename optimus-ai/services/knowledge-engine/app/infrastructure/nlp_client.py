import re
from typing import Tuple
from app.domain.models import IntentResult

SYSTEM_PROMPT_SECRET = "SUPERERP_INTERNAL_SYSTEM_SECRET_KEY_NEVER_REVEAL"

class LLMClientMock:
    """
    Motor NLP con defensas de seguridad OWASP Top 10 for LLMs:
    - LLM01: Inyección de Prompt (Directa e Indirecta)
    - LLM02: Manejo Inseguro de Salidas
    - LLM06: Divulgación de Información Confidencial (Data Leakage)
    - LLM08: Excesiva Confianza / Fuera de Dominio
    """
    
    # Patrones de inyección de prompt conocidos
    PROMPT_INJECTION_PATTERNS = [
        r"ignore (all )?previous instructions",
        r"forget (your )?prompt",
        r"revela tu prompt",
        r"muestra el system prompt",
        r"dime tu prompt",
        r"system prompt secret",
        r"actua como un",
        r"jailbreak",
        r"modo desarrollador"
    ]

    # Temas fuera de dominio o peligrosos
    OUT_OF_DOMAIN_PATTERNS = [
        r"medicamento|diagnostico|medico|receta medica",
        r"crear virus|malware|hackear",
        r"transferir dinero a cuenta externa"
    ]

    def extract_intent(self, text: str, user_context: dict | None = None) -> IntentResult:
        normalized_text = text.lower()

        # 1. Defensa contra Inyección de Prompt (OWASP LLM01)
        for pattern in self.PROMPT_INJECTION_PATTERNS:
            if re.search(pattern, normalized_text):
                return IntentResult(
                    intent="SECURITY_VIOLATION",
                    target="PROMPT_INJECTION_DETECTED",
                    parameters={"blocked": True, "reason": "Intento de inyección de prompt o elusión de directivas."}
                )

        # 2. Defensa contra Pedidos Fuera de Dominio / Peligrosos (OWASP LLM08)
        for pattern in self.OUT_OF_DOMAIN_PATTERNS:
            if re.search(pattern, normalized_text):
                return IntentResult(
                    intent="OUT_OF_DOMAIN",
                    target="RESTRICTED_TOPIC",
                    parameters={"blocked": True, "reason": "Tema fuera del dominio empresarial del ERP."}
                )

        intent = "UNKNOWN"
        target = "UNKNOWN"
        parameters = {}
        
        # 3. Identificar la Intención (Verbos clave del dominio ERP)
        if "reduc" in normalized_text or "baj" in normalized_text or "minimiz" in normalized_text:
            intent = "OPTIMIZE"
        elif "simul" in normalized_text or "proyect" in normalized_text or "evalu" in normalized_text:
            intent = "SIMULATE"
        elif "asign" in normalized_text or "distribu" in normalized_text:
            intent = "ASSIGN"
            
        # 4. Identificar el Objetivo
        if "costo" in normalized_text or "gasto" in normalized_text:
            target = "COSTS"
        elif "ventas" in normalized_text or "ingreso" in normalized_text:
            target = "REVENUE"
        elif "riesgo" in normalized_text:
            target = "RISK"
            
        # 5. Extraer parámetros numéricos
        match = re.search(r'(\d+)\s*(?:%|por ciento)', normalized_text)
        if match:
            parameters["percentage"] = int(match.group(1))
            
        return IntentResult(intent=intent, target=target, parameters=parameters)

    def generate_explanation(self, intent_result: IntentResult) -> str:
        """
        Explainable AI (XAI) con validación de no-fuga de datos (Data Leakage).
        """
        if intent_result.intent == "SECURITY_VIOLATION":
            return "Solicitud bloqueada por políticas de seguridad: No está permitido solicitar el prompt del sistema ni anular las restricciones operativas."

        if intent_result.intent == "OUT_OF_DOMAIN":
            return "Solicitud fuera de dominio: OptimusAI está exclusivamente diseñado para optimización, simulación y planificación empresarial. No responde consultas médicas, legales o destructivas."

        if intent_result.intent == "OPTIMIZE" and intent_result.target == "COSTS":
            pct = intent_result.parameters.get("percentage", "un valor no especificado")
            explanation = f"He interpretado que deseas ejecutar el motor de optimización para reducir los costos corporativos en un {pct}%. Enviaré estos parámetros al Optimization Engine y sugeriré una reasignación de recursos."
            # Asegurar que nunca se filtre el secreto del sistema
            assert SYSTEM_PROMPT_SECRET not in explanation
            return explanation
        
        if intent_result.intent == "SIMULATE":
            return "Entiendo que quieres correr una simulación de Monte Carlo para evaluar distintos escenarios. Preparando los parámetros para el Simulation Engine."
            
        return f"He recibido tu solicitud pero la intención detectada ({intent_result.intent} sobre {intent_result.target}) requiere más contexto. ¿Podrías ser más específico?"

nlp_client = LLMClientMock()
