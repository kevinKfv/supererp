# OptimusAI / SuperERP — Estado del Proyecto, Pendientes y Guía de Pruebas

> **Fecha de Actualización:** Octubre 2026  
> **Alcance:** Diagnóstico integral de arquitectura, microservicios, frontend, infraestructura, directorio de cuentas y aseguramiento de calidad (QA).  
> **Estado General:** **Sistema Consolidado y Operativo**. Se resolvieron los bloqueantes críticos del Identity Service (persistencia en PostgreSQL, resolución de rutas y bug de bcrypt), se construyeron las interfaces de usuario para Simulación y Reglas, se añadieron tests unitarios para todos los motores de backend y se completaron los manifiestos de Kubernetes.

---

## 1. Resumen Ejecutivo del Estado del Sistema

El ecosistema cuenta con una arquitectura distribuida de microservicios en **FastAPI (Python)**, un frontend empresarial en **React 19 + Vite + TailwindCSS**, observabilidad con **Prometheus y Grafana**, y persistencia/procesamiento con **PostgreSQL, Redis, MinIO, Qdrant y Kafka**.

### Matriz de Módulos Implementados

| Componente | Estado Operativo | Integrado en Gateway | Interfaz en Frontend | Persistencia Real | Tests Automatizados |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **API Gateway** | ✅ Operativo | N/A | ✅ Conectado | N/A | ✅ Test de salud y rutas |
| **Identity Service** | ✅ **Corregido** | ✅ Rutas `/api/v1/identity` | ⚠️ Login pendiente en UI | ✅ **PostgreSQL** (`users`) | ✅ Auth unit tests |
| **Optimization Engine** | ✅ Operativo | ✅ Funcional | ✅ [OptimizationDemo.tsx](optimus-ai/frontend/src/pages/OptimizationDemo.tsx) | ✅ Redis (Celery) | ✅ **[test_optimization.py](optimus-ai/services/optimization-engine/tests/test_optimization.py)** |
| **Prediction Engine** | ✅ Operativo | ✅ Funcional | ✅ [PredictionDemo.tsx](optimus-ai/frontend/src/pages/PredictionDemo.tsx) | ✅ MinIO (`sales_xgboost.joblib`) | ✅ **[test_prediction.py](optimus-ai/services/prediction-engine/tests/test_prediction.py)** |
| **Simulation Engine** | ✅ Operativo | ✅ Funcional | ✅ **[SimulationDemo.tsx](optimus-ai/frontend/src/pages/SimulationDemo.tsx)** | N/A (NumPy vectorizado) | ✅ **[test_simulation.py](optimus-ai/services/simulation-engine/tests/test_simulation.py)** |
| **Rules Engine** | ✅ Operativo | ✅ Funcional | ✅ **[RulesDemo.tsx](optimus-ai/frontend/src/pages/RulesDemo.tsx)** | N/A (Evaluador JSON AST) | ✅ Evaluador y reglas |
| **Knowledge Engine** | ✅ Operativo | ✅ Funcional | ✅ [Chat.tsx](optimus-ai/frontend/src/pages/Chat.tsx) (con acciones) | N/A (NLP heurístico) | ✅ **[test_knowledge.py](optimus-ai/services/knowledge-engine/tests/test_knowledge.py)** |
| **Dashboard UI** | ✅ Operativo | ✅ Conectado | ✅ Centro de Control | N/A | ✅ 10 tests Vitest |
| **Docker Compose** | ✅ 17 Contenedores UP | ✅ Configurado | ✅ Puerto 5173 | ✅ Volúmenes montados | N/A |
| **Kubernetes (k8s)** | ✅ **Completado** | ✅ Todos los servicios | ✅ Frontend expuesto | ✅ MinIO & Postgres | N/A |

---

## 2. Directorio de Accesos, Cuentas y Credenciales

Para consultar el listado detallado de todas las cuentas, usuarios, contraseñas y puertos, consulta el documento:  
👉 **[CUENTAS_Y_USUARIOS.md](CUENTAS_Y_USUARIOS.md)**

### Resumen de Credenciales Clave:
* **Administrador del Sistema (Identity Service / API):**
  * Usuario: `admin_supererp`
  * Correo: `admin@supererp.com`
  * Contraseña: `SuperSecretPassword123`
  * Endpoint Login: `http://localhost:8000/api/v1/identity/auth/login`
* **Grafana:** `http://localhost:3000` | Usuario: `admin` | Password: `admin`
* **MinIO Console:** `http://localhost:9001` | Usuario: `optimus_admin` | Password: `optimus_password`
* **PostgreSQL:** `localhost:5432` | Base: `optimus_identity` | Usuario: `optimus` | Password: `optimus_password`
* **Frontend Web:** `http://localhost:5173` (Acceso directo a todos los módulos)

---

## 3. Mejoras y Correcciones Recientes Realizadas

1. **Reparación de Identity Service**:
   * Se fijó `bcrypt==4.0.1` en `requirements.txt` y se implementó truncamiento defensivo a 72 bytes en `security.py`.
   * Se configuró persistencia real con SQLAlchemy conectando a PostgreSQL (`optimus_postgres`), con creación automática de la tabla `users`.
   * Se alinearon las rutas del servicio bajo el prefijo `/api/v1/identity`, permitiendo registro, login y consulta de `/users/me` a través del API Gateway (`http://localhost:8000`).
2. **Nuevas Pantallas de Frontend**:
   * **Simulación Monte Carlo ([SimulationDemo.tsx](optimus-ai/frontend/src/pages/SimulationDemo.tsx))**: Permite configurar escenarios, ejecutar miles de iteraciones vectorizadas, visualizar percentiles de riesgo (VaR 95%) y probabilidad de pérdida.
   * **Reglas de Negocio ([RulesDemo.tsx](optimus-ai/frontend/src/pages/RulesDemo.tsx))**: Permite cargar casos de negocio (descuentos, prevención de fraude, logística) y evaluar reglas JSON AST contra hechos en tiempo real.
   * **Navegación y Rutas**: Integración de `/simulation` y `/rules` en `App.tsx` y en el menú de navegación de `Layout.tsx`.
   * **Acciones en Chat**: Botones de derivación directa en `Chat.tsx` que permiten pasar de una intención detectada al motor respectivo.
3. **Tests Automatizados de Backend**:
   * Se crearon suites de pruebas con `pytest` para `optimization-engine`, `prediction-engine`, `simulation-engine` y `knowledge-engine`.
4. **Infraestructura Cloud-Native**:
   * Se completaron los manifiestos de Kubernetes en `k8s/03-microservices.yaml` y `k8s/02-infrastructure.yaml` para soportar todo el stack (motores, Celery worker y MinIO).

---

## 4. Guía Integral de Pruebas: ¿Qué y Cómo Probar?

### FASE 1: Verificación de Contenedores y Servicios
```powershell
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```
- [x] Contenedores activos: `optimus_gateway`, `optimus_identity`, `optimus_postgres`, `optimus_redis`, `optimus_minio`, `optimus_frontend`, `optimus_grafana`, `optimus_prometheus`, etc.
- [x] Prometheus scrapeando el Gateway en `http://localhost:9090`.
- [x] Grafana disponible en `http://localhost:3000`.
- [x] MinIO Console en `http://localhost:9001` con bucket `ml-models`.

---

### FASE 2: Pruebas de Microservicios Backend (vía Gateway puerto 8000)

#### 1. Autenticación y Registro (Identity Service)
```powershell
# Registro de usuario
$body = '{"username":"nuevo_analista","email":"analista@supererp.com","password":"PasswordSegura123"}'
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/identity/auth/register" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json

# Login y obtención de JWT
$form = @{ username = "admin_supererp"; password = "SuperSecretPassword123" }
$auth = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/identity/auth/login" -Method Post -Body $form
$token = $auth.access_token

# Consulta de perfil protegido
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/identity/users/me" -Method Get -Headers $headers | ConvertTo-Json
```

#### 2. Optimización Asíncrona (OR-Tools + Celery + Redis)
```powershell
$body = '{"costs":[[4,1],[2,3]]}'
$res = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/optimize/assignment" -Method Post -ContentType "application/json" -Body $body
$taskId = $res.task_id

# Consulta del resultado
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/optimize/status/$taskId" -Method Get | ConvertTo-Json -Depth 5
```

#### 3. Predicción con Modelo en MinIO (XGBoost)
```powershell
# Inferencia con entradas [precio, marketing, temperatura]
$predBody = '{"features":[[100.0, 80.0, 25.0]]}'
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/predict/predict" -Method Post -ContentType "application/json" -Body $predBody | ConvertTo-Json
```

#### 4. Simulación Monte Carlo
```powershell
$simBody = '{"expected_revenue": 100000, "revenue_std": 15000, "expected_cost": 70000, "cost_std": 10000, "iterations": 10000}'
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/simulate/montecarlo" -Method Post -ContentType "application/json" -Body $simBody | ConvertTo-Json
```

#### 5. Reglas Dinámicas JSON AST
```powershell
$ruleBody = '{"rules":[{"id":"R1","conditions":[{"field":"monto","operator":">","value":1000}],"condition_logic":"AND","action":"DESCUENTO","priority":1}],"facts":{"monto":1500}}'
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/rules/evaluate/" -Method Post -ContentType "application/json" -Body $ruleBody | ConvertTo-Json -Depth 5
```

#### 6. Asistente NLP y Justificación XAI
```powershell
$chatBody = '{"user_input":"Reducir costos en 15%"}'
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/chat/intent" -Method Post -ContentType "application/json" -Body $chatBody | ConvertTo-Json
```

---

### FASE 3: Pruebas de Interfaz de Usuario (Frontend)

Abrir en navegador: **`http://localhost:5173`**
- [x] **Navegación**: Menú lateral completo con Inicio, Optimización, Predicción, Simulación, Reglas de Negocio y Chat.
- [x] **Optimización (`/optimization`)**: Validación de matrices, restricciones y cálculo óptimo.
- [x] **Predicción (`/prediction`)**: Consulta al modelo ML con datos de ejemplo.
- [x] **Simulación (`/simulation`)**: Ejecución de Monte Carlo con visualización de percentiles VaR y riesgo.
- [x] **Reglas de Negocio (`/rules`)**: Evaluación de reglas contra hechos y visualización de acciones activadas.
- [x] **Chat cognitivo (`/chat`)**: Extracción de intención y botones de derivación directa.
- [x] **Tests unitarios Vitest**: `docker exec optimus_frontend npm run test` (10/10 pasados).

---

## 5. Checklist de Estado del Proyecto

- [x] **1. Identidad & Seguridad**:
  - [x] Fijar `bcrypt==4.0.1` en `requirements.txt`.
  - [x] Modelos SQLAlchemy y persistencia en PostgreSQL (`optimus_postgres`).
  - [x] Rutas de Gateway `/api/v1/identity` alineadas.
  - [x] Directorio de cuentas documentado en `CUENTAS_Y_USUARIOS.md`.
- [x] **2. Nuevas Pantallas de Frontend**:
  - [x] Pantalla de **Simulación de Monte Carlo**.
  - [x] Pantalla de **Evaluación de Reglas de Negocio**.
  - [x] Centro de control actualizado con acceso a los 4 motores.
  - [x] Acciones y links directos en el Chat con IA.
- [x] **3. Cobertura de Tests en Backend**:
  - [x] `optimization-engine/tests/test_optimization.py`.
  - [x] `prediction-engine/tests/test_prediction.py`.
  - [x] `simulation-engine/tests/test_simulation.py`.
  - [x] `knowledge-engine/tests/test_knowledge.py`.
- [x] **4. Manifiestos de Kubernetes**:
  - [x] Manifiestos completos para todos los microservicios en `k8s/03-microservices.yaml`.
  - [x] Manifiesto de MinIO en `k8s/02-infrastructure.yaml`.
