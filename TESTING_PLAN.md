# Plan de Pruebas Integrales — OptimusAI / SuperERP

> **Estado:** ✅ Fases 1 y 2 implementadas y operativas. Fases 3–5 pendientes (E2E, carga, K8s).  
> **Última actualización:** Octubre 2026

Este documento describe el enfoque estructurado para probar exhaustivamente el sistema OptimusAI, garantizando el funcionamiento de todos sus microservicios, el frontend y la infraestructura.

---

## 1. Pruebas Unitarias y de Integración (Backend) — ✅ Implementadas

**Herramientas:** `pytest`, `fastapi.testclient`

### Cómo ejecutar (dentro de Docker):
```powershell
docker exec optimus_identity              pytest tests/ -v
docker exec optimus_optimization_engine  pytest tests/ -v
docker exec optimus_prediction_engine    pytest tests/ -v
docker exec optimus_simulation_engine    pytest tests/ -v
docker exec optimus_rules_engine         pytest tests/ -v
docker exec optimus_knowledge_engine     pytest tests/ -v
```

### Estado por servicio:

| Servicio | Archivo de Tests | Cobertura | Tests |
| :--- | :--- | :--- | :---: |
| **Gateway Service** | *(health via integración)* | Health, rutas | — |
| **Identity Service** | `tests/test_auth.py` | Registro, Login, JWT, /users/me, 401 | 5 ✅ |
| **Optimization Engine** | `tests/test_optimization.py` | Health, 2x2 óptimo, restricciones, infeasible | 4 ✅ |
| **Prediction Engine** | `tests/test_prediction.py` | Health, train sintético, train custom, predict endpoint | 3 ✅ |
| **Simulation Engine** | `tests/test_simulation.py` | Health, lógica Monte Carlo, endpoint HTTP | 3 ✅ |
| **Rules Engine** | `tests/test_evaluator.py` | Todos los operadores, AND/OR, claves anidadas, prioridades, 3 escenarios HTTP | 20 ✅ |
| **Knowledge Engine** | `tests/test_knowledge.py` | Health, intención OPTIMIZE/SIMULATE/ASSIGN, XAI, endpoint chat | 5 ✅ |

**Total backend: 40 tests**

---

## 2. Pruebas de Interfaz de Usuario (Frontend) — ✅ Implementadas

**Herramientas:** `Vitest`, `React Testing Library`, `jsdom`

### Cómo ejecutar:
```powershell
# Dentro de Docker
docker exec optimus_frontend npm run test

# En local (requiere Node.js)
cd optimus-ai/frontend
npm run test
```

### Estado:

| Archivo | Componente | Tests |
| :--- | :--- | :---: |
| `App.test.jsx` | Login.tsx | 4 ✅ (render, credenciales, submit vacío, toggle pass) |
| `pages/OptimizationDemo.test.jsx` | OptimizationDemo.tsx | 10 ✅ (validación, polling, CSV, permisos, recovery) |

**Total frontend: 14 tests**

### Qué se prueba en el Login:
- [ ] Formulario renderiza correctamente con labels y botón
- [ ] Las credenciales de prueba aparecen en pantalla
- [ ] Submit con campos vacíos muestra mensaje de error
- [ ] Toggle de ojo muestra/oculta la contraseña

### Qué se prueba en Optimización:
- [ ] Celda vacía → error de validación sin enviar tarea
- [ ] ID guardado en localStorage se recupera tras recarga
- [ ] Pausa automática a los 30 segundos de polling
- [ ] Distinción entre INFEASIBLE y FAILURE
- [ ] Error de red → mensaje + botón "Consultar de nuevo"
- [ ] ID de más de 24 horas se descarta automáticamente
- [ ] Edición de borrador preserva resultado anterior
- [ ] Nuevo ID reemplaza al anterior solo tras aceptar ejecución
- [ ] Permisos por tarea (bloquear/permitir empleados)
- [ ] Costo actual se muestra solo cuando la asignación está completa

---

## 3. Pruebas End-to-End (E2E) — ⏳ Pendiente

**Herramientas sugeridas:** `Playwright` (ya integrado en el stack) o `Cypress`  
**Requisito:** Entorno Docker completo corriendo + browser headless

### Escenarios Clave:

1. **Flujo de autenticación completo**
   - Navegar a `http://localhost:5173/login`
   - Ingresar `admin_supererp` / `SuperSecretPassword123`
   - Verificar redirección al Dashboard con sidebar visible

2. **Ciclo de optimización end-to-end**
   - Navegar a `/optimization`
   - Ingresar matriz `[[4,1],[2,3]]`
   - Presionar "Iniciar optimización"
   - Esperar resultado OPTIMAL con costo = 3
   - Verificar persistencia del ID en localStorage

3. **Predicción con modelo ML**
   - Navegar a `/prediction`
   - Ingresar `precio=100, marketing=80, temperatura=25`
   - Verificar que se obtiene un número de predicción

4. **Simulación Monte Carlo**
   - Navegar a `/simulation`
   - Configurar parámetros y ejecutar
   - Verificar que aparecen VaR p5, media y p95

5. **Evaluación de Reglas**
   - Navegar a `/rules`
   - Cargar escenario de descuento
   - Verificar que DESCUENTO aparece en acciones disparadas

6. **Chat cognitivo**
   - Navegar a `/chat`
   - Escribir "Reducir costos en 15%"
   - Verificar intención OPTIMIZE/COSTS + botón de derivación

### Para implementar:
```powershell
# Instalar Playwright en el frontend
cd optimus-ai/frontend
npm install --save-dev @playwright/test
npx playwright install
# Crear tests en: frontend/tests/e2e/
```

---

## 4. Pruebas de Carga y Rendimiento — ⏳ Pendiente

**Herramientas:** `k6` o `Locust`

### Escenario 1 — Estrés en el Gateway (k6)
```javascript
// tests/load/gateway_stress.js
import http from 'k6/http';
import { check } from 'k6';
export const options = { vus: 50, duration: '60s' };
export default function () {
  const r = http.get('http://localhost:8000/health');
  check(r, { 'status 200': (res) => res.status === 200 });
}
```
```powershell
k6 run tests/load/gateway_stress.js
```
**Meta:** >500 RPS, latencia P95 < 200ms

### Escenario 2 — Saturación de la Cola Celery
```powershell
# Enviar 100 tareas de optimización simultáneamente
1..100 | ForEach-Object -Parallel {
  Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/optimize/assignment" `
    -Method Post -ContentType "application/json" -Body '{"costs":[[4,1],[2,3]]}'
} -ThrottleLimit 20
```
**Meta:** Cola vaciada en < 2 minutos, workers sin crash

### Escenario 3 — Carga en Predicción
```powershell
# 50 predicciones paralelas
1..50 | ForEach-Object -Parallel {
  Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/predict/predict" `
    -Method Post -ContentType "application/json" -Body '{"features":[[100.0,80.0,25.0]]}'
} -ThrottleLimit 10
```

---

## 5. Pruebas de Infraestructura y Observabilidad — ⏳ Pendiente

### Docker Compose
- [ ] Todos los 17 contenedores UP: `docker ps --format "table {{.Names}}\t{{.Status}}"`
- [ ] Prometheus scrapeando: `http://localhost:9090/targets` → todos en state=UP
- [ ] Grafana con datasource configurado: `http://localhost:3000`
- [ ] MinIO bucket `ml-models` con modelo `sales_xgboost.joblib`: `http://localhost:9001`

### Kubernetes (Chaos Testing)
```bash
# Verificar pods corriendo
kubectl get pods -n optimus-ai

# Chaos: matar el Identity Service y verificar auto-recuperación
kubectl delete pod -l app=identity-service -n optimus-ai
kubectl get pods -n optimus-ai -w   # debe relanzarse en < 30 segundos

# Verificar métricas expuestas
kubectl port-forward svc/gateway-service 8000:8000 -n optimus-ai
curl http://localhost:8000/metrics
```

### Endpoints K8s esperados
| Servicio | Tipo | Puerto Externo |
| :--- | :--- | :--- |
| Frontend | LoadBalancer | 5173 |
| Gateway | LoadBalancer | 8000 |
| Prometheus | ClusterIP (interno) | 9090 |
| Grafana | ClusterIP (interno) | 3000 |

---

## 6. CI/CD — ✅ Pipeline de GitHub Actions configurado

El archivo `.github/workflows/ci.yml` corre automáticamente en cada PR/push a `main`:
- Instala dependencias Python por servicio
- Corre `pytest` en todos los microservicios
- Corre `npm run test` en el frontend

### Siguientes mejoras de CI/CD:
1. Agregar scripts de `k6` en `tests/load/` e integrarlos en un job nocturno
2. Crear entorno *Staging* en Kubernetes para las pruebas E2E
3. Agregar `pytest-cov` con umbral mínimo de cobertura del 80%
4. Publicar imagen Docker en GitHub Container Registry (GHCR) al pasar los tests
