#!/bin/sh
set -e

echo "=== [Koyeb] Iniciando Backend All-in-One de OptimusAI ==="

# 1. Iniciar Redis local embebido en background (si no hay REDIS_URL externa)
if [ -z "$REDIS_URL" ] || echo "$REDIS_URL" | grep -q "localhost\|127.0.0.1"; then
    echo "[0/8] Iniciando Redis Server local en background..."
    redis-server --daemonize yes --protected-mode no --port 6379 || true
    export REDIS_URL="redis://127.0.0.1:6379/0"
fi

# Configurar fallback de base de datos a SQLite si no hay Postgres externa
if [ -z "$DATABASE_URL" ]; then
    export DATABASE_URL="sqlite:////tmp/identity.db"
fi

# 2. Iniciar Identity Service en puerto 8001
echo "[1/7] Iniciando Identity Service (puerto 8001)..."
cd /app/services/identity-service
uvicorn app.main:app --host 127.0.0.1 --port 8001 &

# 3. Iniciar Optimization Engine en puerto 8002
echo "[2/7] Iniciando Optimization Engine (puerto 8002)..."
cd /app/services/optimization-engine
uvicorn app.main:app --host 127.0.0.1 --port 8002 &

# 4. Iniciar Celery Worker para optimizaciones en segundo plano
echo "[3/7] Iniciando Celery Worker..."
celery -A app.worker:celery_app worker --loglevel=info --concurrency=1 &

# 5. Iniciar Prediction Engine en puerto 8003
echo "[4/7] Iniciando Prediction Engine (puerto 8003)..."
cd /app/services/prediction-engine
uvicorn app.main:app --host 127.0.0.1 --port 8003 &

# 6. Iniciar Simulation Engine en puerto 8004
echo "[5/7] Iniciando Simulation Engine (puerto 8004)..."
cd /app/services/simulation-engine
uvicorn app.main:app --host 127.0.0.1 --port 8004 &

# 7. Iniciar Rules Engine en puerto 8005
echo "[6/7] Iniciando Rules Engine (puerto 8005)..."
cd /app/services/rules-engine
uvicorn app.main:app --host 127.0.0.1 --port 8005 &

# 8. Iniciar Knowledge Engine en puerto 8006
echo "[7/7] Iniciando Knowledge Engine (puerto 8006)..."
cd /app/services/knowledge-engine
uvicorn app.main:app --host 127.0.0.1 --port 8006 &

# Mapear variables para el Gateway
export IDENTITY_SERVICE_URL="http://127.0.0.1:8001"
export OPTIMIZATION_ENGINE_URL="http://127.0.0.1:8002"
export PREDICTION_ENGINE_URL="http://127.0.0.1:8003"
export SIMULATION_ENGINE_URL="http://127.0.0.1:8004"
export RULES_ENGINE_URL="http://127.0.0.1:8005"
export KNOWLEDGE_ENGINE_URL="http://127.0.0.1:8006"

# Iniciar API Gateway en el puerto público ($PORT o 8000)
echo "=== Iniciando API Gateway en el puerto ${PORT:-8000} ==="
cd /app/services/gateway-service
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
