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

## Cómo ejecutar

Asegúrate de tener Docker y Docker Compose instalados.

1. Clona el repositorio.
2. Ve al directorio `optimus-ai`.
3. Levanta la infraestructura y los servicios con:

```bash
cd optimus-ai
docker-compose up -d --build
```
