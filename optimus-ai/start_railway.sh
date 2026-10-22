#!/bin/sh
set -e

echo "=== Iniciando Backend Unificado de OptimusAI para Railway ==="

# 1. Iniciar Identity Service en puerto 8001
echo "[1/7] Iniciando Identity Service (puerto 8001)..."
cd /app/services/identity-service
uvicorn app.main:app --host 127.0.0.1 --port 8001 &

# 2. Iniciar Optimization Engine en puerto 8002
echo "[2/7] Iniciando Optimization Engine (puerto 8002)..."
cd /app/services/optimization-engine
uvicorn app.main:app --host 127.0.0.1 --port 8002 &

# 3. Iniciar Celery Worker para optimizaciones en segundo plano
echo "[3/7] Iniciando Celery Worker..."
celery -A app.worker:celery_app worker --loglevel=info --concurrency=2 &

# 4. Iniciar Prediction Engine en puerto 8003
echo "[4/7] Iniciando Prediction Engine (puerto 8003)..."
cd /app/services/prediction-engine
uvicorn app.main:app --host 127.0.0.1 --port 8003 &

# 5. Iniciar Simulation Engine en puerto 8004
echo "[5/7] Iniciando Simulation Engine (puerto 8004)..."
cd /app/services/simulation-engine
uvicorn app.main:app --host 127.0.0.1 --port 8004 &

# 6. Iniciar Rules Engine en puerto 8005
echo "[6/7] Iniciando Rules Engine (puerto 8005)..."
cd /app/services/rules-engine
uvicorn app.main:app --host 127.0.0.1 --port 8005 &

# 7. Iniciar Knowledge Engine en puerto 8006
echo "[7/7] Iniciando Knowledge Engine (puerto 8006)..."
cd /app/services/knowledge-engine
uvicorn app.main:app --host 127.0.0.1 --port 8006 &

# Configurar variables internas para el Gateway
export IDENTITY_SERVICE_URL="http://127.0.0.1:8001"
export OPTIMIZATION_ENGINE_URL="http://127.0.0.1:8002"
export PREDICTION_ENGINE_URL="http://127.0.0.1:8003"
export SIMULATION_ENGINE_URL="http://127.0.0.1:8004"
export RULES_ENGINE_URL="http://127.0.0.1:8005"
export KNOWLEDGE_ENGINE_URL="http://127.0.0.1:8006"

# Iniciar API Gateway en el puerto público de Railway ($PORT o 8000)
echo "=== Iniciando API Gateway en el puerto ${PORT:-8000} ==="
cd /app/services/gateway-service
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
