# Plan de Pruebas Integrales - OptimusAI

Este documento describe el enfoque estructurado para probar exhaustivamente el sistema OptimusAI, garantizando el funcionamiento de todos sus microservicios, el frontend y la infraestructura.

## 1. Pruebas Unitarias y de Integración (Backend)
**Objetivo:** Verificar la lógica de negocio aislada y la interacción de cada microservicio con sus dependencias directas (Bases de datos, Colas).
*   **Herramientas:** `pytest`, `pytest-cov`, `pytest-asyncio`.
*   **Alcance por Servicio:**
    *   **Gateway Service:** Rutas, validación de esquemas, reenvío de peticiones.
    *   **Identity Service:** Creación de usuarios, generación y validación de tokens JWT, permisos.
    *   **Optimization Engine:** Mocking de Celery, validación de resolución de modelos (CP/MIP) con OR-Tools.
    *   **Prediction Engine:** Tests de carga de modelos preentrenados (XGBoost/scikit-learn) desde MinIO y predicciones.
    *   **Simulation Engine:** Tests matemáticos del motor de Monte Carlo con umbrales fijos.
    *   **Rules Engine:** Pruebas del evaluador JSON AST con diversas combinaciones de reglas lógicas.
    *   **Knowledge Engine:** Pruebas del flujo RAG con base de datos Qdrant mockeada y respuestas del LLM mockeadas.

## 2. Pruebas de Interfaz de Usuario (Frontend)
**Objetivo:** Asegurar que los componentes visuales de React funcionen correctamente.
*   **Herramientas:** `Jest`, `React Testing Library`.
*   **Alcance:**
    *   Renderizado de los componentes del Dashboard Enterprise.
    *   Simulación de interacciones en el Knowledge Engine (Chat de IA).
    *   Verificación de que el Dark Mode y estilos de Tailwind se apliquen correctamente.

## 3. Pruebas End-to-End (E2E)
**Objetivo:** Verificar el sistema completo simulando el comportamiento de un usuario real desde el navegador hasta la base de datos.
*   **Herramientas:** `Playwright` o `Cypress`.
*   **Escenarios Clave:**
    1.  Login de usuario y navegación al Dashboard.
    2.  Envío de un problema de optimización desde el panel, espera asíncrona y visualización del resultado.
    3.  Interacción con el chatbot del Knowledge Engine y verificación de respuesta.
    4.  Visualización de un reporte de predicciones/simulaciones generadas.

## 4. Pruebas de Carga y Rendimiento
**Objetivo:** Asegurar que la arquitectura asíncrona pueda soportar un entorno enterprise.
*   **Herramientas:** `k6` o `Locust`.
*   **Pruebas Principales:**
    *   **Prueba de Estrés (Gateway):** Enviar peticiones concurrentes altas para verificar RPS y latencias en Prometheus.
    *   **Prueba de Colas (Celery/Redis):** Enviar 100 tareas de optimización de golpe y medir el tiempo de vaciado de la cola y uso de recursos de los workers.

## 5. Pruebas de Infraestructura y Observabilidad (Kubernetes)
**Objetivo:** Confirmar que el despliegue nativo de la nube es resistente y está monitoreado.
*   **Alcance:**
    *   **Resiliencia (Chaos Testing):** Matar un pod (ej: Identity Service) y verificar que el `Deployment` de K8s levante uno nuevo y el sistema se recupere automáticamente.
    *   **Métricas:** Confirmar que Grafana está visualizando los datos scrapeados de Prometheus y que las métricas HTTP del Gateway se reportan.
    *   **Endpoints:** Verificar que los servicios están expuestos correctamente bajo LoadBalancers / Ingress.

## 6. Siguientes Pasos
1. Configurar un pipeline de CI/CD (GitHub Actions) que corra automáticamente la fase 1 y 2 en cada Pull Request.
2. Añadir scripts de `k6` en un directorio `tests/load` e integrarlo en procesos nocturnos de pruebas de rendimiento.
3. Crear un entorno *Staging* en Kubernetes para correr las pruebas E2E.
