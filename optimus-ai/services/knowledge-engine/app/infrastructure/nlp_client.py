import re
from typing import Tuple
from app.domain.models import IntentResult

class LLMClientMock:
    """
    Mock que simula la extracción de intenciones mediante NLP heurístico.
    Diseñado para ser fácilmente reemplazado por un cliente real (OpenAI/LangChain) a futuro.
    """
    
    def extract_intent(self, text: str) -> IntentResult:
        text = text.lower()
        
        intent = "UNKNOWN"
        target = "UNKNOWN"
        parameters = {}
        
        # 1. Identificar la Intención (Verbos clave)
        if "reduc" in text or "baj" in text or "minimiz" in text:
            intent = "OPTIMIZE"
        elif "simul" in text or "proyect" in text or "evalu" in text:
            intent = "SIMULATE"
        elif "asign" in text or "distribu" in text:
            intent = "ASSIGN"
            
        # 2. Identificar el Objetivo (Sustantivos clave)
        if "costo" in text or "gasto" in text:
            target = "COSTS"
        elif "ventas" in text or "ingreso" in text:
            target = "REVENUE"
        elif "riesgo" in text:
            target = "RISK"
            
        # 3. Extraer parámetros (Ej. porcentajes o números)
        # Buscar algo como "15%" o "15 por ciento"
        match = re.search(r'(\d+)\s*(?:%|por ciento)', text)
        if match:
            parameters["percentage"] = int(match.group(1))
            
        return IntentResult(intent=intent, target=target, parameters=parameters)

    def generate_explanation(self, intent_result: IntentResult) -> str:
        """
        Explainable AI (XAI): Genera una justificación humana de lo que el sistema entendió.
        """
        if intent_result.intent == "OPTIMIZE" and intent_result.target == "COSTS":
            pct = intent_result.parameters.get("percentage", "un valor no especificado")
            return f"He interpretado que deseas ejecutar el motor de optimización para reducir los costos corporativos en un {pct}%. Enviaré estos parámetros al Optimization Engine y sugeriré una reasignación de recursos."
        
        if intent_result.intent == "SIMULATE":
            return "Entiendo que quieres correr una simulación de Monte Carlo para evaluar distintos escenarios. Preparando los parámetros para el Simulation Engine."
            
        return f"He recibido tu solicitud pero la intención detectada ({intent_result.intent} sobre {intent_result.target}) requiere más contexto. ¿Podrías ser más específico?"

nlp_client = LLMClientMock()
