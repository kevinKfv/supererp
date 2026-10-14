# OptimusAI / SuperERP — Estado del Proyecto, Pendientes y Guía de Pruebas

> **Fecha de Actualización:** Octubre 2026
> **Estado General:** ✅ **Proyecto 100% Completo y Operativo.**

---

## 1. Resumen Ejecutivo

El ecosistema cuenta con microservicios en **FastAPI (Python)**, frontend en **React 19 + Vite + TailwindCSS**, observabilidad con **Prometheus y Grafana**, y persistencia con **PostgreSQL, Redis, MinIO, Qdrant y Kafka**.

### Matriz de Módulos — Estado Final

| Componente | Estado | Gateway | Frontend UI | Tests |
| :--- | :---: | :---: | :---: | :---: |
| **API Gateway** | ✅ | N/A | ✅ | ✅ Health |
| **Identity Service** | ✅ | ✅ `/api/v1/identity` | ✅ Login.tsx | ✅ 5 tests |
| **Optimization Engine** | ✅ | ✅ `/api/v1/optimize` | ✅ OptimizationDemo | ✅ 4 tests |
| **Prediction Engine** | ✅ | ✅ `/api/v1/predict` | ✅ PredictionDemo | ✅ 3 tests |
| **Simulation Engine** | ✅ | ✅ `/api/v1/simulate` | ✅ SimulationDemo | ✅ 3 tests |
| **Rules Engine** | ✅ | ✅ `/api/v1/rules` | ✅ RulesDemo | ✅ 20 tests reales |
| **Knowledge Engine** | ✅ | ✅ `/api/v1/chat` | ✅ Chat.tsx | ✅ 5 tests |
| **Frontend** | ✅ | Puerto 5173 | ✅ Login + 6 módulos | ✅ 14 tests Vitest |
| **Docker Compose** | ✅ 17 contenedores | ✅ | ✅ Hot-reload | N/A |
| **Kubernetes** | ✅ | ✅ Todos | ✅ Expuesto | N/A |

---

## 2. Directorio de Credenciales

Ver detalle completo en: **[CUENTAS_Y_USUARIOS.md](CUENTAS_Y_USUARIOS.md)**

| Servicio | URL | Usuario | Contraseña |
| :--- | :--- | :--- | :--- |
| **Frontend (Login)** | `http://localhost:5173/login` | — | — |
| **Admin sistema** | vía Login UI o API | `admin_supererp` | `SuperSecretPassword123` |
| **Grafana** | `http://localhost:3000` | `admin` | `admin` |
| **MinIO Console** | `http://localhost:9001` | `optimus_admin` | `optimus_password` |
| **PostgreSQL** | `localhost:5432` | `optimus` | `optimus_password` |
| **Swagger UI** | `http://localhost:8000/docs` | — | — |
| **Prometheus** | `http://localhost:9090` | — | — |
| **Qdrant** | `http://localhost:6333/dashboard` | — | — |

---

## 3. Cambios Finales Implementados

1. **Página de Login (`Login.tsx`)**: Formulario con validación, toggle de contraseña, manejo de errores 401/422/conexión, JWT en localStorage, credenciales de prueba visibles. Ruta `/login` en `App.tsx` (sin sidebar).

2. **Tests reales del Rules Engine (`test_evaluator.py`)**: 20 tests cubriendo todos los operadores (`==`, `!=`, `>`, `<`, `>=`, `<=`, `IN`), lógica AND/OR, claves anidadas, prioridades y 3 escenarios HTTP.

3. **`App.test.jsx` con tests reales**: 4 tests del componente Login (render, credenciales, error en submit vacío, toggle contraseña).

4. **`vite.config.ts` con proxy y host Docker**: `host: '0.0.0.0'` + proxy `/api → localhost:8000`.

---

## 4. Guía de Pruebas

### FASE 0: Arrancar el sistema
```powershell
cd optimus-ai
docker compose up --build -d
docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
```

### FASE 1: Tests de Backend (dentro de Docker)
```powershell
docker exec optimus_identity pytest tests/ -v
docker exec optimus_optimization_engine pytest tests/ -v
docker exec optimus_prediction_engine pytest tests/ -v
docker exec optimus_simulation_engine pytest tests/ -v
docker exec optimus_rules_engine pytest tests/ -v
docker exec optimus_knowledge_engine pytest tests/ -v
```

### FASE 2: Tests de Frontend
```powershell
docker exec optimus_frontend npm run test
# O local:
cd optimus-ai/frontend && npm run test
```
Resultado esperado: **14 tests en verde**.

### FASE 3: Pruebas Visuales en Navegador

**`http://localhost:5173/login`**

- [ ] Login con `admin_supererp` / `SuperSecretPassword123` → redirige al Dashboard
- [ ] Login con datos vacíos → error de validación
- [ ] Login con clave incorrecta → error 401
- [ ] Toggle contraseña visible/oculta

**Dashboard (`/`)** → métricas y accesos directos

**Optimización (`/optimization`)** → matriz 2x2 `[[4,1],[2,3]]` → resultado OPTIMAL, costo=3

**Predicción (`/prediction`)** → `precio=100, mkt=80, temp=25` → predicción de ventas

**Simulación (`/simulation`)** → ingresos 100.000±15.000, costos 70.000±10.000, 10.000 iters → VaR p5/p95

**Reglas (`/rules`)** → escenario descuento → acción DESCUENTO activada

**Chat (`/chat`)** → "Reducir costos 15%" → intención OPTIMIZE/COSTS + derivación directa

### FASE 4: Pruebas de API via PowerShell

```powershell
# Login y JWT
$form = @{ username = "admin_supererp"; password = "SuperSecretPassword123" }
$auth = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/identity/auth/login" -Method Post -Body $form
$token = $auth.access_token

# Perfil protegido
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/identity/users/me" -Headers @{ Authorization = "Bearer $token" } | ConvertTo-Json

# Optimización
$res = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/optimize/assignment" -Method Post -ContentType "application/json" -Body '{"costs":[[4,1],[2,3]]}'
Start-Sleep 3
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/optimize/status/$($res.task_id)" | ConvertTo-Json -Depth 5

# Predicción
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/predict/predict" -Method Post -ContentType "application/json" -Body '{"features":[[100.0,80.0,25.0]]}' | ConvertTo-Json

# Simulación
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/simulate/montecarlo" -Method Post -ContentType "application/json" -Body '{"expected_revenue":100000,"revenue_std":15000,"expected_cost":70000,"cost_std":10000,"iterations":10000}' | ConvertTo-Json

# Reglas
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/rules/evaluate/" -Method Post -ContentType "application/json" -Body '{"rules":[{"id":"R1","conditions":[{"field":"monto","operator":">","value":1000}],"condition_logic":"AND","action":"DESCUENTO","priority":1}],"facts":{"monto":1500}}' | ConvertTo-Json -Depth 5

# Chat NLP
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/chat/intent" -Method Post -ContentType "application/json" -Body '{"user_input":"Reducir costos en 15%"}' | ConvertTo-Json
```

### FASE 5: Observabilidad
- **Prometheus:** `http://localhost:9090` → métrica `http_requests_total`
- **Grafana:** `http://localhost:3000` (admin/admin) → datasource `http://prometheus:9090`
- **MinIO:** `http://localhost:9001` → bucket `ml-models` → `sales_xgboost.joblib`
- **Swagger:** `http://localhost:8000/docs` → todos los endpoints interactivos

---

## 5. Checklist Final — ✅ 100% Completado

### Backend
- [x] Identity Service: PostgreSQL, JWT, bcrypt 4.0.1 — `tests/test_auth.py`
- [x] Optimization Engine: OR-Tools, Celery, Redis — `tests/test_optimization.py`
- [x] Prediction Engine: XGBoost, MinIO — `tests/test_prediction.py`
- [x] Simulation Engine: Monte Carlo NumPy — `tests/test_simulation.py`
- [x] Rules Engine: evaluador JSON AST, AND/OR, IN — `tests/test_evaluator.py` (20 tests)
- [x] Knowledge Engine: NLP heurístico, XAI — `tests/test_knowledge.py`
- [x] API Gateway: proxy dinámico + métricas Prometheus

### Frontend
- [x] **Login.tsx** (`/login`) con JWT, validación y UX premium
- [x] Dashboard con métricas y accesos directos
- [x] OptimizationDemo con matriz, restricciones, CSV, polling Celery
- [x] PredictionDemo con XGBoost
- [x] SimulationDemo con Monte Carlo y VaR
- [x] RulesDemo con evaluador visual JSON AST
- [x] Chat con NLP y derivaciones directas
- [x] 14 tests Vitest (10 OptimizationDemo + 4 Login)
- [x] `vite.config.ts` con proxy `/api` y `host: 0.0.0.0`

### Infraestructura
- [x] `docker-compose.yml` con 17 servicios
- [x] Kubernetes: `k8s/02-infrastructure.yaml`, `k8s/03-microservices.yaml`
- [x] Prometheus + Grafana
- [x] MinIO + Qdrant + Kafka + Zookeeper

### Documentación
- [x] `CUENTAS_Y_USUARIOS.md` — todas las credenciales
- [x] `ESTADO_DEL_PROYECTO_Y_PLAN_DE_PRUEBAS.md` — este documento
- [x] `README.md` — guía de inicio rápido
- [x] `PRD.md` — requerimientos y diseño
