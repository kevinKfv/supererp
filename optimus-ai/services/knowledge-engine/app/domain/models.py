from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class ChatRequest(BaseModel):
    user_input: str = Field(..., description="Texto en lenguaje natural ingresado por el usuario")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Contexto adicional o estado actual")

class IntentResult(BaseModel):
    intent: str = Field(..., description="La intención identificada (ej. OPTIMIZE, SIMULATE)")
    target: str = Field(..., description="El objetivo de la intención (ej. COSTS, REVENUE)")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Parámetros extraídos (ej. {'percentage': 15})")

class ChatResponse(BaseModel):
    original_input: str
    extracted_intent: IntentResult
    explanation: str = Field(..., description="XAI: Explicación en lenguaje natural de cómo la IA interpretó el comando")
