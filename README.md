# OptimusAI - Sistema Universal de Optimización Empresarial

OptimusAI es un motor de decisiones avanzado de nivel enterprise diseñado para resolver problemas complejos de planificación, asignación y reducción de costos utilizando Optimización Matemática, IA y Simulación.

## Arquitectura (Microservicios)

El sistema se compone de múltiples microservicios implementados en Python (FastAPI) con arquitectura asíncrona, orquestados mediante Docker Compose.

### Fases Completadas:

#### Fase 1: Arquitectura Base
- **Gateway Service**: API Gateway para enrutamiento.
- **Identity Service**: Gestión de usuarios y autenticación.
- **Infraestructura Base**: Configuración de `docker-compose` con PostgreSQL, Redis, Kafka, Zookeeper y MinIO.

#### Fase 2: Motor de Optimización
- **Optimization Engine**: Microservicio dedicado a la resolución de problemas matemáticos complejos (MIP, CP, LP).
- **Procesamiento Asíncrono**: Integración con Celery y Redis para resolver modelos (como el Problema de Asignación vía Google OR-Tools) en *background* sin bloquear la API REST.

#### Fase 3: Motor Predictivo
- **Prediction Engine**: Microservicio para entrenar e inferir modelos de Machine Learning.
- **Modelos**: Uso de XGBoost y scikit-learn para predicciones de ventas.
- **Model Registry**: Almacenamiento seguro de modelos binarios (`.joblib`) directamente en MinIO.

#### Fase 4: Motor de Simulación
- **Simulation Engine**: Microservicio para evaluar riesgos y calcular rentabilidad.
- **Monte Carlo**: Simulación matemática vectorizada con NumPy capaz de correr miles de iteraciones para *What-If Analysis* y cálculo de percentiles de riesgo.

#### Fase 5: Motor de Reglas
- **Rules Engine**: Microservicio para validar lógicas de negocio de manera dinámica.
- **JSON AST**: Evaluador puro en Python que lee reglas en formato JSON, permitiendo que el equipo de negocio configure reglas sin tocar el código fuente.

#### Fase 6: Knowledge Engine (Asistente de IA)
- **Knowledge Engine**: Cerebro cognitivo que expone capacidades de procesamiento de lenguaje natural (NLP).
- **Explainable AI (XAI)**: Generación de justificaciones en lenguaje natural para explicar cómo la IA entiende y qué decisiones toma.
- **Base de Datos Vectorial**: Integración con Qdrant para proveer capacidades de RAG (Retrieval-Augmented Generation) a los agentes.

#### Fase 7: Frontend (Panel Visual)
- **Dashboard Enterprise**: Interfaz visual ultra-moderna desarrollada con **React, Vite y TailwindCSS**.
- **Dark Mode & Glassmorphism**: Estética premium adaptada para centros de comando de Inteligencia Artificial.
- **Integración API**: Conexión con los microservicios backend para visualizar métricas e interactuar con el Knowledge Engine (Chat de IA).

#### Fase 8: Observabilidad (Telemetría)
- **Métricas y Scrape**: Integración de **Prometheus** para la recolección automática de métricas de rendimiento y salud de los microservicios.
- **Instrumentación**: El `gateway-service` expone métricas HTTP detalladas automáticamente (latencia, contadores de errores, RPS).
- **Visualización**: Incorporación de **Grafana** para la creación de Dashboards analíticos que permiten monitorear la infraestructura en tiempo real.

#### Fase 9: Despliegue en Kubernetes (Cloud-Native)
- **Migración a K8s**: Conversión de la arquitectura local (`docker-compose`) a Manifiestos YAML para Kubernetes, aislando recursos en el namespace `optimus-ai`.
- **Escalabilidad Horizontal**: Configuración de `Deployments` con múltiples réplicas (ej: Gateway) para manejar alta concurrencia.
- **Redes y Seguridad**: Uso de `ClusterIP` para comunicación interna segura y `LoadBalancer` para exponer el Frontend y el Gateway hacia el exterior.

## Cómo ejecutar

Asegúrate de tener Docker y Docker Compose instalados.

1. Clona el repositorio.
2. Ve al directorio `optimus-ai`.
3. Levanta la infraestructura y los servicios con:

```bash
cd optimus-ai
docker-compose up -d --build
```
