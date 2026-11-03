from fastapi import APIRouter, Depends, HTTPException, status
from ..domain.schemas import UserResponse
from ..domain.models import User
from .auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user

# ==============================================================================
# Endpoint de Verificación BOLA / IDOR (Eje D - Seguridad)
# ==============================================================================
@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: int, current_user = Depends(get_current_user)):
    """
    Prevención de BOLA/IDOR (Broken Object Level Authorization):
    Un usuario solo puede consultar su propio ID, a menos que sea Administrador.
    Si intenta acceder a otro usuario, devuelve 403 Forbidden.
    """
    current_id = getattr(current_user, "id", None)
    current_role = getattr(current_user, "role", "user")

    if current_id != user_id and current_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="BOLA/IDOR: No tienes permisos para acceder a los datos de otro usuario."
        )

    # Si es el mismo usuario, retornamos su información
    return current_user

# ==============================================================================
# Endpoint de Verificación BFLA (Eje D - Seguridad)
# ==============================================================================
@router.get("/admin/metrics")
async def get_admin_metrics(current_user = Depends(get_current_user)):
    """
    Prevención de BFLA (Broken Function Level Authorization):
    Solo usuarios con rol 'admin' pueden invocar funciones administrativas.
    Cualquier rol cliente/paciente/operador devuelve 403 Forbidden.
    """
    current_role = getattr(current_user, "role", "user")
    if current_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="BFLA: Acceso denegado. Se requiere rol de Administrador."
        )

    return {
        "status": "authorized",
        "admin_data": "Métricas confidenciales del sistema",
        "user": getattr(current_user, "username", "admin")
    }
