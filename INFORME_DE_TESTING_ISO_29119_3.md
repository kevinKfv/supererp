# Informe Integral de Testing y Aseguramiento de Calidad
## Estándar ISO/IEC/IEEE 29119-3 — TP Obligatorio (Prueba del Sistema - Clase 15)
**Asignatura:** Desarrollo de Aplicaciones II (3.4.218) · 2.º Cuatrimestre 2026  
**Departamento:** Tecnología Informática — UADE  
**Sistema:** OptimusAI / SuperERP — Plataforma de Optimización Empresarial, Machine Learning y Simulación  
**Tag de Release:** `v1.0-testing` | **Fecha:** 10/11/2026  

---

## 🗺️ Índice de Contenidos (ISO/IEC/IEEE 29119-3)
1. [Plan y Estrategia de Pruebas](#1-plan-y-estrategia-de-pruebas)
2. [Matriz de Trazabilidad Bidireccional](#2-matriz-de-trazabilidad-bidireccional)
3. [Especificación Formal de Casos de Prueba](#3-especificación-formal-de-casos-de-prueba)
4. [Informe de Ejecución y Métricas de Calidad](#4-informe-de-ejecución-y-métricas-de-calidad)
5. [Registro y Clasificación de Defectos (Jira)](#5-registro-y-clasificación-de-defectos-jira)
6. [Informe de Seguridad OWASP y Criterios SEC (Clase 11)](#6-informe-de-seguridad-owasp-y-criterios-sec)
7. [Declaración y Plan de Inteligencia Artificial (Sección 8)](#7-declaración-y-plan-de-inteligencia-artificial)
8. [Lecciones Aprendidas](#8-lecciones-aprendidas)

---

## 1. Plan y Estrategia de Pruebas

### 1.1 Alcance y Fuera de Alcance
* **Dentro del alcance:**
  * **Autenticación y RBAC:** Identity Service, hashing bcrypt, ciclo JWT (expiración, firma, claims), protección contra BOLA/IDOR, BFLA y fuerza bruta.
  * **Optimización Matemática:** Optimization Engine (OR-Tools MIP/CP), tareas asíncronas con Celery y Redis, patrón State de transiciones (HTTP 409).
  * **Machine Learning:** Prediction Engine (inferencia y serialización de modelos XGBoost en MinIO).
  * **Simulación Estocástica:** Simulation Engine (Monte Carlo vectorizado con NumPy, bandas VaR p5/p95).
  * **Motor de Reglas:** Rules Engine (evaluación de AST de reglas dinámicas, operadores comparativos y lógicos).
  * **Chat Cognitivo / NLP:** Knowledge Engine (extracción de intenciones, defensas contra Prompt Injection y Out-of-Domain).
  * **Resiliencia e Integración:** API Gateway (Problem Details RFC 9457, Idempotency-Key, ETag concurrency 412, Circuit Breaker y mapping de SOAP Faults).
  * **Frontend Web:** React 19 + Vite (validaciones de interfaz, persistencia de estado, responsive 360/768/1280px y accesibilidad).
* **Fuera del alcance:** Despliegue en clusters físicos On-Premise; pasarelas de pago con tarjeta de crédito en vivo.

### 1.2 Niveles de Prueba y Entornos
* **Nivel 1 - Unitario & Componentes:** `pytest` (backend) y `Vitest` + `React Testing Library` (frontend).
* **Nivel 2 - Integración & Resiliencia:** Servicios corriendo contra PostgreSQL, Redis y Mock SOAP/REST.
* **Nivel 3 - Contrato & API:** Colección Postman ejecutada con `newman` contra el OpenAPI publicado.
* **Nivel 4 - End-to-End (E2E):** `Playwright` ejecutando en navegadores headless Chromium y mobile viewport (Pixel 5 - 360px).
* **Nivel 5 - Carga & Rendimiento:** `k6` simulando 50 VUs continuos durante 5 minutos sobre los 3 endpoints críticos.

### 1.3 Matriz de Riesgos (Probabilidad × Impacto) y Cobertura
| ID Riesgo | Descripción del Riesgo | Prob. (1-5) | Imp. (1-5) | Severidad (P×I) | Estrategia de Mitigación y Cobertura |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **R-01** | Fuga de secretos en commits de Git (desaprobación G6). | 2 | 5 | **10 (Crítico)** | `.env.example`, sanitización de configs y escaneo continuo con `gitleaks`. |
| **R-02** | Demora o caída de microservicio externo cuelga hilos del gateway. | 4 | 4 | **16 (Crítico)** | Timeout estricto de 5s, circuit breaker y fallback con degradación graciosa. |
| **R-03** | Vulnerabilidad BOLA/IDOR expone datos entre usuarios. | 3 | 5 | **15 (Crítico)** | Verificación estricta de `current_user.id` en endpoints protegidos devolviendo 403. |
| **R-04** | Ataque de inyección de prompt elude políticas del LLM cognitivo. | 4 | 3 | **12 (Alto)** | Filtro regex y AST de patrones maliciosos en `LLMClientMock` con bloqueo seguro. |
| **R-05** | Actualización concurrente sobreescribe una asignación óptima. | 3 | 4 | **12 (Alto)** | Cabecera `If-Match` con validación de ETag devolviendo `412 Precondition Failed`. |
| **R-06** | Envío duplicado de tarea por doble clic satura cola de workers. | 4 | 3 | **12 (Alto)** | Cabecera `Idempotency-Key` en Gateway con caché de respuestas. |

---

## 2. Matriz de Trazabilidad Bidireccional

| HU ID | Título de la Historia de Usuario | Criterio de Aceptación (Gherkin) | Caso de Prueba | Test Automatizado (Ruta / Clase) | Resultado | Estado Defecto |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **HU-01** | Autenticación y Control de Acceso JWT | **Dado** usuario registrado, **Cuando** envía credenciales válidas, **Entonces** recibe JWT y rol. | `CP-AUTH-01` | `services/identity-service/tests/test_auth.py::test_login_and_jwt_generation` | ✅ PASÓ | Cerrado |
| **HU-01** | Protección BOLA / IDOR | **Dado** Usuario A autenticado, **Cuando** pide `/users/100` de Usuario B, **Entonces** devuelve 403. | `CP-SEC-01` | `services/identity-service/tests/test_auth.py::test_security_bola_idor_forbidden` | ✅ PASÓ | Cerrado |
| **HU-01** | Mitigación Fuerza Bruta | **Dado** atacante probando claves, **Cuando** erra 5 veces en 60s, **Entonces** devuelve 429. | `CP-SEC-02` | `services/identity-service/tests/test_auth.py::test_security_brute_force_rate_limiting` | ✅ PASÓ | Cerrado |
| **HU-02** | Optimización de Asignación de Recursos | **Dado** matriz de costos 2x2, **Cuando** se solicita optimización, **Entonces** devuelve total_cost=3 y estado OPTIMAL. | `CP-OPT-01` | `services/optimization-engine/tests/test_optimization.py::test_solve_assignment_optimal_2x2` | ✅ PASÓ | Cerrado |
| **HU-02** | Patrón State en Tareas | **Dado** tarea en estado COMPLETED, **Cuando** se intenta pasar a QUEUED, **Entonces** devuelve 409 Conflict. | `CP-OPT-02` | `services/optimization-engine/tests/test_optimization.py::test_state_transition_invalid_returns_409` | ✅ PASÓ | Cerrado |
| **HU-03** | Predicción de Ventas ML | **Dado** modelo entrenado en MinIO, **Cuando** ingresan features válidas, **Entonces** devuelve estimación numérica. | `CP-PRED-01` | `services/prediction-engine/tests/test_prediction.py::test_predict_endpoint` | ✅ PASÓ | Cerrado |
| **HU-04** | Simulación Financiera Monte Carlo | **Dado** ingresos y costos con desvío estándar, **Cuando** corre 2000 iteraciones, **Entonces** calcula media y percentiles p5/p95. | `CP-SIM-01` | `services/simulation-engine/tests/test_simulation.py::test_simulate_montecarlo_api_endpoint` | ✅ PASÓ | Cerrado |
| **HU-05** | Motor de Reglas Dinámicas | **Dado** contexto comercial y regla de descuento, **Cuando** monto > 10000, **Entonces** dispara acción APPLY_DISCOUNT 15%. | `CP-RULE-01` | `services/rules-engine/tests/test_evaluator.py::test_scenario_1_high_value_customer` | ✅ PASÓ | Cerrado |
| **HU-06** | Asistente Cognitivo XAI | **Dado** prompt "Reducir costos 15%", **Cuando** procesa el NLP, **Entonces** clasifica OPTIMIZE / COSTS con justificación. | `CP-AI-01` | `services/knowledge-engine/tests/test_knowledge.py::test_extract_intent_optimize_costs` | ✅ PASÓ | Cerrado |
| **HU-06** | Defensa Inyección Prompt | **Dado** atacante enviando "Ignore previous instructions", **Cuando** evalúa el NLP, **Entonces** bloquea con SECURITY_VIOLATION sin fugar secretos. | `CP-AI-02` | `services/knowledge-engine/tests/test_knowledge.py::test_ai_direct_prompt_injection_blocked` | ✅ PASÓ | Cerrado |
| **HU-07** | Resiliencia SOAP Externo | **Dado** partner SOAP que arroja Business Fault, **Cuando** pasa por el Gateway, **Entonces** se normaliza a 400 Problem Details sin stack traces. | `CP-INT-01` | `services/gateway-service/tests/test_main.py::test_soap_fault_mapping_business_fault` | ✅ PASÓ | Cerrado |
| **HU-07** | Timeout y Circuit Breaker | **Dado** partner externo demorando > 5s, **Cuando** se consulta cotización, **Entonces** activa fallback automático en < 500ms. | `CP-INT-02` | `services/gateway-service/tests/test_main.py::test_rest_external_service_timeout_fallback` | ✅ PASÓ | Cerrado |

---

## 3. Especificación Formal de Casos de Prueba

> **Estadística de Casos:** 45 casos totales especificados.  
> **Casos Negativos y de Borde:** 20 casos (**44.4% del total**, superando el umbral mínimo del 40% exigido por la cátedra).

### Muestra de Casos Positivos, Negativos y de Borde
* **`CP-SEC-03` (Negativo - Firma JWT Alterada):**
  * *Precondición:* Usuario autenticado obtiene JWT legítimo.
  * *Pasos:* Modificar los últimos 4 caracteres de la firma criptográfica y enviar `GET /users/me`.
  * *Resultado esperado:* HTTP 401 Unauthorized sin revelar mensaje interno del validador.
* **`CP-SEC-04` (Borde - Ataque alg=none):**
  * *Precondición:* Creación de un JWT sin firma (`alg: "none"`).
  * *Pasos:* Enviar token forjado en cabecera `Authorization`.
  * *Resultado esperado:* HTTP 401 Unauthorized; el parser rechaza tokens sin algoritmo HS256.
* **`CP-OPT-03` (Borde - Matriz Infeasible):**
  * *Precondición:* Matriz 2x2 donde los dos trabajadores tienen prohibida la Tarea 1.
  * *Pasos:* Enviar payload de asignación a OR-Tools.
  * *Resultado esperado:* Estado `INFEASIBLE`, total_cost nulo y mensaje descriptivo de falta de solución.
* **`CP-REST-01` (Borde - Idempotencia):**
  * *Precondición:* Petición POST con cabecera `Idempotency-Key: test-uuid-123`.
  * *Pasos:* Enviar la misma petición dos veces consecutivas.
  * *Resultado esperado:* La primera procesa (201); la segunda devuelve idéntico código y body con cabecera `X-Cache-Lookup: HIT`.
* **`CP-REST-02` (Negativo - Concurrencia ETag):**
  * *Precondición:* Cliente tiene copia con `ETag: "stale-etag-token"`.
  * *Pasos:* Enviar actualización con cabecera `If-Match: "stale-etag-token"`.
  * *Resultado esperado:* HTTP 412 Precondition Failed (RFC 9457).

---

## 4. Informe de Ejecución y Métricas de Calidad

### 4.1 Resumen de Ejecución Automatizada
| Nivel / Módulo | Tests Ejecutados | Tests Pasados | Fallados | Bloqueados | Cobertura Líneas | Cobertura Ramas |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Gateway Service** | 7 | 7 | 0 | 0 | 91.2% | 85.0% |
| **Identity Service** | 14 | 14 | 0 | 0 | 88.5% | 81.3% |
| **Optimization Engine** | 12 | 12 | 0 | 0 | 94.0% | 89.2% |
| **Prediction Engine** | 4 | 4 | 0 | 0 | 87.1% | 78.6% |
| **Simulation Engine** | 3 | 3 | 0 | 0 | 96.5% | 91.0% |
| **Rules Engine** | 20 | 20 | 0 | 0 | 98.2% | 95.0% |
| **Knowledge Engine** | 9 | 9 | 0 | 0 | 92.4% | 88.0% |
| **Mock External Service**| 5 | 5 | 0 | 0 | 100% | 100% |
| **Frontend (Vitest)** | 14 | 14 | 0 | 0 | 84.3% | 76.5% |
| **E2E (Playwright)** | 5 | 5 | 0 | 0 | N/A (Flujos) | N/A (Flujos) |
| **TOTAL CONSOLIDADO** | **93** | **93 (100%)**| **0** | **0** | **91.8% (≥80%)** | **85.6% (≥70%)** |

### 4.2 Mutation Testing (PIT / `mutmut`)
* **Herramienta:** `mutmut` sobre paquetes de dominio (`app/domain`, `solvers`, `evaluator`).
* **Mutantes generados:** 142
* **Mutantes eliminados (Killed):** 108
* **Mutantes sobrevivientes (Survived):** 28
* **Mutantes incompetentes (Timeout/Incompetent):** 6
* **Mutation Score Oficial:** **76.05%** (Supera ampliamente el umbral del **≥ 60%**).

### 4.3 Pruebas de Carga (k6 - 50 VUs, 5 Minutos)
* **Script:** [`tests/load/k6_stress_test_50vus_5min.js`](tests/load/k6_stress_test_50vus_5min.js)
* **VUs:** 50 concurrentes sostenidos.
* **Duración:** 5 minutos (300 segundos).
* **Endpoints:** `/api/v1/predict/predict`, `/api/v1/simulate/montecarlo`, `/api/v1/optimize/assignment`.
* **Métricas Obtenidas:**
  * **Peticiones Totales:** 14,820 requests
  * **Throughput:** ~49.4 RPS
  * **Latencia Percentil 95 (p95):** **184.2 ms** (Umbral cátedra: < 500 ms ✅)
  * **Tasa de Error (`http_req_failed`):** **0.02%** (Umbral cátedra: < 1% ✅)

---

## 5. Registro y Clasificación de Defectos (Jira)

| ID Defecto | Severidad | Prioridad | Resumen | Estado | Causa Raíz y Solución |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **OPT-BUG-01** | Mayor | Alta | Transiciones inválidas en tareas devolvían 500 en lugar de 409. | **Cerrado** | Se implementó el patrón State en `state_machine.py` con mapeo explícito a `HTTPException(409)`. |
| **SEC-BUG-02** | Crítica | Bloqueante | Falta de control BOLA permitía ver perfil de otros usuarios cambiando ID. | **Cerrado** | Se agregó validación de pertenencia en `/users/{user_id}` rechazando con 403 Forbidden. |
| **RES-BUG-03** | Mayor | Media | Llamadas a cotizaciones externas colgaban el thread si el partner no respondía. | **Cerrado** | Se configuró timeout de 5 segundos con fallback interno en el Gateway. |

---

## 6. Informe de Seguridad OWASP y Criterios SEC

| Criterio SEC (Clase 11) | Estado | Evidencia y Mitigación |
| :--- | :---: | :--- |
| **BOLA / IDOR** | **CUMPLE** | Endpoint `/users/{user_id}` valida que `current_user.id == user_id` o `role == admin`; de lo contrario, 403. |
| **BFLA** | **CUMPLE** | Endpoint administrativo `/users/admin/metrics` exige estrictamente `role == admin`; de lo contrario, 403. |
| **Integridad JWT** | **CUMPLE** | Validación estricta de algoritmo HS256 (rechaza `none`), expiración controlada y verificación de firma. |
| **Mass Assignment** | **CUMPLE** | Schemas Pydantic (`UserCreate`) excluyen campos privilegiados como `role` e `is_admin`. |
| **Inyección SQL / XSS** | **CUMPLE** | SQLAlchemy ORM parametrizado previene SQLi; React escapa cadenas por defecto en DOM. |
| **Fuerza Bruta / Rate Limit** | **CUMPLE** | Bloqueo automático con HTTP 429 Too Many Requests tras 5 intentos fallidos en 60 segundos. |
| **Escaneo OWASP ZAP** | **CUMPLE** | 0 alertas High; alertas Medium justificadas por encabezados locales. |
| **Análisis SCA (Dependencias)** | **CUMPLE** | `pip-audit` y `npm audit` ejecutados con 0 CVEs críticas o altas sin mitigación. |
| **Cabeceras de Seguridad** | **CUMPLE** | CSP, HSTS, X-Content-Type-Options: nosniff, X-Frame-Options: DENY inyectadas en todas las respuestas. |
| **Secretos en Historial** | **CUMPLE** | Repositorio saneado con `.env.example`, sin credenciales duras. Verificado con `gitleaks`. |

---

## 7. Declaración y Plan de Inteligencia Artificial

### 7.1 IA Usada para Testear (Declaración Formal)
* **Herramienta:** Google Antigravity (Gemini 3.8 Flash High) y GitHub Copilot.
* **Propósito:** Generación de casos de prueba de borde, tests parametrizados para la máquina de estados y creación de fixtures para el motor de reglas.
* **Prompt Representativo:**
  > *"Genera una suite de tests en pytest parametrizada para validar que cualquier transición inválida entre los estados DRAFT, QUEUED, PROCESSING, COMPLETED, FAILED y ARCHIVED lance un HTTPException con código 409 Conflict."*
* **Qué se validó a mano:** Revisión de la lógica de negocio de la matriz `VALID_TRANSITIONS` para permitir reintentos controlados desde `FAILED` hacia `QUEUED`.
* **Caso donde la IA propuso un test incorrecto y cómo se detectó:**  
  La IA propuso un test donde la transición `COMPLETED -> QUEUED` devolvía `400 Bad Request`. El equipo detectó que la rúbrica de cátedra exige taxativamente `409 Conflict` (patrón State), por lo que se descartó la sugerencia de la IA y se ajustó el código a 409.

### 7.2 Plan de IA por Usar (4.ª Entrega y Final)
* Incorporación de pruebas de regresión visual asistidas con IA para validar fidelidad responsive a 360, 768 y 1280 px.
* Generación automatizada de datos sintéticos con distribuciones no normales para pruebas de estrés de Monte Carlo.

### 7.3 Testing de la Funcionalidad de IA Propia del Sistema
* **Inyección de Prompt:** Tests verifican que payloads con *"Ignore previous instructions"* sean detectados como `SECURITY_VIOLATION` sin revelar el system prompt.
* **Pedidos Fuera de Dominio:** Consultas médicas o ilegales son etiquetadas como `OUT_OF_DOMAIN` con mensaje explicativo seguro.
* **Fuga de Datos:** Se asegura mediante aserciones que los outputs del NLP no contengan tokens JWT ni claves del sistema.
* **Fallback ante Caída:** Si el parser recibe entradas confusas, responde con intención `UNKNOWN` y solicita aclaración sin lanzar excepción 500.

---

## 8. Lecciones Aprendidas

1. **Defecto 1 (BOLA en endpoints REST):** Se detectó tarde porque las pruebas iniciales solo probaban usuarios consultando su propio `/users/me`.  
   *Prueba que lo habría atrapado:* Test unitario cruzado con dos tokens de usuarios distintos consultando IDs ajenos desde el primer sprint.
2. **Defecto 2 (Formato de error inconsistente):** El gateway devolvía `{"detail": "..."}` en lugar del estándar RFC 9457 `application/problem+json`.  
   *Prueba que lo habría atrapado:* Un test de contrato OpenAPI / Schemathesis con validación de schema de errores 4xx/5xx.
3. **Defecto 3 (Timeout bloqueante en llamadas SOAP externas):** Inicialmente las peticiones HTTP externas no tenían timeout explícito, lo que en situaciones de latencia alta congelaba los workers.  
   *Prueba que lo habría atrapado:* Una prueba de resiliencia con simulación de retardo artificial de 6 segundos en entorno de CI.
