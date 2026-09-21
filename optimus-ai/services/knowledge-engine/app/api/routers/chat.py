from fastapi import APIRouter, HTTPException
from app.domain.models import ChatRequest, ChatResponse
from app.infrastructure.nlp_client import nlp_client

router = APIRouter()

@router.post("/intent", response_model=ChatResponse)
async def process_chat_intent(req: ChatRequest):
    """
    Recibe lenguaje natural del usuario, extrae la intención de negocio y devuelve 
    una explicación de la decisión tomada (XAI).
    """
    try:
        # 1. Extraer la intención usando nuestro modelo NLP
        intent_result = nlp_client.extract_intent(req.user_input)
        
        # 2. Generar la justificación (Explainable AI)
        explanation = nlp_client.generate_explanation(intent_result)
        
        # En una versión completa, aquí el Knowledge Engine decidiría
        # si llama al Optimization Engine (vía HTTP/RPC) usando estos parámetros.
        
        return ChatResponse(
            original_input=req.user_input,
            extracted_intent=intent_result,
            explanation=explanation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
