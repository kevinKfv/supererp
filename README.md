# OptimusAI — Sistema Universal de Optimización Empresarial

> **Repositorio:** [https://github.com/kevinKfv/supererp](https://github.com/kevinKfv/supererp)  
> **Stack:** FastAPI · React 19 · TailwindCSS · Docker · PostgreSQL · Redis · MinIO · Qdrant · Kafka  
> **Estado:** ✅ Sistema completo y operativo

OptimusAI es un motor de decisiones avanzado de nivel enterprise diseñado para resolver problemas complejos de planificación, asignación y reducción de costos utilizando Optimización Matemática, Machine Learning y Simulación.

---

## 🚀 Inicio Rápido

### Requisitos previos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Puertos libres: 5173, 8000–8006, 3000, 5432, 6333, 6379, 9000–9001, 9090, 9092

### Levantar el sistema completo
```bash
git clone https://github.com/kevinKfv/supererp.git
cd supererp/optimus-ai
docker compose up -d --build
```

### Acceder al sistema
Una vez que todos los contenedores estén UP (puede tardar 1–2 minutos):

| Interfaz | URL | Usuario | Contraseña |
| :--- | :--- | :--- | :--- |
| 🌐 **Frontend (Login)** | http://localhost:5173/login | — | — |
| 🔑 **Admin del sistema** | vía Login UI | `admin_supererp` | `SuperSecretPassword123` |
| 📊 **Swagger / API Docs** | http://localhost:8000/docs | — | — |
| 📈 **Grafana** | http://localhost:3000 | `admin` | `admin` |
| 🗄️ **MinIO Console** | http://localhost:9001 | `optimus_admin` | `optimus_password` |
| 📡 **Prometheus** | http://localhost:9090 | — | — |
| 🔵 **Qdrant Dashboard** | http://localhost:6333/dashboard | — | — |

> 📄 Lista completa de credenciales: **[CUENTAS_Y_USUARIOS.md](CUENTAS_Y_USUARIOS.md)**

---

## 🏗️ Arquitectura de Microservicios

```
optimus-ai/
├── services/
│   ├── gateway-service/       # API Gateway + métricas Prometheus
│   ├── identity-service/      # Auth JWT + PostgreSQL
│   ├── optimization-engine/   # OR-Tools (MIP/CP) + Celery async
│   ├── prediction-engine/     # XGBoost + MinIO model registry
│   ├── simulation-engine/     # Monte Carlo (NumPy vectorizado)
│   ├── rules-engine/          # Evaluador JSON AST dinámico
│   └── knowledge-engine/      # NLP heurístico + XAI
├── frontend/                  # React 19 + Vite + TailwindCSS
├── k8s/                       # Manifiestos Kubernetes
├── docker-compose.yml         # 17 servicios orquestados
└── prometheus.yml             # Configuración de scraping
```

### Flujo de datos
```
Navegador (React)
    ↓ HTTP
API Gateway :8000
    ↓ proxy dinámico /api/v1/{servicio}/...
┌─────────────────────────────────────────────────┐
│ identity-service  :8001  →  PostgreSQL  :5432    │
│ optimization      :8002  →  Redis       :6379    │
│ prediction        :8003  →  MinIO       :9000    │
│ simulation        :8004  →  (NumPy, sin BD)      │
│ rules-engine      :8005  →  (AST puro)           │
│ knowledge-engine  :8006  →  Qdrant      :6333    │
└─────────────────────────────────────────────────┘
Prometheus :9090  ←  scrape /metrics  ←  Gateway
Grafana    :3000  ←  datasource       ←  Prometheus
```

---

## 📦 Fases Implementadas

| Fase | Módulo | Descripción |
| :---: | :--- | :--- |
| 1 | **Gateway + Identity** | Enrutamiento, autenticación JWT, PostgreSQL |
| 2 | **Optimization Engine** | OR-Tools (MIP SCIP), asignación, Celery async |
| 3 | **Prediction Engine** | XGBoost, entrenamiento, MinIO model registry |
| 4 | **Simulation Engine** | Monte Carlo vectorizado, percentiles VaR, análisis de riesgo |
| 5 | **Rules Engine** | Evaluador JSON AST, operadores lógicos, AND/OR |
| 6 | **Knowledge Engine** | NLP heurístico, Explainable AI, Qdrant RAG |
| 7 | **Frontend** | Login, Dashboard, 5 módulos interactivos, Chat IA |
| 8 | **Observabilidad** | Prometheus + Grafana, métricas HTTP automáticas |
| 9 | **Kubernetes** | Manifiestos K8s, ClusterIP, LoadBalancer, namespaces |

---

## 🧪 Tests Automatizados

### Backend (pytest)
```powershell
docker exec optimus_identity             pytest tests/ -v  # 5 tests
docker exec optimus_optimization_engine  pytest tests/ -v  # 4 tests
docker exec optimus_prediction_engine    pytest tests/ -v  # 3 tests
docker exec optimus_simulation_engine    pytest tests/ -v  # 3 tests
docker exec optimus_rules_engine         pytest tests/ -v  # 20 tests
docker exec optimus_knowledge_engine     pytest tests/ -v  # 5 tests
```

### Frontend (Vitest)
```powershell
docker exec optimus_frontend npm run test
# O en local:
cd optimus-ai/frontend && npm run test  # 14 tests
```

> 📄 Plan completo de pruebas: **[TESTING_PLAN.md](TESTING_PLAN.md)**

---

## 🔑 Módulos del Sistema

### 1. Login (`/login`)
Autenticación con JWT. Almacena el token en `localStorage`. Muestra credenciales de prueba en pantalla.

### 2. Dashboard (`/`)
Centro de control con métricas consolidadas y acceso directo a los 4 motores.

### 3. Optimización (`/optimization`)
Editor de matrices de asignación. Resolución asíncrona con Google OR-Tools. Importación/exportación CSV. Restricciones de permisos por empleado.

### 4. Predicción (`/prediction`)
Estimación de ventas con modelo XGBoost almacenado en MinIO. Entrada: precio, marketing, temperatura.

### 5. Simulación Monte Carlo (`/simulation`)
Análisis probabilístico de rentabilidad. Configurable en media y desviación estándar. Retorna percentiles VaR p5/p95 y probabilidad de pérdida.

### 6. Reglas de Negocio (`/rules`)
Evaluador visual JSON AST. Escenarios precargados: descuentos, prevención de fraude, logística express. Sin código: el equipo de negocio configura las reglas.

### 7. Chat con IA (`/chat`)
Asistente NLP que clasifica intenciones en lenguaje natural (OPTIMIZE, SIMULATE, ASSIGN, PREDICT). Botones de derivación directa al motor correspondiente.

---

## 🐳 Gestión de Contenedores

```powershell
# Ver estado de todos los contenedores
docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"

# Ver logs de un servicio
docker logs optimus_gateway -f
docker logs optimus_identity -f

# Detener todo
docker compose down

# Detener y borrar volúmenes (reset completo)
docker compose down -v
```

---

## 📚 Documentación Adicional

| Documento | Descripción |
| :--- | :--- |
| [CUENTAS_Y_USUARIOS.md](CUENTAS_Y_USUARIOS.md) | Todas las credenciales y URLs del sistema |
| [TESTING_PLAN.md](TESTING_PLAN.md) | Plan integral de pruebas (backend, frontend, E2E, carga) |
| [ESTADO_DEL_PROYECTO_Y_PLAN_DE_PRUEBAS.md](ESTADO_DEL_PROYECTO_Y_PLAN_DE_PRUEBAS.md) | Estado actual, checklist y guía de pruebas por fases |
| [PRD.md](PRD.md) | Documento de requerimientos y diseño del producto |
| [optimus-ai/frontend/DESIGN.md](optimus-ai/frontend/DESIGN.md) | Guía de diseño visual y sistema de tokens |

---

## ☸️ Despliegue en Kubernetes

```bash
# Namespace y configuración de red
kubectl apply -f optimus-ai/k8s/01-namespace-config.yaml

# Infraestructura (PostgreSQL, Redis, MinIO, Qdrant, Kafka)
kubectl apply -f optimus-ai/k8s/02-infrastructure.yaml

# Microservicios y frontend
kubectl apply -f optimus-ai/k8s/03-microservices.yaml

# Verificar estado
kubectl get pods -n optimus-ai
kubectl get services -n optimus-ai
```
