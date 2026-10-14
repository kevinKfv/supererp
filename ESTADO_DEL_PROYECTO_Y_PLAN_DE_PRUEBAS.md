# OptimusAI / SuperERP — Estado del Proyecto, Pendientes y Guía de Pruebas

> **Fecha de Elaboración:** Octubre 2026  
> **Alcance:** Diagnóstico integral de arquitectura, microservicios, frontend, infraestructura y aseguramiento de calidad (QA).  
> **Estado General:** **Prototipo Funcional Avanzado (PoC / MVP Parcial)**. La base de microservicios, el orquestador Docker, el motor matemático OR-Tools, el modelo predictivo en MinIO, el simulador de Monte Carlo y el frontend React están operativos, pero faltan integraciones críticas (autenticación persistente, UI para todos los motores y cobertura de tests de backend) para considerarse un producto finalizado y listo para producción.

---

## 1. Resumen Ejecutivo del Estado Actual

El sistema está compuesto por una arquitectura distribuida de microservicios en **FastAPI (Python)**, un frontend moderno en **React 19 + Vite + TailwindCSS**, observabilidad con **Prometheus y Grafana**, y almacenamiento/procesamiento con **PostgreSQL, Redis, MinIO, Qdrant y Kafka**.

### Resumen de Módulos Implementados vs. Pendientes

| Componente | Estado Operativo | Integrado en Gateway | Interfaz en Frontend | Persistencia Real | Tests Automatizados |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **API Gateway** | ✅ Operativo | N/A | ✅ Conectado | N/A | ⚠️ Básicos (1 test) |
| **Identity Service** | ⚠️ Con Bugs | ❌ Desalineado | ❌ Inexistente | ❌ En memoria | ⚠️ Solo unitarios mock |
| **Optimization Engine** | ✅ Operativo | ✅ Funcional | ✅ Muy completa | ✅ Redis (tareas Celery) | ❌ Sin tests (0 tests) |
| **Prediction Engine** | ✅ Operativo | ✅ Funcional | ⚠️ Solo demo fija | ✅ MinIO (`.joblib`) | ❌ Sin tests (0 tests) |
| **Simulation Engine** | ✅ Operativo | ✅ Funcional | ❌ Inexistente | N/A (en memoria) | ❌ Sin tests (0 tests) |
| **Rules Engine** | ✅ Operativo | ✅ Funcional | ❌ Inexistente | N/A (en memoria) | ✅ Evaluador (1 test) |
| **Knowledge Engine** | ✅ Operativo | ✅ Funcional | ✅ Chat básico | ❌ Sin RAG / Qdrant | ❌ Sin tests (0 tests) |
| **Dashboard UI** | ✅ Operativo | ❌ No conectado | ✅ Vistas y estilo | ❌ Datos mock/fijos | ✅ 10 tests vitest |
| **Docker Compose** | ✅ 17 Contenedores UP | ✅ Configurado | ✅ Puerto 5173 | ✅ Volúmenes montados | N/A |
| **Kubernetes (k8s)** | ⚠️ Incompleto | ⚠️ Solo 3 servicios | ⚠️ Manifiesto básico | ⚠️ Sin storage class | N/A |

---

## 2. ¿Qué Falta de Todo lo Hecho para Terminar el Proyecto?

A continuación se detallan los faltantes técnicos y funcionales organizados por criticidad:

### 2.1. Bloqueantes y Errores Activos (Prioridad Crítica)

1. **Reparar el Identity Service (Autenticación rota)**:
   - **Bug de Bcrypt**: La librería `passlib[bcrypt]` falla con error `ValueError: password cannot be longer than 72 bytes` debido a una incompatibilidad con versiones recientes de `bcrypt`. Requiere fijar `bcrypt<=4.0.1` en `requirements.txt`.
   - **Falta de Persistencia**: Actualmente utiliza un diccionario en memoria (`fake_users_db = {}`). Si el contenedor se reinicia, todos los usuarios se borran. Debe conectarse a `optimus_postgres` con SQLAlchemy y migraciones Alembic.
   - **Desajuste de Rutas en Gateway**: El Gateway reenvía a `/api/v1/identity/{path}`, pero `identity-service` expone directamente `/auth/register` y `/auth/login`, provocando respuestas `404 Not Found`.

2. **Flujo de Autenticación y Cierre de Sesión en el Frontend**:
   - No existen pantallas de `/login` ni `/register` en el frontend.
   - El usuario actual mostrado en la barra lateral es un mock estático ("Admin User" / "Enterprise Plan").
   - El frontend debe almacenar el token JWT (en `localStorage` o `sessionStorage`) y enviarlo en el header `Authorization: Bearer <token>`.

3. **Seguridad y Validación en el Gateway**:
   - Actualmente el Gateway pasa cualquier petición sin validar identidad ni permisos. Debe validar los tokens JWT antes de enrutar peticiones protegidas.

---

### 2.2. Módulos Backend sin Interfaz de Usuario (Prioridad Alta)

4. **Interfaz para el Motor de Simulación (`simulation-engine`)**:
   - El endpoint `/api/v1/simulate/montecarlo` funciona perfectamente en el backend, pero el analista de negocio no tiene una pantalla en el frontend donde ingresar:
     - Ingresos esperados e incertidumbre (desviación estándar).
     - Costos esperados e incertidumbre.
     - Número de iteraciones (ej. 10.000).
     - Visualización gráfica de la distribución de rentabilidad, percentil 5 (VaR), percentil 95 y probabilidad de pérdida.

5. **Interfaz para el Motor de Reglas (`rules-engine`)**:
   - El endpoint `/api/v1/rules/evaluate/` evalúa condiciones dinámicas basadas en JSON AST, pero en el frontend no hay interfaz para crear reglas, cargar datos de negocio (facts) ni inspeccionar qué reglas se dispararon.

6. **Dashboard Conectado a Métricas Reales**:
   - La pantalla principal (`/`) tiene 4 tarjetas y un listado de actividad con datos hardcodeados en JavaScript.
   - Falta un endpoint en el backend (o en el Gateway) que consulte la cantidad real de optimizaciones resueltas, modelos entrenados en MinIO y salud de los servicios.

7. **Extensión de la Pantalla de Predicción**:
   - Actualmente `PredictionDemo.tsx` solo permite predecir una fila de prueba fija (`[100.0, 80.0, 25.0]`).
   - Falta permitir al usuario ingresar sus propios valores (precio, marketing, temperatura) o cargar un archivo CSV con múltiples filas.

8. **Conexión Real del Asistente (Knowledge Engine)**:
   - El chat clasifica la intención (ej. "reducir costos en 15%"), pero la respuesta dice *"Enviaré estos parámetros al Optimization Engine..."* y en la realidad **no ejecuta ninguna acción**.
   - Falta un botón de confirmación en el chat que diga: *"¿Deseas enviar este problema al motor de optimización?"* y redireccione o dispare la tarea en Celery.

---

### 2.3. Infraestructura, DevOps y Calidad (Prioridad Media)

9. **Completar Manifiestos de Kubernetes (`optimus-ai/k8s/`)**:
   - `03-microservices.yaml` solo tiene `gateway-service`, `identity-service` y `knowledge-engine`.
   - Faltan los manifiestos de: `optimization-engine`, `optimization-worker`, `prediction-engine`, `simulation-engine`, `rules-engine` y `minio`.

10. **Cobertura de Pruebas Automatizadas en Backend**:
    - `optimization-engine`, `prediction-engine`, `simulation-engine` y `knowledge-engine` tienen **0 tests unitarios**.
    - El pipeline de CI en GitHub Actions (`.github/workflows/ci.yml`) actualmente omite estos servicios con un `echo "No tests found yet"`.

11. **Limpieza de Componentes Huérfanos**:
    - **Kafka y Zookeeper**: Están levantados y consumiendo memoria en Docker Compose, pero ningún microservicio envía ni lee eventos de Kafka. (O se implementa un bus de eventos real para auditoría o se retiran para aligerar la infraestructura).
    - **Qdrant**: La base de datos vectorial está activa, pero el Knowledge Engine utiliza expresiones regulares en lugar de embeddings y búsqueda vectorial (RAG).

---

## 3. Guía Integral de Pruebas: ¿Qué y Cómo Probar?

Para verificar el sistema paso a paso y garantizar que todo funcione correctamente, sigue estas 4 fases de prueba:

---

### FASE 1: Verificación de Infraestructura y Servicios (Docker)

Verifica que los 17 contenedores estén activos y saludables:

```powershell
# 1. Verificar estado de los contenedores
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

#### Puntos de chequeo esperados:
- [ ] **Optimus Frontend**: Activo en `http://localhost:5173`.
- [ ] **Optimus Gateway**: Activo en `http://localhost:8000`.
- [ ] **Prometheus**: Activo en `http://localhost:9090` -> Abrir en navegador y verificar en `Status -> Targets` que `gateway-service` esté en estado `UP`.
- [ ] **Grafana**: Activo en `http://localhost:3000` -> Login inicial: `admin / admin`.
- [ ] **MinIO Console**: Activo en `http://localhost:9001` -> Login: `optimus_admin / optimus_password`. Verificar la existencia del bucket `ml-models`.
- [ ] **Redis**: Puerto 6379 respondiendo al worker de Celery.
- [ ] **PostgreSQL**: Puerto 5432 accesible.

---

### FASE 2: Pruebas de Microservicios Backend (vía Gateway)

Todas las pruebas deben apuntar al API Gateway en el puerto `8000`:

#### 1. Verificación del Gateway
```powershell
curl.exe -s http://127.0.0.1:8000/health
```
*Resultado esperado:* `{"status":"ok","service":"gateway-service"}`

---

#### 2. Prueba del Motor de Optimización (OR-Tools + Celery + Redis)
Encolar un problema de asignación de trabajadores a tareas con matriz de costos:
```powershell
$body = '{"costs":[[4,1],[2,3]]}'
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/optimize/assignment" -Method Post -ContentType "application/json" -Body $body
$taskId = $response.task_id
Write-Host "Tarea encolada con ID: $taskId"
```
Consultar el resultado procesado por el worker de Celery:
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/optimize/status/$taskId" -Method Get | ConvertTo-Json -Depth 5
```
*Resultado esperado:* `status: "SUCCESS"`, `total_cost: 3.0`, asignación óptima de Trabajador 0 a Tarea 1 (costo 1.0) y Trabajador 1 a Tarea 0 (costo 2.0).

---

#### 3. Prueba del Motor Predictivo (XGBoost + MinIO)
Entrenar el modelo de ventas y persistirlo en MinIO:
```powershell
$trainBody = '{}'
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/predict/train" -Method Post -ContentType "application/json" -Body $trainBody | ConvertTo-Json
```
*Resultado esperado:* `status: "Trained"`, `model_uploaded_to_minio: true`.

Realizar una inferencia con variables de entrada `[precio: 100, marketing: 80, temperatura: 25]`:
```powershell
$predictBody = '{"features":[[100.0, 80.0, 25.0]]}'
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/predict/predict" -Method Post -ContentType "application/json" -Body $predictBody | ConvertTo-Json
```
*Resultado esperado:* Arreglo con la predicción numérica calculada (aprox. `284.94`).

---

#### 4. Prueba del Motor de Simulación (Monte Carlo)
Simular 10.000 escenarios de rentabilidad:
```powershell
$simBody = '{"expected_revenue": 100000, "revenue_std": 15000, "expected_cost": 70000, "cost_std": 10000, "iterations": 10000}'
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/simulate/montecarlo" -Method Post -ContentType "application/json" -Body $simBody | ConvertTo-Json
```
*Resultado esperado:* Cálculo de `mean_profitability` (aprox. 30.000), percentiles `worst_case_p5`, `best_case_p95` y `probability_of_loss_percent` (aprox. 4.9%).

---

#### 5. Prueba del Motor de Reglas (JSON AST)
Evaluar regla de negocio con condición de descuento:
```powershell
$ruleBody = '{"rules":[{"id":"R1","conditions":[{"field":"amount","operator":">","value":1000}],"condition_logic":"AND","action":"APPLY_DISCOUNT","priority":1}],"facts":{"amount":1500}}'
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/rules/evaluate/" -Method Post -ContentType "application/json" -Body $ruleBody | ConvertTo-Json -Depth 5
```
*Resultado esperado:* `results[0].passed: true`, `triggered_actions: ["APPLY_DISCOUNT"]`.

---

#### 6. Prueba del Motor de Conocimiento / NLP
Interpretar lenguaje natural del usuario:
```powershell
$chatBody = '{"user_input":"Reducir costos de logistica en 15%"}'
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/chat/intent" -Method Post -ContentType "application/json" -Body $chatBody | ConvertTo-Json
```
*Resultado esperado:* `intent: "OPTIMIZE"`, `target: "COSTS"`, `percentage: 15`, y texto de explicación XAI generado.

---

### FASE 3: Pruebas de Interfaz de Usuario (Frontend)

Abrir en el navegador: **`http://localhost:5173`**

#### 1. Navegación y Responsive
- [ ] Verificar que la barra lateral permita navegar entre **Inicio**, **Optimización**, **Predicción** e **Interpretar instrucciones**.
- [ ] Reducir la ventana a resolución móvil (< 768px) y comprobar que el menú hamburguesa abra y cierre sin romper la maquetación ni generar scroll horizontal.

#### 2. Módulo de Optimización (`/optimization`)
- [ ] **Validación de entradas**: Dejar celdas vacías o ingresar texto no numérico y comprobar que el botón de cálculo se deshabilite y marque el error visual.
- [ ] **Restricciones de asignación**: Marcar un trabajador como no compatible para cierta tarea y comprobar el cálculo de factibilidad.
- [ ] **Importación CSV**: Cargar un archivo `.csv` con matriz de costos y verificar que la grilla se llene automáticamente.
- [ ] **Resolución**: Hacer clic en *"Calcular asignación"*, observar el estado de carga (`PENDING`), el polling hacia el backend y la presentación final de la asignación óptima con el costo total.

#### 3. Módulo de Predicción (`/prediction`)
- [ ] Pulsar en *"Calcular predicción"*.
- [ ] Comprobar que el spinner de carga aparezca durante la petición a `/api/v1/predict/predict`.
- [ ] Verificar que muestre el valor numérico estimado en unidades de ventas.

#### 4. Módulo de Chat / Conocimiento (`/chat`)
- [ ] Enviar la instrucción: *"Necesito reducir costos de transporte un 20%"*.
- [ ] Comprobar que aparezca la burbuja de respuesta con la explicación y el acordeón con el JSON de la intención extraída.

#### 5. Ejecución de Tests Automatizados de Frontend
Correr la suite de pruebas unitarias dentro del contenedor frontend:
```powershell
docker exec optimus_frontend npm run test
```
*Resultado esperado:* 2 archivos pasados, 10 pruebas pasadas en Vitest.

---

### FASE 4: Pruebas de Carga y Resiliencia

#### 1. Prueba de Carga con k6
Ejecutar prueba de estrés sobre el Gateway:
```powershell
# Si tienes k6 instalado en la máquina o en Docker
docker run --rm -i -v "${PWD}/tests/load:/scripts" --network="host" grafana/k6 run /scripts/gateway_load_test.js
```

#### 2. Pruebas de Caos / Resiliencia
- [ ] **Caída de Redis**: Ejecutar `docker stop optimus_redis`. Encolar una optimización desde el frontend y verificar que muestre un mensaje de error claro y no quede en carga infinita. Reiniciar con `docker start optimus_redis`.
- [ ] **Caída del Worker**: Ejecutar `docker stop optimus_optimization_worker`. Encolar una tarea y observar que quede en estado `PENDING`. Al iniciar nuevamente el contenedor con `docker start optimus_optimization_worker`, el worker debe tomar la tarea pendiente y finalizarla.

---

## 4. Checklist de Cierre para Considerar el Proyecto "Terminado"

Usa esta lista de verificación para saber exactamente qué falta antes de dar el proyecto por concluido:

- [ ] **1. Identidad & Seguridad**:
  - [ ] Pin `bcrypt<=4.0.1` en `identity-service/requirements.txt` y reconstruir contenedor.
  - [ ] Configurar modelos SQLAlchemy y tabla de usuarios en PostgreSQL.
  - [ ] Homogeneizar rutas del Gateway para que `/api/v1/identity/auth/*` funcione.
  - [ ] Agregar vista de Login/Registro en el frontend y guardar el token JWT.
- [ ] **2. Nuevas Pantallas de Frontend**:
  - [ ] Crear pantalla de **Simulación de Monte Carlo** (entradas numéricas y gráficos de riesgo).
  - [ ] Crear pantalla de **Evaluación de Reglas de Negocio**.
  - [ ] Enriquecer el **Dashboard** con datos en tiempo real de los servicios.
- [ ] **3. Integración del Asistente**:
  - [ ] Conectar la respuesta del Chat a la creación de tareas reales de optimización o simulación.
- [ ] **4. Aseguramiento de Calidad (Backend Tests)**:
  - [ ] Agregar `tests/test_optimization.py` en `optimization-engine`.
  - [ ] Agregar `tests/test_prediction.py` en `prediction-engine`.
  - [ ] Agregar `tests/test_simulation.py` en `simulation-engine`.
  - [ ] Agregar `tests/test_chat.py` en `knowledge-engine`.
  - [ ] Actualizar CI en GitHub Actions para exigir que todos los tests pasen.
- [ ] **5. Manifiestos de Kubernetes**:
  - [ ] Completar los archivos YAML en `optimus-ai/k8s/` con todos los microservicios restantes.
