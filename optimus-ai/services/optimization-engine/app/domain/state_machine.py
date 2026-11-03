from enum import Enum
from fastapi import HTTPException, status

class TaskState(str, Enum):
    DRAFT = "DRAFT"
    QUEUED = "QUEUED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"
    ARCHIVED = "ARCHIVED"

# Matriz de transiciones permitidas (Patrón State - Eje B)
VALID_TRANSITIONS = {
    TaskState.DRAFT: {TaskState.QUEUED, TaskState.CANCELLED},
    TaskState.QUEUED: {TaskState.PROCESSING, TaskState.CANCELLED},
    TaskState.PROCESSING: {TaskState.COMPLETED, TaskState.FAILED},
    TaskState.COMPLETED: {TaskState.ARCHIVED},
    TaskState.FAILED: {TaskState.ARCHIVED, TaskState.QUEUED}, # Retry
    TaskState.CANCELLED: {TaskState.ARCHIVED},
    TaskState.ARCHIVED: set() # Estado terminal
}

def transition_task_state(current_state: TaskState, new_state: TaskState) -> TaskState:
    """
    Ejecuta y valida la transición de estado de la entidad central.
    Si la transición es inválida según el patrón State, retorna 409 Conflict.
    """
    if new_state not in VALID_TRANSITIONS.get(current_state, set()):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Transición inválida de estado: No se permite cambiar de '{current_state.value}' a '{new_state.value}'."
        )
    return new_state

